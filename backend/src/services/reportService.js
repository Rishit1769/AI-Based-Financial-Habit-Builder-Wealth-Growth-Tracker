const PDFDocument = require('pdfkit');
const { query } = require('../config/db');
const { uploadFile, BUCKET_REPORTS, getFileStream } = require('../config/minio');
const { v4: uuidv4 } = require('uuid');

const toISODate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date range provided');
  }
  return date.toISOString().slice(0, 10);
};

const formatDisplayDate = (dateValue) =>
  new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

const generateFinancialReport = async (userId, { fromDate, toDate, periodLabel }) => {
  const from = toISODate(fromDate);
  const to = toISODate(toDate);

  if (from > to) {
    throw new Error('fromDate must be before or equal to toDate');
  }

  const [user, income, expenses, habits, goals, investments] = await Promise.all([
    query('SELECT name, email FROM users WHERE id = $1', [userId]),
    query(
      `SELECT source, amount, category, date FROM income_records
       WHERE user_id = $1 AND date >= $2::date AND date <= $3::date
       ORDER BY date`,
      [userId, from, to]
    ),
    query(
      `SELECT description, amount, category, date FROM expense_records
       WHERE user_id = $1 AND date >= $2::date AND date <= $3::date
       ORDER BY date`,
      [userId, from, to]
    ),
    query(
      `SELECT h.name, h.frequency,
              COUNT(hc.id) AS completions
       FROM habits h
       LEFT JOIN habit_completions hc ON hc.habit_id = h.id
         AND hc.completed_at >= $2::date
         AND hc.completed_at <= $3::date
       WHERE h.user_id = $1
       GROUP BY h.name, h.frequency
       ORDER BY h.name`,
      [userId, from, to]
    ),
    query('SELECT title, target_amount, current_amount FROM savings_goals WHERE user_id = $1', [userId]),
    query('SELECT asset_name, asset_type, amount_invested, current_value FROM investments WHERE user_id = $1', [userId]),
  ]);

  const userName = user.rows[0]?.name || 'User';
  const totalIncome = income.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalExpenses = expenses.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const netSavings = totalIncome - totalExpenses;

  const title = periodLabel || `${formatDisplayDate(from)} to ${formatDisplayDate(to)}`;

  // Build PDF
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));

  await new Promise((resolve, reject) => {
    doc.on('end', resolve);
    doc.on('error', reject);

    // Header
    doc.rect(0, 0, 612, 80).fill('#6366f1');
    doc.fillColor('white').fontSize(22).text('Financial Habit Builder', 50, 20);
    doc.fontSize(12).text(`Financial Report - ${title}`, 50, 50);
    doc.fillColor('#1e293b');

    doc.moveDown(3);

    // Summary
    doc.fontSize(16).fillColor('#6366f1').text('Summary', { underline: true });
    doc.fillColor('#1e293b').fontSize(12);
    doc.moveDown(0.5);
    doc.text(`Report for: ${userName}`);
    doc.text(`Period: ${formatDisplayDate(from)} to ${formatDisplayDate(to)}`);
    doc.text(`Total Income: ₹${totalIncome.toFixed(2)}`);
    doc.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`);
    doc.text(`Net Savings: ₹${netSavings.toFixed(2)}`);

    doc.moveDown(1.5);

    // Income table
    if (income.rows.length > 0) {
      doc.fontSize(14).fillColor('#6366f1').text('Income Records', { underline: true });
      doc.fillColor('#1e293b').fontSize(11);
      doc.moveDown(0.5);
      income.rows.forEach((r) => {
        doc.text(`- ${r.source} (${r.category}) - ₹${parseFloat(r.amount).toFixed(2)} on ${new Date(r.date).toLocaleDateString('en-IN')}`);
      });
      doc.moveDown(1);
    }

    // Expense table
    if (expenses.rows.length > 0) {
      doc.fontSize(14).fillColor('#6366f1').text('Expense Records', { underline: true });
      doc.fillColor('#1e293b').fontSize(11);
      doc.moveDown(0.5);
      expenses.rows.forEach((r) => {
        doc.text(`- ${r.description} (${r.category}) - ₹${parseFloat(r.amount).toFixed(2)} on ${new Date(r.date).toLocaleDateString('en-IN')}`);
      });
      doc.moveDown(1);
    }

    // Habits
    if (habits.rows.length > 0) {
      doc.fontSize(14).fillColor('#6366f1').text('Habit Performance', { underline: true });
      doc.fillColor('#1e293b').fontSize(11);
      doc.moveDown(0.5);
      habits.rows.forEach((h) => {
        doc.text(`- ${h.name} (${h.frequency}) - ${h.completions} completions in selected period`);
      });
      doc.moveDown(1);
    }

    // Savings goals
    if (goals.rows.length > 0) {
      doc.fontSize(14).fillColor('#6366f1').text('Savings Goals', { underline: true });
      doc.fillColor('#1e293b').fontSize(11);
      doc.moveDown(0.5);
      goals.rows.forEach((g) => {
        const pct = ((parseFloat(g.current_amount) / parseFloat(g.target_amount)) * 100).toFixed(1);
        doc.text(`- ${g.title}: ₹${parseFloat(g.current_amount).toFixed(2)} / ₹${parseFloat(g.target_amount).toFixed(2)} (${pct}%)`);
      });
      doc.moveDown(1);
    }

    // Investments
    if (investments.rows.length > 0) {
      doc.fontSize(14).fillColor('#6366f1').text('Investments Portfolio', { underline: true });
      doc.fillColor('#1e293b').fontSize(11);
      doc.moveDown(0.5);
      investments.rows.forEach((inv) => {
        const gl = parseFloat(inv.current_value) - parseFloat(inv.amount_invested);
        doc.text(`- ${inv.asset_name} (${inv.asset_type}) - Invested: ₹${parseFloat(inv.amount_invested).toFixed(2)}, Current: ₹${parseFloat(inv.current_value).toFixed(2)}, G/L: ₹${gl.toFixed(2)}`);
      });
    }

    // Footer
    doc.fontSize(9).fillColor('#94a3b8');
    doc.text(`Generated on ${new Date().toLocaleString('en-IN')} by Financial Habit Builder`, 50, 750, { align: 'center' });

    doc.end();
  });

  const buffer = Buffer.concat(chunks);
  const objectName = `${userId}/${uuidv4()}-report-${from.replace(/-/g, '')}-${to.replace(/-/g, '')}.pdf`;
  await uploadFile(BUCKET_REPORTS, objectName, buffer, 'application/pdf');

  return objectName;
};

const getReportBuffer = async (objectName) => {
  const stream = await getFileStream(BUCKET_REPORTS, objectName);
  return streamToBuffer(stream);
};

module.exports = { generateFinancialReport, getReportBuffer };

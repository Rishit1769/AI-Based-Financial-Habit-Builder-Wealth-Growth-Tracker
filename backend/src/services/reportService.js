const PDFDocument = require('pdfkit');
const { query } = require('../config/db');
const { uploadFile, BUCKET_REPORTS } = require('../config/minio');
const { v4: uuidv4 } = require('uuid');

const generateMonthlyReport = async (userId, period) => {
  // Parse period (e.g., "2026-03")
  let year, month;
  if (period) {
    [year, month] = period.split('-').map(Number);
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  // Fetch user data
  const [user, income, expenses, habits, goals, investments] = await Promise.all([
    query('SELECT name, email FROM users WHERE id = $1', [userId]),
    query(
      `SELECT source, amount, category, date FROM income_records
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3
       ORDER BY date`,
      [userId, year, month]
    ),
    query(
      `SELECT description, amount, category, date FROM expense_records
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3
       ORDER BY date`,
      [userId, year, month]
    ),
    query(
      `SELECT h.name, h.frequency,
              COUNT(hc.id) AS completions
       FROM habits h LEFT JOIN habit_completions hc ON hc.habit_id = h.id
         AND EXTRACT(MONTH FROM hc.completed_at) = $2 AND EXTRACT(YEAR FROM hc.completed_at) = $3
       WHERE h.user_id = $1 GROUP BY h.name, h.frequency`,
      [userId, month, year]
    ),
    query('SELECT title, target_amount, current_amount FROM savings_goals WHERE user_id = $1', [userId]),
    query('SELECT asset_name, asset_type, amount_invested, current_value FROM investments WHERE user_id = $1', [userId]),
  ]);

  const userName = user.rows[0]?.name || 'User';
  const totalIncome = income.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalExpenses = expenses.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const netSavings = totalIncome - totalExpenses;

  // Build PDF
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));

  await new Promise((resolve, reject) => {
    doc.on('end', resolve);
    doc.on('error', reject);

    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const periodTitle = `${monthName} ${year}`;

    // Header
    doc.rect(0, 0, 612, 80).fill('#6366f1');
    doc.fillColor('white').fontSize(22).text('Financial Habit Builder', 50, 20);
    doc.fontSize(12).text(`Monthly Financial Report – ${periodTitle}`, 50, 50);
    doc.fillColor('#1e293b');

    doc.moveDown(3);

    // Summary
    doc.fontSize(16).fillColor('#6366f1').text('Summary', { underline: true });
    doc.fillColor('#1e293b').fontSize(12);
    doc.moveDown(0.5);
    doc.text(`Report for: ${userName}`);
    doc.text(`Period: ${periodTitle}`);
    doc.text(`Total Income: ₹${totalIncome.toFixed(2)}`);
    doc.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`);
    doc.text(`Net Savings: ₹${netSavings.toFixed(2)}`, { color: netSavings >= 0 ? '#10b981' : '#ef4444' });

    doc.moveDown(1.5);

    // Income table
    if (income.rows.length > 0) {
      doc.fontSize(14).fillColor('#6366f1').text('Income Records', { underline: true });
      doc.fillColor('#1e293b').fontSize(11);
      doc.moveDown(0.5);
      income.rows.forEach((r) => {
        doc.text(`• ${r.source} (${r.category}) – ₹${parseFloat(r.amount).toFixed(2)} on ${new Date(r.date).toLocaleDateString('en-IN')}`);
      });
      doc.moveDown(1);
    }

    // Expense table
    if (expenses.rows.length > 0) {
      doc.fontSize(14).fillColor('#6366f1').text('Expense Records', { underline: true });
      doc.fillColor('#1e293b').fontSize(11);
      doc.moveDown(0.5);
      expenses.rows.forEach((r) => {
        doc.text(`• ${r.description} (${r.category}) – ₹${parseFloat(r.amount).toFixed(2)} on ${new Date(r.date).toLocaleDateString('en-IN')}`);
      });
      doc.moveDown(1);
    }

    // Habits
    if (habits.rows.length > 0) {
      doc.fontSize(14).fillColor('#6366f1').text('Habit Performance', { underline: true });
      doc.fillColor('#1e293b').fontSize(11);
      doc.moveDown(0.5);
      habits.rows.forEach((h) => {
        doc.text(`• ${h.name} (${h.frequency}) – ${h.completions} completions this month`);
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
        doc.text(`• ${g.title}: ₹${parseFloat(g.current_amount).toFixed(2)} / ₹${parseFloat(g.target_amount).toFixed(2)} (${pct}%)`);
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
        doc.text(`• ${inv.asset_name} (${inv.asset_type}) – Invested: ₹${parseFloat(inv.amount_invested).toFixed(2)}, Current: ₹${parseFloat(inv.current_value).toFixed(2)}, G/L: ₹${gl.toFixed(2)}`);
      });
    }

    // Footer
    doc.fontSize(9).fillColor('#94a3b8');
    doc.text(`Generated on ${new Date().toLocaleString('en-IN')} by Financial Habit Builder`, 50, 750, { align: 'center' });

    doc.end();
  });

  const buffer = Buffer.concat(chunks);
  const objectName = `${userId}/${uuidv4()}-report-${year}-${String(month).padStart(2, '0')}.pdf`;
  await uploadFile(BUCKET_REPORTS, objectName, buffer, 'application/pdf');

  return objectName;
};

module.exports = { generateMonthlyReport };

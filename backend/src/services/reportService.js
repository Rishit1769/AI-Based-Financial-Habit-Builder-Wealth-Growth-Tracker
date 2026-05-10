const PDFDocument = require('pdfkit');
const { query } = require('../config/db');
const { uploadFile, BUCKET_REPORTS, getFileStream } = require('../config/minio');
const { v4: uuidv4 } = require('uuid');

const PAGE_MARGIN = 46;
const FOOTER_RESERVED = 48;

const COLORS = {
  primary: '#2C3E7A',
  accent: '#5B6BF5',
  headerDark: '#1E263D',
  neutralBg: '#F5F6FA',
  divider: '#E3E6EE',
  text: '#1F2937',
  textMuted: '#6B7280',
  white: '#FFFFFF',
  income: '#27AE60',
  expense: '#E74C3C',
  savings: '#2D9CDB',
  health: '#F2994A',
  food: '#EB5757',
};

const CATEGORY_COLORS = {
  salary: COLORS.income,
  health: COLORS.health,
  food: COLORS.food,
};

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

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getCategoryColor = (category) =>
  CATEGORY_COLORS[(category || '').toLowerCase()] || COLORS.accent;

const drawDivider = (doc) => {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  doc
    .moveTo(left, doc.y)
    .lineTo(right, doc.y)
    .strokeColor(COLORS.divider)
    .lineWidth(1)
    .stroke();
  doc.moveDown(1);
};

const ensureSpace = (doc, requiredHeight) => {
  const maxY = doc.page.height - FOOTER_RESERVED;
  if (doc.y + requiredHeight <= maxY) {
    return;
  }
  doc.addPage();
  doc.y = doc.page.margins.top;
};

const truncateText = (doc, value, maxWidth) => {
  const text = String(value || '');
  if (doc.widthOfString(text) <= maxWidth) {
    return text;
  }

  let truncated = text;
  while (truncated.length > 0 && doc.widthOfString(`${truncated}...`) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}...`;
};

const drawHeader = (doc, { title, userName }) => {
  const width = doc.page.width;
  const headerHeight = 96;

  doc.save();
  doc.rect(0, 0, width, headerHeight).fill(COLORS.headerDark);
  doc.rect(0, headerHeight - 4, width, 4).fill(COLORS.accent);

  // Subtle premium accents in the header background.
  doc
    .polygon([width - 120, 0], [width, 0], [width, 60])
    .fillOpacity(0.08)
    .fill(COLORS.white)
    .fillOpacity(1);
  doc
    .polygon([width - 200, 0], [width - 140, 0], [width, 90], [width, 140])
    .fillOpacity(0.05)
    .fill(COLORS.white)
    .fillOpacity(1);

  const logoX = doc.page.margins.left;
  const logoY = 20;
  doc.roundedRect(logoX, logoY, 34, 34, 8).fill(COLORS.accent);
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor(COLORS.white)
    .text('F', logoX + 11, logoY + 8);

  doc
    .font('Helvetica-Bold')
    .fontSize(19)
    .fillColor(COLORS.white)
    .text('Financial Habit Builder', logoX + 46, 22);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#D3DBF6')
    .text(`Financial Summary Report | ${title}`, logoX + 46, 46);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#D3DBF6')
    .text(`Prepared for ${userName}`, logoX + 46, 62);

  doc.restore();
  doc.y = headerHeight + 18;
};

const drawSectionTitle = (doc, title) => {
  ensureSpace(doc, 28);
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor(COLORS.primary)
    .text(title, doc.page.margins.left, doc.y);
  doc.moveDown(0.5);
};

const drawSummaryCards = (doc, stats) => {
  drawSectionTitle(doc, 'Executive Summary');

  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const gap = 12;
  const cardWidth = (width - gap * 2) / 3;
  const cardHeight = 92;
  const y = doc.y;

  stats.forEach((stat, index) => {
    const x = left + index * (cardWidth + gap);

    doc.save();
    doc.roundedRect(x + 2, y + 3, cardWidth, cardHeight, 12).fill('#DDE2EF');
    doc.roundedRect(x, y, cardWidth, cardHeight, 12).fill(COLORS.white);

    doc.circle(x + 18, y + 20, 9).fill(stat.color);
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor(COLORS.white)
      .text(stat.icon, x + 13.5, y + 16.2, { width: 10, align: 'center' });

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.textMuted)
      .text(stat.label, x + 34, y + 13, { width: cardWidth - 42 });

    doc
      .font('Helvetica-Bold')
      .fontSize(15)
      .fillColor(COLORS.text)
      .text(stat.value, x + 14, y + 40, { width: cardWidth - 20 });
    doc.restore();
  });

  doc.y = y + cardHeight + 20;
};

const drawIncomeExpenseChart = (doc, totalIncome, totalExpenses) => {
  drawSectionTitle(doc, 'Income vs Expense Breakdown');

  ensureSpace(doc, 130);

  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const chartY = doc.y;
  const barX = left + 128;
  const barWidth = width - 160;
  const barHeight = 16;
  const maxValue = Math.max(totalIncome, totalExpenses, 1);

  const rows = [
    { label: 'Income', value: totalIncome, color: COLORS.income },
    { label: 'Expenses', value: totalExpenses, color: COLORS.expense },
  ];

  rows.forEach((row, index) => {
    const y = chartY + index * 42;
    const fillWidth = (row.value / maxValue) * barWidth;

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(row.label, left, y + 2, { width: 100 });

    doc.roundedRect(barX, y, barWidth, barHeight, 8).fill('#E8ECF6');
    doc.roundedRect(barX, y, fillWidth, barHeight, 8).fill(row.color);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(formatCurrency(row.value), barX + barWidth + 6, y + 2, {
        width: 100,
        align: 'right',
      });
  });

  const savings = totalIncome - totalExpenses;
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(COLORS.textMuted)
    .text(`Net savings for the period: ${formatCurrency(savings)}`, left, chartY + 94);

  doc.y = chartY + 118;
};

const drawCategoryPill = (doc, x, y, width, height, value) => {
  const text = (value || 'uncategorized').toLowerCase();
  const pillColor = getCategoryColor(text);
  const display = truncateText(doc, text, width - 20);
  const pillWidth = Math.min(width - 12, doc.widthOfString(display) + 18);
  const pillX = x + 6;
  const pillY = y + (height - 16) / 2;

  doc.roundedRect(pillX, pillY, pillWidth, 16, 8).fill(pillColor);
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(COLORS.white)
    .text(display, pillX, pillY + 4, { width: pillWidth, align: 'center', lineBreak: false });
};

const drawRecordsTable = (doc, title, rows, descriptorKey) => {
  drawSectionTitle(doc, title);

  const columns = [
    { key: 'date', label: 'Date', width: 88 },
    { key: 'description', label: 'Description', width: 212 },
    { key: 'category', label: 'Category', width: 110 },
    { key: 'amount', label: 'Amount', width: 93 },
  ];
  const rowHeight = 28;
  const headerHeight = 28;
  const left = doc.page.margins.left;

  const drawHeaderRow = (y) => {
    let x = left;
    columns.forEach((col) => {
      doc.rect(x, y, col.width, headerHeight).fill(COLORS.primary);
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(COLORS.white)
        .text(col.label, x + 8, y + 9, {
          width: col.width - 12,
          align: col.key === 'amount' ? 'right' : 'left',
          lineBreak: false,
        });
      x += col.width;
    });
  };

  ensureSpace(doc, headerHeight + rowHeight);
  let y = doc.y;
  drawHeaderRow(y);
  y += headerHeight;

  if (rows.length === 0) {
    doc.rect(left, y, columns.reduce((sum, col) => sum + col.width, 0), rowHeight).fill(COLORS.white);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.textMuted)
      .text('No records in this period.', left + 8, y + 9, { width: 300 });
    doc.y = y + rowHeight + 14;
    return;
  }

  rows.forEach((row, index) => {
    if (y + rowHeight > doc.page.height - FOOTER_RESERVED) {
      doc.addPage();
      doc.y = doc.page.margins.top;
      y = doc.y;
      drawHeaderRow(y);
      y += headerHeight;
    }

    const bg = index % 2 === 0 ? COLORS.white : COLORS.neutralBg;
    doc
      .rect(left, y, columns.reduce((sum, col) => sum + col.width, 0), rowHeight)
      .fill(bg);

    const description = truncateText(doc, row[descriptorKey], 198);
    let x = left;

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(formatDisplayDate(row.date), x + 8, y + 9, { width: columns[0].width - 12, lineBreak: false });
    x += columns[0].width;

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(description, x + 8, y + 9, { width: columns[1].width - 12, lineBreak: false });
    x += columns[1].width;

    drawCategoryPill(doc, x, y, columns[2].width, rowHeight, row.category);
    x += columns[2].width;

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(formatCurrency(row.amount), x + 6, y + 9, {
        width: columns[3].width - 12,
        align: 'right',
        lineBreak: false,
      });

    y += rowHeight;
  });

  doc.y = y + 14;
};

const addFooters = (doc, generatedAt) => {
  const range = doc.bufferedPageRange();

  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);

    const left = doc.page.margins.left;
    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const y = doc.page.height - 30;

    doc.save();
    doc
      .moveTo(left, y - 6)
      .lineTo(doc.page.width - doc.page.margins.right, y - 6)
      .strokeColor(COLORS.divider)
      .lineWidth(1)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(COLORS.textMuted)
      .text(`Generated: ${generatedAt}`, left, y, {
        width: usableWidth / 3,
        align: 'left',
      });

    doc.text('Confidential', left + usableWidth / 3, y, {
      width: usableWidth / 3,
      align: 'center',
    });

    doc.text(`Page ${i + 1} of ${range.count}`, left + (2 * usableWidth) / 3, y, {
      width: usableWidth / 3,
      align: 'right',
    });
    doc.restore();
  }
};

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

  const [user, income, expenses] = await Promise.all([
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
  ]);

  const userName = user.rows[0]?.name || 'User';
  const totalIncome = income.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalExpenses = expenses.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const netSavings = totalIncome - totalExpenses;

  const title = periodLabel || `${formatDisplayDate(from)} to ${formatDisplayDate(to)}`;
  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Build a polished, print-ready PDF report.
  const doc = new PDFDocument({
    size: 'A4',
    margin: PAGE_MARGIN,
    bufferPages: true,
  });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));

  await new Promise((resolve, reject) => {
    doc.on('end', resolve);
    doc.on('error', reject);

    drawHeader(doc, { title, userName });

    drawSummaryCards(doc, [
      { label: 'Total Income', value: formatCurrency(totalIncome), color: COLORS.income, icon: '+' },
      { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: COLORS.expense, icon: '-' },
      { label: 'Net Savings', value: formatCurrency(netSavings), color: COLORS.savings, icon: '=' },
    ]);
    drawDivider(doc);

    drawIncomeExpenseChart(doc, totalIncome, totalExpenses);
    drawDivider(doc);

    drawRecordsTable(doc, 'Income Records', income.rows, 'source');
    drawDivider(doc);

    drawRecordsTable(doc, 'Expense Records', expenses.rows, 'description');

    addFooters(doc, generatedAt);

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

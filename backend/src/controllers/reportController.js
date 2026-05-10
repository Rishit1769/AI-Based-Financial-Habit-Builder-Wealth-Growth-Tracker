const { query } = require('../config/db');
const reportService = require('../services/reportService');
const { sendEmail } = require('../config/email');
const { getPresignedUrl } = require('../config/minio');
const { BUCKET_REPORTS } = require('../config/minio');

const toISODate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date value');
  }
  return date.toISOString().slice(0, 10);
};

const formatDisplayDate = (dateValue) =>
  new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const toPeriodCode = (fromDate, toDate) =>
  `${fromDate.replace(/-/g, '')}-${toDate.replace(/-/g, '')}`;

const parsePeriodCode = (periodCode) => {
  const match = /^([0-9]{8})-([0-9]{8})$/.exec(periodCode || '');
  if (!match) {
    return null;
  }

  const fromDate = `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}`;
  const toDate = `${match[2].slice(0, 4)}-${match[2].slice(4, 6)}-${match[2].slice(6, 8)}`;
  return {
    fromDate,
    toDate,
    periodLabel: `${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)}`,
  };
};

const resolveRange = ({ fromDate, toDate, preset, period }) => {
  if (fromDate && toDate) {
    const from = toISODate(fromDate);
    const to = toISODate(toDate);
    if (from > to) {
      throw new Error('fromDate must be before or equal to toDate');
    }
    return {
      fromDate: from,
      toDate: to,
      reportType: 'date_range',
      periodLabel: `${formatDisplayDate(from)} to ${formatDisplayDate(to)}`,
    };
  }

  const today = new Date();

  if (preset === 'past_6_months') {
    const from = new Date(today);
    from.setMonth(from.getMonth() - 6);
    const fromDateIso = toISODate(from);
    const toDateIso = toISODate(today);
    return {
      fromDate: fromDateIso,
      toDate: toDateIso,
      reportType: 'date_range',
      periodLabel: 'Past 6 Months',
    };
  }

  if (preset === 'past_year') {
    const from = new Date(today);
    from.setFullYear(from.getFullYear() - 1);
    const fromDateIso = toISODate(from);
    const toDateIso = toISODate(today);
    return {
      fromDate: fromDateIso,
      toDate: toDateIso,
      reportType: 'date_range',
      periodLabel: 'Past Year',
    };
  }

  if (period && /^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-').map(Number);
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 0));
    const fromDateIso = toISODate(from);
    const toDateIso = toISODate(to);
    return {
      fromDate: fromDateIso,
      toDate: toDateIso,
      reportType: 'monthly',
      periodLabel: new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    };
  }

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const fromDateIso = toISODate(monthStart);
  const toDateIso = toISODate(today);
  return {
    fromDate: fromDateIso,
    toDate: toDateIso,
    reportType: 'monthly',
    periodLabel: 'Current Month',
  };
};

const generate = async (req, res, next) => {
  try {
    const range = resolveRange(req.body || {});
    const fileUrl = await reportService.generateFinancialReport(req.user.id, {
      fromDate: range.fromDate,
      toDate: range.toDate,
      periodLabel: range.periodLabel,
    });

    const periodCode = toPeriodCode(range.fromDate, range.toDate);

    const reportResult = await query(
      'INSERT INTO reports (user_id, report_type, file_url, period) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, range.reportType, fileUrl, periodCode]
    );

    const presigned = await getPresignedUrl(BUCKET_REPORTS, fileUrl, 3600).catch(() => null);

    res.json({
      success: true,
      message: 'Report generated',
      data: {
        ...reportResult.rows[0],
        fromDate: range.fromDate,
        toDate: range.toDate,
        periodLabel: range.periodLabel,
        fileKey: fileUrl,
        downloadUrl: presigned,
      },
    });
  } catch (err) {
    next(err);
  }
};

const emailReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const reportResult = await query(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, req.user.id]
    );
    if (reportResult.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Report not found' });

    const report = reportResult.rows[0];
    const presigned = await getPresignedUrl(BUCKET_REPORTS, report.file_url, 3600);
    const parsed = parsePeriodCode(report.period);
    const reportTitle = parsed?.periodLabel || report.period || 'Selected Period';

    await sendEmail({
      to: req.user.email,
      subject: `Your Financial Report - ${reportTitle}`,
      html: `
        <h2>Your Financial Report is Ready 📊</h2>
        <p>Hi ${req.user.name}, your financial report has been generated.</p>
        <p><a href="${presigned}" style="background:#6366f1;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Download Report</a></p>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.json({ success: true, message: 'Report emailed successfully' });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    // Attach presigned URLs
    const reports = await Promise.all(
      result.rows.map(async (r) => {
        const downloadUrl = await getPresignedUrl(BUCKET_REPORTS, r.file_url, 3600).catch(() => null);
        const parsed = parsePeriodCode(r.period);
        return {
          ...r,
          fromDate: parsed?.fromDate || null,
          toDate: parsed?.toDate || null,
          periodLabel: parsed?.periodLabel || r.period,
          downloadUrl,
        };
      })
    );
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

const downloadReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const reportResult = await query(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, req.user.id]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const report = reportResult.rows[0];
    const buffer = await reportService.getReportBuffer(report.file_url);
    const parsed = parsePeriodCode(report.period);
    const reportTitle = parsed?.periodLabel || report.period || 'selected-period';
    const safeReportSlug = reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `financial-report-${safeReportSlug || 'report'}.pdf`;

    let emailStatus = 'sent';
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Your Financial Report - ${reportTitle}`,
        html: `
          <h2>Your Downloaded Financial Report</h2>
          <p>Hi ${req.user.name},</p>
          <p>You just downloaded your financial report for <strong>${reportTitle}</strong>.</p>
          <p>We have attached the same report PDF in this email for your records.</p>
        `,
        attachments: [
          {
            filename,
            content: buffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (emailErr) {
      emailStatus = 'failed';
      console.error('[REPORT_EMAIL_ERROR]', emailErr.message);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Report-Email-Status', emailStatus);
    return res.send(buffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { generate, emailReport, getAll, downloadReport };

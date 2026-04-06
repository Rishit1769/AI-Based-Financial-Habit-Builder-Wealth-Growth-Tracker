const { query } = require('../config/db');
const reportService = require('../services/reportService');
const { sendEmail } = require('../config/email');
const { getPresignedUrl } = require('../config/minio');
const { BUCKET_REPORTS } = require('../config/minio');

const generate = async (req, res, next) => {
  try {
    const { period } = req.body; // e.g., "2026-03" or "2026"
    const fileUrl = await reportService.generateMonthlyReport(req.user.id, period);

    await query(
      'INSERT INTO reports (user_id, report_type, file_url, period) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'monthly', fileUrl, period]
    );

    // Optionally email the report
    const presigned = await getPresignedUrl(BUCKET_REPORTS, fileUrl, 3600).catch(() => null);

    res.json({
      success: true,
      message: 'Report generated',
      data: { fileKey: fileUrl, downloadUrl: presigned },
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

    await sendEmail({
      to: req.user.email,
      subject: `Your Financial Report – ${report.period || new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
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
        return { ...r, downloadUrl };
      })
    );
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

module.exports = { generate, emailReport, getAll };

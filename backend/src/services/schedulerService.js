const cron = require('node-cron');
const { query } = require('../config/db');
const { habitReminderEmail, monthlyReportEmail } = require('./emailService');
const reportService = require('./reportService');
const { getPresignedUrl, BUCKET_REPORTS } = require('../config/minio');

const start = () => {
  // Daily at 8:00 AM – send habit reminders
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Running daily habit reminders...');
    try {
      const users = await query(
        `SELECT DISTINCT u.id, u.name, u.email FROM users u
         INNER JOIN habits h ON h.user_id = u.id
         WHERE h.is_active = TRUE AND u.is_active = TRUE
           AND NOT EXISTS (
             SELECT 1 FROM habit_completions hc
             WHERE hc.habit_id = h.id AND hc.completed_at = CURRENT_DATE
           )`
      );

      for (const user of users.rows) {
        const pendingHabits = await query(
          `SELECT name FROM habits WHERE user_id = $1 AND is_active = TRUE
           AND NOT EXISTS (
             SELECT 1 FROM habit_completions hc WHERE hc.habit_id = habits.id AND hc.completed_at = CURRENT_DATE
           )`,
          [user.id]
        );
        const habitNames = pendingHabits.rows.map((h) => h.name).join(', ');
        await habitReminderEmail(user.name, user.email, habitNames).catch(() => {});

        // Store notification in DB
        await query(
          `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
          [user.id, 'Daily Habit Reminder', `You have pending habits: ${habitNames}`, 'habit_reminder']
        );
      }
      console.log(`[Scheduler] Sent habit reminders to ${users.rows.length} users.`);
    } catch (err) {
      console.error('[Scheduler] Habit reminder error:', err.message);
    }
  });

  // 1st of every month at 9:00 AM – auto-generate monthly report
  cron.schedule('0 9 1 * *', async () => {
    console.log('[Scheduler] Generating monthly reports...');
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const period = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

      const users = await query(`SELECT id, name, email FROM users WHERE is_active = TRUE AND role = 'user'`);

      for (const user of users.rows) {
        try {
          const fileUrl = await reportService.generateMonthlyReport(user.id, period);
          await query(
            'INSERT INTO reports (user_id, report_type, file_url, period) VALUES ($1, $2, $3, $4)',
            [user.id, 'monthly', fileUrl, period]
          );
          const presigned = await getPresignedUrl(BUCKET_REPORTS, fileUrl, 86400).catch(() => null);
          if (presigned) {
            const monthName = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
            await monthlyReportEmail(user.name, user.email, monthName, presigned).catch(() => {});
          }
        } catch (e) {
          console.error(`[Scheduler] Report failed for user ${user.id}:`, e.message);
        }
      }
      console.log(`[Scheduler] Reports generated for ${users.rows.length} users.`);
    } catch (err) {
      console.error('[Scheduler] Monthly report error:', err.message);
    }
  });

  console.log('✅ Scheduler started: daily reminders @ 8AM, monthly reports @ 1st of month 9AM');
};

module.exports = { start };

const { sendEmail } = require('../config/email');

const welcomeEmail = async (name, email) => {
  return sendEmail({
    to: email,
    subject: '🎉 Welcome to Financial Habit Builder!',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8fafc">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;border-radius:12px;text-align:center">
          <h1 style="color:white;margin:0">Welcome to Financial Habit Builder! 🚀</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:12px;margin-top:20px">
          <h2>Hi ${name}! 👋</h2>
          <p>We're thrilled to have you on board. Your journey to financial freedom starts today.</p>
          <h3 style="color:#6366f1">Here's what you can do:</h3>
          <ul>
            <li>📊 Track your income and expenses</li>
            <li>💪 Build strong financial habits</li>
            <li>🎯 Set and achieve savings goals</li>
            <li>📈 Monitor your wealth growth</li>
            <li>🤖 Get AI-powered financial advice</li>
          </ul>
          <p style="text-align:center;margin-top:30px">
            <a href="${process.env.FRONTEND_URL}" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold">
              Get Started →
            </a>
          </p>
        </div>
        <p style="text-align:center;color:#94a3b8;margin-top:20px;font-size:12px">
          Financial Habit Builder & Wealth Growth Tracker
        </p>
      </body>
      </html>
    `,
  });
};

const habitReminderEmail = async (name, email, habitName) => {
  return sendEmail({
    to: email,
    subject: `⏰ Daily Habit Reminder: ${habitName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#10b981,#059669);padding:20px;border-radius:12px;text-align:center">
          <h2 style="color:white;margin:0">⏰ Habit Reminder</h2>
        </div>
        <div style="background:white;padding:30px;border-radius:12px;margin-top:20px;border:1px solid #e2e8f0">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Don't forget your habit for today: <strong style="color:#6366f1">${habitName}</strong></p>
          <p>Stay consistent – your streak depends on it! 🔥</p>
          <p style="text-align:center">
            <a href="${process.env.FRONTEND_URL}/habits" style="background:#10b981;color:white;padding:12px 30px;border-radius:8px;text-decoration:none">
              Mark Complete →
            </a>
          </p>
        </div>
      </div>
    `,
  });
};

const monthlyReportEmail = async (name, email, period, downloadUrl) => {
  return sendEmail({
    to: email,
    subject: `📊 Your Monthly Financial Report – ${period}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:20px;border-radius:12px;text-align:center">
          <h2 style="color:white;margin:0">📊 Monthly Financial Report</h2>
        </div>
        <div style="background:white;padding:30px;border-radius:12px;margin-top:20px;border:1px solid #e2e8f0">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your financial report for <strong>${period}</strong> is ready!</p>
          <p style="text-align:center;margin-top:20px">
            <a href="${downloadUrl}" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold">
              Download Report (PDF) 📄
            </a>
          </p>
          <p style="color:#94a3b8;font-size:12px;margin-top:20px">This link expires in 1 hour.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { welcomeEmail, habitReminderEmail, monthlyReportEmail };

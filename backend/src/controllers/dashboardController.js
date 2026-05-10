const { query } = require('../config/db');
const { sendEmail } = require('../config/email');

// Track sent alerts in-memory per user per month to avoid spamming repeated requests
const alertsSentThisMonth = new Map();

const shouldSendAlert = (userId, alertKey) => {
  const monthKey = `${userId}:${alertKey}:${new Date().getFullYear()}-${new Date().getMonth()}`;
  if (alertsSentThisMonth.has(monthKey)) return false;
  alertsSentThisMonth.set(monthKey, true);
  return true;
};

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [
      incomeMonth, expenseMonth,
      totalSavings, totalInvestments,
      habitsStats, recentTransactions,
      savingsGoals, netWorthTrend,
      expenseByCategory,
    ] = await Promise.all([
      // Income this month
      query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM income_records
         WHERE user_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3`,
        [userId, currentMonth, currentYear]
      ),
      // Expenses this month
      query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM expense_records
         WHERE user_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3`,
        [userId, currentMonth, currentYear]
      ),
      // Total savings goal amounts
      query(
        `SELECT COALESCE(SUM(current_amount), 0) AS total FROM savings_goals WHERE user_id = $1`,
        [userId]
      ),
      // Total current investment value
      query(
        `SELECT COALESCE(SUM(current_value), 0) AS total FROM investments WHERE user_id = $1`,
        [userId]
      ),
      // Habit stats today
      query(
        `SELECT
           COUNT(*) FILTER (WHERE is_active = TRUE) AS total_active,
           COUNT(*) FILTER (WHERE is_active = TRUE AND EXISTS(
             SELECT 1 FROM habit_completions hc
             WHERE hc.habit_id = habits.id AND hc.completed_at = CURRENT_DATE
           )) AS completed_today
         FROM habits WHERE user_id = $1`,
        [userId]
      ),
      // Recent 5 transactions (income + expense)
      query(
        `(SELECT 'income' AS type, source AS label, amount, date FROM income_records WHERE user_id = $1 ORDER BY date DESC LIMIT 5)
         UNION ALL
         (SELECT 'expense' AS type, description AS label, amount, date FROM expense_records WHERE user_id = $1 ORDER BY date DESC LIMIT 5)
         ORDER BY date DESC LIMIT 10`,
        [userId]
      ),
      // Savings goals
      query(
        `SELECT id, title, target_amount, current_amount, deadline, is_completed FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
        [userId]
      ),
      // Last 6 months net worth trend
      query(
        `SELECT
           to_char(date_trunc('month', gs.month), 'Mon YYYY') AS label,
           COALESCE((SELECT SUM(amount) FROM income_records ir WHERE ir.user_id = $1
             AND date_trunc('month', ir.date) <= date_trunc('month', gs.month)), 0)
           - COALESCE((SELECT SUM(amount) FROM expense_records er WHERE er.user_id = $1
             AND date_trunc('month', er.date) <= date_trunc('month', gs.month)), 0) AS net_worth
         FROM generate_series(
           date_trunc('month', NOW()) - INTERVAL '5 months',
           date_trunc('month', NOW()),
           '1 month'::INTERVAL
         ) AS gs(month)
         ORDER BY gs.month`,
        [userId]
      ),
      // Expenses by category this month
      query(
        `SELECT category, COALESCE(SUM(amount), 0) AS total FROM expense_records
         WHERE user_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3
         GROUP BY category ORDER BY total DESC`,
        [userId, currentMonth, currentYear]
      ),
    ]);

    const monthlyIncome = parseFloat(incomeMonth.rows[0].total);
    const monthlyExpense = parseFloat(expenseMonth.rows[0].total);
    const totalSavingsAmt = parseFloat(totalSavings.rows[0].total);
    const totalInvestmentsAmt = parseFloat(totalInvestments.rows[0].total);
    const netWorth = totalSavingsAmt + totalInvestmentsAmt;
    const monthlySavings = monthlyIncome - monthlyExpense;
    const monthlyDifference = Math.abs(monthlyIncome - monthlyExpense);
    const isIncomeExpenseEqual = monthlyDifference <= 0.01;
    const spendingRatio = monthlyIncome > 0 ? monthlyExpense / monthlyIncome : 0;

    // ── Monthly spending alert emails (non-blocking, once per month per alert type) ──
    const userEmail = req.user.email;
    const userName = req.user.name;
    const monthLabel = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    if (monthlyExpense > monthlyIncome && shouldSendAlert(userId, 'expense_exceeds_income')) {
      sendEmail({
        to: userEmail,
        subject: `Alert: Expenses Exceeded Income - ${monthLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto">
            <div style="background:#ef4444;padding:24px;border-radius:12px 12px 0 0;text-align:center">
              <h2 style="color:white;margin:0">Monthly Overspending Alert</h2>
            </div>
            <div style="background:#ffffff;padding:28px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px">
              <p style="color:#334155">Hi <strong>${userName}</strong>,</p>
              <p style="color:#475569">Your expenses have exceeded your income this month (<strong>${monthLabel}</strong>).</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#fef2f2">
                  <td style="padding:10px 14px;color:#dc2626;font-weight:600">Monthly Income</td>
                  <td style="padding:10px 14px;text-align:right;color:#dc2626">₹${monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;color:#374151">Monthly Expenses</td>
                  <td style="padding:10px 14px;text-align:right;color:#374151">₹${monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="background:#fef2f2">
                  <td style="padding:10px 14px;color:#dc2626;font-weight:700">Net Savings</td>
                  <td style="padding:10px 14px;text-align:right;color:#dc2626;font-weight:700">₹${monthlySavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </table>
              <p style="color:#475569;font-size:14px"><strong>Tip:</strong> Review expense categories and reduce non-essential spending to recover positive monthly savings.</p>
              <a href="${process.env.FRONTEND_URL}/expenses" style="display:inline-block;margin-top:16px;background:#6366f1;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Expenses</a>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    if (isIncomeExpenseEqual && shouldSendAlert(userId, 'income_equals_expense')) {
      sendEmail({
        to: userEmail,
        subject: `Alert: Income and Expense Are Equal - ${monthLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto">
            <div style="background:#f59e0b;padding:24px;border-radius:12px 12px 0 0;text-align:center">
              <h2 style="color:white;margin:0">Zero Monthly Savings Alert</h2>
            </div>
            <div style="background:#ffffff;padding:28px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px">
              <p style="color:#334155">Hi <strong>${userName}</strong>,</p>
              <p style="color:#475569">Your monthly income and expense are currently equal for <strong>${monthLabel}</strong>.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#fffbeb">
                  <td style="padding:10px 14px;color:#92400e;font-weight:600">Monthly Income</td>
                  <td style="padding:10px 14px;text-align:right;color:#92400e">₹${monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;color:#374151">Monthly Expenses</td>
                  <td style="padding:10px 14px;text-align:right;color:#374151">₹${monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </table>
              <p style="color:#475569;font-size:14px"><strong>Tip:</strong> Try reducing one discretionary category this week to move back to positive savings.</p>
              <a href="${process.env.FRONTEND_URL}/expenses" style="display:inline-block;margin-top:16px;background:#6366f1;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Review Spending</a>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    if (
      monthlyIncome > 0 &&
      spendingRatio >= 0.9 &&
      monthlyExpense < monthlyIncome &&
      shouldSendAlert(userId, 'high_spending_warning')
    ) {
      sendEmail({
        to: userEmail,
        subject: `Alert: Spending Is High This Month - ${monthLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto">
            <div style="background:#f59e0b;padding:24px;border-radius:12px 12px 0 0;text-align:center">
              <h2 style="color:white;margin:0">High Spending Warning</h2>
            </div>
            <div style="background:#ffffff;padding:28px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px">
              <p style="color:#334155">Hi <strong>${userName}</strong>,</p>
              <p style="color:#475569">You have used <strong>${(spendingRatio * 100).toFixed(1)}%</strong> of your monthly income in expenses for <strong>${monthLabel}</strong>.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#fffbeb">
                  <td style="padding:10px 14px;color:#92400e;font-weight:600">Monthly Income</td>
                  <td style="padding:10px 14px;text-align:right;color:#92400e">₹${monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;color:#374151">Monthly Expenses</td>
                  <td style="padding:10px 14px;text-align:right;color:#374151">₹${monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="background:#fffbeb">
                  <td style="padding:10px 14px;color:#92400e;font-weight:700">Estimated Savings Left</td>
                  <td style="padding:10px 14px;text-align:right;color:#92400e;font-weight:700">₹${monthlySavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </table>
              <p style="color:#475569;font-size:14px"><strong>Tip:</strong> Pause optional spending now to protect your monthly savings target.</p>
              <a href="${process.env.FRONTEND_URL}/expenses" style="display:inline-block;margin-top:16px;background:#6366f1;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Check Categories</a>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    if (netWorth < 0 && shouldSendAlert(userId, 'net_worth')) {
      sendEmail({
        to: userEmail,
        subject: `⚠️ Alert: Your Net Worth is Negative`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto">
            <div style="background:#dc2626;padding:24px;border-radius:12px 12px 0 0;text-align:center">
              <h2 style="color:white;margin:0">🔴 Net Worth Alert</h2>
            </div>
            <div style="background:#ffffff;padding:28px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px">
              <p style="color:#334155">Hi <strong>${userName}</strong>,</p>
              <p style="color:#475569">Your net worth has gone negative. Your total savings and investments combined are currently <strong style="color:#dc2626">₹${netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>.</p>
              <p style="color:#475569;font-size:14px">💡 Consider reviewing your investment portfolio and savings goals to improve your financial health.</p>
              <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;margin-top:16px;background:#6366f1;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Dashboard</a>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    res.json({
      success: true,
      data: {
        overview: {
          monthlyIncome,
          monthlyExpense,
          monthlySavings,
          netWorth,
          totalSavings: totalSavingsAmt,
          totalInvestments: totalInvestmentsAmt,
        },
        habitStats: habitsStats.rows[0],
        recentTransactions: recentTransactions.rows,
        savingsGoals: savingsGoals.rows,
        netWorthTrend: netWorthTrend.rows,
        expenseByCategory: expenseByCategory.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMonthlyComparison = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const [income, expense] = await Promise.all([
      query(
        `SELECT to_char(date_trunc('month', date), 'Mon YYYY') AS month,
                SUM(amount) AS total
         FROM income_records WHERE user_id = $1
           AND date >= date_trunc('month', NOW()) - ($2::INT - 1) * INTERVAL '1 month'
         GROUP BY date_trunc('month', date) ORDER BY date_trunc('month', date)`,
        [req.user.id, months]
      ),
      query(
        `SELECT to_char(date_trunc('month', date), 'Mon YYYY') AS month,
                SUM(amount) AS total
         FROM expense_records WHERE user_id = $1
           AND date >= date_trunc('month', NOW()) - ($2::INT - 1) * INTERVAL '1 month'
         GROUP BY date_trunc('month', date) ORDER BY date_trunc('month', date)`,
        [req.user.id, months]
      ),
    ]);
    res.json({ success: true, data: { income: income.rows, expense: expense.rows } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getMonthlyComparison };

const { query } = require('../config/db');

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

    res.json({
      success: true,
      data: {
        overview: {
          monthlyIncome,
          monthlyExpense,
          monthlySavings: monthlyIncome - monthlyExpense,
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

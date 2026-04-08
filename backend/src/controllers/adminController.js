const { query } = require('../config/db');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [users, count] = await Promise.all([
      query(
        `SELECT id, name, email, role, is_active, created_at FROM users ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      query(`SELECT COUNT(*) FROM users ${where}`, params),
    ]);

    res.json({
      success: true,
      data: users.rows,
      pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

const toggleUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 AND role != $2 RETURNING id, is_active',
      [userId, 'admin']
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'User not found or cannot deactivate admin' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const getPlatformStats = async (req, res, next) => {
  try {
    const [users, income, expenses, habits, goals, investments, reports] = await Promise.all([
      query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_active) AS active,
             COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_this_month
             FROM users WHERE role = 'user'`),
      query(`SELECT COALESCE(SUM(amount),0) AS total FROM income_records`),
      query(`SELECT COALESCE(SUM(amount),0) AS total FROM expense_records`),
      query(`SELECT COUNT(*) AS total FROM habits`),
      query(`SELECT COUNT(*) AS total, COALESCE(SUM(current_amount),0) AS saved FROM savings_goals`),
      query(`SELECT COALESCE(SUM(current_value),0) AS total FROM investments`),
      query(`SELECT COUNT(*) AS total FROM reports`),
    ]);

    res.json({
      success: true,
      data: {
        users: users.rows[0],
        totalIncome: income.rows[0].total,
        totalExpenses: expenses.rows[0].total,
        totalHabits: habits.rows[0].total,
        savingsGoals: goals.rows[0],
        totalInvestments: investments.rows[0].total,
        totalReports: reports.rows[0].total,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMonthlyActivity = async (req, res, next) => {
  try {
    const months = 6;
    const [users, income, expenses] = await Promise.all([
      query(
        `SELECT to_char(date_trunc('month', created_at), 'Mon YYYY') AS month, COUNT(*) AS total
         FROM users WHERE created_at >= NOW() - ($1::INT - 1) * INTERVAL '1 month'
         GROUP BY date_trunc('month', created_at) ORDER BY date_trunc('month', created_at)`,
        [months]
      ),
      query(
        `SELECT to_char(date_trunc('month', date), 'Mon YYYY') AS month, SUM(amount) AS total
         FROM income_records WHERE date >= NOW() - ($1::INT - 1) * INTERVAL '1 month'
         GROUP BY date_trunc('month', date) ORDER BY date_trunc('month', date)`,
        [months]
      ),
      query(
        `SELECT to_char(date_trunc('month', date), 'Mon YYYY') AS month, SUM(amount) AS total
         FROM expense_records WHERE date >= NOW() - ($1::INT - 1) * INTERVAL '1 month'
         GROUP BY date_trunc('month', date) ORDER BY date_trunc('month', date)`,
        [months]
      ),
    ]);
    res.json({ success: true, data: { users: users.rows, income: income.rows, expenses: expenses.rows } });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await query(
      'DELETE FROM users WHERE id = $1 AND role != $2 RETURNING id',
      [userId, 'admin']
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'User not found or cannot delete admin' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let idx = 1;
    if (status && status !== 'all') {
      conditions.push(`f.status = $${idx}`);
      params.push(status);
      idx++;
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [feedback, count] = await Promise.all([
      query(
        `SELECT f.id, f.subject, f.message, f.type, f.status, f.admin_notes, f.created_at,
                COALESCE(f.user_name, u.name) AS user_name,
                COALESCE(f.user_email, u.email) AS user_email
         FROM user_feedback f
         LEFT JOIN users u ON u.id = f.user_id
         ${where}
         ORDER BY f.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      query(`SELECT COUNT(*) FROM user_feedback f ${where}`, params),
    ]);
    res.json({ success: true, data: feedback.rows, pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
};

const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { feedbackId } = req.params;
    const { status, admin_notes } = req.body;
    const validStatuses = ['open', 'in_review', 'resolved', 'closed'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });
    const result = await query(
      `UPDATE user_feedback SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, admin_notes || null, feedbackId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    const { feedbackId } = req.params;
    await query('DELETE FROM user_feedback WHERE id = $1', [feedbackId]);
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, toggleUser, getPlatformStats, getMonthlyActivity, deleteUser, getFeedback, updateFeedbackStatus, deleteFeedback };

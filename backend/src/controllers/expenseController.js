const { query } = require('../config/db');

const VALID_CATEGORIES = ['food','transport','rent','entertainment','health','education','shopping','utilities','other'];

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, month, year, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ['user_id = $1'];
    const params = [req.user.id];
    let idx = 2;

    if (month && year) {
      conditions.push(`EXTRACT(MONTH FROM date) = $${idx++} AND EXTRACT(YEAR FROM date) = $${idx++}`);
      params.push(month, year);
    } else if (year) {
      conditions.push(`EXTRACT(YEAR FROM date) = $${idx++}`);
      params.push(year);
    }
    if (category && VALID_CATEGORIES.includes(category)) {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }

    const where = conditions.join(' AND ');
    const [data, count] = await Promise.all([
      query(
        `SELECT * FROM expense_records WHERE ${where} ORDER BY date DESC, created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      query(`SELECT COUNT(*) FROM expense_records WHERE ${where}`, params),
    ]);

    res.json({
      success: true,
      data: data.rows,
      pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { description, amount, category = 'other', notes, date } = req.body;
    const result = await query(
      `INSERT INTO expense_records (user_id, description, amount, category, notes, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, description, amount, category, notes, date || new Date()]
    );
    res.status(201).json({ success: true, message: 'Expense added', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, amount, category, notes, date } = req.body;
    const result = await query(
      `UPDATE expense_records SET description = COALESCE($1,description), amount = COALESCE($2,amount),
       category = COALESCE($3,category), notes = COALESCE($4,notes), date = COALESCE($5,date)
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [description, amount, category, notes, date, id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Expense updated', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM expense_records WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;
    const params = [req.user.id, year];
    let dateFilter = `EXTRACT(YEAR FROM date) = $2`;
    if (month) { dateFilter += ` AND EXTRACT(MONTH FROM date) = $3`; params.push(month); }

    const [byCat, byMonth, total] = await Promise.all([
      query(
        `SELECT category, SUM(amount) AS total FROM expense_records
         WHERE user_id = $1 AND ${dateFilter} GROUP BY category ORDER BY total DESC`,
        params
      ),
      query(
        `SELECT EXTRACT(MONTH FROM date) AS month, SUM(amount) AS total FROM expense_records
         WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 GROUP BY month ORDER BY month`,
        [req.user.id, year]
      ),
      query(
        `SELECT SUM(amount) AS total FROM expense_records WHERE user_id = $1 AND ${dateFilter}`,
        params
      ),
    ]);

    res.json({
      success: true,
      data: { byCategory: byCat.rows, byMonth: byMonth.rows, total: total.rows[0].total || 0 },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove, getSummary };

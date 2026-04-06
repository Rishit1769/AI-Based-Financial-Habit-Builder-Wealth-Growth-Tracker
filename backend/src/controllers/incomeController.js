const { query } = require('../config/db');

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
    if (category) {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }

    const where = conditions.join(' AND ');
    const [data, count] = await Promise.all([
      query(
        `SELECT * FROM income_records WHERE ${where} ORDER BY date DESC, created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      query(`SELECT COUNT(*) FROM income_records WHERE ${where}`, params),
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
    const { source, amount, category = 'salary', notes, date } = req.body;
    const result = await query(
      `INSERT INTO income_records (user_id, source, amount, category, notes, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, source, amount, category, notes, date || new Date()]
    );
    res.status(201).json({ success: true, message: 'Income record added', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { source, amount, category, notes, date } = req.body;
    const result = await query(
      `UPDATE income_records SET source = COALESCE($1,source), amount = COALESCE($2,amount),
       category = COALESCE($3,category), notes = COALESCE($4,notes), date = COALESCE($5,date)
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [source, amount, category, notes, date, id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Income record updated', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM income_records WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Income record deleted' });
  } catch (err) {
    next(err);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const monthly = await query(
      `SELECT EXTRACT(MONTH FROM date) AS month, SUM(amount) AS total, category
       FROM income_records WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2
       GROUP BY month, category ORDER BY month`,
      [req.user.id, year]
    );
    const total = await query(
      `SELECT SUM(amount) AS total FROM income_records WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
      [req.user.id, year]
    );
    res.json({
      success: true,
      data: { monthly: monthly.rows, totalYear: total.rows[0].total || 0 },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove, getSummary };

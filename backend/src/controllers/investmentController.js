const { query } = require('../config/db');

const getAll = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM investments WHERE user_id = $1 ORDER BY date_added DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { asset_name, asset_type = 'other', amount_invested, current_value, notes, date_added } = req.body;
    const result = await query(
      `INSERT INTO investments (user_id, asset_name, asset_type, amount_invested, current_value, notes, date_added)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, asset_name, asset_type, amount_invested, current_value || amount_invested, notes, date_added || new Date()]
    );
    res.status(201).json({ success: true, message: 'Investment added', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { asset_name, asset_type, amount_invested, current_value, notes, date_added } = req.body;
    const result = await query(
      `UPDATE investments SET
         asset_name = COALESCE($1, asset_name),
         asset_type = COALESCE($2, asset_type),
         amount_invested = COALESCE($3, amount_invested),
         current_value = COALESCE($4, current_value),
         notes = COALESCE($5, notes),
         date_added = COALESCE($6, date_added)
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [asset_name, asset_type, amount_invested, current_value, notes, date_added, req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Investment not found' });
    res.json({ success: true, message: 'Investment updated', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM investments WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Investment not found' });
    res.json({ success: true, message: 'Investment deleted' });
  } catch (err) {
    next(err);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT asset_type,
              SUM(amount_invested) AS total_invested,
              SUM(current_value) AS total_current
       FROM investments WHERE user_id = $1 GROUP BY asset_type`,
      [req.user.id]
    );
    const totals = await query(
      `SELECT SUM(amount_invested) AS total_invested, SUM(current_value) AS total_current
       FROM investments WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({
      success: true,
      data: {
        byType: result.rows,
        totalInvested: totals.rows[0].total_invested || 0,
        totalCurrentValue: totals.rows[0].total_current || 0,
        totalGainLoss:
          (totals.rows[0].total_current || 0) - (totals.rows[0].total_invested || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove, getSummary };

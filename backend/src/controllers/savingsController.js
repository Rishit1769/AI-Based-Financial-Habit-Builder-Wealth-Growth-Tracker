const { query } = require('../config/db');

const getAll = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, description, target_amount, current_amount = 0, deadline, category = 'general' } = req.body;
    const result = await query(
      `INSERT INTO savings_goals (user_id, title, description, target_amount, current_amount, deadline, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, title, description, target_amount, current_amount, deadline, category]
    );
    res.status(201).json({ success: true, message: 'Savings goal created', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { title, description, target_amount, current_amount, deadline, category, is_completed } = req.body;
    const result = await query(
      `UPDATE savings_goals SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         target_amount = COALESCE($3, target_amount),
         current_amount = COALESCE($4, current_amount),
         deadline = COALESCE($5, deadline),
         category = COALESCE($6, category),
         is_completed = COALESCE($7, is_completed)
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [title, description, target_amount, current_amount, deadline, category, is_completed, req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Savings goal updated', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const addContribution = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const result = await query(
      `UPDATE savings_goals
       SET current_amount = current_amount + $1,
           is_completed = CASE WHEN current_amount + $1 >= target_amount THEN TRUE ELSE FALSE END
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [amount, req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Contribution added', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM savings_goals WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Savings goal deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, addContribution, remove };

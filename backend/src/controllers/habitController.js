const { query } = require('../config/db');

// ── Habits CRUD ──────────────────────────────────────────────

const getAll = async (req, res, next) => {
  try {
    const habits = await query(
      `SELECT h.*,
         (SELECT COUNT(*) FROM habit_completions hc WHERE hc.habit_id = h.id) AS total_completions
       FROM habits h WHERE h.user_id = $1 ORDER BY h.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: habits.rows });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, frequency = 'daily', target_count = 1 } = req.body;
    const result = await query(
      `INSERT INTO habits (user_id, name, description, frequency, target_count)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, name, description, frequency, target_count]
    );
    res.status(201).json({ success: true, message: 'Habit created', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, description, frequency, target_count, is_active } = req.body;
    const result = await query(
      `UPDATE habits SET name = COALESCE($1,name), description = COALESCE($2,description),
       frequency = COALESCE($3,frequency), target_count = COALESCE($4,target_count),
       is_active = COALESCE($5,is_active) WHERE id = $6 AND user_id = $7 RETURNING *`,
      [name, description, frequency, target_count, is_active, req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, message: 'Habit updated', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, message: 'Habit deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Completions ──────────────────────────────────────────────

const completeHabit = async (req, res, next) => {
  try {
    const { id } = req.params; // habit id
    const { date, notes } = req.body;
    const completionDate = date || new Date().toISOString().split('T')[0];

    // Verify habit belongs to user
    const habit = await query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (habit.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Habit not found' });

    const result = await query(
      `INSERT INTO habit_completions (habit_id, user_id, completed_at, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (habit_id, completed_at) DO UPDATE SET notes = EXCLUDED.notes
       RETURNING *`,
      [id, req.user.id, completionDate, notes]
    );
    res.status(201).json({ success: true, message: 'Habit marked complete', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const uncompleteHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    const completionDate = date || new Date().toISOString().split('T')[0];
    await query(
      'DELETE FROM habit_completions WHERE habit_id = $1 AND user_id = $2 AND completed_at = $3',
      [id, req.user.id, completionDate]
    );
    res.json({ success: true, message: 'Habit completion removed' });
  } catch (err) {
    next(err);
  }
};

const getCompletions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days = 90 } = req.query;
    const result = await query(
      `SELECT completed_at FROM habit_completions
       WHERE habit_id = $1 AND user_id = $2 AND completed_at >= CURRENT_DATE - $3::INT
       ORDER BY completed_at DESC`,
      [id, req.user.id, days]
    );
    res.json({ success: true, data: result.rows.map((r) => r.completed_at) });
  } catch (err) {
    next(err);
  }
};

// Calculate streak for a habit
const getStreak = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT completed_at FROM habit_completions
       WHERE habit_id = $1 AND user_id = $2 ORDER BY completed_at DESC`,
      [id, req.user.id]
    );
    const dates = result.rows.map((r) => new Date(r.completed_at).toDateString());
    let streak = 0;
    let check = new Date();
    for (let i = 0; i < 365; i++) {
      if (dates.includes(check.toDateString())) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    res.json({ success: true, data: { streak } });
  } catch (err) {
    next(err);
  }
};

// All habit stats (today's status, streaks)
const getStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const habits = await query(
      `SELECT h.id, h.name, h.frequency,
              EXISTS(
                SELECT 1 FROM habit_completions hc
                WHERE hc.habit_id = h.id AND hc.completed_at = $2
              ) AS completed_today
       FROM habits h WHERE h.user_id = $1 AND h.is_active = TRUE`,
      [req.user.id, today]
    );

    // Compute streaks in JS
    const allCompletions = await query(
      `SELECT habit_id, completed_at FROM habit_completions
       WHERE user_id = $1 ORDER BY habit_id, completed_at DESC`,
      [req.user.id]
    );

    const completionMap = {};
    for (const row of allCompletions.rows) {
      if (!completionMap[row.habit_id]) completionMap[row.habit_id] = [];
      completionMap[row.habit_id].push(new Date(row.completed_at).toDateString());
    }

    const habitsWithStreak = habits.rows.map((h) => {
      const dates = completionMap[h.id] || [];
      let streak = 0;
      let check = new Date();
      for (let i = 0; i < 365; i++) {
        if (dates.includes(check.toDateString())) {
          streak++;
          check.setDate(check.getDate() - 1);
        } else break;
      }
      return { ...h, streak };
    });

    const completedToday = habitsWithStreak.filter((h) => h.completed_today).length;
    res.json({
      success: true,
      data: {
        habits: habitsWithStreak,
        totalHabits: habitsWithStreak.length,
        completedToday,
        completionRate: habitsWithStreak.length > 0
          ? Math.round((completedToday / habitsWithStreak.length) * 100)
          : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove, completeHabit, uncompleteHabit, getCompletions, getStreak, getStats };

const { query } = require('../config/db');
const { generateContent } = require('../config/gemini');

const getAdvice = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Gather user's financial context
    const [income, expenses, habits, goals, investments] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(amount),0) AS total, EXTRACT(MONTH FROM date) AS month
         FROM income_records WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())
         GROUP BY month ORDER BY month DESC LIMIT 3`,
        [userId]
      ),
      query(
        `SELECT category, COALESCE(SUM(amount),0) AS total
         FROM expense_records WHERE user_id = $1
         AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW())
         AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())
         GROUP BY category ORDER BY total DESC`,
        [userId]
      ),
      query(
        `SELECT name, frequency, EXISTS(
           SELECT 1 FROM habit_completions hc WHERE hc.habit_id = habits.id AND hc.completed_at = CURRENT_DATE
         ) AS completed_today FROM habits WHERE user_id = $1 AND is_active = TRUE`,
        [userId]
      ),
      query(
        `SELECT title, target_amount, current_amount, deadline FROM savings_goals WHERE user_id = $1`,
        [userId]
      ),
      query(
        `SELECT asset_name, asset_type, amount_invested, current_value FROM investments WHERE user_id = $1`,
        [userId]
      ),
    ]);

    const context = `
You are a professional financial advisor AI assistant for an app called "Financial Habit Builder & Wealth Growth Tracker".
You provide personalized, actionable financial advice based on the user's data.

USER FINANCIAL CONTEXT:
- Recent monthly income (last 3 months): ${JSON.stringify(income.rows)}
- This month's expenses by category: ${JSON.stringify(expenses.rows)}
- Active habits: ${JSON.stringify(habits.rows)}
- Savings goals: ${JSON.stringify(goals.rows)}
- Investments: ${JSON.stringify(investments.rows)}

USER MESSAGE: ${message}

Please provide helpful, encouraging, and specific financial advice. Keep your response concise (max 300 words), structured with headers if needed, and always end with an actionable tip.
`.trim();

    const response = await generateContent(context);

    // Save conversation
    await query(
      'INSERT INTO ai_conversations (user_id, message, response) VALUES ($1, $2, $3)',
      [userId, message, response]
    );

    res.json({ success: true, data: { response, timestamp: new Date().toISOString() } });
  } catch (err) {
    if (err.message?.includes('GEMINI_API_KEY')) {
      return res.status(503).json({ success: false, message: 'AI service not configured. Please set GEMINI_API_KEY.' });
    }
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const result = await query(
      `SELECT id, message, response, created_at FROM ai_conversations
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAdvice, getHistory };

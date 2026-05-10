# Database Data Flow

This project uses PostgreSQL as the source of truth for user-facing data.

## Frontend Views and Data Sources

### Overview View

- Endpoint: `GET /api/dashboard`
- Data shown:
  - Monthly income
  - Monthly expense
  - Monthly savings
  - Net worth
  - Savings goals progress
  - Net worth trend bars
  - Habit completion summary

### Habits View

- Endpoint: `GET /api/habits/stats`
- Data shown:
  - Active habits list
  - Per-habit streak
  - Frequency
  - Completed-today state
  - Overall completion rate

### AI Advisor View

- Endpoint: `GET /api/ai/history`
- Data shown:
  - Stored user and AI conversation history from `ai_conversations`

- Endpoint: `POST /api/ai/advice`
- Action:
  - Saves user prompt and generated AI response into database
  - Returns latest response for UI rendering

### Header Profile

- Endpoint: `GET /api/users/profile`
- Data shown:
  - User name and profile identity data in header

## Backend Aggregation Layer

- `dashboardController.js` combines income, expenses, savings, investments, and habits data from multiple tables into a single response.
- `habitController.js` computes habit streaks and completion metrics.
- `aiController.js` stores and retrieves AI conversation records.

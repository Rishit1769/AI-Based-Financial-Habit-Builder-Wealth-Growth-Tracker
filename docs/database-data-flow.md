# Database and Data Flow

PostgreSQL is the system of record for user identity, financial entries, habits, reports metadata, notifications, and admin moderation data.

## Core Data Domains

- users and refresh_tokens
- financial_profiles
- income_records and expense_records
- habits and habit_completions
- savings_goals
- investments
- ai_conversations
- reports
- notifications
- user_feedback
- otp_verifications

## Frontend to API to Database Flow

### Overview View

Frontend endpoint:

- GET /api/dashboard

Controller behavior:

- Aggregates monthly income, monthly expenses, savings totals, investments totals, habit completion status, recent transactions, savings goals, net worth trend, and category-level expenses.
- Queries multiple tables in parallel and returns a consolidated payload.

Source tables:

- income_records
- expense_records
- savings_goals
- investments
- habits
- habit_completions

### Transactions View

Frontend endpoints:

- GET /api/income
- GET /api/expenses
- GET /api/income/summary
- GET /api/expenses/summary
- POST /api/income
- POST /api/expenses

Source tables:

- income_records
- expense_records

Flow notes:

- Month and year query filters are passed from UI.
- UI merges income and expense payloads for unified transaction display.

### Allocation View

Frontend endpoints:

- GET /api/investments/summary
- GET /api/savings
- POST /api/investments
- POST /api/savings

Source tables:

- investments
- savings_goals

Flow notes:

- Investment summary returns by-type totals and aggregate gain or loss.
- Savings goals are returned as full rows and visualized against targets.

### Habits View

Frontend endpoints:

- GET /api/habits/stats
- POST /api/habits
- POST /api/habits/:id/complete
- DELETE /api/habits/:id/complete

Source tables:

- habits
- habit_completions

Flow notes:

- Completion toggles are persisted by date.
- Streaks are computed server-side from completion history.

### Reports View

Frontend endpoints:

- GET /api/reports
- POST /api/reports/generate
- GET /api/reports/:reportId/download

Source tables:

- reports
- income_records
- expense_records

Object storage:

- MinIO reports bucket stores generated PDF binary files.

Flow notes:

- Generate route builds PDF from SQL data, uploads to object storage, and stores metadata in reports.
- Download route streams PDF and attempts to email attachment to user.

### Advisor View

Frontend endpoints:

- GET /api/ai/history
- POST /api/ai/advice

Source table:

- ai_conversations

Flow notes:

- Advice request builds contextual prompt from user income, expenses, habits, goals, and investments.
- Prompt and model response are stored for history playback.

### Settings View

Frontend endpoints:

- GET /api/users/profile
- PUT /api/users/profile
- PUT /api/users/change-password

Source tables:

- users
- financial_profiles
- refresh_tokens

Flow notes:

- Profile updates write to both users and financial_profiles.
- Password change revokes all refresh tokens.

### Notifications

Frontend endpoint:

- GET /api/notifications (when consumed by UI)

Source table:

- notifications

Flow notes:

- Notifications are inserted by scheduled jobs (habit reminders) and can be marked read or deleted via notification endpoints.

## Scheduled Data Flow

The scheduler service starts with backend boot and runs two cron jobs:

- Daily at 08:00: finds users with pending habits, sends reminder email, inserts notifications rows.
- Monthly on day 1 at 09:00: generates previous month report for active users, stores report metadata, sends monthly report email when presigned URL is available.

## Report Data Pipeline

1. API receives report generation request with date mode.
2. Date range is resolved and validated.
3. Income and expense rows are queried for user and period.
4. PDF is built using PDFKit.
5. PDF buffer is uploaded to MinIO reports bucket.
6. reports row is inserted with file key and period code.
7. Presigned URL is generated for client consumption.

## Reliability Notes

- Most list endpoints support paging to protect query volume.
- Dashboard email alerts are in-memory de-duplicated per user per month per alert type.
- Email sending in non-critical paths is non-blocking where appropriate.

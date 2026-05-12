# API Endpoints

All endpoints are prefixed with /api.

## Authentication and Access

Public endpoints:

- POST /auth/send-otp
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET /download/apk
- GET /health

Authenticated endpoints require:

- Authorization: Bearer <access_token>

Admin-only endpoints require:

- Valid access token
- Authenticated user role set to admin

## Response Convention

Most handlers return:

- success: boolean
- message: string (when relevant)
- data: object or array (when relevant)
- pagination: object (for paginated list endpoints)

## Auth

### POST /auth/send-otp

Validates and sends email OTP for registration.

Body:

- name: string, required, min length 2
- email: valid email, required

### POST /auth/register

Verifies OTP, creates user, initializes financial profile, and returns auth tokens.

Body:

- name: string, required, 2 to 100 chars
- phone: string, required, regex ^\+?[0-9]{10,15}$
- email: valid email, required
- password: string, required, min 8 chars
- otp: string, required

### POST /auth/login

Authenticates user and returns access and refresh token pair.

Body:

- email: valid email, required
- password: string, required

### POST /auth/refresh

Rotates refresh token and returns a new token pair.

Body:

- refreshToken: string, required

### POST /auth/logout

Revokes provided refresh token (if present).

Body:

- refreshToken: string, optional

## Users

All routes in this section require authentication.

### GET /users/profile

Returns user profile joined with financial profile fields.

### PUT /users/profile

Updates user and financial profile fields.

Body (all optional):

- name
- avatar_url
- currency
- monthly_income_target
- bio

### PUT /users/change-password

Changes password and revokes all refresh tokens for the user.

Body:

- currentPassword: string, required
- newPassword: string, required

## Income

All routes in this section require authentication.

### GET /income

List income records with filters and pagination.

Query params:

- page, default 1
- limit, default 20
- year, optional
- month, optional (works with year)
- category, optional

### GET /income/summary

Year summary grouped by month and category.

Query params:

- year, default current year

### POST /income

Create income record.

Body:

- source
- amount
- category, default salary
- notes
- date

### PUT /income/:id

Partial update for an income record.

### DELETE /income/:id

Delete an income record.

## Expenses

All routes in this section require authentication.

### GET /expenses

List expense records with filters and pagination.

Query params:

- page, default 1
- limit, default 20
- year, optional
- month, optional (works with year)
- category, optional (validated against allowed categories)

### GET /expenses/summary

Returns category totals, month totals, and total amount.

Query params:

- year, default current year
- month, optional

### POST /expenses

Create expense record.

Body:

- description
- amount
- category, default other
- notes
- date

### PUT /expenses/:id

Partial update for an expense record.

### DELETE /expenses/:id

Delete an expense record.

## Habits

All routes in this section require authentication.

### GET /habits

Returns all habits with total completion counts.

### GET /habits/stats

Returns active habits, completed_today status, streaks, and completion rate.

### POST /habits

Create habit.

Body:

- name
- description
- frequency, default daily
- target_count, default 1

### PUT /habits/:id

Partial update of habit fields.

### DELETE /habits/:id

Delete habit.

### POST /habits/:id/complete

Mark habit complete for date (upsert behavior).

Body:

- date, optional, default today
- notes, optional

### DELETE /habits/:id/complete

Remove completion for date.

Body:

- date, optional, default today

### GET /habits/:id/completions

Returns completion dates.

Query params:

- days, default 90

### GET /habits/:id/streak

Returns current streak.

## Savings

All routes in this section require authentication.

### GET /savings

List savings goals.

### POST /savings

Create savings goal.

Body:

- title
- description
- target_amount
- current_amount, default 0
- deadline
- category, default general

### PUT /savings/:id

Partial update of savings goal fields.

### POST /savings/:id/contribute

Add contribution amount and auto-update completion state.

Body:

- amount

### DELETE /savings/:id

Delete savings goal.

## Investments

All routes in this section require authentication.

### GET /investments

List investments.

### GET /investments/summary

Returns totals by asset type and portfolio-level gain or loss.

### POST /investments

Create investment.

Body:

- asset_name
- asset_type, default other
- amount_invested
- current_value, default amount_invested
- notes
- date_added

### PUT /investments/:id

Partial update of investment fields.

### DELETE /investments/:id

Delete investment.

## Dashboard

All routes in this section require authentication.

### GET /dashboard

Returns consolidated dashboard payload including:

- overview (income, expense, savings, net worth)
- habitStats
- recentTransactions
- savingsGoals
- netWorthTrend
- expenseByCategory

### GET /dashboard/monthly-comparison

Returns month-wise income and expense comparison series.

Query params:

- months, default 6

## AI

All routes in this section require authentication.

### POST /ai/advice

Generates contextual advice from user financial data and saves conversation.

Body:

- message

### GET /ai/history

Returns paginated conversation history.

Query params:

- page, default 1
- limit, default 20

## Reports

All routes in this section require authentication.

### GET /reports

Returns report history with presigned download URLs and parsed date metadata.

### POST /reports/generate

Generates report and stores metadata. Supported modes:

- Custom date range via fromDate and toDate
- Preset past_6_months
- Preset past_year
- Monthly period via period in YYYY-MM format
- Default current month when no inputs provided

Body options:

- fromDate
- toDate
- preset
- period

### GET /reports/:reportId/download

Streams PDF report as attachment and attempts to send a copy by email.

Response header:

- X-Report-Email-Status: sent or failed

### POST /reports/:reportId/email

Emails report download link to authenticated user.

## Notifications

All routes in this section require authentication.

### GET /notifications

Returns latest notifications (up to 50).

### PUT /notifications/read-all

Marks all notifications as read.

### PUT /notifications/:id/read

Marks a single notification as read.

### DELETE /notifications/clear-read

Deletes all read notifications.

### DELETE /notifications/:id

Deletes a single notification.

## Admin

All routes in this section require auth plus admin role.

### GET /admin/users

List users with pagination and optional search.

Query params:

- page, default 1
- limit, default 20
- search, optional

### PUT /admin/users/:userId/toggle

Toggles active status for non-admin users.

### DELETE /admin/users/:userId

Deletes non-admin user.

### GET /admin/stats

Returns platform-level totals across users, transactions, habits, goals, investments, and reports.

### GET /admin/activity

Returns month-wise activity trends for users, income, and expenses.

### GET /admin/feedback

List user feedback with filters and pagination.

Query params:

- status, optional (all, open, in_review, resolved, closed)
- page, default 1
- limit, default 20

### PUT /admin/feedback/:feedbackId/status

Updates feedback status and optional admin notes.

Body:

- status, required
- admin_notes, optional

### DELETE /admin/feedback/:feedbackId

Deletes feedback record.

## Download

### GET /download/apk

Public APK stream from object storage.

Returns:

- 404 if APK object is missing
- 503 if storage service is unavailable

## Health

### GET /health

Basic API health check endpoint.

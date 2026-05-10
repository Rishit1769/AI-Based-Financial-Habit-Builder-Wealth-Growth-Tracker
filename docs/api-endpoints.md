# API Endpoints in Use

All endpoints are prefixed with `/api`.

## Auth

- `POST /api/auth/send-otp`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

## User

- `GET /api/users/profile`
- `PUT /api/users/profile`
- `PUT /api/users/change-password`

## Income

- `GET /api/income`
- `GET /api/income/summary`
- `POST /api/income`
- `PUT /api/income/:id`
- `DELETE /api/income/:id`

## Expenses

- `GET /api/expenses`
- `GET /api/expenses/summary`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

## Dashboard and Habits

- `GET /api/dashboard`
- `GET /api/dashboard/monthly-comparison`

- `GET /api/habits`
- `GET /api/habits/stats`
- `POST /api/habits`
- `PUT /api/habits/:id`
- `DELETE /api/habits/:id`
- `POST /api/habits/:id/complete`
- `DELETE /api/habits/:id/complete`
- `GET /api/habits/:id/completions`
- `GET /api/habits/:id/streak`

## Savings Goals

- `GET /api/savings`
- `POST /api/savings`
- `PUT /api/savings/:id`
- `POST /api/savings/:id/contribute`
- `DELETE /api/savings/:id`

## Investments

- `GET /api/investments`
- `GET /api/investments/summary`
- `POST /api/investments`
- `PUT /api/investments/:id`
- `DELETE /api/investments/:id`

## AI

- `GET /api/ai/history`
- `POST /api/ai/advice`

## Reports

- `GET /api/reports`
- `POST /api/reports/generate`
- `GET /api/reports/:reportId/download`
- `POST /api/reports/:reportId/email`

## Notifications

- `GET /api/notifications`
- `PUT /api/notifications/read-all`
- `PUT /api/notifications/:id/read`
- `DELETE /api/notifications/clear-read`
- `DELETE /api/notifications/:id`

## Admin (Auth + Admin Only)

- `GET /api/admin/users`
- `PUT /api/admin/users/:userId/toggle`
- `DELETE /api/admin/users/:userId`
- `GET /api/admin/stats`
- `GET /api/admin/activity`
- `GET /api/admin/feedback`
- `PUT /api/admin/feedback/:feedbackId/status`
- `DELETE /api/admin/feedback/:feedbackId`

## Download

- `GET /api/download/apk`

## Health

- `GET /api/health`

## Notes

All authenticated endpoints require:

- Header: `Authorization: Bearer <access-token>`

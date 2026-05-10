# API Endpoints in Use

## Auth

- `POST /api/auth/send-otp`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

## User

- `GET /api/users/profile`

## Dashboard and Habits

- `GET /api/dashboard`
- `GET /api/habits/stats`

## AI

- `GET /api/ai/history`
- `POST /api/ai/advice`

## Notes

All authenticated endpoints require:

- Header: `Authorization: Bearer <access-token>`

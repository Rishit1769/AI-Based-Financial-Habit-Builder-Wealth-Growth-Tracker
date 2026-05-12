# Financial Habit Builder and Wealth Growth Tracker

A full-stack personal finance platform that combines financial tracking, habit consistency, AI-assisted coaching, and PDF reporting.

## Product Overview

The application is designed for users who want one workspace for day-to-day money operations and long-term wealth habits.

Core capabilities:

- Email OTP registration with JWT-based authentication and refresh token rotation
- Income and expense ledger with month and year summaries
- Habit creation, daily completion tracking, and streak analytics
- Savings goals and investment allocation insights
- Aggregated dashboard metrics and trend visualizations
- AI financial guidance using Gemini with persisted conversation history
- PDF report generation with MinIO storage and downloadable artifacts
- Notification center plus admin moderation and platform analytics

## Architecture

Frontend:

- React 19 + Vite
- Tailwind CSS v4 styling system
- View-driven dashboard modules (Overview, Transactions, Allocation, Habits, Reports, Settings, Advisor)

Backend:

- Node.js + Express REST API
- PostgreSQL as primary datastore
- JWT access/refresh auth model with middleware-protected routes
- Cron scheduler for daily reminders and monthly report jobs

Supporting services:

- MinIO for report PDFs and APK artifact distribution
- Nodemailer for OTP, reminders, and report emails
- Google Gemini API for advisor responses

## Repository Layout

```text
.
|-- backend/
|   |-- server.js
|   |-- .env.example
|   `-- src/
|       |-- config/
|       |-- controllers/
|       |-- db/
|       |-- middleware/
|       |-- routes/
|       `-- services/
|-- frontend/
|   |-- index.html
|   |-- vite.config.js
|   `-- src/
|       |-- components/
|       |-- context/
|       |-- services/
|       |-- styles/
|       `-- views/
|-- docs/
|-- dev.js
`-- package.json
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MinIO (or S3-compatible object storage)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure backend environment

```bash
copy backend\.env.example backend\.env
```

Update backend/.env with valid values for database, JWT, MinIO, SMTP, and Gemini.

### 3. Run database migration

```bash
npm run migrate --prefix backend
```

### 4. Start development servers

```bash
npm run dev
```

The root dev script uses dev.js to avoid Windows shell parsing issues in folder names that contain ampersands.

## Environment Variables

Backend variables (backend/.env):

| Variable | Required | Description |
|---|---|---|
| NODE_ENV | Yes | Runtime mode, usually development or production |
| PORT | Yes | Backend server port |
| FRONTEND_URL | Yes | Allowed CORS origin(s), comma-separated supported |
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Access token signing key |
| JWT_REFRESH_SECRET | Yes | Refresh token signing key |
| JWT_EXPIRES_IN | Optional | Access token lifetime, default 15m |
| JWT_REFRESH_EXPIRES_IN | Optional | Refresh token lifetime, default 7d |
| EMAIL_HOST | Yes | SMTP host |
| EMAIL_PORT | Yes | SMTP port |
| EMAIL_USER | Yes | SMTP username |
| EMAIL_PASS | Yes | SMTP password or app password |
| EMAIL_FROM | Optional | Sender display and email |
| GEMINI_API_KEY | Yes for AI | Gemini API key |
| MINIO_ENDPOINT | Yes | MinIO/S3 host |
| MINIO_PORT | Yes | MinIO/S3 port |
| MINIO_USE_SSL | Yes | true or false |
| MINIO_ACCESS_KEY | Yes | Object storage access key |
| MINIO_SECRET_KEY | Yes | Object storage secret key |
| MINIO_BUCKET_REPORTS | Yes | Bucket for generated reports |
| MINIO_BUCKET_APK | Yes | Bucket for downloadable APK |
| APK_OBJECT_NAME | Optional | APK object key, default financial-habit-builder.apk |

Frontend variables (optional, frontend/.env):

| Variable | Required | Description |
|---|---|---|
| VITE_API_BASE_URL | No | API base URL, defaults to http://localhost:5000/api |

## Scripts

Root:

- npm run dev
- npm run backend
- npm run frontend
- npm run install:all

Backend:

- npm run dev --prefix backend
- npm run start --prefix backend
- npm run migrate --prefix backend

Frontend:

- npm run dev --prefix frontend
- npm run build --prefix frontend
- npm run preview --prefix frontend

## API Surface

All endpoints are under /api.

Public routes:

- /auth/*
- /download/apk
- /health

Protected routes:

- /users
- /income
- /expenses
- /habits
- /savings
- /investments
- /dashboard
- /ai
- /reports
- /notifications

Admin-only routes:

- /admin

For full endpoint and parameter details, see docs/api-endpoints.md.

## Operations and Security Notes

- Global API rate limit: 300 requests per 15 minutes
- Auth routes rate limit: 20 requests per hour
- Access tokens are short-lived; refresh endpoint rotates refresh tokens
- Report download responses expose X-Report-Email-Status to indicate email attachment delivery outcome

## Documentation

- docs/README.md
- docs/api-endpoints.md
- docs/authentication-flow.md
- docs/database-data-flow.md
- docs/development-workflow.md


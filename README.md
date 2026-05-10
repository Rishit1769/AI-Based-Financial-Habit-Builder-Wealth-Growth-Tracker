# Financial Habit Builder and Wealth Growth Tracker

A full-stack personal finance platform with habit tracking, AI guidance, dynamic analytics charts, and premium PDF reporting.

## Current Status

- Backend: Express + PostgreSQL API with JWT auth, reporting, scheduler, and email integration
- Frontend: React + Vite dashboard with live chart visualizations across Overview, Transactions, Allocation, Habits, and Reports
- Storage: MinIO buckets for generated reports and APK download artifacts
- AI: Gemini-powered advisor endpoint with persisted chat history

## Features

- Secure auth with OTP onboarding, login, refresh, and logout
- Income and expense tracking with filters and summaries
- Habit management with daily completion, streaks, and stats
- Savings goals and investments with live allocation analytics
- Dashboard aggregation endpoint for cross-module insights
- AI advisor chat and history
- Date-range and preset PDF report generation with email delivery
- In-app notifications and admin management endpoints
- Reusable frontend chart system:
    - line trend charts
    - grouped bar charts
    - donut breakdown charts

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion, React Icons |
| Backend | Node.js, Express, PostgreSQL, JWT, bcryptjs |
| Reports | PDFKit, MinIO |
| AI | Google Generative AI (Gemini) |
| Email | Nodemailer |

## Repository Layout

```
.
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── db/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   └── charts/
│       ├── context/
│       ├── services/
│       ├── styles/
│       └── views/
├── docs/
├── dev.js
└── package.json
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- MinIO (or compatible S3 endpoint)

### 1) Install dependencies

```bash
npm run install:all
```

### 2) Configure environment

```bash
cp backend/.env.example backend/.env
```

Update backend/.env with valid DB, JWT, MinIO, Gemini, and SMTP values.

### 3) Run database migration

```bash
npm run migrate --prefix backend
```

### 4) Start development

```bash
npm run dev
```

This uses dev.js to start backend and frontend safely on Windows when the folder path contains an ampersand.

## Build and Run Notes

- Standard frontend build:

```bash
npm run build --prefix frontend
```

- If your shell fails because of special characters in the folder path, run Vite directly:

```bash
cd frontend
node .\node_modules\vite\bin\vite.js build
```

## Scripts

Root package scripts:

- npm run dev
- npm run backend
- npm run frontend
- npm run install:all

Backend package scripts:

- npm run dev --prefix backend
- npm run start --prefix backend
- npm run migrate --prefix backend

Frontend package scripts:

- npm run dev --prefix frontend
- npm run build --prefix frontend
- npm run preview --prefix frontend

## API Summary

Base path: /api

- /auth
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
- /admin
- /download
- /health

For full route list, see docs/api-endpoints.md.

## Documentation

- docs/README.md
- docs/authentication-flow.md
- docs/database-data-flow.md
- docs/development-workflow.md
- docs/api-endpoints.md


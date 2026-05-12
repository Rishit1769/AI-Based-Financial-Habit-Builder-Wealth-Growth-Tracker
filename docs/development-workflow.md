# Development Workflow

This guide documents the day-to-day workflow for local development, feature delivery, and release readiness.

## Local Development Setup

1. Install dependencies:
	- npm run install:all
2. Configure backend environment:
	- copy backend/.env.example to backend/.env
3. Run schema migration:
	- npm run migrate --prefix backend
4. Start frontend and backend together:
	- npm run dev

Note:

- The root dev script uses dev.js to safely run both servers on Windows paths that contain ampersands.

## Service Startup Model

- Backend runs via nodemon server.js.
- Frontend runs via Vite dev server.
- Scheduler service starts automatically with backend boot.

## Build and Preview

Frontend build:

- npm run build --prefix frontend

Frontend preview:

- npm run preview --prefix frontend

Windows fallback for special shell path parsing issues:

- cd frontend
- node .\node_modules\vite\bin\vite.js build

## Branch and Commit Workflow

Recommended flow per feature slice:

1. Create or switch to feature branch.
2. Implement a single cohesive change set.
3. Run manual verification and build checks.
4. Stage only relevant files.
5. Commit with clear scope.
6. Push and open pull request.

Suggested commit style examples:

- feat(auth): add OTP verification validation
- feat(reports): support custom date range generation
- fix(dashboard): correct monthly comparison aggregation
- docs(api): align endpoints with controller behavior

## Pre-merge Verification Checklist

- Backend boots without runtime errors.
- Database migration succeeds on clean database.
- Auth flow covers register, OTP verify, login, logout.
- Token-protected routes reject missing or invalid auth headers.
- Frontend views load data from live APIs, not static mocks.
- Report generation and download path are functional.
- No environment secrets are committed.

## Operational Checks for Integrations

Email:

- OTP email delivery works with configured SMTP account.
- Report email behavior is validated on download and explicit email endpoint.

MinIO:

- Reports and APK buckets exist and are accessible.
- Presigned URL generation works for report download links.

Gemini:

- GEMINI_API_KEY is configured.
- AI advisor handles missing or invalid key with expected 503 behavior.

## Common Troubleshooting

Token expired responses:

- API returns 401 with code TOKEN_EXPIRED.
- Refresh access token through /api/auth/refresh and retry.

CORS errors:

- Ensure FRONTEND_URL in backend/.env includes active frontend origin.
- Multiple origins can be set as comma-separated values.

Migration issues:

- Verify DATABASE_URL points to reachable PostgreSQL instance.
- Confirm user has rights to create extensions and tables.

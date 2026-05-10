# Development and Release Workflow

## Feature Branch and Commit Workflow

For each successful feature implementation:

1. Validate the feature locally (build/test/manual checks).
2. Stage only relevant files for the feature.
3. Create one commit for that feature.
4. Push the commit to GitHub.

Current team convention in this repository: commit after every completed feature slice.

## Recommended Commit Message Format

- `feat(auth): require phone in OTP registration flow`
- `feat(frontend): add OTP auth screens and DB-backed dashboard data`
- `docs: add structured project documentation`

## Local Run Workflow

1. Install dependencies:
	- `npm run install:all`
2. Configure backend environment:
	- copy `backend/.env.example` to `backend/.env`
3. Run database migration:
	- `npm run migrate --prefix backend`
4. Start both servers:
	- `npm run dev`

## Build Workflow

- Frontend standard build command:
  - `npm run build --prefix frontend`
- If shell path parsing fails on Windows due to special characters in folder path:
  - run from `frontend/`: `node .\\node_modules\\vite\\bin\\vite.js build`

## Verification Checklist

- Backend validation aligns with frontend form requirements.
- Frontend data is read from API endpoints backed by database queries.
- No hardcoded user-specific values for identity or finance metrics.
- Build completes successfully.
- Chart rendering logic correctly distinguishes zero values from non-zero values.
- Header and navigation UI updates preserve responsiveness.

# Development and Release Workflow

## Feature Branch and Commit Workflow

For each successful feature implementation:

1. Validate the feature locally (build/test/manual checks).
2. Stage only relevant files for the feature.
3. Create one commit for that feature.
4. Push the commit to GitHub.

## Recommended Commit Message Format

- `feat(auth): require phone in OTP registration flow`
- `feat(frontend): add OTP auth screens and DB-backed dashboard data`
- `docs: add structured project documentation`

## Verification Checklist

- Backend validation aligns with frontend form requirements.
- Frontend data is read from API endpoints backed by database queries.
- No hardcoded user-specific values for identity or finance metrics.
- Build completes successfully.

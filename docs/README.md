# Documentation Index

This directory contains implementation-aligned project documentation for backend APIs, authentication, data architecture, and team workflow.

## Documents

- [API Endpoints](./api-endpoints.md)
- [Authentication Flow](./authentication-flow.md)
- [Database and Data Flow](./database-data-flow.md)
- [Development Workflow](./development-workflow.md)

## Scope

These docs are written against the current codebase in backend/ and frontend/ and are intended for:

- onboarding new developers
- API integration planning
- feature-level impact analysis
- release readiness and verification

## Maintenance Notes

- Update these files whenever routes, payloads, middleware rules, or scheduler behavior changes.
- Keep endpoint behavior synchronized with backend/src/routes and backend/src/controllers.
- Keep UI data flow synchronized with frontend/src/views and frontend/src/services/api.js.

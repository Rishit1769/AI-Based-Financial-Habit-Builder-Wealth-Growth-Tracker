# Authentication Flow

This project uses email OTP onboarding with JWT access and refresh tokens.

## Registration Flow

1. User enters name, phone, email, and password on the Register screen.
2. Frontend calls POST /api/auth/send-otp with name and email.
3. Backend validates request, generates a 6-digit OTP, stores a hashed OTP, and emails it.
4. Frontend persists pending registration details locally and routes to OTP verification.
5. User submits OTP.
6. Frontend calls POST /api/auth/register with name, phone, email, password, and otp.
7. Backend verifies OTP and expiry, creates user, creates financial profile, removes OTP entry, and issues access and refresh tokens.
8. Frontend stores tokens and user object in localStorage under wealthgrow.auth.

## Login Flow

1. User submits email and password.
2. Frontend calls POST /api/auth/login.
3. Backend validates credentials and active user status, issues access and refresh tokens, and stores refresh token in database.
4. Frontend stores auth session and enters authenticated app shell.

## Session Restore Flow

1. On initial load, frontend checks for a stored access token.
2. If token exists, frontend calls GET /api/users/profile.
3. If successful, profile data is rehydrated into client state.
4. If profile fetch fails (invalid or expired token), local session is cleared and user is returned to login.

## Token Refresh Flow

1. Frontend can call POST /api/auth/refresh with refreshToken.
2. Backend verifies token signature and database presence.
3. Backend rotates refresh token: old token is deleted and a new token pair is issued.
4. Client should replace both access and refresh tokens with newly returned values.

## Logout Flow

1. Frontend attempts POST /api/auth/logout with refreshToken if available.
2. Backend deletes that refresh token record if provided.
3. Frontend always clears local session storage, even if network/API logout fails.

## Protected Route Behavior

Authentication middleware expects:

- Authorization: Bearer <access_token>

Failure responses:

- 401 Access token required (missing header)
- 401 Token expired with code TOKEN_EXPIRED
- 401 Invalid token
- 401 User not found or inactive

Admin endpoints add a second guard:

- 403 Admin access required when role is not admin

## Validation Rules (Server-side)

Auth route validation currently enforces:

- send-otp: valid email, name length >= 2
- register: name length 2-100, phone format ^\+?[0-9]{10,15}$, valid email, password length >= 8, otp required
- login: valid email, password required

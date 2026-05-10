# Authentication Flow

## Registration Flow

1. User fills registration form with:
   - Name
   - Phone number
   - Email
   - Password
2. Frontend calls `POST /api/auth/send-otp` with name and email.
3. User is redirected to a dedicated OTP verification screen.
4. User submits OTP on OTP screen.
5. Frontend calls `POST /api/auth/register` with:
   - name
   - phone
   - email
   - password
   - otp
6. Backend verifies OTP, creates user, initializes financial profile, then returns access and refresh tokens.

## Login Flow

1. User enters email and password.
2. Frontend calls `POST /api/auth/login`.
3. On success, access and refresh tokens are saved locally and the app enters authenticated mode.

## Logout Flow

1. Frontend calls `POST /api/auth/logout` with refresh token when available.
2. Local session data is cleared even if the API call fails.

## Session Restore Flow

1. On app load, frontend checks local auth storage.
2. If token exists, frontend calls `GET /api/users/profile`.
3. If profile fetch succeeds, session is restored.
4. If it fails, user is redirected to login.

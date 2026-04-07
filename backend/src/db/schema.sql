-- ============================================================
-- Financial Habit Builder & Wealth Growth Tracker – Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  role          VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Refresh Tokens ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Financial Profiles ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency              VARCHAR(10) NOT NULL DEFAULT 'INR',
  monthly_income_target NUMERIC(14,2) DEFAULT 0,
  bio                   TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Income Records ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS income_records (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source     VARCHAR(150) NOT NULL,
  amount     NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  category   VARCHAR(50) NOT NULL DEFAULT 'salary',
  notes      TEXT,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Expense Records ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount      NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  category    VARCHAR(50) NOT NULL DEFAULT 'other'
              CHECK (category IN ('food','transport','rent','entertainment','health','education','shopping','utilities','other')),
  notes       TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Habits ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(150) NOT NULL,
  description  TEXT,
  frequency    VARCHAR(10) NOT NULL DEFAULT 'daily'
               CHECK (frequency IN ('daily','weekly','monthly')),
  target_count INT NOT NULL DEFAULT 1,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Habit Completions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_completions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id     UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, completed_at)
);

-- ─── Savings Goals ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS savings_goals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(150) NOT NULL,
  description      TEXT,
  target_amount    NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
  deadline         DATE,
  category         VARCHAR(50) NOT NULL DEFAULT 'general',
  is_completed     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Investments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_name      VARCHAR(150) NOT NULL,
  asset_type      VARCHAR(30) NOT NULL DEFAULT 'other'
                  CHECK (asset_type IN ('stock','crypto','real_estate','mutual_fund','gold','fd','other')),
  amount_invested NUMERIC(14,2) NOT NULL CHECK (amount_invested >= 0),
  current_value   NUMERIC(14,2) NOT NULL CHECK (current_value >= 0),
  notes           TEXT,
  date_added      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AI Conversations ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  response   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Reports ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(30) NOT NULL DEFAULT 'monthly',
  file_url    TEXT NOT NULL,
  period      VARCHAR(20),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── OTP Verifications ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_verifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      VARCHAR(255) NOT NULL,
  otp_hash   TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Notifications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(150) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(30) NOT NULL DEFAULT 'general',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_income_user_date      ON income_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expense_user_date     ON expense_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expense_user_cat      ON expense_records(user_id, category);
CREATE INDEX IF NOT EXISTS idx_otp_email             ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_habits_user           ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_comp_habit      ON habit_completions(habit_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_comp_user       ON habit_completions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_savings_user          ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user      ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_refresh_token         ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_user          ON refresh_tokens(user_id);

-- ─── Updated_at trigger function ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','financial_profiles','income_records','expense_records',
    'habits','savings_goals','investments'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I;
       CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t, t);
  END LOOP;
END $$;

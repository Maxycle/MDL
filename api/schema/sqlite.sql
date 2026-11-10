-- Mouvement des Libertariens — SQLite schema for local development.
-- Same tables and columns as mysql.sql. Created by: php api/cli/install.php

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  intro TEXT NULL,
  certification TEXT NOT NULL DEFAULT 'SM',
  is_admin INTEGER NOT NULL DEFAULT 0,
  profile_public INTEGER NOT NULL DEFAULT 1,
  wants_pp INTEGER NOT NULL DEFAULT 0,
  reset_token_hash TEXT NULL,
  reset_expires_at TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE levels (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'beginner',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, domain)
);

CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  tries_permitted INTEGER NOT NULL DEFAULT 2,
  try_length_days INTEGER NOT NULL DEFAULT 7,
  cycle_length_days INTEGER NOT NULL DEFAULT 30,
  questions_per_attempt INTEGER NOT NULL DEFAULT 20,
  time_limit_minutes INTEGER NOT NULL DEFAULT 30,
  low_threshold INTEGER NOT NULL DEFAULT 90,
  mid_threshold INTEGER NOT NULL DEFAULT 80,
  high_threshold INTEGER NOT NULL DEFAULT 70,
  sa_open INTEGER NOT NULL DEFAULT 0,
  image_blur_top INTEGER NOT NULL DEFAULT 55,
  image_blur_bottom INTEGER NOT NULL DEFAULT 100,
  intro TEXT NULL,
  welcome_start TEXT NULL,
  welcome_end TEXT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,
  level TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX questions_pool ON questions(domain, level, active);

CREATE TABLE answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX answers_question ON answers(question_id);

CREATE TABLE attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  level TEXT NOT NULL,
  question_ids TEXT NOT NULL,
  started_at TEXT NOT NULL,
  deadline_at TEXT NOT NULL,
  finished_at TEXT NULL,
  avg_low REAL NULL,
  avg_mid REAL NULL,
  avg_high REAL NULL,
  passed INTEGER NULL
);
CREATE INDEX attempts_user ON attempts(user_id, domain, level, started_at);

CREATE TABLE attempt_answers (
  attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  answer_id INTEGER NOT NULL,
  revealed INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (attempt_id, question_id)
);

CREATE TABLE account_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  motivations TEXT NOT NULL,
  referrer_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'unverified',
  email_token_hash TEXT NULL,
  email_token_expires_at TEXT NULL,
  signup_token_hash TEXT NULL,
  signup_token_expires_at TEXT NULL,
  user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  submitted_at TEXT NULL,
  decided_at TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX requests_status ON account_requests(status);

CREATE TABLE request_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL REFERENCES account_requests(id) ON DELETE CASCADE,
  user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX events_request ON request_events(request_id);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL,
  cover_url TEXT NULL,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE throttle (
  k TEXT PRIMARY KEY,
  hits INTEGER NOT NULL,
  window_start TEXT NOT NULL
);

INSERT INTO settings (id, intro, welcome_start, welcome_end, updated_at)
VALUES (1, 'Validez les questionnaires « Droit Naturel » et « École Autrichienne » pour devenir membre certifié du mouvement.', 'Bienvenue', ' !', datetime('now'));

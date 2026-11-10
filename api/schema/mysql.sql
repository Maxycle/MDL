-- Mouvement des Libertariens — MySQL 8 / MariaDB schema
-- Import once with phpMyAdmin (Site Tools > MySQL > phpMyAdmin > Import)
-- or over SSH:  php api/cli/install.php

SET NAMES utf8mb4;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL,
  username VARCHAR(40) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  intro TEXT NULL,
  certification CHAR(2) NOT NULL DEFAULT 'SM',
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  profile_public TINYINT(1) NOT NULL DEFAULT 1,
  wants_pp TINYINT(1) NOT NULL DEFAULT 0,
  reset_token_hash CHAR(64) NULL,
  reset_expires_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY users_email (email),
  UNIQUE KEY users_username (username),
  KEY users_reset (reset_token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
  id CHAR(64) PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  KEY sessions_user (user_id),
  CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE levels (
  user_id INT UNSIGNED NOT NULL,
  domain CHAR(2) NOT NULL,
  level VARCHAR(8) NOT NULL DEFAULT 'beginner',
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (user_id, domain),
  CONSTRAINT levels_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE settings (
  id TINYINT UNSIGNED PRIMARY KEY,
  tries_permitted INT NOT NULL DEFAULT 2,
  try_length_days INT NOT NULL DEFAULT 7,
  cycle_length_days INT NOT NULL DEFAULT 30,
  questions_per_attempt INT NOT NULL DEFAULT 20,
  time_limit_minutes INT NOT NULL DEFAULT 30,
  low_threshold INT NOT NULL DEFAULT 90,
  mid_threshold INT NOT NULL DEFAULT 80,
  high_threshold INT NOT NULL DEFAULT 70,
  sa_open TINYINT(1) NOT NULL DEFAULT 0,
  image_blur_top INT NOT NULL DEFAULT 55,
  image_blur_bottom INT NOT NULL DEFAULT 100,
  intro TEXT NULL,
  welcome_start VARCHAR(120) NULL,
  welcome_end VARCHAR(120) NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE questions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  domain CHAR(2) NOT NULL,
  level CHAR(2) NOT NULL,
  difficulty VARCHAR(4) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(2048) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  KEY questions_pool (domain, level, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE answers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  points INT NOT NULL DEFAULT 0,
  position INT NOT NULL DEFAULT 0,
  KEY answers_question (question_id),
  CONSTRAINT answers_question_fk FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attempts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  domain CHAR(2) NOT NULL,
  level CHAR(2) NOT NULL,
  question_ids TEXT NOT NULL,
  started_at DATETIME NOT NULL,
  deadline_at DATETIME NOT NULL,
  finished_at DATETIME NULL,
  avg_low DECIMAL(6,2) NULL,
  avg_mid DECIMAL(6,2) NULL,
  avg_high DECIMAL(6,2) NULL,
  passed TINYINT(1) NULL,
  KEY attempts_user (user_id, domain, level, started_at),
  CONSTRAINT attempts_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attempt_answers (
  attempt_id INT UNSIGNED NOT NULL,
  question_id INT UNSIGNED NOT NULL,
  answer_id INT UNSIGNED NOT NULL,
  revealed TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (attempt_id, question_id),
  CONSTRAINT attempt_answers_attempt_fk FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE account_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  motivations TEXT NOT NULL,
  referrer_id INT UNSIGNED NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'unverified',
  email_token_hash CHAR(64) NULL,
  email_token_expires_at DATETIME NULL,
  signup_token_hash CHAR(64) NULL,
  signup_token_expires_at DATETIME NULL,
  user_id INT UNSIGNED NULL,
  submitted_at DATETIME NULL,
  decided_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY requests_email (email),
  KEY requests_status (status),
  KEY requests_email_token (email_token_hash),
  KEY requests_signup_token (signup_token_hash),
  CONSTRAINT requests_referrer_fk FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT requests_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE request_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NULL,
  action VARCHAR(12) NOT NULL,
  created_at DATETIME NOT NULL,
  KEY events_request (request_id),
  CONSTRAINT events_request_fk FOREIGN KEY (request_id) REFERENCES account_requests(id) ON DELETE CASCADE,
  CONSTRAINT events_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id INT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  cover_url VARCHAR(500) NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY posts_slug (slug),
  CONSTRAINT posts_author_fk FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resources (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  created_by INT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  url VARCHAR(500) NOT NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT resources_user_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE throttle (
  k CHAR(64) PRIMARY KEY,
  hits INT NOT NULL,
  window_start DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (id, intro, welcome_start, welcome_end, updated_at)
VALUES (1, 'Validez les questionnaires « Droit Naturel » et « École Autrichienne » pour devenir membre certifié du mouvement.', 'Bienvenue', ' !', NOW());

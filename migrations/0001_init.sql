CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT NOT NULL,
  lesson_id INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  exercise_passed INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);

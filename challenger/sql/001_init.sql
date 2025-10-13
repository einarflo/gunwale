-- Initial schema for Challenger cache and feedback
-- Run this manually on the Challenger MySQL database

CREATE TABLE IF NOT EXISTS ai_cache (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  kind VARCHAR(32) NOT NULL,
  cache_key VARCHAR(512) NOT NULL UNIQUE,
  model VARCHAR(64) NULL,
  prompt_version VARCHAR(16) NULL,
  prompt JSON NULL,
  result JSON NOT NULL,
  hit_count INT NOT NULL DEFAULT 0,
  upvotes INT NOT NULL DEFAULT 0,
  downvotes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_hit_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_kind (kind),
  INDEX idx_model (model),
  INDEX idx_prompt_version (prompt_version),
  INDEX idx_created_at (created_at),
  INDEX idx_last_hit_at (last_hit_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ai_cache_feedback (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  cache_id BIGINT NOT NULL,
  vote ENUM('up','down') NOT NULL,
  user_ref VARCHAR(128) NULL,
  source VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_cache FOREIGN KEY (cache_id)
    REFERENCES ai_cache(id) ON DELETE CASCADE,
  INDEX idx_cache_id (cache_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- schema additions for chat
CREATE TABLE IF NOT EXISTS chat_message (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  group_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  sender_name VARCHAR(100),
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  message_type VARCHAR(20) DEFAULT 'TEXT'
);

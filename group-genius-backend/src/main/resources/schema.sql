-- Create users table only if it doesn't exist (preserve existing users)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  bio VARCHAR(255) DEFAULT NULL,
  current_year VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  first_name VARCHAR(255) DEFAULT NULL,
  graduation_year VARCHAR(255) DEFAULT NULL,
  last_name VARCHAR(255) DEFAULT NULL,
  major VARCHAR(255) DEFAULT NULL,
  password VARCHAR(255) DEFAULT NULL,
  profile_image_url TEXT DEFAULT NULL,
  secondary_school VARCHAR(255) DEFAULT NULL,
  university VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UK_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE IF NOT EXISTS courses (
  id BIGINT NOT NULL AUTO_INCREMENT,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  current_enrollment INT NOT NULL DEFAULT 0,
  description VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UK_courses_code (course_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS user_courses (
  user_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, course_id),
  KEY FK_user_courses_course (course_id),
  CONSTRAINT FK_user_courses_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT FK_user_courses_course FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed the courses table (idempotent)
INSERT IGNORE INTO courses (course_code, course_name, description, current_enrollment) VALUES
('CS101','Introduction to Computer Science','Fundamental concepts, programming basics',0),
('CS201','Data Structures and Algorithms','Data structures, algorithms and complexity',0),
('CS301','Database Systems','Relational databases, SQL, and design',0),
('MATH101','Calculus I','Limits, derivatives, integrals',0),
('PHYS101','General Physics I','Mechanics and thermodynamics',0);
;

-- Groups table (core entity for study groups)
CREATE TABLE IF NOT EXISTS `groups` (
  id BIGINT NOT NULL AUTO_INCREMENT,
  group_name VARCHAR(150) NOT NULL,
  description TEXT,
  course_id BIGINT DEFAULT NULL,
  privacy_type VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
  group_password VARCHAR(255) DEFAULT NULL,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_groups_course (course_id),
  KEY idx_groups_created_by (created_by),
  CONSTRAINT fk_groups_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL,
  CONSTRAINT fk_groups_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Group members table (mapped to Membership entity)
CREATE TABLE IF NOT EXISTS group_members (
  id BIGINT NOT NULL AUTO_INCREMENT,
  group_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_group_user (group_id, user_id),
  KEY idx_group_members_group (group_id),
  KEY idx_group_members_user (user_id),
  CONSTRAINT fk_group_members_group FOREIGN KEY (group_id) REFERENCES `groups` (id) ON DELETE CASCADE,
  CONSTRAINT fk_group_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  -- Chat messages table (for group chat functionality)
  CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('SENT','DELIVERED','READ') DEFAULT 'SENT',
    message_type ENUM('TEXT','FILE','IMAGE','SYSTEM') DEFAULT 'TEXT',
    file_url TEXT DEFAULT NULL,
    reply_to_id BIGINT DEFAULT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    edited BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id),
    KEY idx_chat_group (group_id),
    KEY idx_chat_sender (sender_id),
    KEY idx_chat_reply (reply_to_id),
    CONSTRAINT fk_chat_group FOREIGN KEY (group_id) REFERENCES `groups` (id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_chat_reply FOREIGN KEY (reply_to_id) REFERENCES chat_messages (id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  -- Sessions table (linked to groups and users)
  CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  group_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(1000) DEFAULT NULL,
  start_time DATETIME NOT NULL,
  duration_days INT NOT NULL DEFAULT 1,
  meeting_link VARCHAR(500) DEFAULT NULL,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sessions_group (group_id),
  KEY idx_sessions_created_by (created_by),
  CONSTRAINT fk_sessions_group FOREIGN KEY (group_id) REFERENCES `groups` (id) ON DELETE CASCADE,
  CONSTRAINT fk_sessions_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 -- Notification table
  CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  session_id BIGINT DEFAULT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
  message VARCHAR(500) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,   -- ✅ renamed from `read`
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id),
  KEY idx_notifications_session (session_id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_session FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 -- Session Invitations table
 CREATE TABLE IF NOT EXISTS session_invitations (
  id BIGINT NOT NULL AUTO_INCREMENT,
  session_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_session_invitations_session (session_id),
  KEY idx_session_invitations_user (user_id),
  KEY idx_session_invitations_status (status),
  CONSTRAINT fk_session_invitations_session FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
  CONSTRAINT fk_session_invitations_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 -- Session Participants table
 CREATE TABLE IF NOT EXISTS session_participants (
  id BIGINT NOT NULL AUTO_INCREMENT,
  session_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_session_user (session_id, user_id),
  KEY idx_session_participants_session (session_id),
  KEY idx_session_participants_user (user_id),
  CONSTRAINT fk_session_participants_session FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
  CONSTRAINT fk_session_participants_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


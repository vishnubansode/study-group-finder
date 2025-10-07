-- Drop existing tables if present and create the exact structure requested
-- DROP TABLE IF EXISTS user_courses;
-- DROP TABLE IF EXISTS courses;
-- DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id bigint NOT NULL AUTO_INCREMENT,
  bio varchar(255) DEFAULT NULL,
  current_year varchar(255) DEFAULT NULL,
  email varchar(255) DEFAULT NULL,
  first_name varchar(255) DEFAULT NULL,
  graduation_year varchar(255) DEFAULT NULL,
  last_name varchar(255) DEFAULT NULL,
  major varchar(255) DEFAULT NULL,
  password varchar(255) DEFAULT NULL,
  profile_image_url varchar(255) DEFAULT NULL,
  secondary_school varchar(255) DEFAULT NULL,
  university varchar(255) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UK6dotkott2kjsp8vw4d0m25fb7 (email)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE courses (
  id bigint NOT NULL AUTO_INCREMENT,
  course_code varchar(20) NOT NULL,
  course_name varchar(100) NOT NULL,
  description varchar(500) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UKp02ts69sh53ptd62m3c67v0 (course_code)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_courses (
  user_id bigint NOT NULL,
  course_id bigint NOT NULL,
  PRIMARY KEY (user_id,course_id),
  KEY FKb84hga2qpwc4vv44lmyb8mwux (course_id),
  CONSTRAINT FK5i2mwg17kvpk92fy6cdii93da FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT FKb84hga2qpwc4vv44lmyb8mwux FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed courses with simplified columns: name, description, capacity, current enrollment
-- Safely reset the courses table and seed simplified rows. This truncates existing data (if any).
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE user_courses;
TRUNCATE TABLE courses;
SET FOREIGN_KEY_CHECKS=1;

INSERT INTO courses (course_name, course_code, description, course_capacity, current_enrollment)
VALUES
	('Introduction to Computer Science', 'CS101', 'Foundational principles of computer science and programming basics.', 120, 0),
	('Calculus II', 'MATH201', 'Advanced calculus topics including integration techniques and series.', 80, 0),
	('Data Structures and Algorithms', 'CS202', 'Core data structures and algorithms with complexity analysis.', 100, 0),
	('Linear Algebra', 'MATH301', 'Matrices, vector spaces, and linear transformations.', 60, 0),
	('Physics I: Mechanics', 'PHYS101', 'Classical mechanics with laboratory applications.', 70, 0),
	('World History', 'HIST100', 'Global historical developments from ancient to modern times.', 50, 0);

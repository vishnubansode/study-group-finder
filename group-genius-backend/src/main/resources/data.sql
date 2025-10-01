INSERT INTO courses (course_code, course_name, description)
VALUES
	('CS101', 'Introduction to Computer Science', 'Foundational principles of computer science and programming basics.'),
	('MATH201', 'Calculus II', 'Advanced calculus topics including integration techniques and series.'),
	('CS201', 'Data Structures and Algorithms', 'Core data structures and algorithms with complexity analysis.'),
	('MATH301', 'Linear Algebra', 'Matrices, vector spaces, and linear transformations.'),
	('PHYS151', 'Physics I: Mechanics', 'Classical mechanics with laboratory applications.'),
	('HIST120', 'World History', 'Global historical developments from ancient to modern times.')
ON DUPLICATE KEY UPDATE
	course_name = VALUES(course_name),
	description = VALUES(description);

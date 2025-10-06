package com.groupgenius.groupgenius_backend.config;

import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CourseDataInitializer implements CommandLineRunner {

    private final CourseRepository courseRepository;

    @Override
    public void run(String... args) throws Exception {
        if (courseRepository.count() == 0) {
            initializeCourses();
        }
    }

    private void initializeCourses() {
        List<Course> courses = Arrays.asList(
            // Computer Science & general seeded courses - only keep name, description, capacity, and current enrollment
            Course.builder()
                .courseName("Introduction to Computer Science")
                .description("Fundamental concepts of computer science, programming basics, and problem-solving techniques.")
                .courseCapacity(50)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Data Structures and Algorithms")
                .description("Study of fundamental data structures and algorithms, complexity analysis, and implementation.")
                .courseCapacity(40)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Database Systems")
                .description("Database design, SQL, NoSQL databases, and database management systems.")
                .courseCapacity(35)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Software Engineering")
                .description("Software development lifecycle, design patterns, testing, and project management.")
                .courseCapacity(30)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Machine Learning")
                .description("Introduction to machine learning algorithms, neural networks, and AI applications.")
                .courseCapacity(25)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Calculus I")
                .description("Limits, derivatives, and applications of differential calculus.")
                .courseCapacity(60)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Calculus II")
                .description("Integration techniques, infinite series, and parametric equations.")
                .courseCapacity(55)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Linear Algebra")
                .description("Vector spaces, matrices, eigenvalues, and linear transformations.")
                .courseCapacity(40)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Abstract Algebra")
                .description("Group theory, ring theory, and field theory.")
                .courseCapacity(20)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Statistics and Probability")
                .description("Descriptive statistics, probability distributions, and statistical inference.")
                .courseCapacity(45)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("General Physics I")
                .description("Mechanics, waves, and thermodynamics with laboratory component.")
                .courseCapacity(50)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("General Physics II")
                .description("Electricity, magnetism, and optics with laboratory component.")
                .courseCapacity(45)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Quantum Mechanics")
                .description("Introduction to quantum mechanics, wave functions, and atomic structure.")
                .courseCapacity(25)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Thermodynamics")
                .description("Laws of thermodynamics, statistical mechanics, and kinetic theory.")
                .courseCapacity(30)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Composition and Rhetoric")
                .description("Academic writing, critical thinking, and communication skills.")
                .courseCapacity(25)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("World Literature")
                .description("Survey of world literature from ancient to modern times.")
                .courseCapacity(30)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("American Literature")
                .description("Study of American literary works from colonial period to present.")
                .courseCapacity(25)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Creative Writing")
                .description("Workshop in fiction, poetry, and creative nonfiction writing.")
                .courseCapacity(15)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Introduction to Computer Science (Business)")
                .description("Foundational principles of computer science and programming basics.")
                .courseCapacity(50)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Data Structures and Algorithms (Business)")
                .description("Core data structures and algorithms with complexity analysis.")
                .courseCapacity(40)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Database Systems (Business)")
                .description("Relational databases, SQL, and basic indexing and transactions.")
                .courseCapacity(35)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Software Engineering (Business)")
                .description("Principles of software design, testing and team workflows.")
                .courseCapacity(30)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Corporate Finance")
                .description("Financial decision making, capital budgeting, and risk management.")
                .courseCapacity(35)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Introduction to Psychology")
                .description("Fundamental concepts in psychology, human behavior, and mental processes.")
                .courseCapacity(45)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("General Chemistry")
                .description("Chemical principles, atomic structure, and chemical reactions.")
                .courseCapacity(40)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("World History")
                .description("Survey of world civilizations from ancient times to the present.")
                .courseCapacity(35)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Art History")
                .description("Survey of art from prehistoric times to contemporary works.")
                .courseCapacity(25)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Music Theory")
                .description("Fundamentals of music theory, harmony, and composition.")
                .courseCapacity(20)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("Introduction to Philosophy")
                .description("Major philosophical questions, critical thinking, and ethical reasoning.")
                .courseCapacity(30)
                .currentEnrollment(0)
                .build(),

            Course.builder()
                .courseName("General Biology")
                .description("Cell biology, genetics, evolution, and ecology.")
                .courseCapacity(40)
                .currentEnrollment(0)
                .build()
        );

        courseRepository.saveAll(courses);
        System.out.println("Initialized " + courses.size() + " courses in the database.");
    }
}
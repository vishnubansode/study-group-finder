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
            // Computer Science Courses
            Course.builder()
                .courseCode("CS101")
                .courseName("Introduction to Computer Science")
                .description("Fundamental concepts of computer science, programming basics, and problem-solving techniques.")
                .instructorName("Dr. Sarah Johnson")
                .classSchedule("Mon/Wed/Fri 9:00-10:00")
                .creditHours(3)
                .courseCapacity(50)
                .currentEnrollment(23)
                .build(),
                
            Course.builder()
                .courseCode("CS201")
                .courseName("Data Structures and Algorithms")
                .description("Study of fundamental data structures and algorithms, complexity analysis, and implementation.")
                .instructorName("Prof. Michael Chen")
                .classSchedule("Tue/Thu 11:00-12:30")
                .creditHours(4)
                .courseCapacity(40)
                .currentEnrollment(31)
                .build(),
                
            Course.builder()
                .courseCode("CS301")
                .courseName("Database Systems")
                .description("Database design, SQL, NoSQL databases, and database management systems.")
                .instructorName("Dr. Emily Rodriguez")
                .classSchedule("Mon/Wed 2:00-3:30")
                .creditHours(3)
                .courseCapacity(35)
                .currentEnrollment(28)
                .build(),
                
            Course.builder()
                .courseCode("CS401")
                .courseName("Software Engineering")
                .description("Software development lifecycle, design patterns, testing, and project management.")
                .instructorName("Prof. David Wilson")
                .classSchedule("Tue/Thu 3:30-5:00")
                .creditHours(4)
                .courseCapacity(30)
                .currentEnrollment(25)
                .build(),
                
            Course.builder()
                .courseCode("CS450")
                .courseName("Machine Learning")
                .description("Introduction to machine learning algorithms, neural networks, and AI applications.")
                .instructorName("Dr. Lisa Zhang")
                .classSchedule("Mon/Wed/Fri 1:00-2:00")
                .creditHours(3)
                .courseCapacity(25)
                .currentEnrollment(24)
                .build(),
                
            // Mathematics Courses
            Course.builder()
                .courseCode("MATH101")
                .courseName("Calculus I")
                .description("Limits, derivatives, and applications of differential calculus.")
                .instructorName("Prof. Robert Smith")
                .classSchedule("Mon/Wed/Fri 10:00-11:00")
                .creditHours(4)
                .courseCapacity(60)
                .currentEnrollment(45)
                .build(),
                
            Course.builder()
                .courseCode("MATH201")
                .courseName("Calculus II")
                .description("Integration techniques, infinite series, and parametric equations.")
                .instructorName("Dr. Jennifer Lee")
                .classSchedule("Tue/Thu 9:00-10:30")
                .creditHours(4)
                .courseCapacity(55)
                .currentEnrollment(38)
                .build(),
                
            Course.builder()
                .courseCode("MATH301")
                .courseName("Linear Algebra")
                .description("Vector spaces, matrices, eigenvalues, and linear transformations.")
                .instructorName("Prof. Mark Thompson")
                .classSchedule("Mon/Wed/Fri 11:00-12:00")
                .creditHours(3)
                .courseCapacity(40)
                .currentEnrollment(32)
                .build(),
                
            Course.builder()
                .courseCode("MATH401")
                .courseName("Abstract Algebra")
                .description("Group theory, ring theory, and field theory.")
                .instructorName("Dr. Anna Petrov")
                .classSchedule("Tue/Thu 2:00-3:30")
                .creditHours(3)
                .courseCapacity(20)
                .currentEnrollment(15)
                .build(),
                
            Course.builder()
                .courseCode("STAT301")
                .courseName("Statistics and Probability")
                .description("Descriptive statistics, probability distributions, and statistical inference.")
                .instructorName("Prof. James Miller")
                .classSchedule("Mon/Wed 3:00-4:30")
                .creditHours(3)
                .courseCapacity(45)
                .currentEnrollment(39)
                .build(),
                
            // Physics Courses
            Course.builder()
                .courseCode("PHYS101")
                .courseName("General Physics I")
                .description("Mechanics, waves, and thermodynamics with laboratory component.")
                .instructorName("Dr. Thomas Anderson")
                .classSchedule("Mon/Wed/Fri 8:00-9:00")
                .creditHours(4)
                .courseCapacity(50)
                .currentEnrollment(42)
                .build(),
                
            Course.builder()
                .courseCode("PHYS201")
                .courseName("General Physics II")
                .description("Electricity, magnetism, and optics with laboratory component.")
                .instructorName("Prof. Maria Garcia")
                .classSchedule("Tue/Thu 10:00-11:30")
                .creditHours(4)
                .courseCapacity(45)
                .currentEnrollment(36)
                .build(),
                
            Course.builder()
                .courseCode("PHYS301")
                .courseName("Quantum Mechanics")
                .description("Introduction to quantum mechanics, wave functions, and atomic structure.")
                .instructorName("Dr. Richard Feynman")
                .classSchedule("Mon/Wed 4:00-5:30")
                .creditHours(3)
                .courseCapacity(25)
                .currentEnrollment(18)
                .build(),
                
            Course.builder()
                .courseCode("PHYS401")
                .courseName("Thermodynamics")
                .description("Laws of thermodynamics, statistical mechanics, and kinetic theory.")
                .instructorName("Prof. Stephen Hawking")
                .classSchedule("Tue/Thu 1:00-2:30")
                .creditHours(3)
                .courseCapacity(30)
                .currentEnrollment(22)
                .build(),
                
            // English Courses
            Course.builder()
                .courseCode("ENG101")
                .courseName("Composition and Rhetoric")
                .description("Academic writing, critical thinking, and communication skills.")
                .instructorName("Prof. Jane Austen")
                .classSchedule("Mon/Wed/Fri 9:00-10:00")
                .creditHours(3)
                .courseCapacity(25)
                .currentEnrollment(23)
                .build(),
                
            Course.builder()
                .courseCode("ENG201")
                .courseName("World Literature")
                .description("Survey of world literature from ancient to modern times.")
                .instructorName("Dr. William Shakespeare")
                .classSchedule("Tue/Thu 11:00-12:30")
                .creditHours(3)
                .courseCapacity(30)
                .currentEnrollment(27)
                .build(),
                
            Course.builder()
                .courseCode("ENG301")
                .courseName("American Literature")
                .description("Study of American literary works from colonial period to present.")
                .instructorName("Prof. Mark Twain")
                .classSchedule("Mon/Wed 1:00-2:30")
                .creditHours(3)
                .courseCapacity(25)
                .currentEnrollment(21)
                .build(),
                
            Course.builder()
                .courseCode("ENG401")
                .courseName("Creative Writing")
                .description("Workshop in fiction, poetry, and creative nonfiction writing.")
                .instructorName("Dr. Virginia Woolf")
                .classSchedule("Thu 6:00-9:00")
                .creditHours(3)
                .courseCapacity(15)
                .currentEnrollment(12)
                .build(),
                
            // Business Courses
            Course.builder()
                .courseCode("BUS101")
                .courseName("Introduction to Business")
                .description("Overview of business functions, entrepreneurship, and business environment.")
                .instructorName("Prof. Warren Buffett")
                .classSchedule("Mon/Wed/Fri 2:00-3:00")
                .creditHours(3)
                .courseCapacity(50)
                .currentEnrollment(47)
                .build(),
                
            Course.builder()
                .courseCode("BUS201")
                .courseName("Principles of Accounting")
                .description("Financial and managerial accounting principles and practices.")
                .instructorName("Dr. Mary Johnson")
                .classSchedule("Tue/Thu 9:00-10:30")
                .creditHours(3)
                .courseCapacity(40)
                .currentEnrollment(35)
                .build(),
                
            Course.builder()
                .courseCode("BUS301")
                .courseName("Marketing Management")
                .description("Marketing strategy, consumer behavior, and market research.")
                .instructorName("Prof. Philip Kotler")
                .classSchedule("Mon/Wed 10:00-11:30")
                .creditHours(3)
                .courseCapacity(35)
                .currentEnrollment(31)
                .build(),
                
            Course.builder()
                .courseCode("BUS401")
                .courseName("Strategic Management")
                .description("Business strategy formulation, implementation, and competitive analysis.")
                .instructorName("Dr. Michael Porter")
                .classSchedule("Tue/Thu 2:00-3:30")
                .creditHours(3)
                .courseCapacity(30)
                .currentEnrollment(26)
                .build(),
                
            Course.builder()
                .courseCode("FIN301")
                .courseName("Corporate Finance")
                .description("Financial decision making, capital budgeting, and risk management.")
                .instructorName("Prof. Eugene Fama")
                .classSchedule("Mon/Wed/Fri 3:00-4:00")
                .creditHours(3)
                .courseCapacity(35)
                .currentEnrollment(29)
                .build(),
                
            // Additional Interdisciplinary Courses
            Course.builder()
                .courseCode("PSYC101")
                .courseName("Introduction to Psychology")
                .description("Fundamental concepts in psychology, human behavior, and mental processes.")
                .instructorName("Dr. Sigmund Freud")
                .classSchedule("Tue/Thu 10:00-11:30")
                .creditHours(3)
                .courseCapacity(45)
                .currentEnrollment(41)
                .build(),
                
            Course.builder()
                .courseCode("CHEM101")
                .courseName("General Chemistry")
                .description("Chemical principles, atomic structure, and chemical reactions.")
                .instructorName("Prof. Marie Curie")
                .classSchedule("Mon/Wed/Fri 10:00-11:00")
                .creditHours(4)
                .courseCapacity(40)
                .currentEnrollment(37)
                .build(),
                
            Course.builder()
                .courseCode("HIST201")
                .courseName("World History")
                .description("Survey of world civilizations from ancient times to the present.")
                .instructorName("Dr. Arnold Toynbee")
                .classSchedule("Tue/Thu 1:00-2:30")
                .creditHours(3)
                .courseCapacity(35)
                .currentEnrollment(28)
                .build(),
                
            Course.builder()
                .courseCode("ART101")
                .courseName("Art History")
                .description("Survey of art from prehistoric times to contemporary works.")
                .instructorName("Prof. Leonardo da Vinci")
                .classSchedule("Mon/Wed 11:00-12:30")
                .creditHours(3)
                .courseCapacity(25)
                .currentEnrollment(20)
                .build(),
                
            Course.builder()
                .courseCode("MUS101")
                .courseName("Music Theory")
                .description("Fundamentals of music theory, harmony, and composition.")
                .instructorName("Dr. Wolfgang Mozart")
                .classSchedule("Tue/Thu 3:00-4:30")
                .creditHours(3)
                .courseCapacity(20)
                .currentEnrollment(16)
                .build(),
                
            Course.builder()
                .courseCode("PHIL101")
                .courseName("Introduction to Philosophy")
                .description("Major philosophical questions, critical thinking, and ethical reasoning.")
                .instructorName("Prof. Socrates Plato")
                .classSchedule("Mon/Wed/Fri 1:00-2:00")
                .creditHours(3)
                .courseCapacity(30)
                .currentEnrollment(24)
                .build(),
                
            Course.builder()
                .courseCode("BIO101")
                .courseName("General Biology")
                .description("Cell biology, genetics, evolution, and ecology.")
                .instructorName("Dr. Charles Darwin")
                .classSchedule("Tue/Thu 8:00-9:30")
                .creditHours(4)
                .courseCapacity(40)
                .currentEnrollment(34)
                .build()
        );

        courseRepository.saveAll(courses);
        System.out.println("Initialized " + courses.size() + " courses in the database.");
    }
}
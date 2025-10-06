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
                Course.builder()
                        .courseCode("CS101")
                        .courseName("Introduction to Computer Science")
                        .description("Fundamental concepts of computer science, programming basics, and problem-solving techniques.")
                        .build(),

                Course.builder()
                        .courseCode("CS201")
                        .courseName("Data Structures and Algorithms")
                        .description("Study of fundamental data structures and algorithms, complexity analysis, and implementation.")
                        .build(),

                Course.builder()
                        .courseCode("CS301")
                        .courseName("Database Systems")
                        .description("Database design, SQL, NoSQL databases, and database management systems.")
                        .build(),

                Course.builder()
                        .courseCode("CS401")
                        .courseName("Software Engineering")
                        .description("Software development lifecycle, design patterns, testing, and project management.")
                        .build(),

                Course.builder()
                        .courseCode("MATH101")
                        .courseName("Calculus I")
                        .description("Limits, derivatives, and applications of differential calculus.")
                        .build(),

                Course.builder()
                        .courseCode("MATH201")
                        .courseName("Calculus II")
                        .description("Integration techniques, infinite series, and parametric equations.")
                        .build(),

                Course.builder()
                        .courseCode("PHYS101")
                        .courseName("General Physics I")
                        .description("Mechanics, waves, and thermodynamics with laboratory component.")
                        .build(),

                Course.builder()
                        .courseCode("ENG101")
                        .courseName("Composition and Rhetoric")
                        .description("Academic writing, critical thinking, and communication skills.")
                        .build(),

                Course.builder()
                        .courseCode("BUS101")
                        .courseName("Introduction to Business")
                        .description("Overview of business functions, entrepreneurship, and business environment.")
                        .build(),

                Course.builder()
                        .courseCode("PSYC101")
                        .courseName("Introduction to Psychology")
                        .description("Fundamental concepts in psychology, human behavior, and mental processes.")
                        .build()
        );

        courseRepository.saveAll(courses);
        System.out.println("Initialized " + courses.size() + " courses in the database.");
    }
}
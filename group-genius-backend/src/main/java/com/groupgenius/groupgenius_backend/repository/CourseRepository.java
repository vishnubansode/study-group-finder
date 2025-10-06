package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseNameIgnoreCase(String courseName);
    boolean existsByCourseNameIgnoreCase(String courseName);
	
    // Search courses by name content
    @Query("SELECT c FROM Course c WHERE LOWER(c.courseName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Course> searchCourses(@Param("query") String query, Pageable pageable);

    // Find available courses (not full)
    @Query("SELECT c FROM Course c WHERE c.currentEnrollment < c.courseCapacity")
    Page<Course> findAvailableCourses(Pageable pageable);
}
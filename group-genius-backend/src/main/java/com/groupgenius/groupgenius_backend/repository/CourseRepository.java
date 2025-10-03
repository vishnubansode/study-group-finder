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
	Optional<Course> findByCourseCodeIgnoreCase(String courseCode);
	boolean existsByCourseCodeIgnoreCase(String courseCode);
	
	// Search courses by code or name
	@Query("SELECT c FROM Course c WHERE " +
		   "LOWER(c.courseCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
		   "LOWER(c.courseName) LIKE LOWER(CONCAT('%', :query, '%'))")
	Page<Course> searchCourses(@Param("query") String query, Pageable pageable);
	
	// Find courses by instructor
	Page<Course> findByInstructorNameContainingIgnoreCase(String instructorName, Pageable pageable);
	
	// Find available courses (not full)
	@Query("SELECT c FROM Course c WHERE c.currentEnrollment < c.courseCapacity")
	Page<Course> findAvailableCourses(Pageable pageable);
	
	// Find courses by credit hours
	Page<Course> findByCreditHours(Integer creditHours, Pageable pageable);
}
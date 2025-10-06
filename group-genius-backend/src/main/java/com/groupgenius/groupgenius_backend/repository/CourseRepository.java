package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
	Optional<Course> findByCourseCodeIgnoreCase(String courseCode);
	boolean existsByCourseCodeIgnoreCase(String courseCode);

	@Query("SELECT c FROM Course c WHERE " +
			"LOWER(c.courseCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
			"LOWER(c.courseName) LIKE LOWER(CONCAT('%', :query, '%'))")
	Page<Course> searchCourses(@Param("query") String query, Pageable pageable);
}
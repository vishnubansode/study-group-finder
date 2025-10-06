package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    @Query("SELECT u FROM User u JOIN u.courses c WHERE c.id = :courseId AND u.id != :excludeUserId")
    List<User> findPeersInCourse(@Param("courseId") Long courseId, @Param("excludeUserId") Long excludeUserId);
}
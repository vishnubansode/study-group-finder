package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Session;
import com.groupgenius.groupgenius_backend.entity.Group;
import com.groupgenius.groupgenius_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SessionRepository extends JpaRepository<Session, Long>, JpaSpecificationExecutor<Session> {

    // Find overlapping sessions for the same group
    // Overlap: existing_start < new_end AND existing_end > new_start
    // existing_end = DATE_ADD(s.start_time, INTERVAL s.duration_days DAY)
    @Query(value = "SELECT * FROM sessions s WHERE s.group_id = :groupId AND (s.start_time < :endTime AND DATE_ADD(s.start_time, INTERVAL s.duration_days DAY) > :startTime)", nativeQuery = true)
    List<Session> findOverlappingSessions(@Param("groupId") Long groupId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    // Find all sessions created by a specific user
    List<Session> findByCreatedBy(User creator);

    // Active (non-archived) sessions created by a specific user
    List<Session> findByCreatedByAndArchivedFalse(User creator);

    // Find all sessions created by a user in a specific group
    @Query("SELECT s FROM Session s WHERE s.createdBy = :creator AND s.group = :group")
    List<Session> findByCreatedByAndGroup(@Param("creator") User creator, @Param("group") Group group);

    // Active sessions created by a user in a specific group
    @Query("SELECT s FROM Session s WHERE s.createdBy = :creator AND s.group = :group AND s.archived = false")
    List<Session> findByCreatedByAndGroupAndArchivedFalse(@Param("creator") User creator, @Param("group") Group group);

    // Find active sessions for a group (paged)
    Page<Session> findByGroupAndArchivedFalse(Group group, Pageable pageable);

    @Query("SELECT s FROM Session s WHERE s.archived = false AND s.startTime BETWEEN :start AND :end")
    List<Session> findActiveSessionsBetween(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}

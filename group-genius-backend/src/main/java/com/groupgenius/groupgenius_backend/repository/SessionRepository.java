package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Session;
import com.groupgenius.groupgenius_backend.entity.Group;
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
    @Query("""
                SELECT s FROM Session s
                WHERE s.group = :group
                AND (
                    (s.startTime < :endTime AND s.endTime > :startTime)
                )
            """)
    List<Session> findOverlappingSessions(@Param("group") Group group,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    // Optimized visibility query: sessions where endTime >= now AND (creator = user
    // OR user is a participant)
    @Query("""
                    SELECT s FROM Session s
                    WHERE s.group = :group
                        AND s.endTime >= :now
                        AND (
                                s.createdBy.id = :userId
                                OR EXISTS (SELECT sp FROM SessionParticipant sp WHERE sp.session = s AND sp.user.id = :userId)
                        )
                    ORDER BY s.startTime ASC
            """)
    Page<Session> findVisibleSessionsForUser(@Param("group") Group group,
            @Param("userId") Long userId,
            @Param("now") LocalDateTime now,
            Pageable pageable);
}

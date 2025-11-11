package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Session;
import com.groupgenius.groupgenius_backend.entity.SessionParticipant;
import com.groupgenius.groupgenius_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SessionParticipantRepository extends JpaRepository<SessionParticipant, Long> {

    List<SessionParticipant> findBySession(Session session);

    List<SessionParticipant> findByUser(User user);

    Optional<SessionParticipant> findBySessionAndUser(Session session, User user);

    boolean existsBySessionAndUser(Session session, User user);

    @Query("SELECT COUNT(sp) FROM SessionParticipant sp WHERE sp.session.id = :sessionId")
    long countBySessionId(@Param("sessionId") Long sessionId);

    @Query("SELECT sp FROM SessionParticipant sp WHERE sp.session.group.id = :groupId AND sp.user.id = :userId")
    List<SessionParticipant> findByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);
}

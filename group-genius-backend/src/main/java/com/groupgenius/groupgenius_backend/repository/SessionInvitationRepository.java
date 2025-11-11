package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Session;
import com.groupgenius.groupgenius_backend.entity.SessionInvitation;
import com.groupgenius.groupgenius_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SessionInvitationRepository extends JpaRepository<SessionInvitation, Long> {

    List<SessionInvitation> findBySession(Session session);

    List<SessionInvitation> findByUser(User user);

    List<SessionInvitation> findByUserAndStatus(User user, SessionInvitation.Status status);

    Optional<SessionInvitation> findBySessionAndUser(Session session, User user);

    @Query("SELECT si FROM SessionInvitation si WHERE si.user.id = :userId AND si.status = 'PENDING' ORDER BY si.invitedAt DESC")
    List<SessionInvitation> findPendingInvitationsByUserId(@Param("userId") Long userId);

    @Query("SELECT si FROM SessionInvitation si WHERE si.session.group.id = :groupId AND si.user.id = :userId")
    List<SessionInvitation> findByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);
}

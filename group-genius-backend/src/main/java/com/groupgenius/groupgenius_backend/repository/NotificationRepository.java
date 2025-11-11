package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Notification;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<Notification> findBySession(Session session);

    @Modifying
    @Query("delete from Notification n where n.session.id = :sessionId")
    int deleteBySessionId(@Param("sessionId") Long sessionId);

}

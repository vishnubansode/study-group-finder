package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Invitation;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    List<Invitation> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<Invitation> findBySession(Session session);
}

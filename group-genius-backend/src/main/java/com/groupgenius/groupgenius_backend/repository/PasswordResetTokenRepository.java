package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.PasswordResetToken;
import com.groupgenius.groupgenius_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    List<PasswordResetToken> findAllByUser(User user);

    @Modifying
    @Transactional
    void deleteAllByUser(User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken p WHERE p.expiresAt < :dateTime")
    int deleteAllByExpiresAtBefore(LocalDateTime dateTime);

    List<PasswordResetToken> findAllByExpiresAtAfter(LocalDateTime dateTime);

    @Query("SELECT p FROM PasswordResetToken p WHERE p.user = :user AND p.used = false AND p.expiresAt > :now")
    List<PasswordResetToken> findValidTokensByUser(User user, LocalDateTime now);
}
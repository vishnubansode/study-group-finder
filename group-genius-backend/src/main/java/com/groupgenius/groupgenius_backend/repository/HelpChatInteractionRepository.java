package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.HelpChatInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface HelpChatInteractionRepository extends JpaRepository<HelpChatInteraction, Long> {

    List<HelpChatInteraction> findByUserIdOrderByTimestampDesc(Long userId);

    List<HelpChatInteraction> findBySessionId(String sessionId);

    @Query("SELECT h.question as question, COUNT(h) as count " +
            "FROM HelpChatInteraction h " +
            "WHERE h.timestamp >= :since " +
            "GROUP BY h.question " +
            "ORDER BY COUNT(h) DESC")
    List<Map<String, Object>> findFrequentQuestionsSince(LocalDateTime since);

    @Query("SELECT COUNT(h) FROM HelpChatInteraction h WHERE h.timestamp >= :startDate AND h.timestamp < :endDate")
    Long countInteractionsBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT h.type as type, COUNT(h) as count FROM HelpChatInteraction h GROUP BY h.type")
    List<Map<String, Object>> countInteractionsByType();
}
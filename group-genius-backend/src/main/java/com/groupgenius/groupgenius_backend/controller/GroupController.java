package com.groupgenius.groupgenius_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class GroupController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllGroups() {
        // Mock data for now - replace with actual group service later
        List<Map<String, Object>> groups = new ArrayList<>();
        
        // Add some mock groups
        groups.add(Map.of(
            "id", 1,
            "name", "CS101 Study Group",
            "description", "Study group for CS101 fundamentals",
            "course", "CS101",
            "privacy", "public",
            "members", 5,
            "maxMembers", 10,
            "activity", "High",
            "lastActivity", "2 hours ago",
            "tags", List.of("programming", "fundamentals")
        ));
        
        groups.add(Map.of(
            "id", 2,
            "name", "Math Study Group",
            "description", "Advanced mathematics study group",
            "course", "MATH201",
            "privacy", "private",
            "members", 3,
            "maxMembers", 8,
            "activity", "Moderate",
            "lastActivity", "1 day ago",
            "tags", List.of("mathematics", "advanced")
        ));
        
        return ResponseEntity.ok(groups);
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<Map<String, String>> joinGroup(@PathVariable Long groupId) {
        // Mock implementation - replace with actual group service later
        return ResponseEntity.ok(Map.of("message", "Successfully joined group"));
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<Map<String, String>> leaveGroup(@PathVariable Long groupId) {
        // Mock implementation - replace with actual group service later
        return ResponseEntity.ok(Map.of("message", "Successfully left group"));
    }
}

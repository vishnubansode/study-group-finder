package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.GroupCreateRequest;
import com.groupgenius.groupgenius_backend.dto.GroupResponse;
import com.groupgenius.groupgenius_backend.service.GroupMemberService;
import com.groupgenius.groupgenius_backend.service.GroupService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
public class GroupController {
    private static final Logger log = LoggerFactory.getLogger(GroupController.class);
    private final GroupService groupService;
    private final GroupMemberService groupMemberService;

    public GroupController(GroupService groupService, GroupMemberService groupMemberService) {
        this.groupService = groupService;
        this.groupMemberService = groupMemberService;
    }

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String privacy,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false, defaultValue = "false") boolean filterByMembership,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        try {
            Sort sortObj = Sort.by(Sort.Order.desc("createdAt"));
            try {
                String[] parts = sort.split(",", 2);
                sortObj = Sort.by(Sort.Direction.fromString(parts.length > 1 ? parts[1] : "desc"), parts[0]);
            } catch (Exception ignored) {
            }
            Pageable pageable = PageRequest.of(page, size, sortObj);
            return ResponseEntity
                    .ok(groupService.search(courseId, privacy, name, userId, filterByMembership, pageable));
        } catch (Exception ex) {
            log.error("Error while searching groups", ex);
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("timestamp", java.time.OffsetDateTime.now().toString(), "status", 500,
                            "error", "Internal Server Error", "path", "/api/groups", "message", ex.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody GroupCreateRequest req) {
        return groupService.create(req)
                .map(resp -> ResponseEntity
                        .ok(java.util.Map.of("success", true, "message", "Group created", "data", resp)))
                .orElseGet(() -> ResponseEntity.badRequest().body(
                        java.util.Map.of("success", false, "message", "Invalid courseId or createdBy", "data", null)));
    }

    // Wrapper endpoints that reuse group membership service
    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> joinGroup(@PathVariable Long groupId, @RequestParam Long userId,
            @RequestParam(required = false) String password) {
        groupMemberService.requestToJoin(userId, groupId, password);
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Join processed"));
    }

    @PostMapping("/{groupId}/approve")
    public ResponseEntity<?> approveMember(@PathVariable Long groupId, @RequestParam Long adminId,
            @RequestParam Long userId) {
        groupMemberService.approveMember(adminId, userId, groupId);
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Member approved"));
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<?> leaveGroup(@PathVariable Long groupId, @RequestParam Long userId) {
        groupMemberService.leaveGroup(userId, groupId);
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Left group"));
    }

    @DeleteMapping("/{groupId}/remove-member")
    public ResponseEntity<?> removeMember(@PathVariable Long groupId, @RequestParam Long adminId,
            @RequestParam Long userId) {
        groupMemberService.removeMember(adminId, userId, groupId);
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Member removed"));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId, @RequestParam Long adminId) {
        log.info("Delete group request received - groupId: {}, adminId: {}", groupId, adminId);
        try {
            groupService.deleteGroup(groupId, adminId);
            log.info("Group {} successfully deleted by admin {}", groupId, adminId);
            return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Group deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.warn("Delete group failed with validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting group {} by admin {}", groupId, adminId, e);
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("success", false, "message", "Failed to delete group"));
        }
    }
}

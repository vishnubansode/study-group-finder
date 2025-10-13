package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.GroupCreateRequest;
import com.groupgenius.groupgenius_backend.dto.GroupResponse;
import com.groupgenius.groupgenius_backend.service.GroupService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
public class GroupController {
    private final GroupService groupService;
    private final MembershipService membershipService;

    public GroupController(GroupService groupService, MembershipService membershipService) {
        this.groupService = groupService;
        this.membershipService = membershipService;
    }

    @GetMapping
    public Page<GroupResponse> search(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String privacy,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Sort sortObj = Sort.by(Sort.Order.by("createdAt").descending());
        try {
            String[] parts = sort.split(",", 2);
            sortObj = Sort.by(Sort.Direction.fromString(parts.length > 1 ? parts[1] : "desc"), parts[0]);
        } catch (Exception ignored) {
        }
        Pageable pageable = PageRequest.of(page, size, sortObj);
        return groupService.search(courseId, privacy, name, pageable);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody GroupCreateRequest req) {
        return groupService.create(req)
                .map(resp -> ResponseEntity.ok(java.util.Map.of("success", true, "message", "Group created", "data", resp)))
                .orElseGet(() -> ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", "Invalid courseId or createdBy", "data", null)));
    }

    // Wrapper endpoints that reuse existing MembershipService
    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> joinGroup(@PathVariable Long groupId, @RequestParam Long userId) {
        membershipService.requestToJoin(userId, groupId);
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Join request submitted"));
    }

    @PostMapping("/{groupId}/approve")
    public ResponseEntity<?> approveMember(@PathVariable Long groupId, @RequestParam Long adminId, @RequestParam Long userId) {
        membershipService.approveMember(adminId, userId, groupId);
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Member approved"));
    }

    @DeleteMapping("/{groupId}/remove-member")
    public ResponseEntity<?> removeMember(@PathVariable Long groupId, @RequestParam Long adminId, @RequestParam Long userId) {
        membershipService.removeMember(adminId, userId, groupId);
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Member removed"));
    }
}
package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.GroupDto;
import com.groupgenius.groupgenius_backend.entity.Group;
import com.groupgenius.groupgenius_backend.mapper.GroupMapper;
import com.groupgenius.groupgenius_backend.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    // Admin-only group creation
    @PostMapping("/create")
    public ResponseEntity<Group> createGroup(@RequestParam String name, @RequestParam String description, @RequestParam Group.PrivacyType privacy, @RequestParam Long createdByUserId) {
        Group group = groupService.createGroup(name, description, privacy, createdByUserId);
        return ResponseEntity.ok(group);
    }

    // List all groups
    @GetMapping("/all")
    public ResponseEntity<List<GroupDto>> getAllGroups() {
        List<GroupDto> groupDTOs = GroupMapper.toDtoList(groupService.getAllGroups());
        return ResponseEntity.ok(groupDTOs);
    }
}

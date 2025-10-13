package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.MembershipDto;
import com.groupgenius.groupgenius_backend.entity.Membership;
import com.groupgenius.groupgenius_backend.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    // Any authenticated user can request to join a group
    @PostMapping("/join")
    @PreAuthorize("hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<String> joinGroup(@RequestParam Long userId, @RequestParam Long groupId) {
        membershipService.requestToJoin(userId, groupId);
        return ResponseEntity.ok("Join request submitted successfully!");
    }

    // Only ADMIN can approve members
    @PostMapping("/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> approveMember(@RequestParam Long adminId, @RequestParam Long userId, @RequestParam Long groupId) {
        membershipService.approveMember(adminId, userId, groupId);
        return ResponseEntity.ok("Member approved successfully!");
    }

    // Only ADMIN can remove members
    @DeleteMapping("/remove")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> removeMember(@RequestParam Long adminId, @RequestParam Long userId, @RequestParam Long groupId) {
        membershipService.removeMember(adminId, userId, groupId);
        return ResponseEntity.ok("Member removed successfully!");
    }

    // Any authenticated user can view group members
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<MembershipDto>> getGroupMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(membershipService.getGroupMembers(groupId));
    }
}

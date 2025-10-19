package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.GroupMemberDto;
import com.groupgenius.groupgenius_backend.entity.GroupMember;
import com.groupgenius.groupgenius_backend.service.GroupMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/group-members")
@RequiredArgsConstructor
public class GroupMemberController {

    private final GroupMemberService groupMemberService;

    @PostMapping("/join")
    public ResponseEntity<String> joinGroup(@RequestParam Long userId, @RequestParam Long groupId) {
        groupMemberService.requestToJoin(userId, groupId);
        return ResponseEntity.ok("Join request submitted successfully!");
    }

    @PostMapping("/approve")
    public ResponseEntity<String> approveMember(@RequestParam Long adminId, @RequestParam Long userId, @RequestParam Long groupId) {
        groupMemberService.approveMember(adminId, userId, groupId);
        return ResponseEntity.ok("Member approved successfully!");
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> removeMember(@RequestParam Long adminId, @RequestParam Long userId, @RequestParam Long groupId) {
        groupMemberService.removeMember(adminId, userId, groupId);
        return ResponseEntity.ok("Member removed successfully!");
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupMemberDto>> getGroupMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupMemberService.getGroupMembers(groupId));
    }

    @PostMapping("/change-role")
    public ResponseEntity<String> changeMemberRole(@RequestParam Long adminId, @RequestParam Long userId, @RequestParam Long groupId, @RequestParam String role) {
        // map role string to enum
        try {
            GroupMember.Role newRole = GroupMember.Role.valueOf(role.toUpperCase());
            groupMemberService.changeMemberRole(adminId, userId, groupId, newRole);
            return ResponseEntity.ok("Member role changed successfully!");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid role specified");
        }
    }
}

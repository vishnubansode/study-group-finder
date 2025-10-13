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

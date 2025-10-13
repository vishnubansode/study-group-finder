package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.entity.Group;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.GroupRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final MembershipService membershipService; // inject MembershipService

    // Create group (Admin only)
    public Group createGroup(String name, String description, Group.PrivacyType privacy, Long createdByUserId) {
        User user = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if user is Admin
        if (!"ROLE_ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Only Admins can create groups");
        }

        if (groupRepository.existsByGroupNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Group name already exists");
        }

        // Build and save the group
        Group group = Group.builder()
                .groupName(name)
                .description(description)
                .privacyType(privacy)
                .createdBy(user)
                .build();

        Group savedGroup = groupRepository.save(group);

        // Automatically add admin membership
        membershipService.addAdminMembership(savedGroup);

        return savedGroup;
    }

    // Fetch all groups
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }
}


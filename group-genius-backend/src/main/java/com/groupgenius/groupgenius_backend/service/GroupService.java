package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.GroupCreateRequest;
import com.groupgenius.groupgenius_backend.dto.GroupResponse;
import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.entity.Group;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import com.groupgenius.groupgenius_backend.repository.GroupRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import com.groupgenius.groupgenius_backend.specification.GroupSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final MembershipService membershipService; // reuse existing membership logic

    public GroupService(GroupRepository groupRepository, UserRepository userRepository, MembershipService membershipService) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.membershipService = membershipService;
    }

    public Page<GroupResponse> search(Long courseId, String privacy, String name, Pageable pageable) {
        return groupRepository.findAll(GroupSpecifications.filter(courseId, privacy, name), pageable)
                .map(this::toDto);
    }

    public Optional<GroupResponse> create(GroupCreateRequest req) {
        // createdBy is expected to be an existing user id
        Optional<User> u = userRepository.findById(req.getCreatedBy());
        if (u.isEmpty()) return Optional.empty();

        Group g = Group.builder()
                .groupName(req.getName())
                .description(req.getDescription())
                .privacyType(req.getPrivacy() == null ? Group.PrivacyType.PUBLIC : Group.PrivacyType.valueOf(req.getPrivacy()))
                .createdBy(u.get())
                .build();
        Group savedGroup = groupRepository.save(g);

        // Add admin membership using existing MembershipService
        membershipService.addAdminMembership(savedGroup);

        return Optional.of(toDto(savedGroup));
    }

    private GroupResponse toDto(Group g) {
        return GroupResponse.builder()
                .groupId(g.getId())
                .groupName(g.getGroupName())
                .description(g.getDescription())
                .courseName(g.getCourse() != null ? g.getCourse().getCourseName() : null)
                .createdBy(g.getCreatedBy() != null ? g.getCreatedBy().getId() : null)
                .privacy(g.getPrivacyType() != null ? g.getPrivacyType().name() : null)
                .build();
    }
}
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


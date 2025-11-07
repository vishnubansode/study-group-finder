package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.GroupCreateRequest;
import com.groupgenius.groupgenius_backend.dto.GroupResponse;
import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.entity.Group;
import com.groupgenius.groupgenius_backend.entity.GroupMember;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import com.groupgenius.groupgenius_backend.repository.GroupRepository;
import com.groupgenius.groupgenius_backend.repository.GroupMemberRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import com.groupgenius.groupgenius_backend.specification.GroupSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class GroupService {
    private static final Logger log = LoggerFactory.getLogger(GroupService.class);
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final CourseRepository courseRepository;
    private final GroupMemberService groupMemberService;

    public GroupService(GroupRepository groupRepository, UserRepository userRepository,
            GroupMemberRepository groupMemberRepository, CourseRepository courseRepository,
            GroupMemberService groupMemberService) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.courseRepository = courseRepository;
        this.groupMemberService = groupMemberService;
    }

    public Page<GroupResponse> search(Long courseId, String privacy, String name, Long userId,
            boolean filterByMembership, Pageable pageable) {
        User currentUser = null;
        if (userId != null) {
            currentUser = userRepository.findById(userId).orElse(null);
        }

        final User resolvedUser = currentUser;

        // Only filter by userId if filterByMembership is true
        Long filterUserId = filterByMembership ? userId : null;

        return groupRepository.findAll(GroupSpecifications.filter(courseId, privacy, name, filterUserId), pageable)
                .map(group -> toDto(group, resolvedUser));
    }

    public Optional<GroupResponse> create(GroupCreateRequest req) {
        Optional<User> user = userRepository.findById(req.getCreatedBy());
        if (user.isEmpty()) {
            return Optional.empty();
        }

        Group.GroupBuilder groupBuilder = Group.builder()
                .groupName(req.getName())
                .description(req.getDescription())
                .privacyType(req.getPrivacy() == null ? Group.PrivacyType.PUBLIC
                        : Group.PrivacyType.valueOf(req.getPrivacy()))
                .createdBy(user.get());

        if (req.getCourseId() != null) {
            courseRepository.findById(req.getCourseId()).ifPresent(groupBuilder::course);
        }

        // If a password was provided and group is private, store it
        if (req.getPassword() != null && !req.getPassword().isBlank() && req.getPrivacy() != null
                && req.getPrivacy().equals("PRIVATE")) {
            groupBuilder.groupPassword(req.getPassword());
        }

        Group group = groupBuilder.build();
        Group savedGroup = groupRepository.save(group);

        groupMemberService.addAdminMember(savedGroup);

        return Optional.of(toDto(savedGroup));
    }

    public Group createGroup(String name, String description, Group.PrivacyType privacy, Long createdByUserId) {
        User user = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (groupRepository.existsByGroupNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Group name already exists");
        }

        Group group = Group.builder()
                .groupName(name)
                .description(description)
                .privacyType(privacy)
                .createdBy(user)
                .build();

        Group savedGroup = groupRepository.save(group);
        groupMemberService.addAdminMember(savedGroup);
        return savedGroup;
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    @Transactional
    public void deleteGroup(Long groupId, Long adminId) {
        log.info("Attempting to delete group {} by admin {}", groupId, adminId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        log.info("Found group: {}, created by: {}", group.getGroupName(), group.getCreatedBy().getId());

        // Only the group creator (admin) can delete the group
        if (!group.getCreatedBy().getId().equals(adminId)) {
            log.warn("Delete group denied - adminId {} is not the creator ({})", adminId, group.getCreatedBy().getId());
            throw new IllegalArgumentException("Only the group creator can delete this group");
        }

        log.info("Deleting group {} and all associated members", groupId);
        groupRepository.delete(group);
        log.info("Group {} successfully deleted", groupId);
    }

    private GroupResponse toDto(Group group) {
        return toDto(group, null);
    }

    private GroupResponse toDto(Group group, User currentUser) {
        String membershipStatus = null;
        String membershipRole = null;

        if (currentUser != null) {
            Optional<GroupMember> membership = groupMemberRepository.findByUserAndGroup(currentUser, group);
            if (membership.isPresent()) {
                GroupMember member = membership.get();
                membershipStatus = member.getStatus() != null ? member.getStatus().name() : null;
                membershipRole = member.getRole() != null ? member.getRole().name() : null;
            } else {
                membershipStatus = "NOT_MEMBER";
            }
        }

        boolean hasPassword = group.getGroupPassword() != null && !group.getGroupPassword().isEmpty();

        return GroupResponse.builder()
                .groupId(group.getId())
                .groupName(group.getGroupName())
                .description(group.getDescription())
                .courseName(group.getCourse() != null ? group.getCourse().getCourseName() : null)
                .createdBy(group.getCreatedBy() != null ? group.getCreatedBy().getId() : null)
                .privacyType(group.getPrivacyType() != null ? group.getPrivacyType().name() : null)
                .createdAt(group.getCreatedAt())
                .membershipStatus(membershipStatus)
                .membershipRole(membershipRole)
                .hasPassword(hasPassword)
                .build();
    }
}

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

import java.util.List;
import java.util.Optional;

@Service
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final GroupMemberService groupMemberService;

    public GroupService(GroupRepository groupRepository, UserRepository userRepository, CourseRepository courseRepository, GroupMemberService groupMemberService) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.groupMemberService = groupMemberService;
    }

    public Page<GroupResponse> search(Long courseId, String privacy, String name, Pageable pageable) {
        return groupRepository.findAll(GroupSpecifications.filter(courseId, privacy, name), pageable)
                .map(this::toDto);
    }

    public Optional<GroupResponse> create(GroupCreateRequest req) {
        Optional<User> user = userRepository.findById(req.getCreatedBy());
        if (user.isEmpty()) {
            return Optional.empty();
        }

    Group.GroupBuilder groupBuilder = Group.builder()
        .groupName(req.getName())
        .description(req.getDescription())
        .privacyType(req.getPrivacy() == null ? Group.PrivacyType.PUBLIC : Group.PrivacyType.valueOf(req.getPrivacy()))
        .createdBy(user.get());

    if (req.getCourseId() != null) {
        courseRepository.findById(req.getCourseId()).ifPresent(groupBuilder::course);
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

    public void deleteGroup(Long groupId, Long adminId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        
        // Only the group creator (admin) can delete the group
        if (!group.getCreatedBy().getId().equals(adminId)) {
            throw new IllegalArgumentException("Only the group creator can delete this group");
        }
        
        groupRepository.delete(group);
    }

    private GroupResponse toDto(Group group) {
    return GroupResponse.builder()
        .groupId(group.getId())
        .groupName(group.getGroupName())
        .description(group.getDescription())
        .courseName(group.getCourse() != null ? group.getCourse().getCourseName() : null)
        .createdBy(group.getCreatedBy() != null ? group.getCreatedBy().getId() : null)
        .privacyType(group.getPrivacyType() != null ? group.getPrivacyType().name() : null)
        .createdAt(group.getCreatedAt())
        .build();
    }
}


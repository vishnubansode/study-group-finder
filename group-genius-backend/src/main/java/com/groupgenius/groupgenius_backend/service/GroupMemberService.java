package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.GroupMemberDto;
import com.groupgenius.groupgenius_backend.entity.*;
import com.groupgenius.groupgenius_backend.exception.*;
import com.groupgenius.groupgenius_backend.mapper.GroupMemberMapper;
import com.groupgenius.groupgenius_backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupMemberService {

        private static final Logger log = LoggerFactory.getLogger(GroupMemberService.class);

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Transactional
    public void requestToJoin(Long userId, Long groupId) {
        requestToJoin(userId, groupId, null);
    }

    @Transactional
    public void requestToJoin(Long userId, Long groupId, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        groupMemberRepository.findByUserAndGroup(user, group)
                .ifPresent(m -> { throw new DuplicateGroupMemberException("User already joined or pending approval"); });

        // Public groups: auto-approve
        if (group.getPrivacyType() == Group.PrivacyType.PUBLIC) {
            GroupMember gm = GroupMember.builder()
                    .user(user)
                    .group(group)
                    .role(GroupMember.Role.MEMBER)
                    .status(GroupMember.Status.APPROVED)
                    .joinedAt(LocalDateTime.now())
                    .build();
            groupMemberRepository.save(gm);
            return;
        }

        // Private groups: if password provided, validate and auto-approve; if incorrect, throw error; if no password, create PENDING
        boolean hasPassword = group.getGroupPassword() != null && !group.getGroupPassword().isEmpty();
        if (hasPassword) {
            if (password == null || password.isEmpty()) {
                // No password supplied -> create PENDING
                GroupMember pending = GroupMember.builder()
                        .user(user)
                        .group(group)
                        .role(GroupMember.Role.MEMBER)
                        .status(GroupMember.Status.PENDING)
                        .joinedAt(LocalDateTime.now())
                        .build();
                groupMemberRepository.save(pending);
                return;
            }

            // Validate password - simple string comparison (no hashing)
            if (!group.getGroupPassword().equals(password)) {
                throw new IllegalArgumentException("Invalid password");
            }

            // Correct password -> approve
            GroupMember approved = GroupMember.builder()
                    .user(user)
                    .group(group)
                    .role(GroupMember.Role.MEMBER)
                    .status(GroupMember.Status.APPROVED)
                    .joinedAt(LocalDateTime.now())
                    .build();
            groupMemberRepository.save(approved);
            return;
        }

        // Private but no password set: create PENDING
        GroupMember groupMember = GroupMember.builder()
                .user(user)
                .group(group)
                .role(GroupMember.Role.MEMBER)
                .status(GroupMember.Status.PENDING)
                .joinedAt(LocalDateTime.now())
                .build();

        groupMemberRepository.save(groupMember);
    }

    @Transactional
    public void approveMember(Long adminId, Long userId, Long groupId) {
        log.info("approveMember called by adminId={} for userId={} in groupId={}", adminId, userId, groupId);
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        GroupMember adminMembership = groupMemberRepository.findByUserAndGroup(admin, group)
                .orElseThrow(() -> new UnauthorizedActionException("You are not part of this group"));
        if (adminMembership.getRole() != GroupMember.Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can approve members");
        }

        GroupMember memberToApprove = groupMemberRepository.findByUserAndGroup(
                        userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found")),
                        group)
                .orElseThrow(() -> new GroupMemberNotFoundException("Group member not found"));

        memberToApprove.setStatus(GroupMember.Status.APPROVED);
        groupMemberRepository.save(memberToApprove);
        log.info("User {} approved in group {} by admin {}", userId, groupId, adminId);
    }

    @Transactional
    public void removeMember(Long adminId, Long userId, Long groupId) {
        log.info("removeMember called by adminId={} for userId={} in groupId={}", adminId, userId, groupId);
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        GroupMember adminMembership = groupMemberRepository.findByUserAndGroup(admin, group)
                .orElseThrow(() -> new UnauthorizedActionException("You are not part of this group"));
        if (adminMembership.getRole() != GroupMember.Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can remove members");
        }

        GroupMember member = groupMemberRepository.findByUserAndGroup(
                        userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found")),
                        group)
                .orElseThrow(() -> new GroupMemberNotFoundException("Member not found in this group"));

                groupMemberRepository.delete(member);
                log.info("User {} removed from group {} by admin {}", userId, groupId, adminId);
    }

    public List<GroupMemberDto> getGroupMembers(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        return groupMemberRepository.findByGroup(group)
                .stream()
                .map(GroupMemberMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
        public void addAdminMember(Group group) {
        User admin = group.getCreatedBy();

        if (groupMemberRepository.findByUserAndGroup(admin, group).isEmpty()) {
            GroupMember adminMembership = GroupMember.builder()
                    .user(admin)
                    .group(group)
                    .role(GroupMember.Role.ADMIN)
                    .status(GroupMember.Status.APPROVED)
                    .joinedAt(LocalDateTime.now())
                    .build();

            groupMemberRepository.save(adminMembership);
        }
    }
}

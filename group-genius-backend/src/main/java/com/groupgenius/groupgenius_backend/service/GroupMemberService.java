package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.GroupMemberDto;
import com.groupgenius.groupgenius_backend.entity.*;
import com.groupgenius.groupgenius_backend.exception.*;
import com.groupgenius.groupgenius_backend.mapper.GroupMemberMapper;
import com.groupgenius.groupgenius_backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupMemberService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Transactional
    public void requestToJoin(Long userId, Long groupId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        groupMemberRepository.findByUserAndGroup(user, group)
                .ifPresent(m -> { throw new DuplicateGroupMemberException("User already joined or pending approval"); });

        GroupMember.Status status = group.getPrivacyType() == Group.PrivacyType.PUBLIC
                ? GroupMember.Status.APPROVED
                : GroupMember.Status.PENDING;

        GroupMember groupMember = GroupMember.builder()
                .user(user)
                .group(group)
                .role(GroupMember.Role.MEMBER)
                .status(status)
                .joinedAt(LocalDateTime.now())
                .build();

        groupMemberRepository.save(groupMember);
    }

    @Transactional
    public void approveMember(Long adminId, Long userId, Long groupId) {
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
    }

    @Transactional
    public void removeMember(Long adminId, Long userId, Long groupId) {
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

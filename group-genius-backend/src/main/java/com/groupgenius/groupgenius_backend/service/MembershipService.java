package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.MembershipDto;
import com.groupgenius.groupgenius_backend.entity.*;
import com.groupgenius.groupgenius_backend.exception.*;
import com.groupgenius.groupgenius_backend.mapper.MembershipMapper;
import com.groupgenius.groupgenius_backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembershipService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;

    @Transactional
    public void requestToJoin(Long userId, Long groupId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        membershipRepository.findByUserAndGroup(user, group)
                .ifPresent(m -> { throw new DuplicateMembershipException("User already joined or pending approval"); });

        Membership.Status status = group.getPrivacyType() == Group.PrivacyType.PUBLIC
                ? Membership.Status.APPROVED
                : Membership.Status.PENDING;

        Membership membership = Membership.builder()
                .user(user)
                .group(group)
                .role(Membership.Role.MEMBER)
                .status(status)
                .joinedAt(LocalDateTime.now())
                .build();

        membershipRepository.save(membership);
    }

    @Transactional
    public void approveMember(Long adminId, Long userId, Long groupId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        Membership adminMembership = membershipRepository.findByUserAndGroup(admin, group)
                .orElseThrow(() -> new UnauthorizedActionException("You are not part of this group"));
        if (adminMembership.getRole() != Membership.Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can approve members");
        }

        Membership memberToApprove = membershipRepository.findByUserAndGroup(
                        userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found")),
                        group)
                .orElseThrow(() -> new MembershipNotFoundException("Membership not found"));

        memberToApprove.setStatus(Membership.Status.APPROVED);
        membershipRepository.save(memberToApprove);
    }

    @Transactional
    public void removeMember(Long adminId, Long userId, Long groupId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        Membership adminMembership = membershipRepository.findByUserAndGroup(admin, group)
                .orElseThrow(() -> new UnauthorizedActionException("You are not part of this group"));
        if (adminMembership.getRole() != Membership.Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can remove members");
        }

        Membership member = membershipRepository.findByUserAndGroup(
                        userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found")),
                        group)
                .orElseThrow(() -> new MembershipNotFoundException("Member not found in this group"));

        membershipRepository.delete(member);
    }

    public List<MembershipDto> getGroupMembers(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        return membershipRepository.findByGroup(group)
                .stream()
                .map(MembershipMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addAdminMembership(Group group) {
        User admin = group.getCreatedBy();

        if (membershipRepository.findByUserAndGroup(admin, group).isEmpty()) {
            Membership adminMembership = Membership.builder()
                    .user(admin)
                    .group(group)
                    .role(Membership.Role.ADMIN)
                    .status(Membership.Status.APPROVED)
                    .joinedAt(LocalDateTime.now())
                    .build();

            membershipRepository.save(adminMembership);
        }
    }

}

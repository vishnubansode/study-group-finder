package com.groupgenius.groupgenius_backend.mapper;

import com.groupgenius.groupgenius_backend.dto.GroupMemberDto;
import com.groupgenius.groupgenius_backend.entity.GroupMember;

public final class GroupMemberMapper {

    private GroupMemberMapper() {
    }

    public static GroupMemberDto toDto(GroupMember groupMember) {
        return GroupMemberDto.builder()
                .groupMemberId(groupMember.getId())
                .userId(groupMember.getUser().getId())
                .userName(groupMember.getUser().getFirstName() + " " + groupMember.getUser().getLastName())
                .groupId(groupMember.getGroup().getId())
                .groupName(groupMember.getGroup().getGroupName())
                .role(groupMember.getRole().name())
                .status(groupMember.getStatus().name())
                .joinedAt(groupMember.getJoinedAt())
                .build();
    }
}

package com.groupgenius.groupgenius_backend.mapper;

import com.groupgenius.groupgenius_backend.dto.MembershipDto;
import com.groupgenius.groupgenius_backend.entity.Membership;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class MembershipMapper {

    public static MembershipDto toDto(Membership membership) {
        return MembershipDto.builder()
                .membershipId(membership.getId())
                .userId(membership.getUser().getId())
                .userName(membership.getUser().getFirstName() + " " + membership.getUser().getLastName())
                .groupId(membership.getGroup().getId())
                .groupName(membership.getGroup().getGroupName())
                .role(membership.getRole().name())
                .status(membership.getStatus().name())
                .joinedAt(membership.getJoinedAt())
                .build();
    }
}

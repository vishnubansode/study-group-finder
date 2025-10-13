package com.groupgenius.groupgenius_backend.mapper;

import com.groupgenius.groupgenius_backend.dto.GroupDto;
import com.groupgenius.groupgenius_backend.entity.Group;
import lombok.NoArgsConstructor;
import lombok.AccessLevel;

import java.util.List;
import java.util.stream.Collectors;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class GroupMapper {

    public static GroupDto toDto(Group group) {
        return GroupDto.builder()
                .groupId(group.getId())
                .groupName(group.getGroupName())
                .description(group.getDescription())
                .privacyType(group.getPrivacyType().name())
                .createdByUserId(group.getCreatedBy().getId())
                .createdByUserName(group.getCreatedBy().getFirstName() + " " + group.getCreatedBy().getLastName())
                .build();
    }

    public static List<GroupDto> toDtoList(List<Group> groups) {
        return groups.stream()
                .map(GroupMapper::toDto)
                .collect(Collectors.toList());
    }
}

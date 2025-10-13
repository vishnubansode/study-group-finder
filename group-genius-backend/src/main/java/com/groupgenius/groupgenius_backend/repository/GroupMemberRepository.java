package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroup_Id(Long groupId);
    boolean existsByGroup_IdAndUser_Id(Long groupId, Long userId);
}

package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Group;
import com.groupgenius.groupgenius_backend.entity.GroupMember;
import com.groupgenius.groupgenius_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
	Optional<GroupMember> findByUserAndGroup(User user, Group group);
	List<GroupMember> findByGroup(Group group);
	List<GroupMember> findByUser(User user);

	long countByGroupAndRole(Group group, GroupMember.Role role);
}

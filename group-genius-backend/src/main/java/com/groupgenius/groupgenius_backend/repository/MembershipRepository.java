package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Membership;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByUserAndGroup(User user, Group group);
    List<Membership> findByGroup(Group group);
    List<Membership> findByUser(User user);
}

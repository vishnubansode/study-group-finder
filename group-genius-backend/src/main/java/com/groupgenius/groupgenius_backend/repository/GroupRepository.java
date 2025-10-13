package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface GroupRepository extends JpaRepository<Group, Long>, JpaSpecificationExecutor<Group> {
}
package com.groupgenius.groupgenius_backend.repository;

import com.groupgenius.groupgenius_backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findByGroupNameIgnoreCase(String groupName);
    boolean existsByGroupNameIgnoreCase(String groupName);
}

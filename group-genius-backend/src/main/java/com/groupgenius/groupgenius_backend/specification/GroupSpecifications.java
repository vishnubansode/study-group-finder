package com.groupgenius.groupgenius_backend.specification;

import com.groupgenius.groupgenius_backend.entity.Group;
import com.groupgenius.groupgenius_backend.entity.GroupMember;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class GroupSpecifications {
    private GroupSpecifications() {
    }

    public static Specification<Group> filter(Long courseId, String privacy, String name, Long userId) {
        return (root, query, cb) -> {
            Predicate p = cb.conjunction();

            // Filter by userId (only groups where user is a member)
            if (userId != null) {
                Join<Group, GroupMember> memberJoin = root.join("members");
                p = cb.and(p, cb.equal(memberJoin.get("user").get("id"), userId));
                // Only include approved members
                p = cb.and(p, cb.equal(memberJoin.get("status"), GroupMember.Status.APPROVED));
            }

            if (courseId != null) {
                p = cb.and(p, cb.equal(root.get("course").get("id"), courseId));
            }
            if (StringUtils.hasText(privacy)) {
                try {
                    Group.PrivacyType type = Group.PrivacyType.valueOf(privacy.toUpperCase());
                    p = cb.and(p, cb.equal(root.get("privacyType"), type));
                } catch (IllegalArgumentException ignored) {
                }
            }
            if (StringUtils.hasText(name)) {
                String like = "%" + name.toLowerCase() + "%";
                p = cb.and(p, cb.or(
                        cb.like(cb.lower(root.get("groupName")), like),
                        cb.like(cb.lower(root.get("description")), like)));
            }
            return p;
        };
    }
}

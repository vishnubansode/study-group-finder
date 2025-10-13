package com.groupgenius.groupgenius_backend.specification;

import com.groupgenius.groupgenius_backend.entity.Group;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class GroupSpecifications {
    private GroupSpecifications() {}

    public static Specification<Group> filter(Long courseId, String privacy, String name) {
        return (root, query, cb) -> {
            Predicate p = cb.conjunction();
            if (courseId != null) {
                p = cb.and(p, cb.equal(root.get("course").get("id"), courseId));
            }
            if (StringUtils.hasText(privacy)) {
                p = cb.and(p, cb.equal(root.get("privacy"), privacy));
            }
            if (StringUtils.hasText(name)) {
                String like = "%" + name.toLowerCase() + "%";
                p = cb.and(p, cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("description")), like)
                ));
            }
            return p;
        };
    }
}

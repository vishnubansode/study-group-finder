package com.groupgenius.groupgenius_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_groups")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String groupName;

    private String description;

    @Enumerated(EnumType.STRING)
    private PrivacyType privacyType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Membership> memberships = new HashSet<>();

    public enum PrivacyType {
        PUBLIC, PRIVATE
    }
}

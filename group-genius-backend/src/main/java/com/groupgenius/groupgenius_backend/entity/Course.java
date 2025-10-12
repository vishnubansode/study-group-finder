package com.groupgenius.groupgenius_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "courses")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String courseCode;

    @Column(nullable = false, length = 100)
    private String courseName;

    @Column(length = 500)
    private String description;

    @ManyToMany(mappedBy = "courses")
    @Builder.Default
    private Set<User> enrolledUsers = new HashSet<>();

    @Column(name = "current_enrollment", nullable = false)
    @Builder.Default
    private Integer currentEnrollment = 0;
}
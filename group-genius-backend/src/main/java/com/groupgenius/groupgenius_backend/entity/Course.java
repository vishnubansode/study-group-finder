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

    @Column(nullable = false, length = 100)
    private String courseName;

    @Column(length = 500)
    private String description;

    // maximum number of students allowed
    @Column(nullable = false)
    private Integer courseCapacity;

    // how many are currently enrolled
    @Column(nullable = false)
    @Builder.Default
    private Integer currentEnrollment = 0;

    @ManyToMany(mappedBy = "courses")
    @Builder.Default
    private Set<User> enrolledUsers = new HashSet<>();

    // Helper method to check if course is full
    public boolean isFull() {
        return currentEnrollment >= courseCapacity;
    }

    // Helper method to get enrollment percentage
    public double getEnrollmentPercentage() {
        if (courseCapacity == 0) return 0.0;
        return (double) currentEnrollment / courseCapacity * 100.0;
    }
}

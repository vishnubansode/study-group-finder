package com.groupgenius.groupgenius_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String email;

    private String password;
    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;

    private String secondarySchool;
    private String graduationYear;
    private String university;
    private String major;
    private String currentYear;
    private String bio;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_courses", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "course_id"))
    @Builder.Default
    private Set<Course> courses = new HashSet<>();

    public boolean isEnrolledInCourse(Course course) {
        return courses.contains(course);
    }

}

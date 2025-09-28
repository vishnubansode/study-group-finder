package com.groupgenius.groupgenius_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

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

    private String profileImageUrl;

    private String secondarySchool;
    private String graduationYear;
    private String university;
    private String major;
    private String currentYear;

    // Persist selected courses as a separate table
    @ElementCollection
    @CollectionTable(name = "user_courses", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "course_name")
    private List<String> selectedCourses;

}

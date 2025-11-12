package com.examportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "questions")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    @NotNull
    @JsonIgnore
    private Exam exam;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @NotBlank
    @Column(nullable = false)
    private String optionA;

    @NotBlank
    @Column(nullable = false)
    private String optionB;

    @NotBlank
    @Column(nullable = false)
    private String optionC;

    @NotBlank
    @Column(nullable = false)
    private String optionD;

    @NotBlank
    @Column(nullable = false, length = 1)
    private String correctAnswer; // A, B, C, or D

    @Min(1)
    @Column(nullable = false)
    private Integer marks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DifficultyLevel difficultyLevel = DifficultyLevel.MEDIUM;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<StudentAnswer> studentAnswers;

    // Helper method to get exam ID for JSON serialization
    public Long getExamId() {
        return exam != null ? exam.getId() : null;
    }

    public enum DifficultyLevel {
        EASY, MEDIUM, HARD
    }
}

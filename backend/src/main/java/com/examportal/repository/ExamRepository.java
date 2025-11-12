package com.examportal.repository;

import com.examportal.entity.Exam;
import com.examportal.entity.ExamCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByExamCategory(ExamCategory examCategory);
    List<Exam> findByIsActiveTrue();
    Page<Exam> findByIsActiveTrue(Pageable pageable);
    
    @Query("SELECT COUNT(e) FROM Exam e WHERE e.isActive = true")
    long countActiveExams();
    
    List<Exam> findTop3ByOrderByCreatedAtDesc();
    
    @Query("SELECT e FROM Exam e WHERE e.examCategory.id = :categoryId AND e.isActive = true")
    List<Exam> findActiveExamsByCategory(@Param("categoryId") Long categoryId);
    
    long countByExamCategory(ExamCategory examCategory);
}

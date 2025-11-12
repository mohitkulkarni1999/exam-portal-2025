package com.examportal.repository;

import com.examportal.entity.Exam;
import com.examportal.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExam(Exam exam);
    List<Question> findByExam_Id(Long examId);
    
    @Query("SELECT COUNT(q) FROM Question q WHERE q.exam.id = :examId")
    long countByExamId(@Param("examId") Long examId);
    
    @Query("SELECT COUNT(q) FROM Question q")
    long countAllQuestions();
    
    @Query("SELECT q FROM Question q WHERE q.exam.id = :examId ORDER BY q.id")
    List<Question> findByExamIdOrderById(@Param("examId") Long examId);
}

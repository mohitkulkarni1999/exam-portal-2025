package com.examportal.repository;

import com.examportal.entity.ExamSession;
import com.examportal.entity.Question;
import com.examportal.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findByExamSession(ExamSession examSession);
    Optional<StudentAnswer> findByExamSessionAndQuestion(ExamSession examSession, Question question);
    
    @Query("SELECT sa FROM StudentAnswer sa WHERE sa.examSession.id = :sessionId")
    List<StudentAnswer> findByExamSessionId(@Param("sessionId") Long sessionId);
    
    @Query("SELECT COUNT(sa) FROM StudentAnswer sa WHERE sa.examSession.id = :sessionId AND sa.isCorrect = true")
    long countCorrectAnswersBySessionId(@Param("sessionId") Long sessionId);
    
    @Query("SELECT COUNT(sa) FROM StudentAnswer sa WHERE sa.examSession.id = :sessionId AND sa.selectedAnswer IS NOT NULL")
    long countAnsweredQuestionsBySessionId(@Param("sessionId") Long sessionId);
}

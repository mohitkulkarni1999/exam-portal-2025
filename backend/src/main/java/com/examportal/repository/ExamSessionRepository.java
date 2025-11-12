package com.examportal.repository;

import com.examportal.entity.Exam;
import com.examportal.entity.ExamSession;
import com.examportal.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {
    List<ExamSession> findByStudent(Student student);
    List<ExamSession> findByExam(Exam exam);
    Optional<ExamSession> findByStudentAndExam(Student student, Exam exam);
    
    @Query("SELECT es FROM ExamSession es WHERE es.student.id = :studentId AND es.status = :status")
    List<ExamSession> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") ExamSession.Status status);
    
    @Query("SELECT es FROM ExamSession es WHERE es.exam.id = :examId AND es.status = 'COMPLETED'")
    List<ExamSession> findCompletedSessionsByExamId(@Param("examId") Long examId);
    
    @Query("SELECT COUNT(es) FROM ExamSession es WHERE es.status = 'COMPLETED'")
    long countCompletedSessions();
    
    @Query("SELECT COUNT(es) FROM ExamSession es WHERE es.status = 'COMPLETED' AND es.obtainedMarks >= (es.exam.passingMarks)")
    long countPassedSessions();
    
    @Query("SELECT AVG(es.obtainedMarks) FROM ExamSession es WHERE es.exam.id = :examId AND es.status = 'COMPLETED'")
    Double getAverageMarksByExamId(@Param("examId") Long examId);
    
    List<ExamSession> findTop5ByStatusOrderByEndTimeDesc(ExamSession.Status status);
}

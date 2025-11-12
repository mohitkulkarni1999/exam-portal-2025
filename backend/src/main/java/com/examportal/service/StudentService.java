package com.examportal.service;

import com.examportal.entity.*;
import com.examportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentService {
    
    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;
    private final ExamSessionRepository examSessionRepository;
    private final QuestionRepository questionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    
    public List<Exam> getAvailableExams() {
        return examRepository.findByIsActiveTrue();
    }
    
    public List<Exam> getAvailableExamsForStudent(Long studentId) {
        // Get all active exams
        List<Exam> allActiveExams = examRepository.findByIsActiveTrue();
        
        // Get completed exam IDs for this student
        List<ExamSession> completedSessions = examSessionRepository.findByStudentIdAndStatus(studentId, ExamSession.Status.COMPLETED);
        List<Long> completedExamIds = completedSessions.stream()
                .map(session -> session.getExam().getId())
                .toList();
        
        // Filter out completed exams
        return allActiveExams.stream()
                .filter(exam -> !completedExamIds.contains(exam.getId()))
                .toList();
    }
    
    public Exam getExamById(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
    }
    
    public ExamSession startExam(Long studentId, Long examId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        
        // Check if student has already taken this exam
        Optional<ExamSession> existingSession = examSessionRepository.findByStudentAndExam(student, exam);
        if (existingSession.isPresent()) {
            // For testing purposes, allow retaking exams by returning the existing session if not completed
            // or creating a new session if the previous one was completed
            ExamSession existing = existingSession.get();
            if (existing.getStatus() == ExamSession.Status.IN_PROGRESS) {
                return existing; // Return existing in-progress session
            }
            // If completed, allow retaking by continuing to create new session
        }
        
        ExamSession session = new ExamSession();
        session.setStudent(student);
        session.setExam(exam);
        session.setStartTime(LocalDateTime.now());
        session.setStatus(ExamSession.Status.IN_PROGRESS);
        
        return examSessionRepository.save(session);
    }
    
    public ExamSession getExamSession(Long sessionId) {
        return examSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Exam session not found"));
    }
    
    public List<Question> getExamQuestions(Long examId) {
        return questionRepository.findByExamIdOrderById(examId);
    }
    
    public StudentAnswer submitAnswer(Long sessionId, Long questionId, String selectedAnswer) {
        ExamSession session = examSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Exam session not found"));
        
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        
        // Check if answer already exists
        Optional<StudentAnswer> existingAnswer = studentAnswerRepository
                .findByExamSessionAndQuestion(session, question);
        
        StudentAnswer answer;
        if (existingAnswer.isPresent()) {
            answer = existingAnswer.get();
            answer.setSelectedAnswer(selectedAnswer);
        } else {
            answer = new StudentAnswer();
            answer.setExamSession(session);
            answer.setQuestion(question);
            answer.setSelectedAnswer(selectedAnswer);
        }
        
        // Check if answer is correct
        answer.setIsCorrect(selectedAnswer != null && selectedAnswer.equals(question.getCorrectAnswer()));
        
        return studentAnswerRepository.save(answer);
    }
    
    public ExamSession submitExam(Long sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Exam session not found"));
        
        session.setEndTime(LocalDateTime.now());
        session.setStatus(ExamSession.Status.COMPLETED);
        
        // Calculate marks properly
        List<Question> examQuestions = questionRepository.findByExam_Id(session.getExam().getId());
        List<StudentAnswer> studentAnswers = studentAnswerRepository.findByExamSessionId(sessionId);
        
        int obtainedMarks = 0;
        
        // Calculate marks based on correct answers and their individual question marks
        for (StudentAnswer answer : studentAnswers) {
            if (answer.getIsCorrect() != null && answer.getIsCorrect()) {
                obtainedMarks += answer.getQuestion().getMarks();
            }
        }
        
        // Ensure obtained marks don't exceed total marks
        int totalMarks = examQuestions.stream().mapToInt(Question::getMarks).sum();
        obtainedMarks = Math.min(obtainedMarks, totalMarks);
        
        session.setObtainedMarks(obtainedMarks);
        
        return examSessionRepository.save(session);
    }
    
    public List<ExamSession> getStudentResults(Long studentId) {
        // Verify student exists
        studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        return examSessionRepository.findByStudentIdAndStatus(studentId, ExamSession.Status.COMPLETED);
    }
    
    public List<StudentAnswer> getExamSessionAnswers(Long sessionId) {
        return studentAnswerRepository.findByExamSessionId(sessionId);
    }
}

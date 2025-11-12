package com.examportal.service;

import com.examportal.entity.Exam;
import com.examportal.entity.ExamCategory;
import com.examportal.repository.ExamRepository;
import com.examportal.repository.ExamCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamService {
    
    private final ExamRepository examRepository;
    private final ExamCategoryRepository examCategoryRepository;
    
    public List<Exam> getAllActiveExams() {
        return examRepository.findByIsActiveTrue();
    }
    
    public Page<Exam> getActiveExams(Pageable pageable) {
        return examRepository.findByIsActiveTrue(pageable);
    }
    
    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }
    
    public Exam createExam(Exam exam) {
        return examRepository.save(exam);
    }
    
    public Exam updateExam(Long id, Exam examDetails) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
        
        exam.setTitle(examDetails.getTitle());
        exam.setDescription(examDetails.getDescription());
        exam.setDurationMinutes(examDetails.getDurationMinutes());
        exam.setTotalMarks(examDetails.getTotalMarks());
        exam.setPassingMarks(examDetails.getPassingMarks());
        exam.setInstructions(examDetails.getInstructions());
        exam.setIsActive(examDetails.getIsActive());
        
        return examRepository.save(exam);
    }
    
    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }
    
    public List<Exam> getExamsByCategory(Long categoryId) {
        return examRepository.findActiveExamsByCategory(categoryId);
    }
    
    public long getActiveExamCount() {
        return examRepository.countActiveExams();
    }
    
    // Exam Category methods
    public List<ExamCategory> getAllCategories() {
        return examCategoryRepository.findAll();
    }
    
    public ExamCategory createCategory(ExamCategory category) {
        if (examCategoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category with name already exists: " + category.getName());
        }
        return examCategoryRepository.save(category);
    }
    
    public ExamCategory updateCategory(Long id, ExamCategory categoryDetails) {
        ExamCategory category = examCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        
        return examCategoryRepository.save(category);
    }
    
    public void deleteCategory(Long id) {
        ExamCategory category = examCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        // Check if category has associated exams by counting them
        long examCount = examRepository.countByExamCategory(category);
        if (examCount > 0) {
            throw new RuntimeException("Cannot delete category with existing exams. Please reassign or delete exams first.");
        }
        
        examCategoryRepository.deleteById(id);
    }
}

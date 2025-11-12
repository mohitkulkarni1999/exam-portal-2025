package com.examportal.service;

import com.examportal.entity.Question;
import com.examportal.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {
    
    private final QuestionRepository questionRepository;
    
    public List<Question> getQuestionsByExamId(Long examId) {
        return questionRepository.findByExam_Id(examId);
    }
    
    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }
    
    public long countQuestionsByExamId(Long examId) {
        return questionRepository.countByExamId(examId);
    }
    
    public void deleteQuestion(Long questionId) {
        questionRepository.deleteById(questionId);
    }
    
    public Question updateQuestion(Long questionId, Question questionDetails) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        
        question.setQuestionText(questionDetails.getQuestionText());
        question.setOptionA(questionDetails.getOptionA());
        question.setOptionB(questionDetails.getOptionB());
        question.setOptionC(questionDetails.getOptionC());
        question.setOptionD(questionDetails.getOptionD());
        question.setCorrectAnswer(questionDetails.getCorrectAnswer());
        question.setMarks(questionDetails.getMarks());
        question.setDifficultyLevel(questionDetails.getDifficultyLevel());
        
        return questionRepository.save(question);
    }
    
    public long countAllQuestions() {
        return questionRepository.countAllQuestions();
    }
}

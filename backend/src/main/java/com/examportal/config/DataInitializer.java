package com.examportal.config;

import com.examportal.entity.*;
import com.examportal.repository.*;
import com.examportal.service.AuthService;
import com.examportal.service.ExamService;
import com.examportal.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final AuthService authService;
    private final ExamService examService;
    private final QuestionService questionService;
    private final ExamSessionRepository examSessionRepository;
    private final StudentRepository studentRepository;
    private final QuestionRepository questionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Create default admin user on application startup
        authService.createDefaultAdmin();
        
        // Create default exam categories
        createDefaultCategories();
        
        // Create sample exams
        createSampleExams();
        
        // Create sample questions
        createSampleQuestions();
        
        // Create sample exam sessions with realistic results
        createSampleExamSessions();
    }
    
    private void createDefaultCategories() {
        try {
            // Check if categories already exist
            if (examService.getAllCategories().isEmpty()) {
                // Create default categories
                ExamCategory math = new ExamCategory();
                math.setName("Mathematics");
                math.setDescription("Mathematical concepts, algebra, geometry, calculus, and problem-solving");
                examService.createCategory(math);
                
                ExamCategory science = new ExamCategory();
                science.setName("Science");
                science.setDescription("Physics, Chemistry, Biology, and general scientific knowledge");
                examService.createCategory(science);
                
                ExamCategory english = new ExamCategory();
                english.setName("English");
                english.setDescription("Grammar, vocabulary, reading comprehension, and writing skills");
                examService.createCategory(english);
                
                ExamCategory history = new ExamCategory();
                history.setName("History");
                history.setDescription("World history, historical events, and cultural knowledge");
                examService.createCategory(history);
                
                ExamCategory programming = new ExamCategory();
                programming.setName("Programming");
                programming.setDescription("Computer programming, algorithms, and software development");
                examService.createCategory(programming);
                
                System.out.println("Default exam categories created successfully!");
            }
        } catch (Exception e) {
            System.err.println("Error creating default categories: " + e.getMessage());
        }
    }
    
    private void createSampleExams() {
        try {
            // Check if exams already exist
            var existingExamsPage = examService.getActiveExams(org.springframework.data.domain.PageRequest.of(0, 10));
            var existingExams = existingExamsPage.getContent();
            System.out.println("Existing exams count: " + existingExams.size());
            
            // Create sample exams if they don't already exist (check by title)
            boolean hasMathExam = existingExams.stream().anyMatch(e -> e.getTitle().contains("Mathematics"));
            boolean hasScienceExam = existingExams.stream().anyMatch(e -> e.getTitle().contains("Science"));
            boolean hasEnglishExam = existingExams.stream().anyMatch(e -> e.getTitle().contains("English"));
            
            if (!hasMathExam || !hasScienceExam || !hasEnglishExam) {
                // Get categories to assign to exams
                var categories = examService.getAllCategories();
                System.out.println("Available categories count: " + categories.size());
                categories.forEach(cat -> System.out.println("Category: " + cat.getName()));
                
                if (!categories.isEmpty()) {
                    // Create sample exams for each category
                    var mathCategory = categories.stream().filter(c -> c.getName().equals("Mathematics")).findFirst().orElse(null);
                    var scienceCategory = categories.stream().filter(c -> c.getName().equals("Science")).findFirst().orElse(null);
                    var englishCategory = categories.stream().filter(c -> c.getName().equals("English")).findFirst().orElse(null);
                    
                    System.out.println("Math category found: " + (mathCategory != null));
                    System.out.println("Science category found: " + (scienceCategory != null));
                    System.out.println("English category found: " + (englishCategory != null));
                    
                    if (mathCategory != null && !hasMathExam) {
                        com.examportal.entity.Exam mathExam = new com.examportal.entity.Exam();
                        mathExam.setTitle("Basic Mathematics Test");
                        mathExam.setDescription("Test your fundamental math skills including algebra and geometry");
                        mathExam.setExamCategory(mathCategory);
                        mathExam.setDurationMinutes(60);
                        mathExam.setTotalMarks(100);
                        mathExam.setPassingMarks(40);
                        mathExam.setInstructions("Read all questions carefully. Calculator is not allowed.");
                        mathExam.setIsActive(true);
                        examService.createExam(mathExam);
                        System.out.println("Created Math exam: " + mathExam.getTitle());
                    }
                    
                    if (scienceCategory != null && !hasScienceExam) {
                        com.examportal.entity.Exam scienceExam = new com.examportal.entity.Exam();
                        scienceExam.setTitle("General Science Quiz");
                        scienceExam.setDescription("Basic concepts in Physics, Chemistry, and Biology");
                        scienceExam.setExamCategory(scienceCategory);
                        scienceExam.setDurationMinutes(45);
                        scienceExam.setTotalMarks(75);
                        scienceExam.setPassingMarks(30);
                        scienceExam.setInstructions("Multiple choice questions. Choose the best answer.");
                        scienceExam.setIsActive(true);
                        examService.createExam(scienceExam);
                        System.out.println("Created Science exam: " + scienceExam.getTitle());
                    }
                    
                    if (englishCategory != null && !hasEnglishExam) {
                        com.examportal.entity.Exam englishExam = new com.examportal.entity.Exam();
                        englishExam.setTitle("English Comprehension Test");
                        englishExam.setDescription("Reading comprehension and grammar assessment");
                        englishExam.setExamCategory(englishCategory);
                        englishExam.setDurationMinutes(90);
                        englishExam.setTotalMarks(120);
                        englishExam.setPassingMarks(50);
                        englishExam.setInstructions("Read passages carefully and answer all questions.");
                        englishExam.setIsActive(true);
                        examService.createExam(englishExam);
                        System.out.println("Created English exam: " + englishExam.getTitle());
                    }
                    
                    System.out.println("Sample exams created successfully!");
                }
            }
        } catch (Exception e) {
            System.err.println("Error creating sample exams: " + e.getMessage());
        }
    }
    
    @Transactional
    private void createSampleQuestions() {
        try {
            // Get all categories first
            var categories = examService.getAllCategories();
            
            // Create questions for each category's exams
            for (var category : categories) {
                Long examId = getExamIdForCategory(category.getName());
                if (examId != null && questionService.countQuestionsByExamId(examId) == 0) {
                    createQuestionsForCategory(category.getName(), examId);
                }
            }
            System.out.println("Sample questions created successfully!");
        } catch (Exception e) {
            System.err.println("Error creating sample questions: " + e.getMessage());
        }
    }
    
    private Long getExamIdForCategory(String categoryName) {
        try {
            var exams = examService.getActiveExams(org.springframework.data.domain.PageRequest.of(0, 10));
            for (var exam : exams) {
                // Use the title to identify the exam instead of accessing lazy-loaded category
                if ((categoryName.equals("Mathematics") && exam.getTitle().contains("Mathematics")) ||
                    (categoryName.equals("Science") && exam.getTitle().contains("Science")) ||
                    (categoryName.equals("English") && exam.getTitle().contains("English"))) {
                    return exam.getId();
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting exam ID for category: " + e.getMessage());
        }
        return null;
    }
    
    private void createQuestionsForCategory(String categoryName, Long examId) {
        // Create a minimal exam object with just the ID to avoid lazy loading issues
        com.examportal.entity.Exam exam = new com.examportal.entity.Exam();
        exam.setId(examId);
        
        if ("Mathematics".equals(categoryName)) {
            createMathQuestions(exam);
        } else if ("Science".equals(categoryName)) {
            createScienceQuestions(exam);
        } else if ("English".equals(categoryName)) {
            createEnglishQuestions(exam);
        }
    }
    
    private void createMathQuestions(com.examportal.entity.Exam exam) {
        // Question 1
        com.examportal.entity.Question q1 = new com.examportal.entity.Question();
        q1.setExam(exam);
        q1.setQuestionText("What is the value of π (pi) up to 2 decimal places?");
        q1.setOptionA("3.14");
        q1.setOptionB("3.15");
        q1.setOptionC("3.13");
        q1.setOptionD("3.16");
        q1.setCorrectAnswer("A");
        q1.setMarks(2);
        q1.setDifficultyLevel(com.examportal.entity.Question.DifficultyLevel.EASY);
        questionService.createQuestion(q1);
        
        // Question 2
        com.examportal.entity.Question q2 = new com.examportal.entity.Question();
        q2.setExam(exam);
        q2.setQuestionText("Solve: 2x + 5 = 15. What is the value of x?");
        q2.setOptionA("5");
        q2.setOptionB("10");
        q2.setOptionC("7");
        q2.setOptionD("8");
        q2.setCorrectAnswer("A");
        q2.setMarks(3);
        q2.setDifficultyLevel(com.examportal.entity.Question.DifficultyLevel.MEDIUM);
        questionService.createQuestion(q2);
        
        // Question 3
        com.examportal.entity.Question q3 = new com.examportal.entity.Question();
        q3.setExam(exam);
        q3.setQuestionText("What is the square root of 144?");
        q3.setOptionA("11");
        q3.setOptionB("12");
        q3.setOptionC("13");
        q3.setOptionD("14");
        q3.setCorrectAnswer("B");
        q3.setMarks(2);
        q3.setDifficultyLevel(com.examportal.entity.Question.DifficultyLevel.EASY);
        questionService.createQuestion(q3);
    }
    
    private void createScienceQuestions(com.examportal.entity.Exam exam) {
        // Question 1
        com.examportal.entity.Question q1 = new com.examportal.entity.Question();
        q1.setExam(exam);
        q1.setQuestionText("What is the chemical symbol for water?");
        q1.setOptionA("H2O");
        q1.setOptionB("CO2");
        q1.setOptionC("O2");
        q1.setOptionD("H2SO4");
        q1.setCorrectAnswer("A");
        q1.setMarks(2);
        q1.setDifficultyLevel(com.examportal.entity.Question.DifficultyLevel.EASY);
        questionService.createQuestion(q1);
        
        // Question 2
        com.examportal.entity.Question q2 = new com.examportal.entity.Question();
        q2.setExam(exam);
        q2.setQuestionText("Which planet is known as the Red Planet?");
        q2.setOptionA("Venus");
        q2.setOptionB("Mars");
        q2.setOptionC("Jupiter");
        q2.setOptionD("Saturn");
        q2.setCorrectAnswer("B");
        q2.setMarks(2);
        q2.setDifficultyLevel(com.examportal.entity.Question.DifficultyLevel.EASY);
        questionService.createQuestion(q2);
    }
    
    private void createEnglishQuestions(com.examportal.entity.Exam exam) {
        // Question 1
        com.examportal.entity.Question q1 = new com.examportal.entity.Question();
        q1.setExam(exam);
        q1.setQuestionText("Which of the following is a synonym for 'happy'?");
        q1.setOptionA("Sad");
        q1.setOptionB("Joyful");
        q1.setOptionC("Angry");
        q1.setOptionD("Tired");
        q1.setCorrectAnswer("B");
        q1.setMarks(2);
        q1.setDifficultyLevel(com.examportal.entity.Question.DifficultyLevel.EASY);
        questionService.createQuestion(q1);
        
        // Question 2
        com.examportal.entity.Question q2 = new com.examportal.entity.Question();
        q2.setExam(exam);
        q2.setQuestionText("What is the past tense of 'run'?");
        q2.setOptionA("Runned");
        q2.setOptionB("Run");
        q2.setOptionC("Ran");
        q2.setOptionD("Running");
        q2.setCorrectAnswer("C");
        q2.setMarks(2);
        q2.setDifficultyLevel(com.examportal.entity.Question.DifficultyLevel.MEDIUM);
        questionService.createQuestion(q2);
    }
    
    @Transactional
    private void createSampleExamSessions() {
        try {
            // Check if sample sessions already exist
            long existingSessions = examSessionRepository.count();
            if (existingSessions > 0) {
                System.out.println("Sample exam sessions already exist. Skipping creation.");
                return;
            }
            
            // Get existing students and exams
            List<Student> students = studentRepository.findAll();
            List<Exam> exams = examService.getAllActiveExams();
            
            if (students.isEmpty() || exams.isEmpty()) {
                System.out.println("No students or exams found. Cannot create sample sessions.");
                return;
            }
            
            // Create realistic exam sessions for different students
            if (exams.size() >= 3) {
                createRealisticExamSession(students.get(0), exams.get(0), 85); // High performer
                createRealisticExamSession(students.get(0), exams.get(1), 72); // Good performer
                createRealisticExamSession(students.get(0), exams.get(2), 45); // Average performer
                
                if (students.size() > 1) {
                    createRealisticExamSession(students.get(1), exams.get(0), 92); // Excellent performer
                    createRealisticExamSession(students.get(1), exams.get(1), 68); // Good performer
                }
            }
            
            System.out.println("Sample exam sessions created successfully!");
            
        } catch (Exception e) {
            System.err.println("Error creating sample exam sessions: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void createRealisticExamSession(Student student, Exam exam, int targetPercentage) {
        try {
            // Create exam session
            ExamSession session = new ExamSession();
            session.setStudent(student);
            session.setExam(exam);
            session.setStartTime(LocalDateTime.now().minusHours(2));
            session.setEndTime(LocalDateTime.now().minusHours(1));
            session.setStatus(ExamSession.Status.COMPLETED);
            
            // Get all questions for this exam
            List<Question> questions = questionRepository.findByExam_Id(exam.getId());
            
            if (questions.isEmpty()) {
                System.out.println("No questions found for exam: " + exam.getTitle());
                return;
            }
            
            // Calculate total marks and target marks
            int totalMarks = questions.stream().mapToInt(Question::getMarks).sum();
            int targetMarks = (int) Math.round((targetPercentage / 100.0) * totalMarks);
            
            // Save session first to get ID
            session = examSessionRepository.save(session);
            
            // Create student answers with realistic distribution
            Random random = new Random();
            int currentMarks = 0;
            
            for (Question question : questions) {
                StudentAnswer answer = new StudentAnswer();
                answer.setExamSession(session);
                answer.setQuestion(question);
                
                // Determine if this answer should be correct based on target percentage
                boolean shouldBeCorrect = currentMarks + question.getMarks() <= targetMarks;
                
                // Add some randomness to make it more realistic
                if (shouldBeCorrect && random.nextDouble() > 0.1) { // 90% chance to get it right if we need the marks
                    answer.setSelectedAnswer(question.getCorrectAnswer());
                    answer.setIsCorrect(true);
                    currentMarks += question.getMarks();
                } else if (!shouldBeCorrect && random.nextDouble() > 0.8) { // 20% chance to get it right even if we don't need the marks
                    answer.setSelectedAnswer(question.getCorrectAnswer());
                    answer.setIsCorrect(true);
                    currentMarks += question.getMarks();
                } else {
                    // Select a random wrong answer
                    String[] options = {"A", "B", "C", "D"};
                    String wrongAnswer;
                    do {
                        wrongAnswer = options[random.nextInt(4)];
                    } while (wrongAnswer.equals(question.getCorrectAnswer()));
                    
                    answer.setSelectedAnswer(wrongAnswer);
                    answer.setIsCorrect(false);
                }
                
                studentAnswerRepository.save(answer);
            }
            
            // Update session with obtained marks
            session.setObtainedMarks(currentMarks);
            examSessionRepository.save(session);
            
            System.out.println("Created exam session for " + student.getFullName() + 
                             " in " + exam.getTitle() + 
                             " with " + currentMarks + "/" + totalMarks + 
                             " (" + Math.round((double) currentMarks / totalMarks * 100) + "%)");
            
        } catch (Exception e) {
            System.err.println("Error creating realistic exam session: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

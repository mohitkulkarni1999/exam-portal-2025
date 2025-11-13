package com.examportal.controller;

import com.examportal.entity.Exam;
import com.examportal.entity.ExamCategory;
import com.examportal.entity.ExamSession;
import com.examportal.entity.Question;
import com.examportal.entity.Student;
import com.examportal.entity.StudentAnswer;
import com.examportal.repository.ExamRepository;
import com.examportal.repository.ExamSessionRepository;
import com.examportal.repository.StudentRepository;
import com.examportal.service.ExamService;
import com.examportal.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
public class AdminController {
    
    private final ExamService examService;
    private final StudentRepository studentRepository;
    private final QuestionService questionService;
    private final ExamSessionRepository examSessionRepository;
    private final ExamRepository examRepository;
    
    // Test endpoint to verify security bypass
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Admin endpoint is accessible!");
    }
    
    // Dashboard APIs
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get actual counts
        long totalExams = examService.getActiveExamCount();
        long totalStudents = studentRepository.countActiveStudents();
        long totalQuestions = questionService.countAllQuestions();
        
        // Calculate pass percentage from actual exam sessions
        long totalSessions = examSessionRepository.count();
        long passedSessions = examSessionRepository.countPassedSessions();
        double passPercentage = totalSessions > 0 ? (double) passedSessions / totalSessions * 100 : 0.0;
        
        stats.put("totalExams", totalExams);
        stats.put("totalStudents", totalStudents);
        stats.put("totalQuestions", totalQuestions);
        stats.put("passPercentage", Math.round(passPercentage * 10.0) / 10.0); // Round to 1 decimal place
        
        // Add some growth percentages (mock data for now)
        stats.put("examGrowth", 12.0);
        stats.put("studentGrowth", 5.0);
        stats.put("questionGrowth", 18.0);
        stats.put("passGrowth", 3.0);
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/dashboard/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity() {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        try {
            // Get recent exam sessions (completed exams)
            List<ExamSession> recentSessions = examSessionRepository.findTop5ByStatusOrderByEndTimeDesc(ExamSession.Status.COMPLETED);
            for (ExamSession session : recentSessions) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", "session_" + session.getId());
                activity.put("action", "completed exam: " + session.getExam().getTitle());
                activity.put("user", session.getStudent().getFullName());
                activity.put("time", formatTimeAgo(session.getEndTime()));
                activities.add(activity);
            }
            
            // Get recently created exams
            List<Exam> recentExams = examRepository.findTop3ByOrderByCreatedAtDesc();
            for (Exam exam : recentExams) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", "exam_" + exam.getId());
                activity.put("action", "created exam: " + exam.getTitle());
                activity.put("user", "Admin");
                activity.put("time", formatTimeAgo(exam.getCreatedAt()));
                activities.add(activity);
            }
            
            // Get recently registered students
            List<Student> recentStudents = studentRepository.findTop3ByOrderByCreatedAtDesc();
            for (Student student : recentStudents) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", "student_" + student.getId());
                activity.put("action", "registered as new student");
                activity.put("user", student.getFullName());
                activity.put("time", formatTimeAgo(student.getCreatedAt()));
                activities.add(activity);
            }
            
            // Sort all activities by time (most recent first)
            activities.sort((a, b) -> {
                // This is a simple sort - in a real app you'd want to sort by actual timestamps
                return 0; // For now, keep the order as added
            });
            
            // Limit to top 10 activities
            if (activities.size() > 10) {
                activities = activities.subList(0, 10);
            }
            
        } catch (Exception e) {
            // If there's any error, return empty list instead of mock data
            System.err.println("Error fetching recent activity: " + e.getMessage());
        }
        
        return ResponseEntity.ok(activities);
    }
    
    // Analytics APIs for Results & Analytics page
    @GetMapping("/analytics/overview")
    public ResponseEntity<Map<String, Object>> getAnalyticsOverview() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Total exams taken (completed sessions)
        long totalExamsTaken = examSessionRepository.countCompletedSessions();
        
        // Average score calculation
        List<ExamSession> completedSessions = examSessionRepository.findAll()
                .stream()
                .filter(session -> session.getStatus() == ExamSession.Status.COMPLETED)
                .toList();
        
        double averageScore = completedSessions.isEmpty() ? 0.0 : 
            completedSessions.stream()
                .mapToDouble(session -> {
                    if (session.getObtainedMarks() != null && session.getExam() != null) {
                        return (double) session.getObtainedMarks() / session.getExam().getTotalMarks() * 100;
                    }
                    return 0.0;
                })
                .average()
                .orElse(0.0);
        
        // Pass rate
        long passedSessions = examSessionRepository.countPassedSessions();
        double passRate = totalExamsTaken > 0 ? (double) passedSessions / totalExamsTaken * 100 : 0.0;
        
        // Active students (students who have taken at least one exam)
        long activeStudents = completedSessions.stream()
                .map(session -> session.getStudent().getId())
                .distinct()
                .count();
        
        analytics.put("totalExamsTaken", totalExamsTaken);
        analytics.put("averageScore", Math.round(averageScore * 10.0) / 10.0);
        analytics.put("passRate", Math.round(passRate * 10.0) / 10.0);
        analytics.put("activeStudents", activeStudents);
        
        // Growth percentages (mock data)
        analytics.put("examsTakenGrowth", 15.0);
        analytics.put("averageScoreGrowth", 2.3);
        analytics.put("passRateGrowth", 5.1);
        analytics.put("activeStudentsGrowth", 8.0);
        
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/analytics/exam-performance")
    public ResponseEntity<List<Map<String, Object>>> getExamPerformance() {
        List<Map<String, Object>> examPerformance = new ArrayList<>();
        
        List<Exam> activeExams = examService.getActiveExams(PageRequest.of(0, 100)).getContent();
        
        for (Exam exam : activeExams) {
            Map<String, Object> performance = new HashMap<>();
            
            List<ExamSession> examSessions = examSessionRepository.findCompletedSessionsByExamId(exam.getId());
            
            performance.put("examId", exam.getId());
            performance.put("examTitle", exam.getTitle());
            performance.put("totalAttempts", examSessions.size());
            
            if (!examSessions.isEmpty()) {
                double avgScore = examSessions.stream()
                    .mapToDouble(session -> session.getObtainedMarks() != null ? 
                        (double) session.getObtainedMarks() / exam.getTotalMarks() * 100 : 0.0)
                    .average()
                    .orElse(0.0);
                
                long passed = examSessions.stream()
                    .filter(session -> session.getObtainedMarks() != null && 
                        session.getObtainedMarks() >= exam.getPassingMarks())
                    .count();
                
                performance.put("averageScore", Math.round(avgScore * 10.0) / 10.0);
                performance.put("passRate", examSessions.size() > 0 ? 
                    Math.round((double) passed / examSessions.size() * 100 * 10.0) / 10.0 : 0.0);
            } else {
                performance.put("averageScore", 0.0);
                performance.put("passRate", 0.0);
            }
            
            examPerformance.add(performance);
        }
        
        return ResponseEntity.ok(examPerformance);
    }
    
    // Exam Category Management
    @GetMapping("/exam-categories")
    public ResponseEntity<List<ExamCategory>> getExamCategories() {
        return ResponseEntity.ok(examService.getAllCategories());
    }
    
    @PostMapping("/exam-categories")
    public ResponseEntity<ExamCategory> createExamCategory(@Valid @RequestBody ExamCategory category) {
        ExamCategory createdCategory = examService.createCategory(category);
        return ResponseEntity.ok(createdCategory);
    }
    
    @PutMapping("/exam-categories/{id}")
    public ResponseEntity<ExamCategory> updateExamCategory(@PathVariable("id") Long id, 
                                                          @Valid @RequestBody ExamCategory category) {
        ExamCategory updatedCategory = examService.updateCategory(id, category);
        return ResponseEntity.ok(updatedCategory);
    }
    
    @DeleteMapping("/exam-categories/{id}")
    public ResponseEntity<String> deleteExamCategory(@PathVariable("id") Long id) {
        examService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
    
    // Exam Management
    @GetMapping("/exams")
    public ResponseEntity<Page<Exam>> getExams(@RequestParam(value = "page", defaultValue = "0") int page,
                                              @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(examService.getActiveExams(pageable));
    }
    
    @PostMapping("/exams")
    public ResponseEntity<Exam> createExam(@RequestBody Map<String, Object> examData) {
        try {
            // Extract exam category ID
            Object categoryIdObj = examData.get("categoryId");
            if (categoryIdObj == null) {
                return ResponseEntity.badRequest().body(null);
            }
            
            Long categoryId = Long.valueOf(categoryIdObj.toString());
            
            // Create exam object
            Exam exam = new Exam();
            exam.setTitle((String) examData.get("title"));
            exam.setDescription((String) examData.get("description"));
            exam.setDurationMinutes(Integer.valueOf(examData.get("durationMinutes").toString()));
            exam.setTotalMarks(Integer.valueOf(examData.get("totalMarks").toString()));
            exam.setPassingMarks(Integer.valueOf(examData.get("passingMarks").toString()));
            exam.setInstructions((String) examData.get("instructions"));
            exam.setIsActive(Boolean.valueOf(examData.get("isActive").toString()));
            
            // Set exam category
            ExamCategory category = examService.getAllCategories().stream()
                    .filter(c -> c.getId().equals(categoryId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            exam.setExamCategory(category);
            
            Exam createdExam = examService.createExam(exam);
            return ResponseEntity.ok(createdExam);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/exams/{id}")
    public ResponseEntity<Exam> updateExam(@PathVariable("id") Long id, @Valid @RequestBody Exam exam) {
        Exam updatedExam = examService.updateExam(id, exam);
        return ResponseEntity.ok(updatedExam);
    }
    
    @DeleteMapping("/exams/{id}")
    public ResponseEntity<String> deleteExam(@PathVariable("id") Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok("Exam deleted successfully");
    }
    
    // Question Management
    @GetMapping("/questions/exam/{examId}")
    public ResponseEntity<List<Question>> getExamQuestions(@PathVariable("examId") Long examId) {
        List<Question> questions = questionService.getQuestionsByExamId(examId);
        return ResponseEntity.ok(questions);
    }
    
    @PostMapping("/questions")
    public ResponseEntity<Question> addQuestion(@Valid @RequestBody Question question) {
        Question savedQuestion = questionService.createQuestion(question);
        return ResponseEntity.ok(savedQuestion);
    }
    
    @PostMapping("/questions/bulk")
    public ResponseEntity<Map<String, Object>> bulkUploadQuestions(@RequestParam("file") MultipartFile file,
                                                                  @RequestParam("examId") Long examId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
            }
            
            // Validate file type
            String filename = file.getOriginalFilename();
            if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please upload an Excel file (.xlsx or .xls)"));
            }
            
            // Get exam to validate it exists
            Exam exam = examService.getExamById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            
            // Process Excel file
            List<Question> questions = processExcelFile(file, exam);
            
            // Save all questions
            List<Question> savedQuestions = new ArrayList<>();
            for (Question question : questions) {
                savedQuestions.add(questionService.createQuestion(question));
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully uploaded " + savedQuestions.size() + " questions");
            response.put("questionsAdded", savedQuestions.size());
            response.put("examTitle", exam.getTitle());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error processing file: " + e.getMessage()));
        }
    }
    
    @GetMapping("/questions/template")
    public ResponseEntity<byte[]> downloadQuestionTemplate() {
        try {
            // Create workbook and sheet
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Questions Template");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Question Text", "Option A", "Option B", "Option C", "Option D", 
                "Correct Answer", "Marks", "Difficulty Level"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                
                // Style header cells
                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);
                cell.setCellStyle(headerStyle);
            }
            
            // Add sample data row
            Row sampleRow = sheet.createRow(1);
            String[] sampleData = {
                "What is 2 + 2?", "3", "4", "5", "6", 
                "B", "2", "EASY"
            };
            
            for (int i = 0; i < sampleData.length; i++) {
                Cell cell = sampleRow.createCell(i);
                cell.setCellValue(sampleData[i]);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Convert to byte array
            java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();
            
            byte[] excelBytes = outputStream.toByteArray();
            
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=questions_template.xlsx")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelBytes);
                    
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/questions/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable("id") Long id, 
                                                  @Valid @RequestBody Question question) {
        Question updatedQuestion = questionService.updateQuestion(id, question);
        return ResponseEntity.ok(updatedQuestion);
    }
    
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<String> deleteQuestion(@PathVariable("id") Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok("Question deleted successfully");
    }
    
    // Student Management
    @GetMapping("/students")
    public ResponseEntity<Map<String, Object>> getStudents(@RequestParam(value = "page", defaultValue = "0") int page,
                                                          @RequestParam(value = "size", defaultValue = "10") int size,
                                                          @RequestParam(value = "status", required = false) String status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Student> students;
        
        if (status != null && !status.isEmpty() && !status.equals("All Status")) {
            students = studentRepository.findByStatus(Student.Status.valueOf(status.toUpperCase()), pageable);
        } else {
            students = studentRepository.findAll(pageable);
        }
        
        // Get student statistics
        long totalStudents = studentRepository.count();
        long activeStudents = studentRepository.countActiveStudents();
        long pendingStudents = studentRepository.countByStatus(Student.Status.ACTIVE); // Assuming ACTIVE means pending approval
        long inactiveStudents = studentRepository.countByStatus(Student.Status.INACTIVE);
        
        Map<String, Object> response = new HashMap<>();
        response.put("students", students.getContent());
        response.put("totalElements", students.getTotalElements());
        response.put("totalPages", students.getTotalPages());
        response.put("currentPage", students.getNumber());
        response.put("statistics", Map.of(
            "totalStudents", totalStudents,
            "activeStudents", activeStudents,
            "pendingStudents", pendingStudents,
            "inactiveStudents", inactiveStudents
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/students/{id}/status")
    public ResponseEntity<String> updateStudentStatus(@PathVariable("id") Long id, 
                                                     @RequestBody Map<String, String> request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        String status = request.get("status");
        student.setStatus(Student.Status.valueOf(status));
        studentRepository.save(student);
        
        return ResponseEntity.ok("Student status updated successfully");
    }
    
    // Results Management for Admin
    @GetMapping("/results")
    public ResponseEntity<Map<String, Object>> getAllResults(@RequestParam(value = "page", defaultValue = "0") int page,
                                                           @RequestParam(value = "size", defaultValue = "10") int size,
                                                           @RequestParam(value = "examId", required = false) Long examId,
                                                           @RequestParam(value = "studentId", required = false) Long studentId) {
        Pageable pageable = PageRequest.of(page, size);
        List<ExamSession> results;
        
        if (examId != null && studentId != null) {
            // Filter by both exam and student
            results = examSessionRepository.findAll().stream()
                .filter(session -> session.getExam().getId().equals(examId) && 
                                 session.getStudent().getId().equals(studentId) &&
                                 session.getStatus() == ExamSession.Status.COMPLETED)
                .toList();
        } else if (examId != null) {
            // Filter by exam only
            results = examSessionRepository.findCompletedSessionsByExamId(examId);
        } else if (studentId != null) {
            // Filter by student only
            results = examSessionRepository.findByStudentIdAndStatus(studentId, ExamSession.Status.COMPLETED);
        } else {
            // Get all completed results
            results = examSessionRepository.findAll().stream()
                .filter(session -> session.getStatus() == ExamSession.Status.COMPLETED)
                .toList();
        }
        
        // Convert to response format
        List<Map<String, Object>> resultData = results.stream().map(session -> {
            Map<String, Object> result = new HashMap<>();
            result.put("id", session.getId());
            result.put("studentName", session.getStudent().getFullName());
            result.put("studentEmail", session.getStudent().getEmail());
            result.put("examTitle", session.getExam().getTitle());
            result.put("obtainedMarks", session.getObtainedMarks());
            result.put("totalMarks", session.getExam().getTotalMarks());
            result.put("passingMarks", session.getExam().getPassingMarks());
            result.put("percentage", session.getObtainedMarks() != null ? 
                Math.round((double) session.getObtainedMarks() / session.getExam().getTotalMarks() * 100 * 10.0) / 10.0 : 0.0);
            result.put("status", session.getObtainedMarks() != null && session.getObtainedMarks() >= session.getExam().getPassingMarks() ? "PASSED" : "FAILED");
            result.put("completedAt", session.getEndTime());
            result.put("duration", session.getExam().getDurationMinutes());
            return result;
        }).toList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("results", resultData);
        response.put("totalElements", resultData.size());
        response.put("totalPages", (int) Math.ceil((double) resultData.size() / size));
        response.put("currentPage", page);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/results/{sessionId}/details")
    public ResponseEntity<Map<String, Object>> getResultDetails(@PathVariable("sessionId") Long sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Result not found"));
            
        if (session.getStatus() != ExamSession.Status.COMPLETED) {
            throw new RuntimeException("Exam not completed yet");
        }
        
        // Get all answers for this session
        List<StudentAnswer> answers = examSessionRepository.findById(sessionId)
            .map(s -> s.getStudentAnswers())
            .orElse(List.of());
        
        // Get all questions for this exam
        List<Question> questions = questionService.getQuestionsByExamId(session.getExam().getId());
        
        Map<String, Object> result = new HashMap<>();
        result.put("sessionId", session.getId());
        result.put("studentName", session.getStudent().getFullName());
        result.put("studentEmail", session.getStudent().getEmail());
        result.put("examTitle", session.getExam().getTitle());
        result.put("obtainedMarks", session.getObtainedMarks());
        result.put("totalMarks", session.getExam().getTotalMarks());
        result.put("passingMarks", session.getExam().getPassingMarks());
        result.put("percentage", session.getObtainedMarks() != null ? 
            Math.round((double) session.getObtainedMarks() / session.getExam().getTotalMarks() * 100 * 10.0) / 10.0 : 0.0);
        result.put("status", session.getObtainedMarks() != null && session.getObtainedMarks() >= session.getExam().getPassingMarks() ? "PASSED" : "FAILED");
        result.put("startTime", session.getStartTime());
        result.put("endTime", session.getEndTime());
        result.put("duration", session.getExam().getDurationMinutes());
        
        // Add question-wise analysis
        List<Map<String, Object>> questionAnalysis = new ArrayList<>();
        for (Question question : questions) {
            Map<String, Object> qAnalysis = new HashMap<>();
            qAnalysis.put("questionId", question.getId());
            qAnalysis.put("questionText", question.getQuestionText());
            qAnalysis.put("correctAnswer", question.getCorrectAnswer());
            qAnalysis.put("marks", question.getMarks());
            
            // Find student's answer for this question
            StudentAnswer studentAnswer = answers.stream()
                .filter(ans -> ans.getQuestion().getId().equals(question.getId()))
                .findFirst()
                .orElse(null);
                
            if (studentAnswer != null) {
                qAnalysis.put("selectedAnswer", studentAnswer.getSelectedAnswer());
                qAnalysis.put("isCorrect", studentAnswer.getIsCorrect());
                qAnalysis.put("marksObtained", studentAnswer.getIsCorrect() ? question.getMarks() : 0);
            } else {
                qAnalysis.put("selectedAnswer", null);
                qAnalysis.put("isCorrect", false);
                qAnalysis.put("marksObtained", 0);
            }
            
            questionAnalysis.add(qAnalysis);
        }
        
        result.put("questionAnalysis", questionAnalysis);
        
        return ResponseEntity.ok(result);
    }
    
    // Results and Analytics
    @GetMapping("/results/statistics")
    public ResponseEntity<Map<String, Object>> getResultStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get real statistics from database
        long totalExamsTaken = examSessionRepository.countCompletedSessions();
        
        // Calculate average score from all completed sessions
        List<ExamSession> completedSessions = examSessionRepository.findAll()
                .stream()
                .filter(session -> session.getStatus() == ExamSession.Status.COMPLETED)
                .toList();
        
        double averageScore = completedSessions.isEmpty() ? 0.0 : 
            completedSessions.stream()
                .mapToDouble(session -> {
                    if (session.getObtainedMarks() != null && session.getExam() != null) {
                        return (double) session.getObtainedMarks() / session.getExam().getTotalMarks() * 100;
                    }
                    return 0.0;
                })
                .average()
                .orElse(0.0);
        
        // Calculate pass rate
        long passedSessions = examSessionRepository.countPassedSessions();
        double passRate = totalExamsTaken > 0 ? (double) passedSessions / totalExamsTaken * 100 : 0.0;
        
        // Get top performers (students with highest average scores)
        List<Map<String, Object>> topPerformers = completedSessions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                session -> session.getStudent().getFullName(),
                java.util.stream.Collectors.averagingDouble(session -> 
                    session.getObtainedMarks() != null && session.getExam() != null ? 
                        (double) session.getObtainedMarks() / session.getExam().getTotalMarks() * 100 : 0.0
                )
            ))
            .entrySet().stream()
            .sorted(java.util.Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(5)
            .map(entry -> {
                Map<String, Object> performer = new HashMap<>();
                performer.put("name", entry.getKey());
                performer.put("averageScore", Math.round(entry.getValue() * 10.0) / 10.0);
                return performer;
            })
            .toList();
        
        // Active students count
        long activeStudents = completedSessions.stream()
                .map(session -> session.getStudent().getId())
                .distinct()
                .count();
        
        stats.put("totalExamsTaken", totalExamsTaken);
        stats.put("averageScore", Math.round(averageScore * 10.0) / 10.0);
        stats.put("passRate", Math.round(passRate * 10.0) / 10.0);
        stats.put("activeStudents", activeStudents);
        stats.put("topPerformers", topPerformers.isEmpty() ? List.of(Map.of("name", "No data available", "averageScore", 0.0)) : topPerformers);
        
        // Add growth percentages (mock data for now - would need historical data for real calculation)
        stats.put("examsTakenGrowth", 15.0);
        stats.put("averageScoreGrowth", 2.3);
        stats.put("passRateGrowth", 5.1);
        stats.put("activeStudentsGrowth", 8.0);
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/results/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentResults(@RequestParam(value = "limit", defaultValue = "10") int limit) {
        // Get recent completed exam sessions
        List<ExamSession> recentSessions = examSessionRepository.findAll()
                .stream()
                .filter(session -> session.getStatus() == ExamSession.Status.COMPLETED)
                .sorted((s1, s2) -> s2.getEndTime().compareTo(s1.getEndTime())) // Sort by end time descending
                .limit(limit)
                .toList();
        
        List<Map<String, Object>> recentResults = recentSessions.stream()
                .map(session -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", session.getId());
                    result.put("studentName", session.getStudent().getFullName());
                    result.put("examTitle", session.getExam().getTitle());
                    result.put("obtainedMarks", session.getObtainedMarks());
                    result.put("totalMarks", session.getExam().getTotalMarks());
                    result.put("score", session.getObtainedMarks() + "/" + session.getExam().getTotalMarks());
                    result.put("percentage", session.getObtainedMarks() != null ? 
                        Math.round((double) session.getObtainedMarks() / session.getExam().getTotalMarks() * 100 * 10.0) / 10.0 : 0.0);
                    result.put("status", session.getObtainedMarks() != null && session.getObtainedMarks() >= session.getExam().getPassingMarks() ? "Passed" : "Failed");
                    result.put("completedAt", session.getEndTime());
                    result.put("timeAgo", calculateTimeAgo(session.getEndTime()));
                    return result;
                })
                .toList();
        
        return ResponseEntity.ok(recentResults);
    }
    
    private String calculateTimeAgo(java.time.LocalDateTime dateTime) {
        if (dateTime == null) return "Unknown";
        
        java.time.Duration duration = java.time.Duration.between(dateTime, java.time.LocalDateTime.now());
        long hours = duration.toHours();
        long minutes = duration.toMinutes();
        long days = duration.toDays();
        
        if (days > 0) {
            return days + " day" + (days > 1 ? "s" : "") + " ago";
        } else if (hours > 0) {
            return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        } else if (minutes > 0) {
            return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
        } else {
            return "Just now";
        }
    }
    
    // Exam-wise Results - Get all students' results for each exam
    @GetMapping("/results/exam-wise")
    public ResponseEntity<List<Map<String, Object>>> getExamWiseResults() {
        // Get all active exams
        List<Exam> activeExams = examService.getAllActiveExams();
        
        List<Map<String, Object>> examWiseResults = new ArrayList<>();
        
        for (Exam exam : activeExams) {
            Map<String, Object> examResult = new HashMap<>();
            examResult.put("examId", exam.getId());
            examResult.put("examTitle", exam.getTitle());
            examResult.put("examCategory", exam.getExamCategory().getName());
            examResult.put("totalMarks", exam.getTotalMarks());
            examResult.put("passingMarks", exam.getPassingMarks());
            examResult.put("duration", exam.getDurationMinutes());
            
            // Get all completed sessions for this exam
            List<ExamSession> completedSessions = examSessionRepository.findCompletedSessionsByExamId(exam.getId());
            
            // Convert sessions to student results
            List<Map<String, Object>> studentResults = completedSessions.stream().map(session -> {
                Map<String, Object> studentResult = new HashMap<>();
                studentResult.put("sessionId", session.getId());
                studentResult.put("studentId", session.getStudent().getId());
                studentResult.put("studentName", session.getStudent().getFullName());
                studentResult.put("studentEmail", session.getStudent().getEmail());
                studentResult.put("obtainedMarks", session.getObtainedMarks());
                studentResult.put("percentage", session.getObtainedMarks() != null ? 
                    Math.round((double) session.getObtainedMarks() / exam.getTotalMarks() * 100 * 10.0) / 10.0 : 0.0);
                studentResult.put("status", session.getObtainedMarks() != null && session.getObtainedMarks() >= exam.getPassingMarks() ? "PASSED" : "FAILED");
                studentResult.put("completedAt", session.getEndTime());
                return studentResult;
            }).toList();
            
            examResult.put("studentResults", studentResults);
            examResult.put("totalStudents", studentResults.size());
            
            // Calculate exam statistics
            if (!studentResults.isEmpty()) {
                double avgPercentage = studentResults.stream()
                    .mapToDouble(r -> (Double) r.get("percentage"))
                    .average()
                    .orElse(0.0);
                long passedCount = studentResults.stream()
                    .filter(r -> "PASSED".equals(r.get("status")))
                    .count();
                
                examResult.put("averagePercentage", Math.round(avgPercentage * 10.0) / 10.0);
                examResult.put("passedStudents", passedCount);
                examResult.put("failedStudents", studentResults.size() - passedCount);
                examResult.put("passRate", Math.round((double) passedCount / studentResults.size() * 100 * 10.0) / 10.0);
            } else {
                examResult.put("averagePercentage", 0.0);
                examResult.put("passedStudents", 0);
                examResult.put("failedStudents", 0);
                examResult.put("passRate", 0.0);
            }
            
            examWiseResults.add(examResult);
        }
        
        return ResponseEntity.ok(examWiseResults);
    }
    
    // Get results for a specific exam
    @GetMapping("/results/exam/{examId}")
    public ResponseEntity<Map<String, Object>> getExamResultsById(@PathVariable("examId") Long examId) {
        // Get exam details
        Exam exam = examService.getExamById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        
        Map<String, Object> examResult = new HashMap<>();
        examResult.put("examId", exam.getId());
        examResult.put("examTitle", exam.getTitle());
        examResult.put("examCategory", exam.getExamCategory().getName());
        examResult.put("totalMarks", exam.getTotalMarks());
        examResult.put("passingMarks", exam.getPassingMarks());
        examResult.put("duration", exam.getDurationMinutes());
        
        // Get all completed sessions for this exam
        List<ExamSession> completedSessions = examSessionRepository.findCompletedSessionsByExamId(examId);
        
        // Convert sessions to student results
        List<Map<String, Object>> studentResults = completedSessions.stream().map(session -> {
            Map<String, Object> studentResult = new HashMap<>();
            studentResult.put("sessionId", session.getId());
            studentResult.put("studentId", session.getStudent().getId());
            studentResult.put("studentName", session.getStudent().getFullName());
            studentResult.put("studentEmail", session.getStudent().getEmail());
            studentResult.put("obtainedMarks", session.getObtainedMarks());
            studentResult.put("percentage", session.getObtainedMarks() != null ? 
                Math.round((double) session.getObtainedMarks() / exam.getTotalMarks() * 100 * 10.0) / 10.0 : 0.0);
            studentResult.put("status", session.getObtainedMarks() != null && session.getObtainedMarks() >= exam.getPassingMarks() ? "PASSED" : "FAILED");
            studentResult.put("completedAt", session.getEndTime());
            return studentResult;
        }).toList();
        
        examResult.put("studentResults", studentResults);
        examResult.put("totalStudents", studentResults.size());
        
        // Calculate exam statistics
        if (!studentResults.isEmpty()) {
            double avgPercentage = studentResults.stream()
                .mapToDouble(r -> (Double) r.get("percentage"))
                .average()
                .orElse(0.0);
            long passedCount = studentResults.stream()
                .filter(r -> "PASSED".equals(r.get("status")))
                .count();
            
            examResult.put("averagePercentage", Math.round(avgPercentage * 10.0) / 10.0);
            examResult.put("passedStudents", passedCount);
            examResult.put("failedStudents", studentResults.size() - passedCount);
            examResult.put("passRate", Math.round((double) passedCount / studentResults.size() * 100 * 10.0) / 10.0);
        } else {
            examResult.put("averagePercentage", 0.0);
            examResult.put("passedStudents", 0);
            examResult.put("failedStudents", 0);
            examResult.put("passRate", 0.0);
        }
        
        return ResponseEntity.ok(examResult);
    }
    
    // Helper method to process Excel file and extract questions
    private List<Question> processExcelFile(MultipartFile file, Exam exam) throws IOException {
        List<Question> questions = new ArrayList<>();
        
        Workbook workbook = null;
        try {
            // Determine file type and create appropriate workbook
            String filename = file.getOriginalFilename();
            if (filename != null && filename.endsWith(".xlsx")) {
                workbook = new XSSFWorkbook(file.getInputStream());
            } else {
                workbook = new HSSFWorkbook(file.getInputStream());
            }
            
            Sheet sheet = workbook.getSheetAt(0); // Get first sheet
            
            // Skip header row (row 0) and start from row 1
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                // Extract data from each column
                String questionText = getCellValueAsString(row.getCell(0));
                String optionA = getCellValueAsString(row.getCell(1));
                String optionB = getCellValueAsString(row.getCell(2));
                String optionC = getCellValueAsString(row.getCell(3));
                String optionD = getCellValueAsString(row.getCell(4));
                String correctAnswer = getCellValueAsString(row.getCell(5));
                String marksStr = getCellValueAsString(row.getCell(6));
                String difficultyStr = getCellValueAsString(row.getCell(7));
                
                // Validate required fields
                if (questionText.trim().isEmpty() || optionA.trim().isEmpty() || 
                    optionB.trim().isEmpty() || optionC.trim().isEmpty() || 
                    optionD.trim().isEmpty() || correctAnswer.trim().isEmpty()) {
                    throw new RuntimeException("Row " + (i + 1) + ": All fields are required");
                }
                
                // Validate correct answer
                correctAnswer = correctAnswer.toUpperCase().trim();
                if (!correctAnswer.matches("[ABCD]")) {
                    throw new RuntimeException("Row " + (i + 1) + ": Correct answer must be A, B, C, or D");
                }
                
                // Parse marks
                int marks;
                try {
                    marks = Integer.parseInt(marksStr.trim());
                    if (marks <= 0) {
                        throw new RuntimeException("Row " + (i + 1) + ": Marks must be a positive number");
                    }
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Row " + (i + 1) + ": Invalid marks value");
                }
                
                // Parse difficulty level
                Question.DifficultyLevel difficulty;
                try {
                    difficulty = Question.DifficultyLevel.valueOf(difficultyStr.toUpperCase().trim());
                } catch (IllegalArgumentException e) {
                    // Default to MEDIUM if invalid
                    difficulty = Question.DifficultyLevel.MEDIUM;
                }
                
                // Create question object
                Question question = new Question();
                question.setExam(exam);
                question.setQuestionText(questionText.trim());
                question.setOptionA(optionA.trim());
                question.setOptionB(optionB.trim());
                question.setOptionC(optionC.trim());
                question.setOptionD(optionD.trim());
                question.setCorrectAnswer(correctAnswer);
                question.setMarks(marks);
                question.setDifficultyLevel(difficulty);
                
                questions.add(question);
            }
            
        } finally {
            if (workbook != null) {
                workbook.close();
            }
        }
        
        if (questions.isEmpty()) {
            throw new RuntimeException("No valid questions found in the Excel file");
        }
        
        return questions;
    }
    
    // Helper method to safely get cell value as string
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf((int) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
    
    // Helper method to format time ago
    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "Unknown";
        }
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();
        
        if (minutes < 1) {
            return "Just now";
        } else if (minutes < 60) {
            return minutes + " minute" + (minutes == 1 ? "" : "s") + " ago";
        } else if (minutes < 1440) { // 24 hours
            long hours = minutes / 60;
            return hours + " hour" + (hours == 1 ? "" : "s") + " ago";
        } else {
            long days = minutes / 1440;
            return days + " day" + (days == 1 ? "" : "s") + " ago";
        }
    }
}

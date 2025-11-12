import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Clock, Flag, CheckCircle, Circle, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import { studentAPI, adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import '../../styles/examSecurity.css';

const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examSession, setExamSession] = useState(null);

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => studentAPI.getExam(examId),
  });

  // Fetch questions for this exam
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['examQuestions', examId],
    queryFn: () => studentAPI.getExamQuestions(examId),
    enabled: examStarted,
  });

  // Start exam mutation
  const startExamMutation = useMutation({
    mutationFn: () => studentAPI.startExam(examId),
    onSuccess: (session) => {
      setExamSession(session);
      setExamStarted(true);
      setTimeRemaining(exam.durationMinutes * 60); // Convert to seconds
      toast.success('Exam started successfully!');
    },
    onError: () => {
      toast.error('Failed to start exam');
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: ({ questionId, selectedAnswer }) => 
      studentAPI.submitAnswer(examSession.id, { questionId, selectedAnswer }),
  });

  // Submit exam mutation
  const submitExamMutation = useMutation({
    mutationFn: () => studentAPI.submitExam(examSession.id),
    onSuccess: () => {
      toast.success('Exam submitted successfully!');
      navigate('/student/dashboard');
    },
    onError: () => {
      toast.error('Failed to submit exam');
    },
  });

  // Timer effect
  useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining]);

  // Copy protection and security measures
  useEffect(() => {
    if (examStarted) {
      // Disable right-click context menu
      const handleContextMenu = (e) => {
        e.preventDefault();
        return false;
      };

      // Disable text selection
      const handleSelectStart = (e) => {
        e.preventDefault();
        return false;
      };

      // Disable copy, cut, paste, print shortcuts
      const handleKeyDown = (e) => {
        // Disable Ctrl+C, Ctrl+A, Ctrl+V, Ctrl+X, Ctrl+P, Ctrl+S, F12, Ctrl+Shift+I, Ctrl+U
        if (
          (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
          (e.ctrlKey && (e.key === 'a' || e.key === 'A')) ||
          (e.ctrlKey && (e.key === 'v' || e.key === 'V')) ||
          (e.ctrlKey && (e.key === 'x' || e.key === 'X')) ||
          (e.ctrlKey && (e.key === 'p' || e.key === 'P')) ||
          (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
          (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c'))
        ) {
          e.preventDefault();
          toast.error('This action is not allowed during the exam!');
          return false;
        }
      };

      // Disable drag and drop
      const handleDragStart = (e) => {
        e.preventDefault();
        return false;
      };

      // Add event listeners
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('selectstart', handleSelectStart);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('dragstart', handleDragStart);

      // Cleanup
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('selectstart', handleSelectStart);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('dragstart', handleDragStart);
      };
    }
  }, [examStarted]);

  // Tab/Window focus detection
  useEffect(() => {
    if (examStarted) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          toast.warning('Warning: Tab switching detected! Stay focused on the exam.');
        }
      };

      const handleBlur = () => {
        toast.warning('Warning: Window lost focus! Please stay on the exam page.');
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
      };
    }
  }, [examStarted]);

  const handleStartExam = () => {
    startExamMutation.mutate();
  };

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
    
    // Auto-save answer to backend
    if (examSession) {
      submitAnswerMutation.mutate({ questionId, selectedAnswer });
    }
  };

  const handleSubmitExam = () => {
    if (window.confirm('Are you sure you want to submit the exam? This action cannot be undone.')) {
      submitExamMutation.mutate();
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  if (examLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <div className="text-xl font-semibold text-gray-900 mb-2">Exam Not Found</div>
          <button onClick={() => navigate('/student/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pre-exam screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title}</h1>
            <p className="text-gray-600">{exam.categoryName}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{exam.durationMinutes}</div>
              <div className="text-sm text-blue-700">Minutes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Flag className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{exam.totalMarks}</div>
              <div className="text-sm text-green-700">Total Marks</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">{exam.instructions}</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Read all questions carefully before answering</li>
                <li>• You can navigate between questions using the navigation buttons</li>
                <li>• Your answers are automatically saved</li>
                <li>• Make sure to submit the exam before time runs out</li>
                <li>• Passing marks: {exam.passingMarks}</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExam}
              disabled={startExamMutation.isLoading}
              className="btn-primary"
            >
              {startExamMutation.isLoading ? 'Starting...' : 'Start Exam'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading questions
  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <div className="mt-4 text-gray-600">Loading exam questions...</div>
        </div>
      </div>
    );
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <div className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</div>
          <div className="text-gray-600 mb-4">This exam doesn't have any questions yet.</div>
          <button onClick={() => navigate('/student/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gray-50 ${examStarted ? 'exam-secure no-select no-drag no-context-menu' : ''}`}
      style={{
        userSelect: examStarted ? 'none' : 'auto',
        WebkitUserSelect: examStarted ? 'none' : 'auto',
        MozUserSelect: examStarted ? 'none' : 'auto',
        msUserSelect: examStarted ? 'none' : 'auto',
        WebkitTouchCallout: examStarted ? 'none' : 'auto',
        WebkitTapHighlightColor: examStarted ? 'transparent' : 'auto'
      }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{exam.title}</h1>
              <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Time Remaining</div>
                <div className={`text-lg font-mono font-bold ${
                  timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-lg font-bold text-gray-900">
                  {answeredCount}/{totalQuestions}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-8">
              {currentQuestion && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Question {currentQuestionIndex + 1}
                      </h2>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {currentQuestion.marks} marks
                      </span>
                    </div>
                    <div 
                      className="text-gray-800 text-lg leading-relaxed question-text no-select no-highlight no-cursor"
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        WebkitTouchCallout: 'none'
                      }}
                      onDragStart={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {currentQuestion.questionText}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestion.id] === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          answers[currentQuestion.id] === option
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[currentQuestion.id] === option && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="font-medium text-gray-700 mr-3">{option})</span>
                        <span 
                          className="text-gray-800 option-text no-select no-highlight"
                          style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            WebkitTouchCallout: 'none'
                          }}
                          onDragStart={(e) => e.preventDefault()}
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          {currentQuestion[`option${option}`]}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t">
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="btn-secondary flex items-center disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </button>
                    
                    {currentQuestionIndex === totalQuestions - 1 ? (
                      <button
                        onClick={handleSubmitExam}
                        disabled={submitExamMutation.isLoading}
                        className="btn-primary bg-green-600 hover:bg-green-700"
                      >
                        {submitExamMutation.isLoading ? 'Submitting...' : 'Submit Exam'}
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                        className="btn-primary flex items-center"
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[question.id]
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                  <span className="text-gray-600">Not answered</span>
                </div>
              </div>

              <button
                onClick={handleSubmitExam}
                disabled={submitExamMutation.isLoading}
                className="w-full mt-6 btn-primary bg-green-600 hover:bg-green-700"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;

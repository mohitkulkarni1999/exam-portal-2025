import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Calendar,
  User,
  LogOut,
  Play
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  // Fetch available exams from backend
  const { data: availableExamsData, isLoading: examsLoading, error: examsError } = useQuery({
    queryKey: ['availableExams'],
    queryFn: studentAPI.getAvailableExams,
  });

  // Ensure availableExams is always an array
  const availableExams = Array.isArray(availableExamsData) ? availableExamsData : [];

  // Fetch student dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: studentAPI.getDashboard,
  });

  // Fetch student results
  const { data: studentResults = [], isLoading: resultsLoading, error: resultsError } = useQuery({
    queryKey: ['studentResults'],
    queryFn: studentAPI.getResults,
  });

  // Use real results data from API - ensure it's always an array
  const previousResults = Array.isArray(studentResults) ? studentResults : [];

  // Debug logging
  console.log('StudentDashboard - availableExamsData:', availableExamsData);
  console.log('StudentDashboard - availableExams:', availableExams);
  console.log('StudentDashboard - isArray:', Array.isArray(availableExams));
  console.log('StudentDashboard - studentResults:', studentResults);
  console.log('StudentDashboard - previousResults:', previousResults);
  console.log('StudentDashboard - previousResults isArray:', Array.isArray(previousResults));

  // Loading state
  if (examsLoading || dashboardLoading || resultsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (examsError || dashboardError || resultsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading dashboard data</div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Available Exams',
      value: availableExams.length,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Completed Exams',
      value: previousResults.length,
      icon: Award,
      color: 'bg-green-500',
    },
    {
      title: 'Average Score',
      value: '78.5%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Study Time',
      value: '45h',
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">ExamPortal</div>
              <span className="ml-4 text-gray-600">Student Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Ready to take your next exam? Check out the available exams below.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Exams */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Available Exams</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {availableExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {exam.title}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {exam.durationMinutes} minutes
                            </div>
                            <div className="flex items-center">
                              <Award className="w-4 h-4 mr-1" />
                              {exam.totalMarks} marks
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {exam.categoryName || 'No Category'}
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              Pass: {exam.passingMarks} marks
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {exam.instructions}
                          </p>
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/student/exam/${exam.id}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Exam
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {availableExams.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <div className="text-lg font-medium mb-2">No Exams Available</div>
                      <div className="text-sm">Check back later for new exams from your instructors.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Previous Results */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Previous Results</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {previousResults.map((result) => (
                    <div
                      key={result.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {result.examTitle}
                          </h3>
                          <p className="text-sm text-gray-600">{result.examCategory}</p>
                        </div>
                        <span
                          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            result.status === 'PASSED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {result.status}
                        </span>
                      </div>
                      
                      {/* Score Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Score</span>
                          <span className="text-sm font-bold text-gray-900">
                            {result.obtainedMarks}/{result.totalMarks} ({result.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              result.percentage >= 60 ? 'bg-green-500' : 
                              result.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(result.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Passing Marks:</span>
                          <span className="font-medium ml-2">{result.passingMarks}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium ml-2">{result.duration} mins</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Completed:</span>
                          <span className="font-medium ml-2">
                            {new Date(result.completedAt).toLocaleDateString()} at {new Date(result.completedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {previousResults.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No previous results available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

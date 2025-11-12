import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Award,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ExamSelector = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch exams
  const { data: examsData, isLoading: examsLoading, error: examsError } = useQuery({
    queryKey: ['exams'],
    queryFn: () => adminAPI.getExams(),
  });

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ['examCategories'],
    queryFn: () => adminAPI.getExamCategories(),
  });

  // Fetch exam-wise results to get student counts
  const { data: examWiseResults } = useQuery({
    queryKey: ['examWiseResults'],
    queryFn: () => adminAPI.getExamWiseResults(),
  });

  if (examsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (examsError) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading exams: {examsError.message}
      </div>
    );
  }

  // Get exams array from response
  const exams = Array.isArray(examsData) ? examsData : examsData?.content || [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Filter exams based on search and category
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exam.examCategory?.id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Get student count for each exam from examWiseResults
  const getStudentCount = (examId) => {
    const examResult = examWiseResults?.find(result => result.examId === examId);
    return examResult?.totalStudents || 0;
  };

  const handleViewResults = (examId) => {
    // Open in new tab
    const url = `/admin/results/exam/${examId}`;
    window.open(url, '_blank');
  };

  const handleViewResultsInSameTab = (examId) => {
    navigate(`/admin/results/exam/${examId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select Exam to View Results</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Choose an exam to view detailed student results</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48 lg:w-64">
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 sm:hidden" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-9 sm:pl-3 pr-8 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => {
            const studentCount = getStudentCount(exam.id);
            return (
              <div key={exam.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-100">
                <div className="p-4 sm:p-6">
                  {/* Exam Header */}
                  <div className="mb-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{exam.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                        {exam.description && exam.description.length > 100 
                          ? `${exam.description.substring(0, 100)}...` 
                          : exam.description
                        }
                      </p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {exam.examCategory?.name || 'No Category'}
                      </span>
                    </div>
                  </div>

                  {/* Exam Stats */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg mx-auto mb-1 sm:mb-2">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <p className="text-xs text-gray-600">Students</p>
                      <p className="text-sm sm:text-lg font-semibold text-gray-900">{studentCount}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg mx-auto mb-1 sm:mb-2">
                        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600">Total Marks</p>
                      <p className="text-sm sm:text-lg font-semibold text-gray-900">{exam.totalMarks}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg mx-auto mb-1 sm:mb-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                      </div>
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="text-sm sm:text-lg font-semibold text-gray-900">{exam.durationMinutes}m</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg mx-auto mb-1 sm:mb-2">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                      </div>
                      <p className="text-xs text-gray-600">Pass Marks</p>
                      <p className="text-sm sm:text-lg font-semibold text-gray-900">{exam.passingMarks}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewResults(exam.id)}
                      disabled={studentCount === 0}
                      className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        studentCount > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">View Results (New Tab)</span>
                      <span className="sm:hidden">New Tab</span>
                    </button>
                    <button
                      onClick={() => handleViewResultsInSameTab(exam.id)}
                      disabled={studentCount === 0}
                      className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 ${
                        studentCount > 0
                          ? 'border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-md transform hover:-translate-y-0.5'
                          : 'border-gray-300 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">View Results (Same Tab)</span>
                      <span className="sm:hidden">Same Tab</span>
                    </button>
                  </div>

                  {studentCount === 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-700 text-center font-medium">
                        No students have taken this exam yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 sm:py-12">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No exams are available yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredExams.length > 0 && (
        <div className="text-xs sm:text-sm text-gray-600 text-center bg-gray-50 py-2 px-4 rounded-lg">
          Showing {filteredExams.length} of {exams.length} exams
        </div>
      )}
    </div>
  );
};

export default ExamSelector;

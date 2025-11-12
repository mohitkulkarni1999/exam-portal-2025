import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ArrowLeft,
  BookOpen,
  Award,
  Clock,
  AlertCircle,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const QuestionManagement = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const queryClient = useQueryClient();

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => adminAPI.getExams().then(response => {
      const exams = Array.isArray(response.data) ? response.data : response.data.content || [];
      return exams.find(e => e.id === parseInt(examId));
    }),
  });

  // Fetch questions for this exam
  const { data: questions = [], isLoading: questionsLoading, error } = useQuery({
    queryKey: ['examQuestions', examId],
    queryFn: () => adminAPI.getQuestions(examId),
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: adminAPI.addQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['examQuestions', examId]);
      setShowCreateModal(false);
    },
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['examQuestions', examId]);
      setEditingQuestion(null);
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: adminAPI.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['examQuestions', examId]);
    },
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: adminAPI.bulkUploadQuestions,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['examQuestions', examId]);
      setShowBulkUpload(false);
      setSelectedFile(null);
      alert(`Successfully uploaded ${response.data.questionsAdded} questions!`);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Failed to upload questions';
      alert(errorMessage);
    },
  });

  const handleCreateQuestion = (questionData) => {
    const payload = {
      ...questionData,
      exam: { id: parseInt(examId) }
    };
    createQuestionMutation.mutate(payload);
  };

  const handleUpdateQuestion = (questionData) => {
    const payload = {
      ...questionData,
      exam: { id: parseInt(examId) }
    };
    updateQuestionMutation.mutate({ id: editingQuestion.id, data: payload });
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleBulkUpload = () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('examId', examId);

    setUploadProgress(true);
    bulkUploadMutation.mutate(formData);
    setUploadProgress(false);
  };

  const handleDownloadTemplate = () => {
    adminAPI.downloadQuestionTemplate();
  };

  // Ensure questions is always an array
  const questionsArray = Array.isArray(questions) ? questions : [];
  
  const filteredQuestions = questionsArray.filter(question =>
    question.questionText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMarks = questionsArray.reduce((sum, q) => sum + (q.marks || 0), 0);

  if (examLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <div className="text-red-600 mb-4">Error loading questions</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/exams')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Exams
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Question Management</h1>
            <p className="text-gray-600">{exam?.title || 'Loading...'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </button>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </button>
        </div>
      </div>

      {/* Exam Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{questionsArray.length}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalMarks}</div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{exam?.durationMinutes || 0}</div>
              <div className="text-sm text-gray-600">Duration (min)</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{exam?.passingMarks || 0}</div>
              <div className="text-sm text-gray-600">Passing Marks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Questions ({filteredQuestions.length})</h2>
        </div>
        <div className="p-6">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <div className="text-lg font-medium mb-2">No Questions Found</div>
              <div className="text-sm mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first question.'}
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Q{index + 1}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          question.difficultyLevel === 'EASY' ? 'bg-green-100 text-green-800' :
                          question.difficultyLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficultyLevel}
                        </span>
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                          {question.marks} marks
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {question.questionText}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={`p-2 rounded ${question.correctAnswer === 'A' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <span className="font-medium">A)</span> {question.optionA}
                        </div>
                        <div className={`p-2 rounded ${question.correctAnswer === 'B' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <span className="font-medium">B)</span> {question.optionB}
                        </div>
                        <div className={`p-2 rounded ${question.correctAnswer === 'C' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <span className="font-medium">C)</span> {question.optionC}
                        </div>
                        <div className={`p-2 rounded ${question.correctAnswer === 'D' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <span className="font-medium">D)</span> {question.optionD}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Question"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingQuestion) && (
        <QuestionModal
          question={editingQuestion}
          onSave={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
          onClose={() => {
            setShowCreateModal(false);
            setEditingQuestion(null);
          }}
          isLoading={createQuestionMutation.isLoading || updateQuestionMutation.isLoading}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadModal
          onUpload={handleBulkUpload}
          onClose={() => {
            setShowBulkUpload(false);
            setSelectedFile(null);
          }}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          isLoading={bulkUploadMutation.isLoading}
          onDownloadTemplate={handleDownloadTemplate}
        />
      )}
    </div>
  );
};

// Question Modal Component
const QuestionModal = ({ question, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    questionText: question?.questionText || '',
    optionA: question?.optionA || '',
    optionB: question?.optionB || '',
    optionC: question?.optionC || '',
    optionD: question?.optionD || '',
    correctAnswer: question?.correctAnswer || 'A',
    marks: question?.marks || 1,
    difficultyLevel: question?.difficultyLevel || 'MEDIUM',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {question ? 'Edit Question' : 'Add New Question'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text *
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="input-field"
              rows={3}
              required
              placeholder="Enter the question..."
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option A *
              </label>
              <input
                type="text"
                value={formData.optionA}
                onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                className="input-field"
                required
                placeholder="Option A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option B *
              </label>
              <input
                type="text"
                value={formData.optionB}
                onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                className="input-field"
                required
                placeholder="Option B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option C *
              </label>
              <input
                type="text"
                value={formData.optionC}
                onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                className="input-field"
                required
                placeholder="Option C"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option D *
              </label>
              <input
                type="text"
                value={formData.optionD}
                onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                className="input-field"
                required
                placeholder="Option D"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer *
              </label>
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="input-field"
                required
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marks *
              </label>
              <input
                type="number"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                className="input-field"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (question ? 'Update Question' : 'Add Question')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Upload Modal Component
const BulkUploadModal = ({ onUpload, onClose, selectedFile, onFileSelect, isLoading, onDownloadTemplate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Upload Questions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Excel Format Required</p>
                <p className="text-blue-700 mb-2">
                  Upload an Excel file (.xlsx or .xls) with the following columns:
                </p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• Question Text</li>
                  <li>• Option A, Option B, Option C, Option D</li>
                  <li>• Correct Answer (A, B, C, or D)</li>
                  <li>• Marks (positive number)</li>
                  <li>• Difficulty Level (EASY, MEDIUM, HARD)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template Button */}
          <button
            onClick={onDownloadTemplate}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Excel Template
          </button>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            {selectedFile && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              disabled={!selectedFile || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Questions
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionManagement;

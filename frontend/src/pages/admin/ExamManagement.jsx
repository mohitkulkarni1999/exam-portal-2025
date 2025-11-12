import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, BookOpen, Eye } from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ExamManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const queryClient = useQueryClient();

  // Fetch exams
  const { data: examsData, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: () => adminAPI.getExams(),
  });

  // Fetch exam categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['examCategories'],
    queryFn: adminAPI.getExamCategories,
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: adminAPI.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      setShowCreateModal(false);
    },
  });

  // Update exam mutation
  const updateExamMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      setEditingExam(null);
    },
  });

  // Delete exam mutation
  const deleteExamMutation = useMutation({
    mutationFn: adminAPI.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
    },
  });

  const handleCreateExam = (examData) => {
    createExamMutation.mutate(examData);
  };

  const handleUpdateExam = (examData) => {
    updateExamMutation.mutate({ id: editingExam.id, data: examData });
  };

  const handleDeleteExam = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      deleteExamMutation.mutate(examId);
    }
  };

  const filteredExams = examsData?.content?.filter(exam =>
    exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading exams: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Exam
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Exams Table - Desktop */}
      <div className="bg-white rounded-lg shadow overflow-hidden hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">{exam.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.categoryName || 'No Category'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.durationMinutes} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.totalMarks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      exam.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/exams/${exam.id}/questions`}
                        className="text-green-600 hover:text-green-900"
                        title="Manage Questions"
                      >
                        <BookOpen className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setEditingExam(exam)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Exam"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exams Cards - Mobile & Tablet */}
      <div className="lg:hidden space-y-4">
        {filteredExams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{exam.title}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{exam.description}</p>
              </div>
              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                exam.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {exam.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Category:</span>
                <p className="text-gray-900">{exam.categoryName || 'No Category'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <p className="text-gray-900">{exam.durationMinutes} min</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Marks:</span>
                <p className="text-gray-900">{exam.totalMarks}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
              <Link
                to={`/admin/exams/${exam.id}/questions`}
                className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                title="Manage Questions"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Questions
              </Link>
              <button
                onClick={() => setEditingExam(exam)}
                className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit Exam"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteExam(exam.id)}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                title="Delete Exam"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingExam) && (
        <ExamModal
          exam={editingExam}
          categories={categoriesData || []}
          onSave={editingExam ? handleUpdateExam : handleCreateExam}
          onClose={() => {
            setShowCreateModal(false);
            setEditingExam(null);
          }}
          isLoading={createExamMutation.isLoading || updateExamMutation.isLoading}
        />
      )}
    </div>
  );
};

// Exam Modal Component - Fixed categories array handling - v2.0
const ExamModal = ({ exam, categories = [], onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    title: exam?.title || '',
    description: exam?.description || '',
    examCategory: exam ? categories.find(c => c.id === exam.categoryId) : null,
    durationMinutes: exam?.durationMinutes || 60,
    totalMarks: exam?.totalMarks || 100,
    passingMarks: exam?.passingMarks || 40,
    instructions: exam?.instructions || '',
    isActive: exam?.isActive ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the data for the backend - send categoryId instead of examCategory object
    const examData = {
      ...formData,
      categoryId: formData.examCategory ? formData.examCategory.id : null
    };
    
    // Remove the examCategory object since we're sending categoryId
    delete examData.examCategory;
    
    onSave(examData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {exam ? 'Edit Exam' : 'Create New Exam'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.examCategory?.id || ''}
              onChange={(e) => {
                const category = (categories && Array.isArray(categories)) 
                  ? categories.find(c => c.id === parseInt(e.target.value))
                  : null;
                setFormData({ ...formData, examCategory: category });
              }}
              className="input-field"
              required
            >
              <option value="">Select Category</option>
              {(categories && Array.isArray(categories)) ? categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              )) : (
                <option disabled>No categories available</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Marks
              </label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Marks
            </label>
            <input
              type="number"
              value={formData.passingMarks}
              onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="input-field"
              rows="4"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center"
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {exam ? 'Update' : 'Create'} Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamManagement;

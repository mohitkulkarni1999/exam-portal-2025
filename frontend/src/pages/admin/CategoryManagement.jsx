import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CategoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['examCategories'],
    queryFn: adminAPI.getExamCategories,
  });

  // Debug logging
  console.log('CategoryManagement - categoriesData:', categoriesData);
  console.log('CategoryManagement - isArray:', Array.isArray(categoriesData));
  console.log('CategoryManagement - type:', typeof categoriesData);


  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: adminAPI.createExamCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['examCategories']);
      setShowCreateModal(false);
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateExamCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['examCategories']);
      setEditingCategory(null);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: adminAPI.deleteExamCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['examCategories']);
    },
  });

  const handleCreateCategory = (categoryData) => {
    createCategoryMutation.mutate(categoryData);
  };

  const handleUpdateCategory = (categoryData) => {
    updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryData });
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This may affect existing exams.')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const filteredCategories = Array.isArray(categoriesData) ? categoriesData.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    console.error('Categories Error:', error);
    return (
      <div className="text-center text-red-600 p-4">
        <div>Error loading categories: {error.message}</div>
        <div className="text-sm mt-2">Check browser console for details</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center justify-center w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="sm:inline">Create New Category</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 md:p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 flex-1 pr-2 line-clamp-2">
                {category.name}
              </h3>
              <div className="flex space-x-1 md:space-x-2 flex-shrink-0">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="p-1.5 md:p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit Category"
                >
                  <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-1.5 md:p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3 md:mb-4 line-clamp-3 min-h-[3rem]">
              {category.description || 'No description available'}
            </p>
            <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {Array.isArray(categoriesData) && categoriesData.length === 0 
              ? "No categories found" 
              : "Categories data is not in expected format"}
          </div>
          <div className="text-sm text-gray-400 mb-4">
            Expected: Array, Got: {typeof categoriesData}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Your First Category
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCategory) && (
        <CategoryModal
          category={editingCategory}
          onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCategory(null);
          }}
          isLoading={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
        />
      )}
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ category, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md mx-4">
        <h2 className="text-lg md:text-xl font-bold mb-4">
          {category ? 'Edit Category' : 'Create New Category'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Mathematics, Science, History"
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
              placeholder="Brief description of this category..."
            />
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
              {category ? 'Update' : 'Create'} Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryManagement;

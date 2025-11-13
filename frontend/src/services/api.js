import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Force production backend URL - Updated
const API_BASE_URL = 'https://exam-portal-backend-ecjt.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      Cookies.remove('user');
      window.location.href = '/admin/login';
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      toast.error('Access denied. Insufficient permissions.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  registerStudent: (userData) => {
    // Transform frontend data to match backend DTO
    const backendData = {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      dateOfBirth: userData.dateOfBirth
    };
    return api.post('/auth/student/register', backendData);
  },
  registerAdmin: (userData) => {
    // Transform frontend data to match backend DTO structure
    const backendData = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone
    };
    return api.post('/auth/admin/register', backendData);
  },
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats').then(response => {
    console.log('Dashboard Stats API Response:', response.data);
    return response.data;
  }),
  getRecentActivity: () => api.get('/admin/dashboard/recent-activity').then(response => {
    console.log('Recent Activity API Response:', response.data);
    return response.data;
  }),
  
  // Exam Categories
  getExamCategories: () => api.get('/admin/exam-categories').then(response => {
    console.log('Categories API Response:', response.data);
    // Handle both direct array and wrapped response
    return Array.isArray(response.data) ? response.data : response.data.data || response.data;
  }),
  createExamCategory: (data) => api.post('/admin/exam-categories', data),
  updateExamCategory: (id, data) => api.put(`/admin/exam-categories/${id}`, data),
  deleteExamCategory: (id) => api.delete(`/admin/exam-categories/${id}`),
  
  // Exams
  getExams: (params) => api.get('/admin/exams', { params }).then(response => {
    console.log('Exams API Response:', response.data);
    // Handle both direct array and wrapped response (for paginated data)
    if (response.data.content) {
      return response.data; // Return full pagination object
    }
    return Array.isArray(response.data) ? response.data : response.data.data || response.data;
  }),
  createExam: (data) => api.post('/admin/exams', data),
  updateExam: (id, data) => api.put(`/admin/exams/${id}`, data),
  deleteExam: (id) => api.delete(`/admin/exams/${id}`),
  
  // Questions
  getQuestions: (examId) => api.get(`/admin/questions/exam/${examId}`).then(response => {
    console.log('Questions API Response:', response.data);
    // Handle both direct array and wrapped response
    return Array.isArray(response.data) ? response.data : response.data.data || response.data;
  }),
  addQuestion: (data) => api.post('/admin/questions', data),
  bulkUploadQuestions: (formData) => api.post('/admin/questions/bulk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  downloadQuestionTemplate: () => api.get('/admin/questions/template', {
    responseType: 'blob',
  }).then(response => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'questions_template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
  
  // Students
  getStudents: (params) => api.get('/admin/students', { params }).then(response => {
    console.log('Students API Response:', response.data);
    // Return the full response so we can access both students and statistics
    return response.data;
  }),
  updateStudentStatus: (id, data) => api.put(`/admin/students/${id}/status`, data).then(response => response.data),
  
  // Results
  getExamResults: (examId) => api.get(`/admin/results/exam/${examId}`),
  getResultStatistics: () => api.get('/admin/results/statistics').then(response => response.data),
  getExamWiseResults: () => api.get('/admin/results/exam-wise').then(response => {
    console.log('Exam-wise Results API Response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  }),
  getExamResultsById: (examId) => api.get(`/admin/results/exam/${examId}`).then(response => {
    console.log('Single Exam Results API Response:', response.data);
    return response.data;
  }),
  getRecentResults: (limit = 10) => api.get(`/admin/results/recent?limit=${limit}`).then(response => response.data),
};

// Student API
export const studentAPI = {
  // Dashboard
  getDashboard: () => api.get('/student/dashboard').then(response => {
    console.log('Student Dashboard API Response:', response.data);
    return response.data;
  }),
  
  // Exams
  getAvailableExams: () => api.get('/student/exams/available').then(response => {
    console.log('Available Exams API Response:', response.data);
    // Handle both direct array and wrapped response
    return Array.isArray(response.data) ? response.data : response.data.data || response.data;
  }),
  getExam: (examId) => api.get(`/student/exams/${examId}`).then(response => {
    console.log('Student Exam Details API Response:', response.data);
    return response.data;
  }),
  startExam: (examId) => api.post(`/student/exams/${examId}/start`).then(response => {
    console.log('Start Exam API Response:', response.data);
    return response.data;
  }),
  getExamQuestions: (examId) => api.get(`/student/exams/${examId}/questions`).then(response => {
    console.log('Student Exam Questions API Response:', response.data);
    return Array.isArray(response.data) ? response.data : response.data.data || response.data;
  }),
  getExamSession: (sessionId) => api.get(`/student/exam-sessions/${sessionId}`).then(response => {
    console.log('Exam Session API Response:', response.data);
    return response.data;
  }),
  
  // Answers
  submitAnswer: (sessionId, data) => api.post(`/student/exam-sessions/${sessionId}/answers`, data).then(response => {
    console.log('Submit Answer API Response:', response.data);
    return response.data;
  }),
  submitExam: (sessionId) => api.post(`/student/exam-sessions/${sessionId}/submit`).then(response => {
    console.log('Submit Exam API Response:', response.data);
    return response.data;
  }),
  
  // Results
  getResults: () => api.get('/student/results').then(response => {
    console.log('Student Results API Response:', response.data);
    // Handle both direct array and wrapped response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // If response has a 'results' property (backend format), return that
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    // Fallback to data property or empty array
    return response.data.data || [];
  }),
  getResultDetails: (resultId) => api.get(`/student/results/${resultId}`).then(response => {
    console.log('Result Details API Response:', response.data);
    return response.data;
  }),
};

export default api;

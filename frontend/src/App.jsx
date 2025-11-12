import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import StudentProtectedRoute from './components/auth/StudentProtectedRoute';
import LandingPage from './pages/public/LandingPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import AdminRegisterPage from './pages/auth/AdminRegisterPage';
import StudentLoginPage from './pages/auth/StudentLoginPage';
import StudentRegisterPage from './pages/auth/StudentRegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import ExamInterface from './pages/student/ExamInterface';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Admin Authentication Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/register" element={<AdminRegisterPage />} />
              
              {/* Student Authentication Routes */}
              <Route path="/student/login" element={<StudentLoginPage />} />
              <Route path="/student/register" element={<StudentRegisterPage />} />
              
              {/* Legacy Routes - Redirect to specific login pages */}
              <Route path="/login" element={<StudentLoginPage />} />
              <Route path="/register" element={<StudentRegisterPage />} />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />
              
              {/* Protected Student Routes */}
              <Route 
                path="/student/dashboard" 
                element={
                  <StudentProtectedRoute>
                    <StudentDashboard />
                  </StudentProtectedRoute>
                } 
              />
              <Route 
                path="/student/exam/:examId" 
                element={
                  <StudentProtectedRoute>
                    <ExamInterface />
                  </StudentProtectedRoute>
                } 
              />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

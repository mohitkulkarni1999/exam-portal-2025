import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const StudentProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Redirect to student login with return url
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'ROLE_STUDENT') {
    // If user is not student, redirect to appropriate dashboard
    if (user.role === 'ROLE_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/student/login" replace />;
  }

  return children;
};

export default StudentProtectedRoute;

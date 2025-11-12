import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminProtectedRoute = ({ children }) => {
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
    // Redirect to admin login with return url
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'ROLE_ADMIN') {
    // If user is not admin, redirect to appropriate dashboard
    if (user.role === 'ROLE_STUDENT') {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;

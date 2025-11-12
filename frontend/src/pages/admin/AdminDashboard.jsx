import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User,
  Plus,
  FileText,
  Award,
  FolderOpen,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ExamManagement from './ExamManagement';
import UserManagement from './UserManagement';
import ResultsAnalytics from './ResultsAnalytics';
import CategoryManagement from './CategoryManagement';
import QuestionManagement from './QuestionManagement';
import ExamResultsDetail from './ExamResultsDetail';

// Dashboard Overview Component
const DashboardOverview = () => {
  // Fetch dashboard stats from backend
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: adminAPI.getDashboardStats,
  });

  // Fetch recent activity from backend
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: adminAPI.getRecentActivity,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading dashboard data: {statsError.message}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Exams',
      value: statsData?.totalExams?.toString() || '0',
      change: '+12%', // This could be calculated from backend
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Students',
      value: statsData?.totalStudents?.toLocaleString() || '0',
      change: '+5%', // This could be calculated from backend
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Total Questions',
      value: statsData?.totalQuestions?.toLocaleString() || '0',
      change: '+18%', // This could be calculated from backend
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      title: 'Pass Percentage',
      value: `${statsData?.passPercentage?.toFixed(1) || '0'}%`,
      change: '+3%', // This could be calculated from backend
      icon: Award,
      color: 'bg-orange-500',
    },
  ];

  const recentActivity = Array.isArray(activityData) ? activityData : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 md:p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-2 md:p-3 rounded-lg flex-shrink-0`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="ml-3 md:ml-4 min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                <div className="flex items-center flex-wrap">
                  <p className="text-lg md:text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <span className="ml-2 text-xs md:text-sm text-green-600">{stat.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity available
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <Link to="/admin/categories" className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <FolderOpen className="w-4 h-4 mr-2" />
                Manage Categories
              </Link>
              <Link to="/admin/exams" className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Create New Exam
              </Link>
              <Link to="/admin/exams" className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <FileText className="w-4 h-4 mr-2" />
                Add Questions
              </Link>
              <Link to="/admin/results" className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Results
              </Link>
              <Link to="/admin/users" className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <Users className="w-4 h-4 mr-2" />
                Manage Students
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      active: location.pathname === '/admin' || location.pathname === '/admin/dashboard',
    },
    {
      name: 'Category Management',
      icon: FolderOpen,
      path: '/admin/categories',
      active: location.pathname.startsWith('/admin/categories'),
    },
    {
      name: 'Exam Management',
      icon: BookOpen,
      path: '/admin/exams',
      active: location.pathname.startsWith('/admin/exams'),
    },
    {
      name: 'User Management',
      icon: Users,
      path: '/admin/users',
      active: location.pathname.startsWith('/admin/users'),
    },
    {
      name: 'Results & Analytics',
      icon: BarChart3,
      path: '/admin/results',
      active: location.pathname.startsWith('/admin/results'),
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      active: location.pathname.startsWith('/admin/settings'),
    },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transition-transform duration-300 ease-in-out lg:transition-none`}>
        <div className="p-4 lg:p-6 flex justify-between items-center lg:block">
          <div>
            <div className="text-xl lg:text-2xl font-bold text-blue-600">ExamPortal</div>
            <div className="text-xs lg:text-sm text-gray-600 mt-1">Admin Panel</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-6">
          <div className="px-3">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors ${
                  item.active
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex justify-between items-center px-4 lg:px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 mr-3"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                {sidebarItems.find(item => item.active)?.name || 'Dashboard'}
              </h1>
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
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="exams" element={<ExamManagement />} />
            <Route path="exams/:examId/questions" element={<QuestionManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="results" element={<ResultsAnalytics />} />
            <Route path="results/exam/:examId" element={<ExamResultsDetail />} />
            <Route path="settings" element={<div>Settings - Coming Soon</div>} />
            <Route index element={<DashboardOverview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

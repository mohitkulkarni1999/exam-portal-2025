import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, Award, Download, Filter } from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ExamSelector from './ExamSelector';

const ResultsAnalytics = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedExam, setSelectedExam] = useState('all');

  // Fetch results statistics
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['resultStatistics', dateRange, selectedExam],
    queryFn: () => adminAPI.getResultStatistics(),
  });

  // Fetch exams for filter dropdown
  const { data: examsData } = useQuery({
    queryKey: ['exams'],
    queryFn: () => adminAPI.getExams(),
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
        Error loading analytics: {statsError.message}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Exams Taken',
      value: statsData?.totalExamsTaken || 0,
      icon: BarChart3,
      color: 'bg-blue-500',
      change: '+15%',
    },
    {
      title: 'Average Score',
      value: `${statsData?.averageScore?.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+2.3%',
    },
    {
      title: 'Pass Rate',
      value: `${statsData?.passRate?.toFixed(1) || 0}%`,
      icon: Award,
      color: 'bg-purple-500',
      change: '+5.1%',
    },
    {
      title: 'Active Students',
      value: statsData?.activeStudents || 0,
      icon: Users,
      color: 'bg-orange-500',
      change: '+8%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Results & Analytics</h1>
        <button className="btn-primary flex items-center justify-center w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last3months">Last 3 Months</option>
            <option value="last6months">Last 6 Months</option>
            <option value="lastyear">Last Year</option>
          </select>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="input-field"
          >
            <option value="all">All Exams</option>
            {examsData?.content?.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exam Selector */}
      <ExamSelector />

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
                  <span className="ml-2 text-xs md:text-sm font-medium text-green-600">{stat.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
              <p className="text-sm">Integration with chart library needed</p>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>Score distribution chart would go here</p>
              <p className="text-sm">Integration with chart library needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {statsData?.topPerformers?.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">#{index + 1}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{performer.name || performer}</p>
                    <p className="text-sm text-gray-500">Student</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{performer.averageScore || 0}%</p>
                  <p className="text-sm text-gray-500">Average Score</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                No performance data available
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default ResultsAnalytics;

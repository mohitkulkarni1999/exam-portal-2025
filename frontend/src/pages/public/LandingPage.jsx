import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Settings, 
  Smartphone, 
  Users, 
  Clock, 
  TrendingUp, 
  Award,
  GraduationCap
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure Exams',
      description: 'Bank-level security with anti-cheating measures and secure authentication.',
    },
    {
      icon: Zap,
      title: 'Real-time Results',
      description: 'Instant results with detailed analytics and performance insights.',
    },
    {
      icon: Settings,
      title: 'Easy Management',
      description: 'Comprehensive admin dashboard for seamless exam management.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Responsive design that works perfectly on all devices.',
    },
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: 'Students Registered' },
    { icon: Award, value: '500+', label: 'Exams Conducted' },
    { icon: TrendingUp, value: '95%', label: 'Success Rate' },
    { icon: Clock, value: '<2s', label: 'Average Response Time' },
  ];

  const steps = [
    { step: '1', title: 'Register/Login', description: 'Create your account or sign in to get started' },
    { step: '2', title: 'Select Exam', description: 'Choose from available exams in your category' },
    { step: '3', title: 'Take Exam', description: 'Complete your exam in a secure environment' },
    { step: '4', title: 'Get Results', description: 'Receive instant results and detailed analytics' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">ExamPortal</div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Professional Online Exam Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Secure, Reliable, and Scalable Examination System
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/student/login"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center"
              >
                <GraduationCap className="h-5 w-5 mr-2" />
                Student Login
              </Link>
              <Link
                to="/admin/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Shield className="h-5 w-5 mr-2" />
                Admin Login
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <Link
                to="/student/register"
                className="bg-white hover:bg-gray-50 text-green-600 px-6 py-2 rounded-lg font-medium text-base border-2 border-green-600 transition-colors duration-200"
              >
                Student Sign Up
              </Link>
              <Link
                to="/admin/register"
                className="bg-white hover:bg-gray-50 text-blue-600 px-6 py-2 rounded-lg font-medium text-base border-2 border-blue-600 transition-colors duration-200"
              >
                Admin Registration
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600">
              Built with modern technology for the best examination experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-blue-100">
              Our platform has helped thousands of students and institutions
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just four simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-4">ExamPortal</div>
              <p className="text-gray-400">
                The most trusted online examination platform for educational institutions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <p>Email: support@examportal.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Education St, Learning City</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ExamPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

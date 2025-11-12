# 🎓 Exam Portal 2025

A comprehensive online examination system built with **Spring Boot** (Backend) and **React** (Frontend). This system provides secure exam management, student assessment, and administrative controls with advanced security features.

## ✨ Features

### 👨‍💼 Admin Features
- **Dashboard Analytics**: Real-time statistics and recent activity tracking
- **Exam Management**: Create, edit, and manage exams with categories
- **Question Management**: Add questions manually or via Excel bulk upload
- **Student Management**: Monitor student registrations and performance
- **Results Analytics**: Comprehensive exam results and student performance analysis
- **Category Management**: Organize exams by categories
- **Interactive Exam Interface** with timer and question navigation
- **Real-time Answer Submission** with auto-save functionality
- **Instant Results** with detailed performance analytics
- **Responsive Design** that works on all devices

### For Administrators
- **Comprehensive Dashboard** with statistics and recent activity
- **Exam Management** - Create, update, and manage exams
- **Question Bank** - Add, edit, and organize questions
- **Student Management** - Monitor and manage student accounts
- **Results Analytics** - Detailed reports and performance insights
- **Category Management** - Organize exams by categories

### Security Features
- **JWT Token Authentication** with 15-minute expiration
- **Role-based Access Control** (Admin/Student)
- **Password Encryption** using BCrypt
- **CORS Configuration** for secure cross-origin requests
- **Input Validation** and SQL injection prevention

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.2.x** with Java 17
- **Spring Security 6** for authentication and authorization
- **Spring Data JPA** with Hibernate for database operations
- **MySQL 8.0** as the primary database
- **JWT** for stateless authentication
- **Maven** for dependency management
- **Lombok** for reducing boilerplate code

### Frontend
- **React 18** with modern hooks and functional components
- **Vite** as the build tool for fast development
- **Tailwind CSS** for responsive and modern UI design
- **React Router** for client-side routing
- **Axios** for HTTP requests with interceptors
- **React Query** for efficient data fetching and caching
- **React Hook Form** with Yup validation
- **Lucide React** for beautiful icons

## 📁 Project Structure

```
exam-portal/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/examportal/
│   │   ├── config/                   # Configuration classes
│   │   ├── controller/               # REST API controllers
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── entity/                   # JPA entities
│   │   ├── repository/               # JPA repositories
│   │   ├── security/                 # Security configuration
│   │   ├── service/                  # Business logic services
│   │   └── ExamPortalApplication.java
│   ├── src/main/resources/
│   │   └── application.yml           # Application configuration
│   └── pom.xml                       # Maven dependencies
│
└── frontend/                         # React Frontend
    ├── src/
    │   ├── components/               # Reusable UI components
    │   │   ├── auth/                 # Authentication components
    │   │   └── ui/                   # UI components
    │   ├── contexts/                 # React contexts
    │   ├── pages/                    # Page components
    │   │   ├── admin/                # Admin pages
    │   │   ├── auth/                 # Authentication pages
    │   │   ├── public/               # Public pages
    │   │   └── student/              # Student pages
    │   ├── services/                 # API service layer
    │   ├── App.jsx                   # Main App component
    │   └── main.jsx                  # Entry point
    ├── index.html                    # HTML template
    ├── package.json                  # Dependencies
    ├── tailwind.config.js            # Tailwind configuration
    └── vite.config.ts                # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0
- Maven 3.6+

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd exam-portal/backend
   ```

2. **Configure Database**
   - Create a MySQL database named `exam_portal`
   - Update database credentials in `src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/exam_portal
       username: your_username
       password: your_password
   ```

3. **Run the Backend**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd exam-portal/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:3000`

## 📊 Database Schema

The application uses the following main entities:

- **User** (Base class with inheritance)
  - **Admin** - System administrators
  - **Student** - Exam takers
- **ExamCategory** - Categorization of exams
- **Exam** - Exam definitions with metadata
- **Question** - Multiple choice questions
- **ExamSession** - Individual exam attempts
- **StudentAnswer** - Student responses to questions

## 🔐 Authentication

The system uses JWT-based authentication:

- **Access Token**: 15-minute expiration for API requests
- **Refresh Token**: 7-day expiration for token renewal
- **Role-based Access**: Separate endpoints for Admin and Student roles

### Default Credentials (for development)
- **Admin**: admin@example.com / admin123
- **Student**: student@example.com / student123

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/student/register` - Student registration

### Admin APIs
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/exam-categories` - List exam categories
- `POST /api/admin/exam-categories` - Create exam category
- `GET /api/admin/exams` - List exams with pagination
- `POST /api/admin/exams` - Create new exam
- `GET /api/admin/questions/exam/{examId}` - Get exam questions
- `POST /api/admin/questions` - Add question
- `GET /api/admin/students` - List students

### Student APIs
- `GET /api/student/dashboard` - Student dashboard data
- `GET /api/student/exams/available` - Available exams
- `POST /api/student/exams/{examId}/start` - Start exam
- `POST /api/student/exam-sessions/{sessionId}/answers` - Submit answer
- `POST /api/student/exam-sessions/{sessionId}/submit` - Submit exam
- `GET /api/student/results` - Student results

## 🎨 UI Features

### Landing Page
- Hero section with call-to-action buttons
- Feature highlights with icons
- Statistics section
- How it works guide
- Professional footer

### Student Portal
- Dashboard with available exams and previous results
- Interactive exam interface with:
  - Question navigation
  - Timer with auto-submit
  - Answer marking and review
  - Question palette with status indicators
  - Progress tracking

### Admin Panel
- Sidebar navigation with active states
- Dashboard with statistics cards
- Quick action buttons
- Recent activity feed
- Data tables with pagination
- Modal forms for CRUD operations

## 🔧 Configuration

### Backend Configuration (`application.yml`)
```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  security:
    jwt:
      secret: mySecretKey123456789012345678901234567890
      expiration: 900000 # 15 minutes
      refresh-expiration: 604800000 # 7 days
```

### Frontend Configuration (`vite.config.ts`)
```typescript
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

## 🚀 Deployment

### Backend Deployment
1. Build the JAR file: `mvn clean package`
2. Run with: `java -jar target/exam-portal-backend-0.0.1-SNAPSHOT.jar`
3. Configure production database and JWT secrets

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@examportal.com
- Documentation: [Project Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

## 🔮 Future Enhancements

- [ ] Email notifications for exam results
- [ ] Bulk question upload via CSV/Excel
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Integration with Learning Management Systems
- [ ] Proctoring features with webcam monitoring
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Offline exam capability
- [ ] Advanced question types (essay, file upload)

---

Built with ❤️ using Spring Boot and React

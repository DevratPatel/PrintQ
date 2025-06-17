# Queue Management App 🚀

A sophisticated, real-time web application for managing poster printing queues, built with modern technologies and featuring a beautiful glassmorphism UI. This solution implements efficient queue management with real-time synchronization.

## 🛠️ Technical Stack

### Frontend Architecture

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict type checking
- **State Management**: React Context API with custom hooks
- **Styling**: Tailwind CSS with custom animations
- **Animation**: Framer Motion for smooth transitions
- **Notifications**: React Hot Toast for user feedback
- **Icons**: React Icons
- **Code Quality**: ESLint and TypeScript for type safety

### Backend & Infrastructure

- **Database**: Firebase Firestore with real-time listeners
- **Authentication**: Firebase Authentication with role-based access
- **Performance**: React Suspense and dynamic imports
- **Security**: Firebase Security Rules

## ✨ Key Features

### Real-time Queue Management

- Real-time updates using Firebase listeners
- Queue position tracking with estimated wait times
- Automatic queue management between two desks

### Advanced UI/UX Features

- **Glassmorphism Design**: Modern, translucent UI components
- **Responsive Design**: Mobile-first approach
- **Skeleton Loading**: Optimistic loading states
- **Error Handling**: Graceful error recovery

### Admin Dashboard

- **Advanced Analytics**:
  - Real-time queue metrics
  - Historical data visualization
  - Custom date range filtering
  - Export functionality for reports (PDF & CSV)
- **Job Management**:
  - CRUD operations with optimistic updates
  - Batch operations support
  - Audit logging for actions
- **User Management**:
  - Role-based access control (Admin/Desk)
  - Staff performance metrics

### Desk Operations

- **Queue Management**:
  - Real-time queue updates
  - Call next customer
  - Complete service
  - Remove from queue
- **Real-time Updates**:
  - Instant status changes
  - Toast notifications

### Customer Experience

- **Queue Entry**:
  - Real-time position updates
- **Display System**:
  - Dynamic TV display
  - Estimated wait times
  - Current serving numbers

## 🚀 Performance Optimizations

- Code splitting and lazy loading
- Efficient Firebase queries
- Optimistic UI updates
- Memoization of expensive computations

## 🔧 Development Setup

1. **Prerequisites**:

   - Node.js 18.x or higher
   - npm 9.x or higher
   - Git

2. **Installation**:

   ```bash
   git clone [repository-url]
   cd poster-queue-system
   npm install
   ```

3. **Environment Configuration**:
   Create `.env.local` with Firebase credentials:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Development Server**:
   ```bash
   npm run dev
   ```

## 📊 Testing Strategy

- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: Cypress for E2E testing

## 🚢 Deployment

The application is configured for deployment on Vercel:

1. **CI/CD Pipeline**:
   - Automated testing on pull requests
   - Preview deployments for feature branches
   - Production deployment on main branch

## 🔐 Security Measures

- JWT-based authentication
- Role-based access control
- Input validation
- Secure Firebase rules

## 📝 License

MIT License - See LICENSE file for details

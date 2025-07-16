# PrintQ 🚀

A sophisticated, real-time web application for managing poster printing queues at UTA Libraries Print & Design Studios. Built with modern technologies and featuring a beautiful glassmorphism UI, this solution implements efficient queue management with real-time synchronization across multiple service desks.

## 🛠️ Technical Stack

### Frontend Architecture

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict type checking
- **State Management**: React Context API with custom hooks
- **Styling**: Tailwind CSS v4 with custom animations
- **Animation**: Framer Motion for smooth transitions
- **Notifications**: React Hot Toast for user feedback
- **Icons**: React Icons & Heroicons
- **UI Components**: Headless UI for accessible components
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF with autoTable for reports
- **Code Quality**: ESLint and TypeScript for type safety

### Backend & Infrastructure

- **Database**: Firebase Firestore with real-time listeners
- **Authentication**: Firebase Authentication with role-based access control
- **Performance**: React Suspense and dynamic imports
- **Security**: Firebase Security Rules
- **Deployment**: Vercel-ready configuration

## ✨ Key Features

### 🔐 Authentication & User Management

- **Role-Based Access Control**: Admin and Desk user roles
- **Secure Login System**: Firebase Authentication integration
- **User Management**: Create, edit, and manage staff accounts
- **Password Management**: Secure password changes and temporary passwords
- **Session Management**: Automatic session handling and logout

### 📊 Real-time Queue Management

- **Live Updates**: Real-time queue synchronization using Firebase listeners
- **Multi-Desk Support**: Manage queues across two service desks
- **Queue Position Tracking**: Real-time position updates with estimated wait times
- **Automatic Queue Management**: Smart distribution between desks
- **Queue Status Management**: Waiting, Serving, and Completed states

### 🎛️ Admin Dashboard

- **Comprehensive Overview**: Real-time metrics and system status
- **Advanced Analytics**:
  - Real-time queue metrics and trends
  - Historical data visualization with charts
  - Custom date range filtering
  - Peak hours analysis and busiest day tracking
  - Export functionality for reports (PDF & CSV)
  - Performance metrics and wait time analysis
- **Queue Management**:
  - Real-time queue monitoring
  - Manual queue manipulation
  - Batch operations support
  - Queue reset functionality
- **User Management**:
  - Staff account creation and management
  - Role assignment and permissions
  - User activity tracking
  - Account status management

### 🖥️ Desk Operations

- **Queue Management**:
  - Real-time queue updates and monitoring
  - Call next customer functionality
  - Complete service operations
  - Remove customers from queue
  - Queue reset capabilities
- **Real-time Updates**:
  - Instant status changes with animations
  - Toast notifications for actions
  - Live queue position updates

### 👥 Customer Experience

- **Queue Entry**:
  - Simple, intuitive entry form
  - Real-time position updates
  - Estimated wait time calculations
  - Student ID validation
- **Display System**:
  - Dynamic TV display for waiting areas
  - Real-time "Now Serving" updates
  - "Up Next" queue preview
  - Professional presentation with animations

### 📱 User Interface Features

- **Glassmorphism Design**: Modern, translucent UI components
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **Dark Theme**: Professional dark interface with accent colors
- **Skeleton Loading**: Optimistic loading states for better UX
- **Error Handling**: Graceful error recovery with user feedback
- **Accessibility**: WCAG compliant components and navigation

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy loading of components and routes
- **Efficient Firebase Queries**: Optimized database queries and real-time listeners
- **Optimistic UI Updates**: Immediate feedback for user actions
- **Memoization**: Cached expensive computations
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Optimization**: Tree shaking and minimal bundle sizes

## 🔧 Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**:

   ```bash
   git clone [repository-url]
   cd star1
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create `.env.local` with your Firebase credentials:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Setup**:

   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Set up Firestore security rules
   - Create initial admin user

5. **Development Server**:

   ```bash
   npm run dev
   ```

6. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── desk1/             # Desk 1 interface
│   ├── desk2/             # Desk 2 interface
│   ├── display/           # TV display page
│   └── login/             # Authentication page
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── ui/                # Reusable UI components
│   └── ...                # Feature components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
└── globals.css           # Global styles
```

## 🔐 Security Features

- **Firebase Security Rules**: Database-level security
- **Role-Based Access Control**: Admin and Desk user permissions
- **Input Validation**: Client and server-side validation
- **Authentication Guards**: Protected routes and components
- **Secure Password Handling**: Encrypted password storage
- **Session Management**: Secure session handling

## 📊 Analytics & Reporting

- **Real-time Metrics**: Live queue statistics and performance data
- **Historical Analysis**: Past queue data and trends
- **Export Capabilities**: PDF and CSV report generation
- **Performance Tracking**: Wait times, service times, and efficiency metrics
- **Custom Date Ranges**: Flexible reporting periods
- **Visual Charts**: Interactive data visualization

## 🎨 UI/UX Features

- **Glassmorphism Design**: Modern translucent interface
- **Smooth Animations**: Framer Motion transitions
- **Responsive Layout**: Mobile, tablet, and desktop optimized
- **Dark Theme**: Professional dark interface
- **Loading States**: Skeleton screens and loading indicators
- **Toast Notifications**: User feedback and status updates
- **Accessibility**: WCAG compliant design

## 🚢 Deployment

### Vercel Deployment

The application is optimized for Vercel deployment:

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add Firebase configuration to Vercel
3. **Automatic Deployments**: CI/CD pipeline with automatic testing
4. **Preview Deployments**: Feature branch previews
5. **Production Deployment**: Main branch automatic deployment

### Environment Variables

Ensure all Firebase configuration variables are set in your deployment environment.

## 🧪 Testing

- **TypeScript**: Static type checking
- **ESLint**: Code quality and consistency
- **Manual Testing**: Comprehensive feature testing
- **Performance Testing**: Bundle analysis and optimization

## 🔄 Real-time Features

- **Live Queue Updates**: Instant queue position changes
- **Real-time Notifications**: Toast messages for all actions
- **Live Display Updates**: TV display synchronization
- **Multi-user Support**: Concurrent user operations
- **Offline Resilience**: Graceful handling of connection issues

## 📱 Mobile Support

- **Responsive Design**: Optimized for all screen sizes
- **Touch-friendly Interface**: Mobile-optimized interactions
- **Progressive Web App**: PWA capabilities
- **Cross-platform Compatibility**: Works on all modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Support

For support and questions:

- Check the documentation
- Review Firebase setup requirements
- Ensure all environment variables are configured
- Verify Firebase security rules are properly set

---

**PrintQ** - Modern queue management for UTA Libraries Print & Design Studios

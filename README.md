# Poster Queue Management System

A modern web application for managing poster printing queues with a beautiful glassmorphism UI and advanced admin/desk features.

## Features

- Real-time queue management
- Beautiful glassmorphism UI
- **Advanced pagination** in all panels (Admin, Desk1, Desk2) with clickable page numbers and ellipsis navigation
- Admin panel for staff with:
  - Edit and delete jobs (with modal and confirmation)
  - Date range filtering for analytics and job history
  - Quick stats, analytics, and job history
- Desk panels (Desk1, Desk2, DeskPanel) with:
  - Paginated waiting queue and serving view
  - Call next, complete, and delete actions
- TV display for customers
- Estimated wait times
- Responsive design
- **Queue number is shown to users after joining the queue**
- Shared Pagination component for consistent UX
- Smooth animations and notifications

## Tech Stack

- Frontend: Next.js 14 with TypeScript
- Styling: Tailwind CSS
- Animations: Framer Motion
- Database: Firebase Firestore
- Notifications: React Hot Toast
- Icons: React Icons

## Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a Firebase project and enable Firestore

4. Create a `.env.local` file in the root directory with your Firebase configuration:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Pages

- `/` - Queue entry form for customers (shows assigned queue number after joining)
- `/admin` - Admin panel for staff (edit/delete jobs, analytics, paginated queue and job history)
- `/desk1` and `/desk2` - Desk panels for staff (serving, paginated waiting queue, call/complete/delete)
- `/display` - TV display for showing queue status

## Development

The project uses:

- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- React Hot Toast for notifications
- Firebase for real-time database
- React Icons for UI icons
- Shared Pagination component for all paginated lists

## Deployment

The application can be deployed to Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables
4. Deploy!

## License

MIT

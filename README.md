# Poster Queue Management System

A modern web application for managing poster printing queues with a beautiful glassmorphism UI.

## Features

- Real-time queue management
- Beautiful glassmorphism UI
- Admin panel for staff
- TV display for customers
- Estimated wait times
- Responsive design

## Tech Stack

- Frontend: Next.js 14 with TypeScript
- Styling: Tailwind CSS
- Animations: Framer Motion
- Database: Firebase Firestore
- Notifications: React Hot Toast

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

- `/` - Queue entry form for customers
- `/admin` - Admin panel for staff
- `/display` - TV display for showing queue status

## Development

The project uses:

- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- React Hot Toast for notifications
- Firebase for real-time database

## Deployment

The application can be deployed to Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables
4. Deploy!

## License

MIT

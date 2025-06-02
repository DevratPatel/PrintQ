"use client";

import { QueueEntryForm } from "@/components/QueueEntryForm";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-black dark:to-blue-950" />

      {/* Content */}
      <main className="relative min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            {/* Title Section */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg sm:text-2xl font-medium text-[var(--foreground-secondary)] mb-1 sm:mb-2"
            >
              UTA Libraries
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-3 sm:mb-4 tracking-tight leading-tight"
            >
              Print & Design Studios
            </motion.h2>
          </motion.div>

          {/* Queue Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="px-2 sm:px-0"
          >
            <QueueEntryForm />
          </motion.div>

          {/* Quick Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 sm:mt-16 text-center px-4 sm:px-0"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-xl mx-auto">
              <div className="space-y-3 p-4 sm:p-0">
                <div className="w-12 h-12 sm:w-10 sm:h-10 mx-auto bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 sm:w-5 sm:h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] text-base sm:text-sm">
                  Quick & Easy
                </h3>
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  Enter your details and get your queue number instantly
                </p>
              </div>

              <div className="space-y-3 p-4 sm:p-0">
                <div className="w-12 h-12 sm:w-10 sm:h-10 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] text-base sm:text-sm">
                  Professional Service
                </h3>
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  Expert assistance with all your printing needs
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--glass-border)",
            color: "var(--foreground)",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "90vw",
            wordBreak: "break-word",
          },
          success: {
            iconTheme: {
              primary: "var(--success)",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--error)",
              secondary: "white",
            },
          },
        }}
      />
    </>
  );
}

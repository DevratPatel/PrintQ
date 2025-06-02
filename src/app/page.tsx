"use client";

import { QueueEntryForm } from "@/components/QueueEntryForm";
import { GlassCard } from "@/components/ui/GlassCard";
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

          {/* While You Wait Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mt-16 sm:mt-20"
          >
            <GlassCard variant="subtle" className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
                  While You Wait
                </h3>
                <p className="text-[var(--foreground-secondary)] text-sm sm:text-base">
                  Get your poster printing materials ready
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* File Preparation */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-[var(--foreground)] text-lg">
                      Prepare Your Files
                    </h4>
                  </div>

                  <div className="space-y-3 text-sm text-[var(--foreground-secondary)]">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <div>
                        <strong>Email Option:</strong> Send your poster to{" "}
                        <a
                          href="mailto:libraryprinting@uta.edu"
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          libraryprinting@uta.edu
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <div>
                        <strong>Flash Drive:</strong> Bring your files on a USB
                        drive
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <div>
                        <strong>Preferred Formats:</strong> PDF, JPEG, or PNG
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & MavID */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-orange-600 dark:text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-[var(--foreground)] text-lg">
                      Payment Ready
                    </h4>
                  </div>

                  <div className="space-y-3 text-sm text-[var(--foreground-secondary)]">
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <div>
                        <strong>Have your MavID ready</strong> with sufficient
                        funds
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <div>
                        <strong>Check Balance:</strong>{" "}
                        <a
                          href="https://get.cbord.com/uta/full/prelogin.php"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Manage your MavID account
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <div>
                        <strong>Add Funds:</strong> Use the link above if you
                        need to deposit money
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-center space-x-2 text-sm text-[var(--foreground-secondary)]">
                  <svg
                    className="w-4 h-4 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    <strong>Pro Tip:</strong> Having your files and payment
                    ready helps speed up the printing process!
                  </span>
                </div>
              </div>
            </GlassCard>
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

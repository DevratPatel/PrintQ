"use client";

import { DeskPanel } from "@/components/DeskPanel";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function Desk1Page() {
  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-black dark:to-blue-950" />

      {/* Content */}
      <div className="relative min-h-screen">
        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DeskPanel desk="desk1" />
          </motion.div>
        </main>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--glass-border)",
            color: "var(--foreground)",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
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

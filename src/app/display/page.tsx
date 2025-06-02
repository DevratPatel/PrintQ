"use client";

import { TVDisplay } from "@/components/TVDisplay";
import { motion } from "framer-motion";

export default function DisplayPage() {
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
            <TVDisplay />
          </motion.div>
        </main>
      </div>
    </>
  );
}

import { useQueue } from "@/hooks/useQueue";
import { GlassCard } from "./ui/GlassCard";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useState } from "react";

export const AdminPanel = () => {
  const { queue, resetQueue } = useQueue();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset the entire queue? This action cannot be undone."
      )
    ) {
      return;
    }
    setIsResetting(true);
    try {
      const success = await resetQueue();
      if (success) {
        toast.success("Queue has been reset");
      } else {
        toast.error("Failed to reset queue");
      }
    } catch (error) {
      toast.error("Failed to reset queue");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-8">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            Admin Queue Management
          </h1>
          <div className="mb-6">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResetting ? "Resetting..." : "Reset Queue"}
            </button>
          </div>
          <h2 className="text-xl font-semibold text-white mb-4">Full Queue</h2>
          <div className="space-y-4">
            {queue.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xl font-bold text-white block">
                      #{entry.queueNumber}
                    </span>
                    <p className="text-white/90">{entry.name}</p>
                    <p className="text-white/70 text-sm">
                      Student ID: {entry.studentId}
                    </p>
                    <p className="text-white/70 text-sm">
                      Desk:{" "}
                      {entry.desk
                        ? entry.desk === "desk1"
                          ? "Desk 1"
                          : "Desk 2"
                        : "Unassigned"}
                    </p>
                    <p className="text-white/70 text-sm">
                      Status: {entry.status}
                    </p>
                  </div>
                  <span className="text-white/50 text-sm">
                    {Math.round((Date.now() - entry.timestamp) / 60000)} min ago
                  </span>
                </div>
              </motion.div>
            ))}
            {queue.length === 0 && (
              <p className="text-white/70 text-center">No one in queue</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

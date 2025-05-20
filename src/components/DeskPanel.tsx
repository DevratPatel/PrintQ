import { useQueue } from "@/hooks/useQueue";
import { GlassCard } from "./ui/GlassCard";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useState } from "react";

interface DeskPanelProps {
  desk: "desk1" | "desk2";
}

export const DeskPanel = ({ desk }: DeskPanelProps) => {
  const {
    getServingForDesk,
    getWaitingQueue,
    callNextForDesk,
    completeServingForDesk,
    resetQueue,
  } = useQueue();
  const serving = getServingForDesk(desk);
  const waiting = getWaitingQueue();
  const [isResetting, setIsResetting] = useState(false);

  const handleNext = async () => {
    if (waiting.length === 0) {
      toast.error("No one in queue");
      return;
    }
    try {
      await callNextForDesk(desk);
      toast.success("Next customer called");
    } catch (error) {
      toast.error("Failed to update queue");
    }
  };

  const handleComplete = async () => {
    if (!serving) {
      toast.error("No one is currently being served");
      return;
    }
    try {
      await completeServingForDesk(desk);
      toast.success("Customer marked as completed");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

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
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            {desk === "desk1" ? "Desk 1" : "Desk 2"} Queue Management
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Current Status
              </h2>
              {serving ? (
                <GlassCard className="bg-white/20">
                  <p className="text-white/90 mb-2">Now Serving:</p>
                  <p className="text-2xl font-bold text-white mb-2">
                    #{serving.queueNumber}
                  </p>
                  <p className="text-white/90">{serving.name}</p>
                  <p className="text-white/70 text-sm">
                    Student ID: {serving.studentId}
                  </p>
                </GlassCard>
              ) : (
                <p className="text-white/70">
                  No one is currently being served
                </p>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Queue Actions
              </h2>
              <div className="space-y-4">
                <button
                  onClick={handleNext}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Call Next Customer
                </button>
                <button
                  onClick={handleComplete}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? "Resetting..." : "Reset Queue"}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-xl font-semibold text-white mb-4">
            Waiting Queue
          </h2>
          <div className="space-y-4">
            {waiting.map((entry) => (
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
                  </div>
                  <span className="text-white/50 text-sm">
                    {Math.round((Date.now() - entry.timestamp) / 60000)} min ago
                  </span>
                </div>
              </motion.div>
            ))}
            {waiting.length === 0 && (
              <p className="text-white/70 text-center">No one in queue</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

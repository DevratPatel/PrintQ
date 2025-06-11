import { useQueue } from "@/hooks/useQueue";
import { GlassCard } from "./ui/GlassCard";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useState } from "react";
import { FiTrash2, FiArrowLeft, FiArrowRight, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";

interface DeskPanelProps {
  desk: "desk1" | "desk2";
}

// Pagination component (same as AdminPanel, with clickable first/last page numbers)
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;
  const pageNumbers = [];
  let start = Math.max(0, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);
  if (currentPage === 0) end = Math.min(2, totalPages - 1);
  if (currentPage === totalPages - 1) start = Math.max(0, totalPages - 3);
  for (let i = start; i <= end; i++) pageNumbers.push(i);
  return (
    <div className="flex items-center gap-1 select-none">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Previous page"
      >
        <FiArrowLeft className="w-4 h-4" />
      </button>
      {start > 0 && (
        <button
          onClick={() => onPageChange(0)}
          className={`px-2 py-1 rounded ${
            0 === currentPage
              ? "bg-white/20 text-white font-bold"
              : "text-white/80 hover:bg-white/10"
          }`}
        >
          1
        </button>
      )}
      {start > 1 && <span className="px-1 text-white/60">...</span>}
      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-2 py-1 rounded ${
            num === currentPage
              ? "bg-white/20 text-white font-bold"
              : "text-white/80 hover:bg-white/10"
          }`}
        >
          {num + 1}
        </button>
      ))}
      {end < totalPages - 2 && <span className="px-1 text-white/60">...</span>}
      {end < totalPages - 1 && (
        <button
          onClick={() => onPageChange(totalPages - 1)}
          className={`px-2 py-1 rounded ${
            totalPages - 1 === currentPage
              ? "bg-white/20 text-white font-bold"
              : "text-white/80 hover:bg-white/10"
          }`}
        >
          {totalPages}
        </button>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Next page"
      >
        <FiArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export const DeskPanel = ({ desk }: DeskPanelProps) => {
  const {
    getServingForDesk,
    getWaitingQueue,
    callNextForDesk,
    completeServingForDesk,
    resetQueue,
    deleteFromQueue,
  } = useQueue();
  const { logout, user } = useAuth();
  const serving = getServingForDesk(desk);
  const waiting = getWaitingQueue();
  const [isResetting, setIsResetting] = useState(false);

  // Pagination state for waiting queue
  const [waitingPage, setWaitingPage] = useState(0);
  const jobsPerPage = 10;
  const totalPages = Math.ceil(waiting.length / jobsPerPage);
  const start = waitingPage * jobsPerPage;
  const end = start + jobsPerPage;
  const waitingPageEntries = waiting.slice(start, end);

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

  const handleDelete = async (entryId: string) => {
    if (
      !confirm("Are you sure you want to remove this person from the queue?")
    ) {
      return;
    }
    const success = await deleteFromQueue(entryId);
    if (success) {
      toast.success("Removed from queue");
    } else {
      toast.error("Failed to remove from queue");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {desk === "desk1" ? "Desk 1" : "Desk 2"} Queue Management
              </h1>
              {user && (
                <p className="text-white/50 text-sm mt-1">
                  Logged in as: {user.email}
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-colors border border-red-500/30"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Current Status
              </h2>
              {serving ? (
                <GlassCard className="bg-white/5">
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
                  className="w-full bg-red-500/40 hover:bg-red-500/60 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex justify-center mb-2">
            <Pagination
              currentPage={waitingPage}
              totalPages={totalPages}
              onPageChange={setWaitingPage}
            />
          </div>
          <div className="space-y-4">
            {waitingPageEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xl font-bold text-white">
                      #{entry.queueNumber}
                    </p>
                    <p className="text-white/90">{entry.name}</p>
                    <p className="text-white/70 text-sm">
                      Student ID: {entry.studentId}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Remove from queue"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
            {waiting.length === 0 && (
              <p className="text-white/70">No one in waiting queue</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

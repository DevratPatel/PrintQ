import { useQueue } from "@/hooks/useQueue";
import { GlassCard } from "./ui/GlassCard";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiTrash2, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useState } from "react";

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

export const Desk2 = () => {
  const {
    getServingForDesk,
    getWaitingQueue,
    callNextForDesk,
    completeServingForDesk,
    deleteFromQueue,
  } = useQueue();
  const serving = getServingForDesk("desk2");
  const waiting = getWaitingQueue();

  // Pagination state for waiting queue
  const [waitingPage, setWaitingPage] = useState(0);
  const jobsPerPage = 10;
  const totalPages = Math.ceil(waiting.length / jobsPerPage);
  const start = waitingPage * jobsPerPage;
  const end = start + jobsPerPage;
  const waitingPageEntries = waiting.slice(start, end);

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
          <h2 className="text-2xl font-bold text-white mb-6">Desk 2</h2>
          <div className="space-y-6">
            {/* Currently Serving */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Currently Serving
              </h3>
              {serving ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        #{serving.queueNumber}
                      </p>
                      <p className="text-white/90">{serving.name}</p>
                      <p className="text-white/70 text-sm">
                        Student ID: {serving.studentId}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(serving.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Remove from queue"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => completeServingForDesk("desk2")}
                    className="mt-4 w-full bg-green-500/40 hover:bg-green-500/60 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Complete Service
                  </button>
                </motion.div>
              ) : (
                <p className="text-white/70">No one currently being served</p>
              )}
            </div>

            {/* Waiting Queue */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Waiting Queue
              </h3>
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
            </div>

            {/* Call Next Button */}
            <button
              onClick={() => callNextForDesk("desk2")}
              disabled={waiting.length === 0}
              className="w-full bg-blue-500/40 hover:bg-blue-500/60 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Call Next
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

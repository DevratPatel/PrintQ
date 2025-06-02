import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import {
  FiTrash2,
  FiSearch,
  FiUsers,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import type { QueueEntry } from "@/types/queue";

interface QueueManagementComponentProps {
  queue: QueueEntry[];
  deleteFromQueue: (entryId: string) => Promise<boolean>;
}

// Pagination component
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

// Search and Filter Component
const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  deskFilter,
  onDeskFilterChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  deskFilter: string;
  onDeskFilterChange: (value: string) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name or student ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500/50 focus:outline-none"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
      >
        <option value="">All Status</option>
        <option value="waiting">Waiting</option>
        <option value="serving">Serving</option>
        <option value="completed">Completed</option>
      </select>
      <select
        value={deskFilter}
        onChange={(e) => onDeskFilterChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
      >
        <option value="">All Desks</option>
        <option value="desk1">Desk 1</option>
        <option value="desk2">Desk 2</option>
      </select>
    </div>
  );
};

export const QueueManagementComponent = ({
  queue,
  deleteFromQueue,
}: QueueManagementComponentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deskFilter, setDeskFilter] = useState("");
  const [currentQueuePage, setCurrentQueuePage] = useState(0);
  const jobsPerPage = 10;

  const handleDelete = async (entryId: string) => {
    if (
      !confirm("Are you sure you want to remove this person from the queue?")
    ) {
      return;
    }
    const success = await deleteFromQueue(entryId);
    if (success) {
      // Toast notification would be handled in parent component
    }
  };

  // Filter queue based on search and filters
  const filteredQueue = queue.filter((entry) => {
    const matchesSearch =
      searchTerm === "" ||
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || entry.status === statusFilter;
    const matchesDesk = deskFilter === "" || entry.desk === deskFilter;
    return matchesSearch && matchesStatus && matchesDesk;
  });

  // Current Queue Sorting: serving -> waiting -> completed
  const statusPriority = (status: string) => {
    if (status === "serving") return 0;
    if (status === "waiting") return 1;
    return 2; // completed or any other
  };
  const sortedQueue = [...filteredQueue].sort((a, b) => {
    const pA = statusPriority(a.status);
    const pB = statusPriority(b.status);
    if (pA !== pB) return pA - pB;
    // If same status, sort by queueNumber ascending
    return (a.queueNumber || 0) - (b.queueNumber || 0);
  });

  // Current Queue Pagination
  const currentQueueTotalPages = Math.ceil(sortedQueue.length / jobsPerPage);
  const currentQueueStart = currentQueuePage * jobsPerPage;
  const currentQueueEnd = currentQueueStart + jobsPerPage;
  const currentQueueJobs = sortedQueue.slice(
    currentQueueStart,
    currentQueueEnd
  );

  return (
    <div className="space-y-6">
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        deskFilter={deskFilter}
        onDeskFilterChange={setDeskFilter}
      />

      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Current Queue ({filteredQueue.length})
          </h2>
          <Pagination
            currentPage={currentQueuePage}
            totalPages={currentQueueTotalPages}
            onPageChange={setCurrentQueuePage}
          />
        </div>

        <div className="space-y-4">
          {currentQueueJobs.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-2xl font-bold text-white">
                      #{entry.queueNumber}
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {entry.name}
                      </p>
                      <p className="text-sm text-white/70">
                        ID: {entry.studentId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.status === "serving"
                          ? "bg-green-500/20 text-green-300"
                          : entry.status === "waiting"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {entry.status.toUpperCase()}
                    </span>
                    <span className="text-white/70">
                      Desk:{" "}
                      {entry.desk
                        ? entry.desk === "desk1"
                          ? "1"
                          : "2"
                        : "Unassigned"}
                    </span>
                    <span className="text-white/70">
                      {Math.round((Date.now() - entry.timestamp) / 60000)}m ago
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                  title="Remove from queue"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
          {currentQueueJobs.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-lg">No queue entries found</p>
              <p className="text-white/50 text-sm">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

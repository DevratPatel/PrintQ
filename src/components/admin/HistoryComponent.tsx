import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import {
  FiSearch,
  FiDownload,
  FiTrash2,
  FiEdit2,
  FiArrowLeft,
  FiArrowRight,
  FiBarChart,
  FiUsers,
} from "react-icons/fi";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import type { QueueHistory } from "@/types/admin";

interface HistoryComponentProps {
  pastJobs: QueueHistory[];
  setPastJobs: React.Dispatch<React.SetStateAction<QueueHistory[]>>;
  setEditingJob: (job: QueueHistory | null) => void;
  formatTime: (timestamp: number) => string;
  formatDate: (timestamp: number) => string;
  recentJobsPage: number;
  setRecentJobsPage: (page: number) => void;
  jobsPerPage: number;
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

export const HistoryComponent = ({
  pastJobs,
  setPastJobs,
  setEditingJob,
  formatTime,
  formatDate,
  recentJobsPage,
  setRecentJobsPage,
  jobsPerPage,
}: HistoryComponentProps) => {
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyDeskFilter, setHistoryDeskFilter] = useState("");
  const [historySortField, setHistorySortField] =
    useState<keyof QueueHistory>("completionTime");
  const [historySortDirection, setHistorySortDirection] = useState<
    "asc" | "desc"
  >("desc");
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");
  const [quickFilter, setQuickFilter] = useState<
    "all" | "today" | "yesterday" | "week" | "month"
  >("all");

  // Quick filter logic
  const getQuickFilterDates = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case "today":
        return {
          start: today.getTime(),
          end: today.getTime() + 24 * 60 * 60 * 1000,
        };
      case "yesterday":
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday.getTime(),
          end: today.getTime(),
        };
      case "week":
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
          start: weekStart.getTime(),
          end: now.getTime(),
        };
      case "month":
        const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
          start: monthStart.getTime(),
          end: now.getTime(),
        };
      default:
        return null;
    }
  };

  // Filter and sort history data
  const filteredHistory = pastJobs
    .filter((job) => {
      const matchesSearch =
        historySearchTerm === "" ||
        job.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        job.studentId.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        job.queueNumber?.toString().includes(historySearchTerm);

      const matchesDesk =
        historyDeskFilter === "" || job.desk === historyDeskFilter;

      // Quick filter date logic
      const quickFilterDates = getQuickFilterDates(quickFilter);
      const matchesQuickFilter =
        !quickFilterDates ||
        (job.completionTime >= quickFilterDates.start &&
          job.completionTime <= quickFilterDates.end);

      return matchesSearch && matchesDesk && matchesQuickFilter;
    })
    .sort((a, b) => {
      const aValue = a[historySortField];
      const bValue = b[historySortField];
      const direction = historySortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction;
      }
      return String(aValue).localeCompare(String(bValue)) * direction;
    });

  // Calculate filtered statistics
  const filteredStats = {
    totalJobs: filteredHistory.length,
    totalWaitTime: filteredHistory.reduce((sum, job) => sum + job.waitTime, 0),
    totalServiceTime: filteredHistory.reduce(
      (sum, job) => sum + job.serviceTime,
      0
    ),
    avgWaitTime:
      filteredHistory.length > 0
        ? Math.round(
            filteredHistory.reduce((sum, job) => sum + job.waitTime, 0) /
              filteredHistory.length
          )
        : 0,
    avgServiceTime:
      filteredHistory.length > 0
        ? Math.round(
            filteredHistory.reduce((sum, job) => sum + job.serviceTime, 0) /
              filteredHistory.length
          )
        : 0,
    longestWait:
      filteredHistory.length > 0
        ? Math.max(...filteredHistory.map((job) => job.waitTime))
        : 0,
    shortestWait:
      filteredHistory.length > 0
        ? Math.min(...filteredHistory.map((job) => job.waitTime))
        : 0,
  };

  const handleSort = (field: keyof QueueHistory) => {
    if (historySortField === field) {
      setHistorySortDirection(historySortDirection === "asc" ? "desc" : "asc");
    } else {
      setHistorySortField(field);
      setHistorySortDirection("desc");
    }
  };

  const handleSelectJob = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedJobs.size === filteredHistory.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredHistory.map((job) => job.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobs.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedJobs.size} selected records? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // Delete selected jobs from Firebase
      const deletePromises = Array.from(selectedJobs).map(async (jobId) => {
        if (jobId) {
          await deleteDoc(doc(db, "queueHistory", jobId));
        }
      });

      await Promise.all(deletePromises);

      // Update local state
      setPastJobs((prev) => prev.filter((job) => !selectedJobs.has(job.id)));
      setSelectedJobs(new Set());

      toast.success(`Successfully deleted ${selectedJobs.size} records`);
    } catch (error) {
      console.error("Error deleting records:", error);
      toast.error("Failed to delete some records");
    }
  };

  const exportFilteredData = () => {
    const dataToExport = filteredHistory.map((job) => ({
      queueNumber: job.queueNumber,
      name: job.name,
      studentId: job.studentId,
      desk: job.desk === "desk1" ? "Desk 1" : "Desk 2",
      waitTime: job.waitTime,
      serviceTime: job.serviceTime,
      date: new Date(job.completionTime).toLocaleDateString(),
      time: new Date(job.completionTime).toLocaleTimeString(),
      efficiency: Math.round(
        (job.serviceTime / (job.waitTime + job.serviceTime)) * 100
      ),
    }));

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(","),
      ...dataToExport.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `queue-history-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("History data exported successfully");
  };

  // Pagination calculations
  const recentJobsStart = recentJobsPage * jobsPerPage;
  const recentJobsEnd = recentJobsStart + jobsPerPage;

  return (
    <div className="space-y-6">
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All Time", icon: "📅" },
          { key: "today", label: "Today", icon: "📍" },
          { key: "yesterday", label: "Yesterday", icon: "⏮" },
          { key: "week", label: "This Week", icon: "📊" },
          { key: "month", label: "This Month", icon: "📈" },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setQuickFilter(filter.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              quickFilter === filter.key
                ? "bg-blue-500 text-white"
                : "bg-white/5 text-white/80 hover:bg-white/10"
            }`}
          >
            <span>{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <GlassCard className="bg-gradient-to-br from-blue-500/20 to-blue-600/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {filteredStats.totalJobs}
            </p>
            <p className="text-sm text-blue-300">Total Records</p>
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-green-500/20 to-green-600/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {filteredStats.avgWaitTime}m
            </p>
            <p className="text-sm text-green-300">Avg Wait Time</p>
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {filteredStats.avgServiceTime}m
            </p>
            <p className="text-sm text-yellow-300">Avg Service Time</p>
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-red-500/20 to-red-600/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {filteredStats.longestWait}m
            </p>
            <p className="text-sm text-red-300">Longest Wait</p>
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-purple-500/20 to-purple-600/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {filteredStats.shortestWait}m
            </p>
            <p className="text-sm text-purple-300">Shortest Wait</p>
          </div>
        </GlassCard>
      </div>

      {/* Advanced Search and Filters */}
      <GlassCard>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, student ID, or queue number..."
              value={historySearchTerm}
              onChange={(e) => setHistorySearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <select
            value={historyDeskFilter}
            onChange={(e) => setHistoryDeskFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
          >
            <option value="">All Desks</option>
            <option value="desk1">Desk 1</option>
            <option value="desk2">Desk 2</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "timeline" : "table")
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors"
            >
              {viewMode === "table" ? (
                <FiBarChart className="w-4 h-4" />
              ) : (
                <FiUsers className="w-4 h-4" />
              )}
              {viewMode === "table" ? "Timeline View" : "Table View"}
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedJobs.size > 0 && (
          <div className="flex items-center justify-between p-4 mb-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <span className="text-blue-300">
              {selectedJobs.size} record{selectedJobs.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={exportFilteredData}
                className="flex items-center gap-2 px-3 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Export Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedJobs.size === filteredHistory.length &&
                      filteredHistory.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-white/20 bg-white/5"
                  />
                </th>
                {[
                  { field: "queueNumber", label: "Queue #" },
                  { field: "name", label: "Name" },
                  { field: "studentId", label: "Student ID" },
                  { field: "desk", label: "Desk" },
                  { field: "waitTime", label: "Wait Time" },
                  { field: "serviceTime", label: "Service Time" },
                  { field: "completionTime", label: "Completed" },
                ].map((col) => (
                  <th key={col.field} className="text-left p-3">
                    <button
                      onClick={() =>
                        handleSort(col.field as keyof QueueHistory)
                      }
                      className="flex items-center gap-1 text-white/80 hover:text-white font-medium"
                    >
                      {col.label}
                      {historySortField === col.field && (
                        <span className="text-blue-400">
                          {historySortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                ))}
                <th className="text-left p-3 text-white/80 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory
                .slice(recentJobsStart, recentJobsEnd)
                .map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedJobs.has(job.id)}
                        onChange={() => handleSelectJob(job.id)}
                        className="rounded border-white/20 bg-white/5"
                      />
                    </td>
                    <td className="p-3 text-white font-mono">
                      #{job.queueNumber}
                    </td>
                    <td className="p-3 text-white font-medium">{job.name}</td>
                    <td className="p-3 text-white/80 font-mono text-sm">
                      {job.studentId}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          job.desk === "desk1"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-green-500/20 text-green-300"
                        }`}
                      >
                        {job.desk === "desk1" ? "Desk 1" : "Desk 2"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-sm font-medium ${
                          job.waitTime <= 10
                            ? "text-green-400"
                            : job.waitTime <= 20
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {job.waitTime}m
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-sm font-medium ${
                          job.serviceTime <= 5
                            ? "text-green-400"
                            : job.serviceTime <= 10
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {job.serviceTime}m
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div className="text-white">
                          {formatDate(job.completionTime)}
                        </div>
                        <div className="text-white/60">
                          {formatTime(job.completionTime)}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingJob(job)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit record"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-white/70">
            Showing {recentJobsStart + 1} to{" "}
            {Math.min(recentJobsEnd, filteredHistory.length)} of{" "}
            {filteredHistory.length} records
          </div>
          <Pagination
            currentPage={recentJobsPage}
            totalPages={Math.ceil(filteredHistory.length / jobsPerPage)}
            onPageChange={setRecentJobsPage}
          />
        </div>
      </GlassCard>

      {/* Export Options */}
      <div className="flex justify-end gap-3">
        <button
          onClick={exportFilteredData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Export Filtered Data (CSV)
        </button>
      </div>
    </div>
  );
};

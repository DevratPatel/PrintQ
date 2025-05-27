import { useQueue } from "@/hooks/useQueue";
import { GlassCard } from "./ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { QueueHistory } from "@/types/queue";
import { FiEdit2, FiTrash2, FiArrowLeft, FiArrowRight } from "react-icons/fi";

type DateRange = {
  start: string;
  end: string;
};

type EditModalProps = {
  job: QueueHistory;
  onClose: () => void;
  onSave: (updatedJob: QueueHistory) => Promise<void>;
};

const EditModal = ({ job, onClose, onSave }: EditModalProps) => {
  const [editedJob, setEditedJob] = useState<QueueHistory>(job);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedJob);
      toast.success("Job updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update job");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNumberChange = (field: keyof QueueHistory, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value);
    if (!isNaN(numValue)) {
      setEditedJob((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold text-white mb-4">
          Edit Job Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Queue Number
            </label>
            <input
              type="number"
              value={editedJob.queueNumber || ""}
              onChange={(e) =>
                handleNumberChange("queueNumber", e.target.value)
              }
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Name
            </label>
            <input
              type="text"
              value={editedJob.name}
              onChange={(e) =>
                setEditedJob((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Desk
            </label>
            <select
              value={editedJob.desk}
              onChange={(e) =>
                setEditedJob((prev) => ({
                  ...prev,
                  desk: e.target.value as "desk1" | "desk2",
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="desk1">Desk 1</option>
              <option value="desk2">Desk 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Wait Time (minutes)
            </label>
            <input
              type="number"
              value={editedJob.waitTime || ""}
              onChange={(e) => handleNumberChange("waitTime", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Service Time (minutes)
            </label>
            <input
              type="number"
              value={editedJob.serviceTime || ""}
              onChange={(e) =>
                handleNumberChange("serviceTime", e.target.value)
              }
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

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

export const AdminPanel = () => {
  const { queue, deleteFromQueue, resetQueue } = useQueue();
  const [isResetting, setIsResetting] = useState(false);
  const [editingJob, setEditingJob] = useState<QueueHistory | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [pastJobs, setPastJobs] = useState<QueueHistory[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalJobs: number;
    averageWaitTime: number;
    averageServiceTime: number;
    jobsByDesk: { desk1: number; desk2: number };
    dailyStats: {
      [key: string]: { count: number; avgWait: number; avgService: number };
    };
    hourlyStats: { [key: string]: { count: number; avgWait: number } };
    peakHours: { hour: string; count: number }[];
    longestWait: { name: string; waitTime: number; date: string };
    busiestDay: { date: string; count: number };
  }>({
    totalJobs: 0,
    averageWaitTime: 0,
    averageServiceTime: 0,
    jobsByDesk: { desk1: 0, desk2: 0 },
    dailyStats: {},
    hourlyStats: {},
    peakHours: [],
    longestWait: { name: "", waitTime: 0, date: "" },
    busiestDay: { date: "", count: 0 },
  });
  const [currentQueuePage, setCurrentQueuePage] = useState(0);
  const [recentJobsPage, setRecentJobsPage] = useState(0);
  const jobsPerPage = 10;

  // Current Queue Sorting: serving -> waiting -> completed
  const statusPriority = (status: string) => {
    if (status === "serving") return 0;
    if (status === "waiting") return 1;
    return 2; // completed or any other
  };
  const sortedQueue = [...queue].sort((a, b) => {
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

  // Recent Jobs Pagination
  const recentJobsTotalPages = Math.ceil(pastJobs.length / jobsPerPage);
  const recentJobsStart = recentJobsPage * jobsPerPage;
  const recentJobsEnd = recentJobsStart + jobsPerPage;
  const recentJobs = pastJobs.slice(recentJobsStart, recentJobsEnd);

  const fetchAnalytics = async () => {
    const historyRef = collection(db, "queueHistory");
    let q = query(
      historyRef,
      where("completionTime", ">=", new Date(dateRange.start).getTime()),
      where(
        "completionTime",
        "<=",
        new Date(dateRange.end).getTime() + 24 * 60 * 60 * 1000
      ),
      orderBy("completionTime", "desc")
    );

    try {
      const snapshot = await getDocs(q);
      const history: QueueHistory[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          queueNumber: data.queueNumber,
          name: data.name,
          studentId: data.studentId,
          desk: data.desk,
          startTime: data.startTime,
          completionTime: data.completionTime,
          waitTime: data.waitTime,
          serviceTime: data.serviceTime,
          date: data.date,
        });
      });

      // Set past jobs
      setPastJobs(history);

      // Calculate statistics
      const totalJobs = history.length;
      const totalWaitTime = history.reduce((acc, job) => acc + job.waitTime, 0);
      const totalServiceTime = history.reduce(
        (acc, job) => acc + job.serviceTime,
        0
      );
      const jobsByDesk = {
        desk1: history.filter((job) => job.desk === "desk1").length,
        desk2: history.filter((job) => job.desk === "desk2").length,
      };

      // Calculate daily statistics
      const dailyStats: {
        [key: string]: { count: number; avgWait: number; avgService: number };
      } = {};
      const hourlyStats: { [key: string]: { count: number; avgWait: number } } =
        {};

      history.forEach((job) => {
        const date = new Date(job.completionTime).toISOString().split("T")[0];
        const hour =
          new Date(job.completionTime).getHours().toString().padStart(2, "0") +
          ":00";

        // Daily stats
        if (!dailyStats[date]) {
          dailyStats[date] = { count: 0, avgWait: 0, avgService: 0 };
        }
        dailyStats[date].count++;
        dailyStats[date].avgWait += job.waitTime;
        dailyStats[date].avgService += job.serviceTime;

        // Hourly stats
        if (!hourlyStats[hour]) {
          hourlyStats[hour] = { count: 0, avgWait: 0 };
        }
        hourlyStats[hour].count++;
        hourlyStats[hour].avgWait += job.waitTime;
      });

      // Calculate averages and find peak hours
      Object.keys(dailyStats).forEach((date) => {
        dailyStats[date].avgWait = Math.round(
          dailyStats[date].avgWait / dailyStats[date].count
        );
        dailyStats[date].avgService = Math.round(
          dailyStats[date].avgService / dailyStats[date].count
        );
      });

      Object.keys(hourlyStats).forEach((hour) => {
        hourlyStats[hour].avgWait = Math.round(
          hourlyStats[hour].avgWait / hourlyStats[hour].count
        );
      });

      // Find peak hours
      const peakHours = Object.entries(hourlyStats)
        .map(([hour, stats]) => ({ hour, count: stats.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Find longest wait
      const longestWait = history.reduce(
        (max, job) =>
          job.waitTime > max.waitTime
            ? { name: job.name, waitTime: job.waitTime, date: job.date }
            : max,
        { name: "", waitTime: 0, date: "" }
      );

      // Find busiest day
      const busiestDay = Object.entries(dailyStats).reduce(
        (max, [date, stats]) =>
          stats.count > max.count ? { date, count: stats.count } : max,
        { date: "", count: 0 }
      );

      setAnalytics({
        totalJobs,
        averageWaitTime: Math.round(totalWaitTime / totalJobs) || 0,
        averageServiceTime: Math.round(totalServiceTime / totalJobs) || 0,
        jobsByDesk,
        dailyStats,
        hourlyStats,
        peakHours,
        longestWait,
        busiestDay,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch job history");
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEditJob = async (updatedJob: QueueHistory) => {
    if (!updatedJob.id) {
      toast.error("Invalid job ID");
      return;
    }

    try {
      const jobRef = doc(db, "queueHistory", updatedJob.id);

      // First check if the document exists
      const docSnap = await getDoc(jobRef);
      if (!docSnap.exists()) {
        toast.error("Job not found in database");
        return;
      }

      const jobData = {
        queueNumber: updatedJob.queueNumber,
        name: updatedJob.name,
        desk: updatedJob.desk,
        waitTime: updatedJob.waitTime,
        serviceTime: updatedJob.serviceTime,
        completionTime: updatedJob.completionTime,
        date: updatedJob.date,
        studentId: updatedJob.studentId,
        startTime: updatedJob.startTime,
      };

      await updateDoc(jobRef, jobData);

      // Update local state
      setPastJobs((prev) =>
        prev.map((job) =>
          job.id === updatedJob.id ? { ...job, ...jobData } : job
        )
      );

      // Refresh analytics
      fetchAnalytics();
      toast.success("Job updated successfully");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job. Please try again.");
      throw error;
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
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Admin Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Current Queue */}
          <div className="lg:col-span-1">
            <GlassCard className="h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Current Queue
                </h2>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="bg-red-500/40 hover:bg-red-500/60 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? "Resetting..." : "Reset Queue"}
                </button>
              </div>
              <div className="flex justify-center mb-4">
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
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-white/50 text-sm">
                          {Math.round((Date.now() - entry.timestamp) / 60000)}{" "}
                          min ago
                        </span>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="flex items-center justify-center w-10 h-10 rounded bg-red-500/40 hover:bg-red-500/60 text-white transition-colors"
                          title="Remove from queue"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {queue.length === 0 && (
                  <p className="text-white/70 text-center">No one in queue</p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Analytics and History */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassCard className="bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Total Jobs
                </h3>
                <p className="text-3xl font-bold text-white">
                  {analytics.totalJobs}
                </p>
              </GlassCard>
              <GlassCard className="bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Avg Wait Time
                </h3>
                <p className="text-3xl font-bold text-white">
                  {analytics.averageWaitTime}m
                </p>
              </GlassCard>
              <GlassCard className="bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Avg Service Time
                </h3>
                <p className="text-3xl font-bold text-white">
                  {analytics.averageServiceTime}m
                </p>
              </GlassCard>
              <GlassCard className="bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Busiest Day
                </h3>
                <p className="text-xl font-bold text-white">
                  {analytics.busiestDay.date}
                </p>
                <p className="text-white/70">
                  {analytics.busiestDay.count} jobs
                </p>
              </GlassCard>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="bg-white/5">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Jobs by Desk
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/90">Desk 1</span>
                    <span className="text-white font-bold">
                      {analytics.jobsByDesk.desk1} jobs
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/90">Desk 2</span>
                    <span className="text-white font-bold">
                      {analytics.jobsByDesk.desk2} jobs
                    </span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="bg-white/5">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Peak Hours
                </h2>
                <div className="space-y-2">
                  {analytics.peakHours.map(({ hour, count }) => (
                    <div
                      key={hour}
                      className="flex justify-between items-center"
                    >
                      <span className="text-white/90">{hour}</span>
                      <span className="text-white font-bold">{count} jobs</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Recent Jobs */}
            <GlassCard className="bg-white/5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Recent Jobs
                </h2>
                <Pagination
                  currentPage={recentJobsPage}
                  totalPages={recentJobsTotalPages}
                  onPageChange={setRecentJobsPage}
                />
              </div>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1x md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4">
                      <div>
                        <p className="text-white/70 text-sm">Queue Number</p>
                        <p className="text-white font-bold">
                          #{job.queueNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm">Name</p>
                        <p className="text-white font-bold">{job.name}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm">Time</p>
                        <p className="text-white font-bold">
                          {formatTime(job.completionTime)}
                        </p>
                        <p className="text-white/90 text-sm">
                          {formatDate(job.completionTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm">Details</p>
                        <div className="flex flex-col">
                          <p className="text-white font-bold">
                            Desk {job.desk === "desk1" ? "1" : "2"}
                          </p>
                          <p className="text-white/90 text-sm">
                            Wait: {job.waitTime}m
                          </p>
                          <p className="text-white/90 text-sm">
                            Service: {job.serviceTime}m
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 justify-center">
                        <button
                          onClick={() => setEditingJob(job)}
                          className="flex items-center justify-center w-10 h-10 rounded bg-blue-500/40 hover:bg-blue-500/60 text-white transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="flex items-center justify-center w-10 h-10 rounded bg-red-500/40 hover:bg-red-500/60 text-white transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {pastJobs.length === 0 && (
                  <p className="text-white/70 text-center">
                    No past jobs found for the selected date range
                  </p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingJob && (
          <EditModal
            job={editingJob}
            onClose={() => setEditingJob(null)}
            onSave={handleEditJob}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

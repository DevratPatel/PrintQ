import { useQueue } from "@/hooks/useQueue";
import { GlassCard } from "./ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
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
import {
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiSettings,
  FiFilter,
  FiEye,
  FiBarChart,
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type DateRange = {
  start: string;
  end: string;
};

type EditModalProps = {
  job: QueueHistory;
  onClose: () => void;
  onSave: (updatedJob: QueueHistory) => Promise<void>;
};

type ViewMode = "overview" | "queue" | "analytics" | "history" | "settings";

// Custom Dark Date Picker Component
const DatePicker = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (date: string) => void;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = value ? new Date(value) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update currentMonth when value changes from outside
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [value]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const dateString = newDate.toISOString().split("T")[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const today = new Date();
    const selectedDateObj = value ? new Date(value) : null;

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-12 h-12" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isToday =
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();

      const isSelected =
        selectedDateObj &&
        dayDate.getDate() === selectedDateObj.getDate() &&
        dayDate.getMonth() === selectedDateObj.getMonth() &&
        dayDate.getFullYear() === selectedDateObj.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`w-12 h-12 rounded-lg text-sm font-medium transition-colors ${
            isSelected
              ? "bg-blue-500 text-white"
              : isToday
              ? "bg-white/20 text-white"
              : "text-white/80 hover:bg-white/10"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <label className="block text-sm font-medium text-white mb-1">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 gap-5 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span>{formatDisplayDate(value)}</span>
        <FiCalendar className="w-4 h-4 text-white/70" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-50 mt-2 p-4 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl min-w-[320px]"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-white font-medium text-lg">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="w-12 h-8 text-sm text-white/60 text-center flex items-center justify-center font-semibold"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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

// Navigation Tabs Component
const NavigationTabs = ({
  currentView,
  onViewChange,
}: {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}) => {
  const tabs = [
    { id: "overview", label: "Overview", icon: FiBarChart },
    { id: "queue", label: "Queue Management", icon: FiUsers },
    { id: "analytics", label: "Analytics", icon: FiTrendingUp },
    { id: "history", label: "History", icon: FiClock },
    { id: "settings", label: "Settings", icon: FiSettings },
  ] as const;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === tab.id
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({
  onRefresh,
  onExport,
  onResetQueue,
  isLoading,
}: {
  onRefresh: () => void;
  onExport: () => void;
  onResetQueue: () => void;
  isLoading: boolean;
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors disabled:opacity-50"
      >
        <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        Refresh
      </button>
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-colors"
      >
        <FiDownload className="w-4 h-4" />
        Export Data
      </button>
      <button
        onClick={onResetQueue}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
      >
        <FiTrash2 className="w-4 h-4" />
        Reset Queue
      </button>
    </div>
  );
};

export const AdminPanel = () => {
  const { queue, deleteFromQueue, resetQueue } = useQueue();
  const [currentView, setCurrentView] = useState<ViewMode>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deskFilter, setDeskFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  // Add missing functions from original implementation
  const [currentQueuePage, setCurrentQueuePage] = useState(0);
  const [recentJobsPage, setRecentJobsPage] = useState(0);
  const jobsPerPage = 10;

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
    setIsLoading(true);
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
      setIsLoading(false);
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

  const handleRefresh = () => {
    setIsLoading(true);
    fetchAnalytics().finally(() => setIsLoading(false));
  };

  const handleExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 20;

    // Helper function to add text
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      doc.setFontSize(options.fontSize || 12);
      doc.setFont(options.font || "helvetica", options.style || "normal");
      if (options.color) {
        if (Array.isArray(options.color)) {
          doc.setTextColor(
            options.color[0],
            options.color[1],
            options.color[2]
          );
        } else {
          doc.setTextColor(options.color);
        }
      } else {
        doc.setTextColor(0, 0, 0);
      }
      doc.text(text, x, y);
    };

    // Header
    addText("Queue Management System Report", margin, yPosition, {
      fontSize: 20,
      style: "bold",
      color: [0, 102, 204],
    });
    yPosition += 10;

    addText(
      `Generated on: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      margin,
      yPosition,
      {
        fontSize: 10,
        color: [100, 100, 100],
      }
    );
    yPosition += 10;

    addText(
      `Date Range: ${new Date(
        dateRange.start
      ).toLocaleDateString()} - ${new Date(
        dateRange.end
      ).toLocaleDateString()}`,
      margin,
      yPosition,
      {
        fontSize: 10,
        color: [100, 100, 100],
      }
    );
    yPosition += 20;

    // Summary Statistics
    addText("Summary Statistics", margin, yPosition, {
      fontSize: 16,
      style: "bold",
      color: [0, 102, 204],
    });
    yPosition += 15;

    const statsData = [
      ["Current Queue Size", queue.length.toString()],
      [
        "Currently Serving",
        queue.filter((e) => e.status === "serving").length.toString(),
      ],
      ["Total Jobs Completed", analytics.totalJobs.toString()],
      ["Average Wait Time", `${analytics.averageWaitTime} minutes`],
      ["Average Service Time", `${analytics.averageServiceTime} minutes`],
      ["Jobs at Desk 1", analytics.jobsByDesk.desk1.toString()],
      ["Jobs at Desk 2", analytics.jobsByDesk.desk2.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: statsData,
      theme: "grid",
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Current Queue Status
    if (queue.length > 0) {
      addText("Current Queue Status", margin, yPosition, {
        fontSize: 16,
        style: "bold",
        color: [0, 102, 204],
      });
      yPosition += 15;

      const currentQueueData = sortedQueue
        .slice(0, 20)
        .map((entry) => [
          `#${entry.queueNumber}`,
          entry.name,
          entry.studentId,
          entry.status.toUpperCase(),
          entry.desk
            ? entry.desk === "desk1"
              ? "Desk 1"
              : "Desk 2"
            : "Unassigned",
          `${Math.round((Date.now() - entry.timestamp) / 60000)}m ago`,
        ]);

      autoTable(doc, {
        startY: yPosition,
        head: [
          ["Queue #", "Name", "Student ID", "Status", "Desk", "Time in Queue"],
        ],
        body: currentQueueData,
        theme: "grid",
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Recent Completed Jobs
    if (pastJobs.length > 0) {
      addText("Recent Completed Jobs (Last 15)", margin, yPosition, {
        fontSize: 16,
        style: "bold",
        color: [0, 102, 204],
      });
      yPosition += 15;

      const recentJobsData = pastJobs.slice(0, 15).map((job) => [
        `#${job.queueNumber}`,
        job.name,
        job.desk === "desk1" ? "Desk 1" : "Desk 2",
        `${job.waitTime}m`,
        `${job.serviceTime}m`,
        new Date(job.completionTime).toLocaleDateString(),
        new Date(job.completionTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            "Queue #",
            "Name",
            "Desk",
            "Wait Time",
            "Service Time",
            "Date",
            "Time",
          ],
        ],
        body: recentJobsData,
        theme: "grid",
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Peak Hours Analysis
    if (analytics.peakHours.length > 0) {
      // Check if we need a new page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      addText("Peak Hours Analysis", margin, yPosition, {
        fontSize: 16,
        style: "bold",
        color: [0, 102, 204],
      });
      yPosition += 15;

      const peakHoursData = analytics.peakHours.map((peak, index) => [
        `${index + 1}`,
        peak.hour,
        peak.count.toString(),
        `${Math.round((peak.count / analytics.totalJobs) * 100)}%`,
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Rank", "Hour", "Jobs Completed", "Percentage"]],
        body: peakHoursData,
        theme: "grid",
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: margin, right: margin },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Footer
    const pageCount = (doc as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addText(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin - 30,
        doc.internal.pageSize.height - 10,
        {
          fontSize: 8,
          color: [150, 150, 150],
        }
      );
      addText(
        "Generated by Queue Management System",
        margin,
        doc.internal.pageSize.height - 10,
        {
          fontSize: 8,
          color: [150, 150, 150],
        }
      );
    }

    // Save the PDF
    const fileName = `queue-report-${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
    toast.success("PDF report generated successfully");
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Live Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="bg-gradient-to-br from-blue-500/20 to-blue-600/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/80">
                Current Queue
              </h3>
              <p className="text-2xl font-bold text-white">{queue.length}</p>
            </div>
            <FiUsers className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-green-500/20 to-green-600/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/80">Serving Now</h3>
              <p className="text-2xl font-bold text-white">
                {queue.filter((e) => e.status === "serving").length}
              </p>
            </div>
            <FiEye className="w-8 h-8 text-green-400" />
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/80">
                Avg Wait Time
              </h3>
              <p className="text-2xl font-bold text-white">
                {analytics.averageWaitTime}m
              </p>
            </div>
            <FiClock className="w-8 h-8 text-yellow-400" />
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-purple-500/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/80">
                Total Served
              </h3>
              <p className="text-2xl font-bold text-white">
                {analytics.totalJobs}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </GlassCard>
      </div>

      {/* Current Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">
            Active Desks
          </h3>
          <div className="space-y-3">
            {["desk1", "desk2"].map((desk) => {
              const serving = queue.find(
                (e) => e.status === "serving" && e.desk === desk
              );
              return (
                <div
                  key={desk}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white">
                      {desk === "desk1" ? "Desk 1" : "Desk 2"}
                    </p>
                    {serving ? (
                      <p className="text-sm text-white/80">
                        Serving: {serving.name} (#{serving.queueNumber})
                      </p>
                    ) : (
                      <p className="text-sm text-white/60">Available</p>
                    )}
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      serving ? "bg-green-400" : "bg-gray-500"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {pastJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="font-medium text-white">
                    #{job.queueNumber} {job.name}
                  </p>
                  <p className="text-sm text-white/80">
                    {formatTime(job.completionTime)} • {job.waitTime}m wait
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  // Add renderQueueView function
  const renderQueueView = () => (
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

  // Update the render method to include the queue view
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-white/70">
                Manage your queue system and analyze performance
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <DatePicker
                value={dateRange.start}
                onChange={(date) =>
                  setDateRange((prev) => ({ ...prev, start: date }))
                }
                label="From"
              />
              <DatePicker
                value={dateRange.end}
                onChange={(date) =>
                  setDateRange((prev) => ({ ...prev, end: date }))
                }
                label="To"
              />
            </div>
          </div>

          <NavigationTabs
            currentView={currentView}
            onViewChange={setCurrentView}
          />
          <QuickActions
            onRefresh={handleRefresh}
            onExport={handleExport}
            onResetQueue={handleReset}
            isLoading={isLoading}
          />
        </div>

        {/* Content based on current view */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === "overview" && renderOverview()}
            {currentView === "queue" && renderQueueView()}
            {currentView === "analytics" && (
              <div className="text-center py-12">
                <FiBarChart className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg">Advanced Analytics</p>
                <p className="text-white/50 text-sm">Coming soon...</p>
              </div>
            )}
            {currentView === "history" && (
              <div className="text-center py-12">
                <FiClock className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg">Historical Data</p>
                <p className="text-white/50 text-sm">Coming soon...</p>
              </div>
            )}
            {currentView === "settings" && (
              <div className="text-center py-12">
                <FiSettings className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg">System Settings</p>
                <p className="text-white/50 text-sm">Coming soon...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
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

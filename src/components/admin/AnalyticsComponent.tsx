import { GlassCard } from "../ui/GlassCard";
import { FiUsers, FiClock, FiTrendingUp, FiBarChart } from "react-icons/fi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { QueueEntry } from "@/types/queue";
import type { QueueHistory, Analytics, DateRange } from "@/types/admin";

interface AnalyticsComponentProps {
  queue: QueueEntry[];
  analytics: Analytics;
  pastJobs: QueueHistory[];
  dateRange: DateRange;
}

export const AnalyticsComponent = ({
  queue,
  analytics,
  pastJobs,
  dateRange,
}: AnalyticsComponentProps) => {
  // Prepare data for various charts
  const dailyTrendData = Object.entries(analytics.dailyStats)
    .map(([date, stats]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      jobs: stats.count,
      avgWait: stats.avgWait,
      avgService: stats.avgService,
      efficiency:
        stats.avgService > 0
          ? Math.round(
              (stats.avgService / (stats.avgWait + stats.avgService)) * 100
            )
          : 0,
    }))
    .slice(-14); // Last 14 days

  const hourlyDistributionData = Object.entries(analytics.hourlyStats)
    .map(([hour, stats]) => ({
      hour: hour,
      jobs: stats.count,
      avgWait: stats.avgWait,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  const deskUtilizationData = [
    { name: "Desk 1", value: analytics.jobsByDesk.desk1, color: "#3B82F6" },
    { name: "Desk 2", value: analytics.jobsByDesk.desk2, color: "#10B981" },
  ];

  const waitTimeDistribution = pastJobs.reduce((acc: any[], job) => {
    const bracket =
      job.waitTime <= 5
        ? "0-5 min"
        : job.waitTime <= 10
        ? "6-10 min"
        : job.waitTime <= 20
        ? "11-20 min"
        : job.waitTime <= 30
        ? "21-30 min"
        : "30+ min";

    const existing = acc.find((item) => item.bracket === bracket);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ bracket, count: 1 });
    }
    return acc;
  }, []);

  const serviceTimeData = pastJobs.reduce((acc: any[], job) => {
    const bracket =
      job.serviceTime <= 2
        ? "0-2 min"
        : job.serviceTime <= 5
        ? "3-5 min"
        : job.serviceTime <= 10
        ? "6-10 min"
        : job.serviceTime <= 15
        ? "11-15 min"
        : "15+ min";

    const existing = acc.find((item) => item.bracket === bracket);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ bracket, count: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="bg-gradient-to-br from-blue-500/20 to-blue-600/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/80">
                Total Customers Served
              </h3>
              <p className="text-3xl font-bold text-white">
                {analytics.totalJobs}
              </p>
              <p className="text-xs text-blue-300 mt-1">
                {analytics.totalJobs > 0
                  ? `+${Math.round(
                      (analytics.totalJobs /
                        Math.max(
                          1,
                          Math.ceil(
                            (new Date(dateRange.end).getTime() -
                              new Date(dateRange.start).getTime()) /
                              (24 * 60 * 60 * 1000)
                          )
                        )) *
                        7
                    )} per week`
                  : "No data"}
              </p>
            </div>
            <FiUsers className="w-12 h-12 text-blue-400/60" />
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/80">
                Peak Hour Volume
              </h3>
              <p className="text-3xl font-bold text-white">
                {analytics.peakHours[0]?.count || 0}
              </p>
              <p className="text-xs text-yellow-300 mt-1">
                at {analytics.peakHours[0]?.hour || "N/A"}
              </p>
            </div>
            <FiClock className="w-12 h-12 text-yellow-400/60" />
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 1 - Full Width Charts */}
      <div className="space-y-6">
        {/* Daily Trends */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">
            Daily Performance Trends
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Jobs Completed"
                />
                <Line
                  type="monotone"
                  dataKey="avgWait"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Avg Wait (min)"
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Hourly Distribution */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">
            Hourly Traffic Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  name="Jobs"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 2 - Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desk Utilization */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">
            Desk Utilization
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deskUtilizationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deskUtilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Wait Time Distribution */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">
            Wait Time Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitTimeDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis
                  dataKey="bracket"
                  type="category"
                  stroke="#9CA3AF"
                  fontSize={12}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Service Time Distribution */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">
            Service Time Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="bracket" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Bar dataKey="count" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

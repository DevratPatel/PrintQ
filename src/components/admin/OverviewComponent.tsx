import { GlassCard } from "../ui/GlassCard";
import { FiUsers, FiEye, FiClock, FiTrendingUp } from "react-icons/fi";
import type { QueueEntry } from "@/types/queue";
import type { QueueHistory, Analytics } from "@/types/admin";

interface OverviewComponentProps {
  queue: QueueEntry[];
  analytics: Analytics;
  pastJobs: QueueHistory[];
  formatTime: (timestamp: number) => string;
  formatDate: (timestamp: number) => string;
}

export const OverviewComponent = ({
  queue,
  analytics,
  pastJobs,
  formatTime,
  formatDate,
}: OverviewComponentProps) => {
  return (
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
};

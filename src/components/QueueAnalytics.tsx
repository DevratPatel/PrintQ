import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GlassCard } from "./ui/GlassCard";
import type { QueueHistory } from "@/types/queue";

export const QueueAnalytics = () => {
  const [analytics, setAnalytics] = useState<{
    totalJobs: number;
    averageWaitTime: number;
    averageServiceTime: number;
    jobsByDesk: { desk1: number; desk2: number };
    dailyStats: { [key: string]: { count: number; avgWait: number } };
  }>({
    totalJobs: 0,
    averageWaitTime: 0,
    averageServiceTime: 0,
    jobsByDesk: { desk1: 0, desk2: 0 },
    dailyStats: {},
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const historyRef = collection(db, "queueHistory");
      const q = query(historyRef, orderBy("completionTime", "desc"));
      const snapshot = await getDocs(q);

      const history: QueueHistory[] = [];
      snapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() } as QueueHistory);
      });

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
      const dailyStats: { [key: string]: { count: number; avgWait: number } } =
        {};
      history.forEach((job) => {
        if (!dailyStats[job.date]) {
          dailyStats[job.date] = { count: 0, avgWait: 0 };
        }
        dailyStats[job.date].count++;
        dailyStats[job.date].avgWait += job.waitTime;
      });

      // Calculate averages for each day
      Object.keys(dailyStats).forEach((date) => {
        dailyStats[date].avgWait = Math.round(
          dailyStats[date].avgWait / dailyStats[date].count
        );
      });

      setAnalytics({
        totalJobs,
        averageWaitTime: Math.round(totalWaitTime / totalJobs) || 0,
        averageServiceTime: Math.round(totalServiceTime / totalJobs) || 0,
        jobsByDesk,
        dailyStats,
      });
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            Queue Analytics
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <GlassCard className="bg-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                Overall Statistics
              </h2>
              <div className="space-y-2">
                <p className="text-white/90">
                  Total Jobs: {analytics.totalJobs}
                </p>
                <p className="text-white/90">
                  Average Wait Time: {analytics.averageWaitTime} minutes
                </p>
                <p className="text-white/90">
                  Average Service Time: {analytics.averageServiceTime} minutes
                </p>
              </div>
            </GlassCard>

            <GlassCard className="bg-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                Jobs by Desk
              </h2>
              <div className="space-y-2">
                <p className="text-white/90">
                  Desk 1: {analytics.jobsByDesk.desk1} jobs
                </p>
                <p className="text-white/90">
                  Desk 2: {analytics.jobsByDesk.desk2} jobs
                </p>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="bg-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Daily Statistics
            </h2>
            <div className="space-y-4">
              {Object.entries(analytics.dailyStats)
                .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                .map(([date, stats]) => (
                  <div key={date} className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-2">
                      {date}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <p className="text-white/90">Total Jobs: {stats.count}</p>
                      <p className="text-white/90">
                        Average Wait: {stats.avgWait} minutes
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </GlassCard>
        </GlassCard>
      </div>
    </div>
  );
};

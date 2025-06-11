export type QueueHistory = {
  id: string;
  queueNumber: number;
  name: string;
  studentId: string;
  desk: "desk1" | "desk2";
  startTime: number;
  completionTime: number;
  waitTime: number;
  serviceTime: number;
  date: string;
};

export type Analytics = {
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
};

export type DateRange = {
  start: string;
  end: string;
};

export type ViewMode =
  | "overview"
  | "queue"
  | "analytics"
  | "history"
  | "users"
  | "settings";

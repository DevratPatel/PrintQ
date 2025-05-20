export interface QueueEntry {
  id: string;
  queueNumber: number;
  name: string;
  studentId: string;
  status: "waiting" | "serving" | "completed";
  desk: "desk1" | "desk2" | null;
  timestamp: number;
  estimatedWaitTime?: number;
}

export interface QueueStats {
  totalServed: number;
  averageWaitTime: number;
  currentQueueLength: number;
}

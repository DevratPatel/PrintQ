export interface QueueEntry {
  id: string;
  queueNumber: number;
  name: string;
  studentId: string;
  status: "waiting" | "serving" | "completed";
  desk: "desk1" | "desk2" | null;
  timestamp: number;
  estimatedWaitTime?: number;
  completionTime?: number; // When the job was completed
  waitTime?: number; // Actual wait time in minutes
}

export interface QueueStats {
  totalServed: number;
  averageWaitTime: number;
  currentQueueLength: number;
}

export interface QueueHistory {
  id: string;
  queueNumber: number;
  name: string;
  studentId: string;
  desk: "desk1" | "desk2";
  startTime: number; // When the job was added to queue
  completionTime: number; // When the job was completed
  waitTime: number; // Total wait time in minutes
  serviceTime: number; // Time taken to complete the job in minutes
  date: string; // Date of the job (YYYY-MM-DD format)
}

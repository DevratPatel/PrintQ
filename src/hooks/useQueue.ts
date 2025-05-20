import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { QueueEntry, QueueStats } from "@/types/queue";

export const useQueue = () => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    totalServed: 0,
    averageWaitTime: 0,
    currentQueueLength: 0,
  });

  useEffect(() => {
    const q = query(collection(db, "queue"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const queueData: QueueEntry[] = [];
      snapshot.forEach((doc) => {
        queueData.push({ id: doc.id, ...doc.data() } as QueueEntry);
      });
      setQueue(queueData);
      updateStats(queueData);
    });
    return () => unsubscribe();
  }, []);

  const updateStats = (queueData: QueueEntry[]) => {
    const completed = queueData.filter((entry) => entry.status === "completed");
    const waiting = queueData.filter((entry) => entry.status === "waiting");
    setStats({
      totalServed: completed.length,
      averageWaitTime: calculateAverageWaitTime(completed),
      currentQueueLength: waiting.length,
    });
  };

  const calculateAverageWaitTime = (completed: QueueEntry[]): number => {
    if (completed.length === 0) return 0;
    const totalWaitTime = completed.reduce((acc, entry) => {
      return acc + (entry.estimatedWaitTime || 0);
    }, 0);
    return Math.round(totalWaitTime / completed.length);
  };

  const addToQueue = async (name: string, studentId: string) => {
    const lastEntry = queue[queue.length - 1];
    const nextNumber = lastEntry ? lastEntry.queueNumber + 1 : 1;
    await addDoc(collection(db, "queue"), {
      queueNumber: nextNumber,
      name,
      studentId,
      status: "waiting",
      desk: null,
      timestamp: Date.now(),
      estimatedWaitTime: calculateEstimatedWaitTime(),
    });
  };

  const calculateEstimatedWaitTime = (): number => {
    // Simple estimation based on current queue length
    return Math.max(5, Math.min(30, stats.currentQueueLength * 5));
  };

  const getServingForDesk = (desk: "desk1" | "desk2") =>
    queue.find((entry) => entry.status === "serving" && entry.desk === desk) ||
    null;

  const getWaitingQueue = () =>
    queue.filter((entry) => entry.status === "waiting" && entry.desk === null);

  const callNextForDesk = async (desk: "desk1" | "desk2") => {
    const serving = getServingForDesk(desk);
    if (serving) {
      await updateDoc(doc(db, "queue", serving.id), { status: "completed" });
    }
    const waiting = getWaitingQueue();
    if (waiting.length > 0) {
      await updateDoc(doc(db, "queue", waiting[0].id), {
        status: "serving",
        desk,
      });
    }
  };

  const completeServingForDesk = async (desk: "desk1" | "desk2") => {
    const serving = getServingForDesk(desk);
    if (serving) {
      await updateDoc(doc(db, "queue", serving.id), { status: "completed" });
    }
  };

  const resetQueue = async () => {
    try {
      const queueRef = collection(db, "queue");
      const snapshot = await getDocs(queueRef);
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error("Error resetting queue:", error);
      return false;
    }
  };

  return {
    queue,
    stats,
    addToQueue,
    getServingForDesk,
    getWaitingQueue,
    callNextForDesk,
    completeServingForDesk,
    resetQueue,
  };
};

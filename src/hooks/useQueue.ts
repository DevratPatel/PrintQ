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
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { QueueEntry, QueueStats, QueueHistory } from "@/types/queue";

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
      return acc + (entry.waitTime || 0);
    }, 0);
    return Math.round(totalWaitTime / completed.length);
  };

  const addToQueue = async (name: string, studentId: string) => {
    try {
      const queueRef = collection(db, "queue");
      const q = query(queueRef, orderBy("timestamp", "desc"), limit(1));
      const snapshot = await getDocs(q);
      let nextNumber = 1;

      if (!snapshot.empty) {
        const lastEntry = snapshot.docs[0].data();
        nextNumber = lastEntry.queueNumber + 1;
      }

      const newEntry = {
        name,
        studentId,
        queueNumber: nextNumber,
        timestamp: Date.now(),
        status: "waiting",
        desk: null,
      };

      await addDoc(queueRef, newEntry);
      return nextNumber;
    } catch (error) {
      console.error("Error adding to queue:", error);
      throw error;
    }
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

  const saveToHistory = async (entry: QueueEntry) => {
    if (!entry.completionTime || !entry.desk) return;

    const historyEntry: QueueHistory = {
      id: entry.id,
      queueNumber: entry.queueNumber,
      name: entry.name,
      studentId: entry.studentId,
      desk: entry.desk,
      startTime: entry.timestamp,
      completionTime: entry.completionTime,
      waitTime: Math.round((entry.completionTime - entry.timestamp) / 60000), // Convert to minutes
      serviceTime: Math.round((entry.completionTime - entry.timestamp) / 60000), // Convert to minutes
      date: new Date(entry.completionTime).toISOString().split("T")[0], // YYYY-MM-DD format
    };

    await addDoc(collection(db, "queueHistory"), historyEntry);
  };

  const callNextForDesk = async (desk: "desk1" | "desk2") => {
    const serving = getServingForDesk(desk);
    if (serving) {
      const completionTime = Date.now();
      await updateDoc(doc(db, "queue", serving.id), {
        status: "completed",
        completionTime,
        waitTime: Math.round((completionTime - serving.timestamp) / 60000),
      });
      await saveToHistory({ ...serving, completionTime, status: "completed" });
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
      const completionTime = Date.now();
      await updateDoc(doc(db, "queue", serving.id), {
        status: "completed",
        completionTime,
        waitTime: Math.round((completionTime - serving.timestamp) / 60000),
      });
      await saveToHistory({ ...serving, completionTime, status: "completed" });
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

  const deleteFromQueue = async (entryId: string) => {
    try {
      await deleteDoc(doc(db, "queue", entryId));
      return true;
    } catch (error) {
      console.error("Error deleting from queue:", error);
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
    deleteFromQueue,
  };
};

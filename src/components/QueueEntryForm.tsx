import { useState } from "react";
import { GlassCard } from "./ui/GlassCard";
import { useQueue } from "@/hooks/useQueue";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export const QueueEntryForm = () => {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [assignedNumber, setAssignedNumber] = useState<number | null>(null);
  const { addToQueue, stats } = useQueue();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const queueNumber = await addToQueue(name, studentId);
      setAssignedNumber(queueNumber);
      toast.success(`Your queue number is #${queueNumber}`);
      setName("");
      setStudentId("");
    } catch (error) {
      toast.error("Failed to add to queue");
    }
  };

  return (
    <GlassCard className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Join Queue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label
            htmlFor="studentId"
            className="block text-sm font-medium text-white mb-1"
          >
            Student ID
          </label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30"
            placeholder="Enter your Student ID"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Get Queue Number
        </button>
      </form>
      <div className="mt-6 text-sm text-white/70">
        <p>Current queue length: {stats.currentQueueLength}</p>
        <p>Estimated wait time: {stats.averageWaitTime} minutes</p>
      </div>

      <AnimatePresence>
        {assignedNumber && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-4 bg-white/10 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-white text-center mb-2">
              Your Queue Number
            </h3>
            <p className="text-3xl font-bold text-white text-center">
              #{assignedNumber}
            </p>
            <p className="text-white/70 text-sm text-center mt-2">
              Please remember this number. You will be called when it's your
              turn.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

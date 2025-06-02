import { useState } from "react";
import { GlassCard } from "./ui/GlassCard";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useQueue } from "@/hooks/useQueue";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export const QueueEntryForm = () => {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [assignedNumber, setAssignedNumber] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToQueue, stats } = useQueue();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const queueNumber = await addToQueue(name, studentId);
      setAssignedNumber(queueNumber);
      toast.success(`Successfully added to queue #${queueNumber}`);
      setName("");
      setStudentId("");
    } catch (error) {
      toast.error("Failed to add to queue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
      <GlassCard variant="highlighted" className="p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">
            Join the Queue
          </h2>
          <p className="text-[var(--foreground-secondary)] text-sm">
            Enter your information to get your queue number
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            disabled={isSubmitting}
            required
            className="text-base sm:text-base"
          />

          <Input
            label="Student ID"
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter your Student ID"
            disabled={isSubmitting}
            required
            className="text-base sm:text-base"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full min-h-[48px] sm:min-h-[52px] text-base font-semibold"
            isLoading={isSubmitting}
            disabled={!name.trim() || !studentId.trim()}
          >
            Get Queue Number
          </Button>
        </form>
      </GlassCard>

      {/* Queue Stats */}
      <GlassCard variant="subtle" className="text-center p-4 sm:p-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
              {stats.currentQueueLength}
            </div>
            <div className="text-xs sm:text-sm text-[var(--foreground-secondary)]">
              In Queue
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
              {stats.averageWaitTime}
            </div>
            <div className="text-xs sm:text-sm text-[var(--foreground-secondary)]">
              Avg. Wait (min)
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Success State */}
      <AnimatePresence>
        {assignedNumber && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <GlassCard
              variant="highlighted"
              className="text-center border-[var(--success)]/30 bg-green-50/80 dark:bg-green-950/80 p-6 sm:p-8"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-[var(--success)] rounded-full flex items-center justify-center">
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                    You're in the queue!
                  </h3>
                  <p className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-2">
                    #{assignedNumber}
                  </p>
                  <p className="text-[var(--foreground-secondary)] text-sm leading-relaxed">
                    Please remember this number.
                    <br />
                    You'll be called when it's your turn.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

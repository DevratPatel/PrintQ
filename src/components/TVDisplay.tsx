import { motion, AnimatePresence } from "framer-motion";
import { useQueue } from "@/hooks/useQueue";
import { GlassCard } from "./ui/GlassCard";

export const TVDisplay = () => {
  const { queue } = useQueue();
  const nowServing = queue.find((entry) => entry.status === "serving");
  const waiting = queue
    .filter((entry) => entry.status === "waiting")
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center justify-center">
        {/* Now Serving */}
        <GlassCard className="flex-1 w-full max-w-md flex flex-col items-center justify-center aspect-square">
          <div className="w-full items-center justify-center flex flex-col h-full">
            <span className="text-2xl font-semibold text-white mb-4">
              Now Serving
            </span>

            <AnimatePresence mode="wait">
              {nowServing ? (
                <motion.div
                  key={nowServing.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-7xl md:text-9xl font-extrabold text-white mb-4 drop-shadow-lg">
                    #{nowServing.queueNumber}
                  </span>
                  <span className="text-2xl md:text-4xl font-medium text-white">
                    {nowServing.name}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-5xl font-bold text-white mb-4">
                    ---
                  </span>
                  <span className="text-2xl text-white/70">Waiting...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Up Next */}
        <GlassCard className="flex-1 w-full max-w-md flex flex-col items-stretch justify-between aspect-square">
          <div className="w-full items-center justify-center flex flex-col h-full">
            <span className="text-2xl font-semibold text-white mb-4">
              Up next
            </span>

            <div className="flex flex-col gap-4 w-full px-2">
              {waiting.length === 0 && (
                <div className="text-white/60 text-center">No one in queue</div>
              )}
              {waiting.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 bg-white/10 rounded-xl px-6 py-3 shadow border border-white/10 text-white text-xl font-medium"
                >
                  <span className="font-bold text-2xl mr-2">
                    #{entry.queueNumber}
                  </span>
                  <span className="truncate">{entry.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

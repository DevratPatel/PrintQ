import { motion, AnimatePresence } from "framer-motion";
import { useQueue } from "@/hooks/useQueue";
import { GlassCard } from "./ui/GlassCard";

export const TVDisplay = () => {
  const { getServingForDesk, getWaitingQueue } = useQueue();
  const serving1 = getServingForDesk("desk1");
  const serving2 = getServingForDesk("desk2");
  const waiting = getWaitingQueue().slice(0, 10);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col gap-8 items-center justify-center">
        {/* Now Serving Card */}
        <GlassCard
          className="w-full max-w-4xl flex flex-col items-stretch justify-between"
          variant="highlighted"
        >
          <div className="flex flex-col h-full mb-4">
            <span className="text-2xl font-semibold text-white mb-4 text-center">
              Now Serving
            </span>
            <div className="flex-1 flex flex-row items-center justify-center gap-8">
              {/* Desk 1 */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {serving1 ? (
                    <motion.div
                      key={serving1.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-7xl md:text-8xl font-extrabold text-white mb-2 drop-shadow-lg">
                        #{serving1.queueNumber}
                      </span>
                      <span className="text-2xl md:text-3xl font-medium text-white mb-1">
                        {serving1.name}
                      </span>
                      <span className="text-lg text-white/80">At Desk 1</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-5xl font-bold text-white mb-2">
                        ---
                      </span>
                      <span className="text-lg text-white/70">at desk 1</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Divider */}
              <div className="h-32 w-px bg-white/30 mx-2 md:block" />
              {/* Desk 2 */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {serving2 ? (
                    <motion.div
                      key={serving2.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-7xl md:text-8xl font-extrabold text-white mb-2 drop-shadow-lg">
                        #{serving2.queueNumber}
                      </span>
                      <span className="text-2xl md:text-3xl font-medium text-white mb-1">
                        {serving2.name}
                      </span>
                      <span className="text-lg text-white/80">at Desk 2</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-5xl font-bold text-white mb-2">
                        ---
                      </span>
                      <span className="text-lg text-white/70">at desk 2</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Up Next */}
        <GlassCard
          className="w-full max-w-4xl flex flex-col items-stretch justify-between"
          variant="subtle"
        >
          <div className="flex flex-col h-full">
            <span className="text-2xl font-semibold text-white text-center mb-4">
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

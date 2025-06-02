import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlighted" | "subtle";
}

export const GlassCard = ({
  children,
  className = "",
  variant = "default",
}: GlassCardProps) => {
  const variantStyles = {
    default:
      "bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--shadow-medium)]",
    highlighted:
      "bg-white/90 dark:bg-gray-900/90 border-white/30 dark:border-gray-700/30 shadow-[var(--shadow-large)]",
    subtle:
      "bg-white/60 dark:bg-gray-900/60 border-white/20 dark:border-gray-700/20 shadow-[var(--shadow-small)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94], // Apple's signature easing
      }}
      className={`
        ${variantStyles[variant]}
        backdrop-blur-xl 
        rounded-2xl 
        border 
        p-8 
        relative 
        overflow-hidden
        ${className}
      `}
    >
      {/* Subtle noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

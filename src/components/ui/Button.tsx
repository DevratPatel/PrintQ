import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white shadow-lg focus:ring-[var(--accent)]/50 disabled:bg-[var(--foreground-tertiary)]",
    secondary:
      "bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-[var(--foreground)] border border-[var(--border)] focus:ring-[var(--accent)]/50 disabled:bg-[var(--background-secondary)] disabled:text-[var(--foreground-tertiary)]",
    tertiary:
      "bg-transparent hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] focus:ring-[var(--accent)]/50 disabled:text-[var(--foreground-tertiary)]",
    danger:
      "bg-[var(--error)] hover:bg-[var(--error)]/90 text-white shadow-lg focus:ring-[var(--error)]/50 disabled:bg-[var(--foreground-tertiary)]",
  };

  const sizeStyles = {
    sm: "px-3 py-2 text-sm gap-1.5",
    md: "px-4 py-3 text-base gap-2",
    lg: "px-6 py-3.5 text-lg gap-2.5",
  };

  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

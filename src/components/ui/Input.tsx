import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: "default" | "search";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      variant = "default",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = `
    w-full px-4 py-3.5 sm:py-3.5
    bg-[var(--background-secondary)] 
    border border-[var(--border)] 
    rounded-xl 
    text-[var(--foreground)] 
    placeholder-[var(--foreground-tertiary)]
    focus:outline-none 
    focus:ring-2 
    focus:ring-[var(--accent)] 
    focus:border-transparent
    transition-all duration-200 ease-out
    text-base
    disabled:opacity-50
    disabled:cursor-not-allowed
    min-h-[48px]
    appearance-none
  `;

    const variantStyles = {
      default: "",
      search: "pl-10",
    };

    const errorStyles = error
      ? "border-[var(--error)] focus:ring-[var(--error)]"
      : "";

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--foreground)] tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {variant === "search" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-[var(--foreground-tertiary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck="false"
            className={`
            ${baseStyles}
            ${variantStyles[variant]}
            ${errorStyles}
            ${className}
          `}
            {...props}
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--error)] flex items-center gap-1">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}

        {helpText && !error && (
          <p className="text-sm text-[var(--foreground-secondary)]">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

import { createContext, forwardRef, useContext } from "react";
import type React from "react";
import { cn } from "@/app/components/ui/utils";

// ── Context ──────────────────────────────────────────────────────────────────

interface PromptInputContextValue {
  isLoading: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
}

const PromptInputContext = createContext<PromptInputContextValue>({
  isLoading: false,
  value: "",
  onValueChange: () => {},
  onSubmit: () => {},
});

// ── PromptInput ───────────────────────────────────────────────────────────────

interface PromptInputProps {
  children: React.ReactNode;
  className?: string;
  value: string;
  onValueChange: (value: string) => void;
  isLoading?: boolean;
  onSubmit: () => void;
}

function PromptInput({
  children,
  className,
  value,
  onValueChange,
  isLoading = false,
  onSubmit,
}: PromptInputProps) {
  return (
    <PromptInputContext.Provider value={{ isLoading, value, onValueChange, onSubmit }}>
      <div
        className={cn(
          "border border-[#e9e9e7] rounded-lg bg-white focus-within:border-foreground/20 transition-colors px-3 py-2",
          className
        )}
      >
        {children}
      </div>
    </PromptInputContext.Provider>
  );
}

// ── PromptInputTextarea ───────────────────────────────────────────────────────

interface PromptInputTextareaProps {
  placeholder?: string;
  className?: string;
}

const PromptInputTextarea = forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ placeholder, className }, ref) => {
    const { value, onValueChange, onSubmit } = useContext(PromptInputContext);

    return (
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
          const el = e.target;
          el.style.height = "auto";
          el.style.height = Math.min(el.scrollHeight, 120) + "px";
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        rows={1}
        className={cn(
          "w-full resize-none bg-transparent text-[13px] text-foreground placeholder:text-[#9b9a97] outline-none",
          className
        )}
        style={{ fontWeight: 400, lineHeight: "20px", maxHeight: 120 }}
      />
    );
  }
);
PromptInputTextarea.displayName = "PromptInputTextarea";

// ── PromptInputActions ────────────────────────────────────────────────────────

function PromptInputActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>{children}</div>
  );
}

// ── PromptInputAction ─────────────────────────────────────────────────────────

function PromptInputAction({
  children,
  tooltip,
}: {
  children: React.ReactNode;
  tooltip?: string;
}) {
  if (!tooltip) return <>{children}</>;
  return <span title={tooltip}>{children}</span>;
}

export { PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea };

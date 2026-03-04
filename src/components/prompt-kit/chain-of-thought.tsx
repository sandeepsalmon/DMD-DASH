import { createContext, useContext, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface StepContextValue {
  open: boolean;
  toggle: () => void;
}

const StepContext = createContext<StepContextValue>({ open: false, toggle: () => {} });

function ChainOfThought({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-1.5", className)}>{children}</div>;
}

function ChainOfThoughtStep({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <StepContext.Provider value={{ open, toggle: () => setOpen((v) => !v) }}>
      <div className="rounded-xl border border-[#e9e9e7] overflow-hidden bg-white">
        {children}
      </div>
    </StepContext.Provider>
  );
}

function ChainOfThoughtTrigger({
  children,
  leftIcon,
}: {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
}) {
  const { open, toggle } = useContext(StepContext);
  return (
    <button
      onClick={toggle}
      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-[#fafaf9] transition-colors"
    >
      {leftIcon && (
        <span className="text-[#9b9a97] shrink-0">{leftIcon}</span>
      )}
      <span
        className="flex-1 text-[12px] text-foreground leading-snug"
        style={{ fontWeight: 500 }}
      >
        {children}
      </span>
      <span className="text-[#9b9a97] shrink-0">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </span>
    </button>
  );
}

function ChainOfThoughtContent({ children }: { children: React.ReactNode }) {
  const { open } = useContext(StepContext);
  if (!open) return null;
  return (
    <div className="border-t border-[#e9e9e7] px-3 py-2.5 space-y-1.5 bg-[#fafaf9]">
      {children}
    </div>
  );
}

function ChainOfThoughtItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-1 h-1 rounded-full bg-[#c0bfbd] shrink-0 mt-[5px]" />
      <p
        className="text-[11px] text-[#9b9a97] leading-relaxed"
        style={{ fontWeight: 400 }}
      >
        {children}
      </p>
    </div>
  );
}

export {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtItem,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
};

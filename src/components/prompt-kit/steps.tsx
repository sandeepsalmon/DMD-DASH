import { cn } from "@/app/components/ui/utils";

export type StepStatus = "done" | "active" | "pending";

export interface Step {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

interface StepsProps {
  steps: Step[];
  className?: string;
}

export function Steps({ steps, className }: StepsProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {steps.map((step, i) => (
        <StepItem key={step.id} step={step} isLast={i === steps.length - 1} />
      ))}
    </div>
  );
}

function StepItem({ step, isLast }: { step: Step; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      {/* Left: dot + vertical connector */}
      <div className="flex flex-col items-center">
        <StepDot status={step.status} />
        {!isLast && <div className="w-px flex-1 mt-1 bg-[#e9e9e7] min-h-[12px]" />}
      </div>

      {/* Right: label + optional detail */}
      <div className={cn("pb-3 min-w-0", isLast && "pb-0")}>
        <p
          className={cn(
            "text-[12px] leading-snug",
            step.status === "pending" ? "text-[#9b9a97]" : "text-foreground"
          )}
          style={{ fontWeight: step.status !== "pending" ? 500 : 400 }}
        >
          {step.label}
        </p>
        {step.detail && (
          <p
            className="text-[11px] text-[#9b9a97] mt-0.5 whitespace-pre-line leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            {step.detail}
          </p>
        )}
      </div>
    </div>
  );
}

function StepDot({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <span className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-0.5">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M1.5 4L3 5.5L6.5 2"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="w-4 h-4 rounded-full border-2 border-foreground/25 border-t-foreground animate-spin shrink-0 mt-0.5" />
    );
  }

  return (
    <span className="w-4 h-4 rounded-full border-2 border-[#d4d4d1] bg-white shrink-0 mt-0.5" />
  );
}

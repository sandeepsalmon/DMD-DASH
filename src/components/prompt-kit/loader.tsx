import type { CSSProperties } from "react";
import { cn } from "@/app/components/ui/utils";

interface LoaderProps {
  className?: string;
}

/** Three bouncing dots — use for "thinking / generating" states */
export function Loader({ className }: LoaderProps) {
  return (
    <>
      <style>{`
        @keyframes pk-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40%            { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
      <span className={cn("inline-flex items-center gap-[3px]", className)}>
        {([0, 0.16, 0.32] as const).map((delay, i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-current"
            style={
              {
                animationName: "pk-bounce",
                animationDuration: "1s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </span>
    </>
  );
}

interface PulseLoaderProps {
  /** Brand color for the dot */
  color: string;
  /** When true the dot becomes solid (agent has spoken / step complete) */
  done?: boolean;
  className?: string;
}

/** Single pulsing dot — use next to each co-agent to show it is active */
export function PulseLoader({ color, done = false, className }: PulseLoaderProps) {
  return (
    <>
      <style>{`
        @keyframes pk-pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1);   }
        }
      `}</style>
      <span
        className={cn(
          "inline-block w-1.5 h-1.5 rounded-full shrink-0 transition-opacity duration-500",
          className
        )}
        style={
          {
            backgroundColor: color,
            animationName: done ? "none" : "pk-pulse-dot",
            animationDuration: "1.2s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            opacity: done ? 1 : undefined,
          } as CSSProperties
        }
      />
    </>
  );
}

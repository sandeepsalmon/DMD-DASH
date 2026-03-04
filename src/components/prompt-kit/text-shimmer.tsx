import type { CSSProperties } from "react";
import { cn } from "@/app/components/ui/utils";

interface TextShimmerProps {
  children: string;
  className?: string;
  /** Animation duration in seconds */
  duration?: number;
}

export function TextShimmer({
  children,
  className,
  duration = 2,
}: TextShimmerProps) {
  return (
    <>
      <style>{`
        @keyframes pk-text-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
      <span
        className={cn("inline-block", className)}
        style={
          {
            background:
              "linear-gradient(90deg, #9b9a97 0%, #37352f 40%, #9b9a97 80%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            animationName: "pk-text-shimmer",
            animationDuration: `${duration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          } as CSSProperties
        }
      >
        {children}
      </span>
    </>
  );
}

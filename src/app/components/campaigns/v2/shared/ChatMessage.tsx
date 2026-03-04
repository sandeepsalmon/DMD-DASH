import type { ReactNode } from "react";

export function DocketMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-1">
        <span className="text-white text-[11px]" style={{ fontWeight: 700 }}>D</span>
      </div>
      <div className="flex-1 min-w-0 bg-[#fafaf9] rounded-2xl rounded-tl-md px-4 py-3.5 border border-[#eeeeec]">
        {children}
      </div>
    </div>
  );
}

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end pl-12">
      <div className="bg-foreground text-white rounded-2xl rounded-tr-md px-5 py-3">
        <p className="text-[13px]" style={{ fontWeight: 400, lineHeight: 1.5 }}>{content}</p>
      </div>
    </div>
  );
}

const AGENT_META: Record<string, { color: string; bg: string; short: string }> = {
  "CRM Agent":        { color: "#2563eb", bg: "#eff6ff", short: "CR" },
  "Content Agent":    { color: "#16a34a", bg: "#f0fdf4", short: "CN" },
  "Lead Analyst":     { color: "#d97706", bg: "#fffbeb", short: "LA" },
  "Email Strategist": { color: "#9333ea", bg: "#faf5ff", short: "ES" },
};

export function AgentChatBubble({ msg }: { msg: { agent: string; message: string } }) {
  const meta = AGENT_META[msg.agent] ?? { color: "#37352f", bg: "#f7f7f5", short: "?" };
  return (
    <div className="flex items-start gap-2 animate-in fade-in duration-300">
      <div
        className="w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[8px]"
        style={{ background: meta.bg, color: meta.color, fontWeight: 700 }}
      >
        {meta.short}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] mb-0.5" style={{ fontWeight: 600, color: meta.color }}>{msg.agent}</p>
        <div className="rounded-xl rounded-tl-none px-3 py-2" style={{ background: meta.bg }}>
          <p className="text-[12px] text-[#37352f]" style={{ fontWeight: 400, lineHeight: 1.5 }}>{msg.message}</p>
        </div>
      </div>
    </div>
  );
}

/** Compact variant — agent name inline with message, minimal height */
export function CompactAgentBubble({ msg }: { msg: { agent: string; message: string } }) {
  const meta = AGENT_META[msg.agent] ?? { color: "#37352f", bg: "#f7f7f5", short: "?" };
  return (
    <div className="flex items-start gap-1.5 animate-in fade-in duration-200 py-0.5">
      <div
        className="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[7px]"
        style={{ background: meta.bg, color: meta.color, fontWeight: 700 }}
      >
        {meta.short}
      </div>
      <p className="text-[11px] text-[#37352f] flex-1 min-w-0" style={{ fontWeight: 400, lineHeight: 1.5 }}>
        <span style={{ fontWeight: 600, color: meta.color }}>{msg.agent}:</span>{" "}
        {msg.message}
      </p>
    </div>
  );
}

import { useState } from "react";
import {
  HugeiconsIcon,
  CheckmarkBadge02Icon,
  HourglassIcon,
  ArrowDown01Icon,
} from "../../icons";
import { Add01Icon } from "@hugeicons/core-free-icons";
import type { CampaignModeState, CampaignEmail } from "../../types";
import { SEGMENT_A_EMAILS, SEGMENT_B_EMAILS, SEGMENT_C_EMAILS } from "../../types";
import { toast } from "sonner";

interface Props {
  campaignState: CampaignModeState;
  marketingAgentCreated: boolean;
}

type SegmentFilter = "all" | "A" | "B" | "C";

const SEGMENTS = [
  { key: "A" as const, name: "Hot", color: "#ef4444", count: 18, emails: SEGMENT_A_EMAILS },
  { key: "B" as const, name: "Warm", color: "#f59e0b", count: 10, emails: SEGMENT_B_EMAILS },
  { key: "C" as const, name: "Re-engage", color: "#22c55e", count: 6, emails: SEGMENT_C_EMAILS },
];

export function EmailPlanArtifact({ campaignState, marketingAgentCreated }: Props) {
  const [filter, setFilter] = useState<SegmentFilter>("all");
  const isLaunched = campaignState === "launched" || campaignState === "running";

  const filteredSegments = filter === "all" ? SEGMENTS : SEGMENTS.filter((s) => s.key === filter);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Segment filter chips */}
      <div className="px-5 py-3 border-b border-[#e9e9e7] shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          {SEGMENTS.map((seg) => (
            <FilterChip
              key={seg.key}
              label={`${seg.key}: ${seg.name} (${seg.count})`}
              color={seg.color}
              active={filter === seg.key}
              onClick={() => setFilter(seg.key)}
            />
          ))}
          <button
            onClick={() => toast.info("Create segment coming soon")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-[#9b9a97] border border-dashed border-[#d4d4d1] hover:border-[#9b9a97] hover:text-foreground/70 transition-colors"
            style={{ fontWeight: 400 }}
          >
            <HugeiconsIcon icon={Add01Icon} size={10} />
            Create
          </button>
        </div>
      </div>

      {/* Email cards list */}
      <div className="flex-1 overflow-y-auto">
        {filteredSegments.map((seg) => (
          <div key={seg.key}>
            {/* Segment header */}
            <div className="px-5 py-2.5 bg-[#fafaf9] border-b border-[#e9e9e7] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
              <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>
                Segment {seg.key}: {seg.name}
              </p>
              <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                {seg.emails.length} emails · {seg.count} leads
              </span>
            </div>

            {/* Email cards */}
            {seg.emails.map((email) => (
              <EmailCard key={email.id} email={email} segColor={seg.color} isLaunched={isLaunched} />
            ))}
          </div>
        ))}

        {/* Conversational Agent one-liner */}
        {marketingAgentCreated && (
          <div className="px-5 py-3 border-t border-[#e9e9e7]">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#fafaf9] border border-[#e9e9e7]">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#faf5ff" }}>
                <span className="text-[8px]" style={{ color: "#9333ea", fontWeight: 700 }}>CA</span>
              </div>
              <p className="text-[11px] text-foreground flex-1" style={{ fontWeight: 400 }}>
                Conversational Agent active — interacting with recipients
              </p>
              {isLaunched && (
                <span className="text-[9px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200" style={{ fontWeight: 500 }}>
                  Active
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, color, active, onClick }: { label: string; color?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all ${
        active ? "bg-foreground text-white" : "bg-[#f4f4f2] text-[#6b6a67] hover:bg-[#e9e9e7]"
      }`}
      style={{ fontWeight: active ? 500 : 400 }}
    >
      {color && !active && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />}
      {label}
    </button>
  );
}

function EmailCard({ email, segColor, isLaunched }: { email: CampaignEmail; segColor: string; isLaunched: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = (() => {
    if (email.status === "sent" && isLaunched) {
      return { label: "Sent", labelClass: "bg-green-50 text-green-700 border-green-200" };
    }
    if (email.status === "scheduled" && isLaunched) {
      return { label: email.scheduledFor ?? "Scheduled", labelClass: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    return { label: `Day ${email.day}`, labelClass: "bg-[#f7f7f5] text-[#9b9a97] border-[#e9e9e7]" };
  })();

  return (
    <div className="border-b border-[#e9e9e7] last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-[#fafaf9] transition-colors"
      >
        <div className="w-0.5 self-stretch rounded-full shrink-0 mt-0.5" style={{ background: segColor, minHeight: 32 }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] px-1.5 py-px rounded border ${statusConfig.labelClass}`} style={{ fontWeight: 500 }}>
              {statusConfig.label}
            </span>
            <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{email.cta}</span>
          </div>
          <p className="text-[12px] text-foreground line-clamp-1 mb-1" style={{ fontWeight: 500 }}>{email.subject}</p>
          {email.status === "sent" && isLaunched && email.openRate !== undefined && (
            <div className="flex items-center gap-3 text-[10px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>
              <span>{email.openRate}% opened</span>
              <span>{email.clickRate}% clicked</span>
              {email.sentCount && <span>{email.sentCount} sent</span>}
            </div>
          )}
        </div>
        <HugeiconsIcon
          icon={ArrowDown01Icon} size={11}
          className={`text-[#9b9a97] shrink-0 mt-1 transition-transform ${expanded ? "" : "rotate-[-90deg]"}`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-4 pl-9 animate-in fade-in duration-200">
          <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-[#fafaf9]">
            <div className="px-3.5 py-2.5 border-b border-[#e9e9e7]">
              <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>To: [Lead name]</p>
              <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>{email.subject}</p>
            </div>
            <div className="px-3.5 py-3 space-y-2">
              <p className="text-[11px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>Hi [First name],</p>
              <p className="text-[11px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>{email.preview}</p>
              <div className="pt-1">
                <span className="inline-block text-[10px] px-2 py-1 rounded-lg bg-foreground text-white" style={{ fontWeight: 500 }}>
                  {email.cta} →
                </span>
              </div>
              <p className="text-[10px] text-[#9b9a97] pt-1" style={{ fontWeight: 400 }}>Personalized per lead using warm context</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

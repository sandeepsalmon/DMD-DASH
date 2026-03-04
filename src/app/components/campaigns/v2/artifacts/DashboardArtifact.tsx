import { HugeiconsIcon, FlashIcon, Mail01Icon } from "../../icons";
import type { CampaignModeState } from "../../types";

interface Props {
  campaignState: CampaignModeState;
}

export function DashboardArtifact({ campaignState }: Props) {
  const isDay3 = campaignState === "running";

  return (
    <div className="px-5 py-5 space-y-4">
      {/* Live status bar */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
        <span className="text-[12px] text-green-700" style={{ fontWeight: 500 }}>Campaign Live</span>
        <span className="text-[11px] text-green-600/60 ml-auto" style={{ fontWeight: 400 }}>
          {isDay3 ? "Day 3" : "Just launched"}
        </span>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {(isDay3
          ? [
              { label: "Emails Sent", value: "44" },
              { label: "Open Rate", value: "68%" },
              { label: "Click Rate", value: "24%" },
              { label: "Meetings Booked", value: "3" },
            ]
          : [
              { label: "Emails Sent", value: "18" },
              { label: "Open Rate", value: "0%" },
              { label: "Click Rate", value: "0%" },
              { label: "Meetings Booked", value: "0" },
            ]
        ).map((stat) => (
          <div key={stat.label} className="border border-[#e9e9e7] rounded-xl p-3 bg-white">
            <p className="text-[10px] text-[#9b9a97] mb-1" style={{ fontWeight: 500 }}>{stat.label}</p>
            <p className="text-[16px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Segment performance */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
          By Segment
        </p>
        <div className="space-y-2">
          {[
            { seg: "A", name: "Hot", color: "#ef4444", sent: isDay3 ? 18 : 18, open: isDay3 ? "78%" : "0%", meetings: isDay3 ? 2 : 0 },
            { seg: "B", name: "Warm", color: "#f59e0b", sent: isDay3 ? 20 : 0, open: isDay3 ? "70%" : "—", meetings: isDay3 ? 1 : 0 },
            { seg: "C", name: "Re-engage", color: "#22c55e", sent: isDay3 ? 6 : 0, open: isDay3 ? "50%" : "—", meetings: 0 },
          ].map((row) => (
            <div key={row.seg} className="border border-[#e9e9e7] rounded-xl px-4 py-3 bg-white flex items-center gap-3">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>Segment {row.seg}</p>
                <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{row.name}</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[#9b9a97] tabular-nums shrink-0" style={{ fontWeight: 400 }}>
                <span>{row.sent} sent</span>
                <span>{row.open} open</span>
                <span>{row.meetings} mtgs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

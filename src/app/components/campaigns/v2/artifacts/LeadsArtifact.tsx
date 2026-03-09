import { useState } from "react";
import {
  HugeiconsIcon,
  IconFromKey,
  Maximize02Icon,
  FireIcon,
} from "../../icons";
import type { Lead, Account, CampaignModeState } from "../../types";
import { LEADS, getAccountsFromLeads } from "../../types";
import type { CampaignData } from "../../campaignData";

type LeadsView = "leads" | "accounts";

const STATUS_CONFIG: Record<string, { text: string; iconKey: string; iconColor: string }> = {
  "meeting-booked": { text: "Meeting booked", iconKey: "checkmark", iconColor: "#22c55e" },
  "high-engagement": { text: "High engagement", iconKey: "chart-line", iconColor: "#3b82f6" },
  "opened-no-click": { text: "Opens, no clicks", iconKey: "alert", iconColor: "#f59e0b" },
  "partial-engagement": { text: "Partial engagement", iconKey: "", iconColor: "" },
  "no-engagement": { text: "No engagement", iconKey: "", iconColor: "" },
  "pre-send-upgrade": { text: "Pre-send upgrade", iconKey: "checkmark", iconColor: "#22c55e" },
};

function isAssignedToAE(lead: Lead): boolean {
  const activityText = lead.activity.map((item) => item.description).join(" ").toLowerCase();
  const contextText = `${lead.warmContext} ${lead.agentNotes}`.toLowerCase();

  const aeAssignmentSignals = [
    "assigned to deal owner",
    "assigned to ae",
    "handoff to ae",
    "meeting booked with ae",
    "meeting confirmed",
    "booked with ae",
    "escalated to ae",
  ];

  return aeAssignmentSignals.some((signal) =>
    activityText.includes(signal) || contextText.includes(signal),
  );
}

function ScoreIndicator({ level }: { level: string }) {
  if (level === "hot") return <HugeiconsIcon icon={FireIcon} size={11} color="#ef4444" />;
  const color = level === "warm" ? "#f59e0b" : "#22c55e";
  return <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />;
}

interface Props {
  onLeadClick: (lead: Lead) => void;
  onExpandLeads: () => void;
  onAccountClick?: (accountName: string) => void;
  campaignData?: CampaignData;
  campaignState?: CampaignModeState;
}

function getAccountsFromLeadsList(leads: Lead[]): Account[] {
  const map = new Map<string, Account>();
  for (const lead of leads) {
    if (!map.has(lead.company)) {
      map.set(lead.company, { name: lead.company, score: lead.score, leadCount: 0, hotLeads: 0, statusKey: "", status: "", leads: [] });
    }
    const acc = map.get(lead.company)!;
    acc.leadCount++;
    if (lead.scoreLevel === "hot") acc.hotLeads++;
    acc.leads.push(lead);
    if (lead.score > acc.score) acc.score = lead.score;
  }
  for (const acc of map.values()) {
    const hasBooked = acc.leads.some((l) => l.status === "meeting-booked");
    const hasHigh = acc.leads.some((l) => l.status === "high-engagement");
    if (hasBooked) { acc.status = "Meeting booked"; acc.statusKey = "meeting-booked"; }
    else if (hasHigh) { acc.status = "High engagement"; acc.statusKey = "high-engagement"; }
    else if (acc.leads.some((l) => l.status === "opened-no-click")) { acc.status = "Opens, no clicks"; acc.statusKey = "opened-no-click"; }
    else { acc.status = "Low engagement"; acc.statusKey = "low"; }
  }
  return [...map.values()].sort((a, b) => b.score - a.score);
}

export function LeadsArtifact({ onLeadClick, onExpandLeads, onAccountClick, campaignData, campaignState }: Props) {
  const [leadsView, setLeadsView] = useState<LeadsView>("leads");
  const campaignLeads = campaignData?.leads ?? LEADS;
  const accounts = campaignData ? getAccountsFromLeadsList(campaignLeads) : getAccountsFromLeads();

  const isLaunched = campaignState === "launched" || campaignState === "running";
  const totalLeads = campaignLeads.length;
  const meetingsBooked = campaignLeads.filter((l) => l.status === "meeting-booked").length;
  const highEngagement = campaignLeads.filter((l) => l.status === "high-engagement").length;
  const hotLeads = campaignLeads.filter((l) => l.scoreLevel === "hot").length;

  const metrics = [
    { label: "Total", value: totalLeads },
    { label: "Hot", value: hotLeads },
    ...(isLaunched ? [{ label: "Meetings", value: meetingsBooked }] : []),
    { label: "High Engage", value: highEngagement },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Summary metrics */}
      <div className="px-5 pt-4 pb-2 shrink-0">
        <div className={`grid gap-2 ${isLaunched ? "grid-cols-4" : "grid-cols-3"}`}>
          {metrics.map((m) => (
            <div key={m.label} className="border border-[#e9e9e7] rounded-lg px-2.5 py-2 bg-white text-center">
              <p className="text-[16px] text-foreground tabular-nums leading-none" style={{ fontWeight: 600 }}>{m.value}</p>
              <p className="text-[9px] text-[#9b9a97] mt-1" style={{ fontWeight: 500 }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-[#e9e9e7] shrink-0">
        <div>
          <div className="flex items-center bg-[#f4f4f2] rounded-lg p-0.5 gap-0.5">
            {([
              { key: "leads" as const, label: "Leads" },
              { key: "accounts" as const, label: "Accounts" },
            ]).map((view) => (
              <button
                key={view.key}
                onClick={() => setLeadsView(view.key)}
                className={`px-3.5 py-1.5 rounded-md text-[11px] transition-all ${
                  leadsView === view.key
                    ? "bg-white text-foreground shadow-sm"
                    : "text-[#9b9a97] hover:text-foreground/70"
                }`}
                style={{ fontWeight: leadsView === view.key ? 500 : 400 }}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onExpandLeads}
          className="w-6 h-6 flex items-center justify-center rounded text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors"
          title="Expand to full view"
        >
          <HugeiconsIcon icon={Maximize02Icon} size={13} />
        </button>
      </div>

      {/* Leads table */}
      {leadsView === "leads" ? (
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[#e9e9e7] z-10">
              <tr>
                {["Lead", "Score", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaignLeads.map((lead) => {
                const assignedToAE = isAssignedToAE(lead);
                return (
                <tr
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className="border-b border-[#e9e9e7]/40 last:border-0 hover:bg-[#f7f7f5] transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-foreground group-hover:text-foreground" style={{ fontWeight: 500 }}>{lead.name}</p>
                    <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{lead.company}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-foreground tabular-nums flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                      {lead.score} <ScoreIndicator level={lead.scoreLevel} />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#9b9a97] max-w-[120px]" style={{ fontWeight: 400 }}>
                    <div className="space-y-1">
                      <span className="line-clamp-1 flex items-center gap-1.5">
                        {STATUS_CONFIG[lead.status]?.iconKey && <IconFromKey iconKey={STATUS_CONFIG[lead.status].iconKey} size={11} color={STATUS_CONFIG[lead.status].iconColor} />}
                        {STATUS_CONFIG[lead.status]?.text ?? lead.status}
                      </span>
                      {assignedToAE && (
                        <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-px rounded border border-blue-200 bg-blue-50 text-blue-700">
                          <IconFromKey iconKey="checkmark" size={9} color="#1d4ed8" />
                          Assigned to AE
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[#e9e9e7] z-10">
              <tr>
                {["Account", "Score", "Leads", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => {
                const assignedCount = acc.leads.filter((lead) => isAssignedToAE(lead)).length;
                return (
                <tr
                  key={acc.name}
                  onClick={() => onAccountClick?.(acc.name)}
                  className="border-b border-[#e9e9e7]/40 last:border-0 hover:bg-[#f7f7f5] transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>{acc.name}</p>
                    {acc.hotLeads > 0 && (
                      <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{acc.hotLeads} hot lead{acc.hotLeads > 1 ? "s" : ""}</p>
                    )}
                    {assignedCount > 0 && (
                      <p className="text-[10px] text-blue-700" style={{ fontWeight: 500 }}>
                        {assignedCount} assigned to AE
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-foreground tabular-nums" style={{ fontWeight: 500 }}>{acc.score}</td>
                  <td className="px-4 py-3 text-[12px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>{acc.leadCount}</td>
                  <td className="px-4 py-3 text-[11px] text-[#9b9a97] max-w-[100px]" style={{ fontWeight: 400 }}>
                    <span className="line-clamp-1">{acc.status}</span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

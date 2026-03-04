import { useEffect, useRef, useState } from "react";
import {
  HugeiconsIcon,
  IconFromKey,
  Maximize02Icon,
  MoreHorizontalIcon,
  PauseIcon,
  Settings01Icon,
  Copy01Icon,
  Archive01Icon,
  Delete02Icon,
  Cancel01Icon,
  MailSend01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Search01Icon,
  Idea01Icon,
  Target02Icon,
  PencilEdit02Icon,
  CheckmarkBadge02Icon,
  HourglassIcon,
  FireIcon,
  ChartLineData02Icon,
  AlertCircleIcon,
  SparklesIcon,
  AiMagicIcon,
  FlashIcon,
  Mail01Icon,
  BarChartIcon,
  Globe02Icon,
  Dollar02Icon,
  WorkflowCircle01Icon,
  Robot01Icon,
  ArrowReloadHorizontalIcon,
} from "./icons";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtItem,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
} from "@/components/prompt-kit/chain-of-thought";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { CampaignModeState, Lead, CTAType, CampaignEmail } from "./types";
import { LEADS, SEGMENT_A_EMAILS, SEGMENT_B_EMAILS, SEGMENT_C_EMAILS, getAccountsFromLeads, ACTIVITY_LOG, CTA_OPTIONS } from "./types";
import { toast } from "sonner";

interface Props {
  modeState: CampaignModeState;
  onLeadClick: (lead: Lead) => void;
  onExpandLeads: () => void;
  onAccountClick?: (accountName: string) => void;
  marketingAgentCreated?: boolean;
}

type RightTab = "plan" | "leads" | "activity" | "dashboard";
type LeadsView = "leads" | "accounts";

const STATUS_CONFIG: Record<string, { text: string; iconKey: string; iconColor: string }> = {
  "meeting-booked": { text: "Meeting booked", iconKey: "checkmark", iconColor: "#22c55e" },
  "high-engagement": { text: "High engagement", iconKey: "chart-line", iconColor: "#3b82f6" },
  "opened-no-click": { text: "Opens, no clicks", iconKey: "alert", iconColor: "#f59e0b" },
  "partial-engagement": { text: "Partial engagement", iconKey: "", iconColor: "" },
  "no-engagement": { text: "No engagement", iconKey: "", iconColor: "" },
  "pre-send-upgrade": { text: "Pre-send upgrade", iconKey: "checkmark", iconColor: "#22c55e" },
};

function ScoreIndicator({ level }: { level: string }) {
  if (level === "hot") return <HugeiconsIcon icon={FireIcon} size={11} color="#ef4444" />;
  const color = level === "warm" ? "#f59e0b" : "#22c55e";
  return <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />;
}

export function CampaignRightPanel({ modeState, onLeadClick, onExpandLeads, onAccountClick, marketingAgentCreated }: Props) {
  const [activeTab, setActiveTab] = useState<RightTab>(
    modeState === "launched" || modeState === "running" ? "dashboard" : "plan"
  );
  const [leadsView, setLeadsView] = useState<LeadsView>("leads");
  const [sequenceModalOpen, setSequenceModalOpen] = useState(false);
  const [expandedSegments, setExpandedSegments] = useState<Record<string, boolean>>({
    A: true,
    B: true,
    C: true,
  });

  const isLaunched = modeState === "launched" || modeState === "running";
  const isPlanVisible = modeState === "plan-ready" || modeState === "launched" || modeState === "running";
  const isBuilding = modeState === "agents-running" || modeState === "agent-suggestion";

  const toggleSegment = (seg: string) =>
    setExpandedSegments((prev) => ({ ...prev, [seg]: !prev[seg] }));

  if (!isPlanVisible && !isBuilding) return null;

  const accounts = getAccountsFromLeads();

  return (
    <div
      className="shrink-0 flex flex-col h-full overflow-hidden transition-all duration-300"
      style={{ width: 420 }}
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#e0dfdd] flex items-center justify-between shrink-0 bg-white/90 backdrop-blur-sm rounded-t-xl">
        <p className="text-[13px] text-foreground truncate mr-2" style={{ fontWeight: 600 }}>
          Re-engage Stalled Pipeline Deals
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {isLaunched && (
            <span className="text-[10px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200 mr-1" style={{ fontWeight: 500 }}>
              Live
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-6 h-6 flex items-center justify-center rounded text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors">
                <HugeiconsIcon icon={MoreHorizontalIcon} size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-[12px] gap-2" onClick={() => toast.info("Campaign settings coming soon")}>
                <HugeiconsIcon icon={Settings01Icon} size={12} /> Campaign Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[12px] gap-2" onClick={() => toast.success("Campaign paused")}>
                <HugeiconsIcon icon={PauseIcon} size={12} /> Pause Campaign
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[12px] gap-2" onClick={() => toast.success("Campaign duplicated")}>
                <HugeiconsIcon icon={Copy01Icon} size={12} /> Duplicate Campaign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[12px] gap-2" onClick={() => toast.info("Campaign archived")}>
                <HugeiconsIcon icon={Archive01Icon} size={12} /> Archive Campaign
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[12px] gap-2 text-red-600 focus:text-red-600"
                onClick={() => {
                  if (confirm("Delete this campaign? This cannot be undone.")) toast.error("Campaign deleted");
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} size={12} /> Delete Campaign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Building state */}
      {isBuilding && (
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="bg-white border border-[#e0dfdd] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin shrink-0" />
              <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                Building plan...
              </p>
            </div>
            <ChainOfThought>
              <ChainOfThoughtStep defaultOpen>
                <ChainOfThoughtTrigger leftIcon={<HugeiconsIcon icon={Search01Icon} size={14} />}>
                  Analyzing 34 stalled pipeline deals
                </ChainOfThoughtTrigger>
                <ChainOfThoughtContent>
                  <ChainOfThoughtItem>Pulling CRM signals: last activity, deal age, email history</ChainOfThoughtItem>
                  <ChainOfThoughtItem>Identifying common drop-off patterns across accounts</ChainOfThoughtItem>
                  <ChainOfThoughtItem>Cross-referencing pricing page visits and agent conversations</ChainOfThoughtItem>
                </ChainOfThoughtContent>
              </ChainOfThoughtStep>

              <ChainOfThoughtStep defaultOpen>
                <ChainOfThoughtTrigger leftIcon={<HugeiconsIcon icon={Idea01Icon} size={14} />}>
                  Segmenting by engagement signals
                </ChainOfThoughtTrigger>
                <ChainOfThoughtContent>
                  <ChainOfThoughtItem>Segment A (Hot): pricing intent + recent agent convo — 18 leads</ChainOfThoughtItem>
                  <ChainOfThoughtItem>Segment B (Warm): some engagement, no purchase signal — 10 leads</ChainOfThoughtItem>
                  <ChainOfThoughtItem>Segment C (Re-engage): previously closed-lost, grouped by reason — 6 leads</ChainOfThoughtItem>
                </ChainOfThoughtContent>
              </ChainOfThoughtStep>

              <ChainOfThoughtStep>
                <ChainOfThoughtTrigger leftIcon={<HugeiconsIcon icon={Target02Icon} size={14} />}>
                  Drafting personalized email sequences
                </ChainOfThoughtTrigger>
                <ChainOfThoughtContent>
                  <ChainOfThoughtItem>Matching tone and CTA to segment urgency level</ChainOfThoughtItem>
                  <ChainOfThoughtItem>Scheduling send windows based on past open-time patterns</ChainOfThoughtItem>
                  <ChainOfThoughtItem>Preparing fallback sequences for non-openers</ChainOfThoughtItem>
                </ChainOfThoughtContent>
              </ChainOfThoughtStep>
            </ChainOfThought>
          </div>
        </div>
      )}

      {/* Tabs — shown when plan is visible */}
      {isPlanVisible && (
        <>
          <div className="px-5 flex items-center gap-1 border-b border-[#e9e9e7] shrink-0">
            {(isLaunched
              ? (["dashboard", "activity", "plan", "leads"] as RightTab[])
              : (["plan", "leads"] as RightTab[])
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-3 text-[12px] capitalize relative transition-colors ${
                  activeTab === tab
                    ? "text-foreground"
                    : "text-[#9b9a97] hover:text-foreground/70"
                }`}
                style={{ fontWeight: activeTab === tab ? 500 : 400 }}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-foreground rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* ── Plan Tab ─────────────────────────────────────────────────── */}
          {activeTab === "plan" && (
            <div className="flex-1 overflow-y-auto">
              {/* Plan tab header */}
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>Campaign Plan</p>
                <button
                  onClick={() => setSequenceModalOpen(true)}
                  className="text-[11px] text-[#9b9a97] hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#f7f7f5]"
                  style={{ fontWeight: 400 }}
                >
                  <HugeiconsIcon icon={PencilEdit02Icon} size={11} /> Manage sequence
                </button>
              </div>
              <div className="px-5 pb-5 pt-1">
                {/* Agents Involved */}
                {marketingAgentCreated && (
                  <div className="bg-white border border-[#e0dfdd] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="px-4 py-2.5 bg-[#fafaf9] border-b border-[#e0dfdd]">
                      <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                        Agents
                      </p>
                    </div>
                    <div className="divide-y divide-[#e9e9e7]">
                      {/* Email Agent */}
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "#eff6ff" }}
                        >
                          <span className="text-[10px]" style={{ color: "#2563eb", fontWeight: 700 }}>EA</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>Email Agent</p>
                          <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                            Handles email sequence and delivery
                          </p>
                        </div>
                        <span className="text-[10px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200" style={{ fontWeight: 500 }}>
                          Active
                        </span>
                      </div>
                      {/* Marketing Agent */}
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "#faf5ff" }}
                        >
                          <span className="text-[10px]" style={{ color: "#9333ea", fontWeight: 700 }}>MA</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>Marketing Agent</p>
                          <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                            Interacts with recipients, enriches warm context
                          </p>
                        </div>
                        <button
                          onClick={() => window.open("#", "_blank")}
                          className="text-[10px] px-1.5 py-px rounded border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:border-[#c8c8c6] transition-colors"
                          style={{ fontWeight: 400 }}
                        >
                          Open ↗
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative pl-6 space-y-4 mt-4">
                  <div className="absolute left-[7px] top-4 bottom-4 w-px bg-[#e9e9e7]" />
                  {/* Segment A */}
                  <div className="relative">
                    <div className="absolute -left-6 top-4 w-3.5 h-3.5 rounded-full border-2 border-white z-10" style={{ background: isLaunched ? "#ef4444" : "white", boxShadow: "0 0 0 1.5px " + (isLaunched ? "#ef4444" : "#e9e9e7") }} />
                    <SegmentBlock
                      name="Segment A: Hot"
                      count={18}
                      description="Pricing page visitors, agent convos"
                      cadence="2 emails · 3 days · Aggressive"
                      color="red"
                      expanded={expandedSegments["A"]}
                      onToggle={() => toggleSegment("A")}
                      emails={SEGMENT_A_EMAILS}
                      isLaunched={isLaunched}
                    />
                  </div>
                  {/* Segment B */}
                  <div className="relative">
                    <div className="absolute -left-6 top-4 w-3.5 h-3.5 rounded-full border-2 border-white z-10" style={{ background: isLaunched ? "#f59e0b" : "white", boxShadow: "0 0 0 1.5px " + (isLaunched ? "#f59e0b" : "#e9e9e7") }} />
                    <SegmentBlock
                      name="Segment B: Warm"
                      count={10}
                      description="Some engagement, no pricing intent"
                      cadence="3 emails · 7 days · Moderate"
                      color="yellow"
                      expanded={expandedSegments["B"]}
                      onToggle={() => toggleSegment("B")}
                      emails={SEGMENT_B_EMAILS}
                      isLaunched={isLaunched}
                    />
                  </div>
                  {/* Segment C */}
                  <div className="relative">
                    <div className="absolute -left-6 top-4 w-3.5 h-3.5 rounded-full border-2 border-white z-10" style={{ background: isLaunched ? "#22c55e" : "white", boxShadow: "0 0 0 1.5px " + (isLaunched ? "#22c55e" : "#e9e9e7") }} />
                    <SegmentBlock
                      name="Segment C: Re-engage"
                      count={6}
                      description="Previous closed-lost, by reason"
                      cadence="3 emails · 10 days · Gentle"
                      color="green"
                      expanded={expandedSegments["C"]}
                      onToggle={() => toggleSegment("C")}
                      emails={SEGMENT_C_EMAILS}
                      isLaunched={isLaunched}
                    />
                  </div>
                </div>
              </div>

              {/* Launch button */}
              <div className="px-5 pb-5 shrink-0">
                {isLaunched ? (
                  <div className="w-full flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 border border-green-200 flex-1 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                      <span className="text-[12px] text-green-700 truncate" style={{ fontWeight: 500 }}>Live</span>
                      <span className="text-[11px] text-green-600/60 truncate" style={{ fontWeight: 400 }}>3 meetings booked</span>
                    </div>
                    <button onClick={() => toast.info("Campaign settings coming soon")} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors shrink-0" title="Campaign settings">
                      <HugeiconsIcon icon={Settings01Icon} size={13} />
                    </button>
                    <button onClick={() => toast.success("Campaign paused")} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors shrink-0" title="Pause campaign">
                      <HugeiconsIcon icon={PauseIcon} size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg text-[13px] bg-[#f7f7f5] text-[#9b9a97] border border-[#e9e9e7] cursor-default"
                    style={{ fontWeight: 400 }}
                  >
                    Launch Campaign
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Leads Tab ────────────────────────────────────────────────── */}
          {activeTab === "leads" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Sub-header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-[#e9e9e7] shrink-0">
                <div className="flex items-center bg-[#f4f4f2] rounded-lg p-0.5 gap-0.5">
                  {(["leads", "accounts"] as LeadsView[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setLeadsView(v)}
                      className={`px-3.5 py-1.5 rounded-md text-[11px] capitalize transition-all ${
                        leadsView === v
                          ? "bg-white text-foreground shadow-sm"
                          : "text-[#9b9a97] hover:text-foreground/70"
                      }`}
                      style={{ fontWeight: leadsView === v ? 500 : 400 }}
                    >
                      {v}
                    </button>
                  ))}
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
                        {["Lead", "Seg", "Score", "Status"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left text-[10px] text-[#9b9a97] uppercase tracking-wider"
                            style={{ fontWeight: 500 }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {LEADS.map((lead) => (
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
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f4f4f2] text-[#6b6a67]" style={{ fontWeight: 500 }}>
                              {lead.segment}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[12px] text-foreground tabular-nums flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                              {lead.score} <ScoreIndicator level={lead.scoreLevel} />
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-[#9b9a97] max-w-[100px]" style={{ fontWeight: 400 }}>
                            <span className="line-clamp-1 flex items-center gap-1.5">
                              {STATUS_CONFIG[lead.status]?.iconKey && <IconFromKey iconKey={STATUS_CONFIG[lead.status].iconKey} size={11} color={STATUS_CONFIG[lead.status].iconColor} />}
                              {STATUS_CONFIG[lead.status]?.text ?? lead.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[#e9e9e7] z-10">
                      <tr>
                        {["Account", "Score", "Leads", "Status"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left text-[10px] text-[#9b9a97] uppercase tracking-wider"
                            style={{ fontWeight: 500 }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((acc) => (
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
                          </td>
                          <td className="px-4 py-3 text-[12px] text-foreground tabular-nums" style={{ fontWeight: 500 }}>
                            {acc.score}
                          </td>
                          <td className="px-4 py-3 text-[12px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>
                            {acc.leadCount}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-[#9b9a97] max-w-[100px]" style={{ fontWeight: 400 }}>
                            <span className="line-clamp-1">{acc.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Activity Tab ─────────────────────────────────────────────── */}
          {activeTab === "activity" && (
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="relative pl-5">
                {/* Vertical timeline line */}
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#e9e9e7]" />
                <div className="space-y-0">
                  {ACTIVITY_LOG.map((item, i) => {
                    const isHighlight = item.icon === "calendar" || item.icon === "checkmark";
                    return (
                      <div key={i} className="relative flex items-start gap-3 py-2.5 group">
                        {/* Timeline dot */}
                        <div
                          className="absolute -left-5 top-3.5 w-2.5 h-2.5 rounded-full border-2 border-white z-10 shrink-0"
                          style={{
                            background: isHighlight ? "#22c55e" : "#d4d4d1",
                            boxShadow: `0 0 0 1.5px ${isHighlight ? "#22c55e" : "#e9e9e7"}`,
                          }}
                        />
                        <div
                          className={`flex-1 min-w-0 rounded-xl px-3.5 py-2.5 transition-colors ${
                            isHighlight
                              ? "bg-green-50/60 border border-green-100"
                              : "group-hover:bg-[#fafaf9]"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="shrink-0 mt-0.5">
                              <IconFromKey iconKey={item.icon} size={13} color={isHighlight ? "#22c55e" : undefined} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] text-foreground" style={{ fontWeight: isHighlight ? 500 : 400, lineHeight: 1.5 }}>
                                {item.text}
                              </p>
                              <p className="text-[10px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
                                {item.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Dashboard Tab ────────────────────────────────────────────── */}
          {activeTab === "dashboard" && <DashboardTab modeState={modeState} />}
        </>
      )}

      {/* Manage Sequence modal */}
      {sequenceModalOpen && (
        <ManageSequenceModal onClose={() => setSequenceModalOpen(false)} />
      )}
    </div>
  );
}

// ── Segment block ────────────────────────────────────────────────────────

interface SegmentBlockProps {
  name: string;
  count: number;
  description: string;
  cadence: string;
  color: "red" | "yellow" | "green";
  expanded: boolean;
  onToggle: () => void;
  emails: typeof SEGMENT_A_EMAILS;
  isLaunched: boolean;
}

function SegmentBlock({ name, count, description, cadence, expanded, onToggle, emails, isLaunched }: SegmentBlockProps) {
  return (
    <div className="bg-white border border-[#e0dfdd] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-start gap-2.5 hover:bg-[#fafaf9] transition-colors text-left"
      >
        <span className="mt-0.5 text-[#9b9a97]">
          {expanded ? <HugeiconsIcon icon={ArrowDown01Icon} size={13} /> : <HugeiconsIcon icon={ArrowDown01Icon} size={13} className="rotate-[-90deg]" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>{name}</p>
            <span className="text-[10px] px-1.5 py-px rounded bg-[#f4f4f2] text-[#6b6a67]" style={{ fontWeight: 500 }}>{count}</span>
          </div>
          <p className="text-[11px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>{description}</p>
          <p className="text-[10px] text-[#b8b8b5] mt-0.5" style={{ fontWeight: 400 }}>{cadence}</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#e9e9e7] divide-y divide-[#e9e9e7]">
          {emails.map((email) => (
            <EmailRow key={email.id} email={email} isLaunched={isLaunched} segmentName={name} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmailRow({ email, isLaunched, segmentName }: { email: typeof SEGMENT_A_EMAILS[0]; isLaunched: boolean; segmentName: string }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const statusIcon =
    email.status === "sent" && isLaunched
      ? <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" />
      : email.status === "scheduled" && isLaunched
      ? <HugeiconsIcon icon={HourglassIcon} size={11} color="#f59e0b" />
      : <span className="w-2 h-2 rounded-full border border-[#d4d4d1] inline-block" />;

  const statusLabel =
    email.status === "sent" && isLaunched
      ? `SENT — ${email.sentCount}/${email.sentCount}`
      : email.status === "scheduled" && isLaunched
      ? `Scheduled ${email.scheduledFor}`
      : `Day ${email.day}`;

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-2 mb-1.5">
        <span className="shrink-0 mt-0.5 flex items-center">{statusIcon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 500 }}>{statusLabel}</p>
          <p className="text-[12px] text-foreground mt-0.5 line-clamp-1" style={{ fontWeight: 400 }}>
            "{email.subject}"
          </p>
          <p className="text-[11px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>{email.cta}</p>
        </div>
      </div>

      {/* Metrics for sent emails */}
      {email.status === "sent" && isLaunched && email.openRate !== undefined && (
        <div className="flex items-center gap-3 ml-4 mt-1">
          <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
            {email.openRate}% opened
          </span>
          <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
            {email.clickRate}% clicked
          </span>
        </div>
      )}

      {/* Auto-send toggle for scheduled */}
      {email.status === "scheduled" && isLaunched && (
        <div className="flex items-center gap-2 ml-4 mt-1.5">
          <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Auto-send</span>
          <div className="w-7 h-3.5 rounded-full bg-foreground relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 rounded-full bg-white" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 ml-4 mt-1.5">
        <button
          onClick={() => setPreviewOpen((v) => !v)}
          className={`text-[10px] transition-colors px-1.5 py-px rounded border hover:border-[#c8c8c6] ${
            previewOpen
              ? "bg-foreground text-white border-foreground"
              : "text-[#9b9a97] hover:text-foreground border-[#e9e9e7]"
          }`}
          style={{ fontWeight: 400 }}
        >
          {previewOpen ? "Close" : "Preview"}
        </button>
        <button
          className="text-[10px] text-[#9b9a97] hover:text-foreground transition-colors px-1.5 py-px rounded border border-[#e9e9e7] hover:border-[#c8c8c6]"
          style={{ fontWeight: 400 }}
          onClick={() => setEditOpen(true)}
        >
          Edit
        </button>
      </div>

      {editOpen && (
        <EmailEditModal email={email} segmentName={segmentName} onClose={() => setEditOpen(false)} />
      )}

      {/* Inline email preview */}
      {previewOpen && (
        <div className="mt-3 ml-4 border border-[#e9e9e7] rounded-xl overflow-hidden bg-[#fafaf9]">
          <div className="px-3 py-2 border-b border-[#e9e9e7]">
            <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>To: [Lead name] · Segment</p>
            <p className="text-[11px] text-foreground mt-0.5 leading-snug" style={{ fontWeight: 500 }}>
              {email.subject}
            </p>
          </div>
          <div className="px-3 py-3 space-y-2">
            <p className="text-[11px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
              Hi [First name],
            </p>
            <p className="text-[11px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
              {email.preview}
            </p>
            <div className="pt-1">
              <span className="inline-block text-[10px] px-2 py-1 rounded-lg bg-foreground text-white" style={{ fontWeight: 500 }}>
                {email.cta} →
              </span>
            </div>
            <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
              Each lead receives a version personalized to their warm context.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Manage Sequence Modal ─────────────────────────────────────────────────

const SEQ_SEGMENTS = [
  { key: "A", name: "Segment A: Hot", color: "#ef4444", cadence: "2 emails · 3 days · Aggressive", emails: SEGMENT_A_EMAILS },
  { key: "B", name: "Segment B: Warm", color: "#f59e0b", cadence: "3 emails · 7 days · Moderate", emails: SEGMENT_B_EMAILS },
  { key: "C", name: "Segment C: Re-engage", color: "#22c55e", cadence: "3 emails · 10 days · Gentle", emails: SEGMENT_C_EMAILS },
];

function ManageSequenceModal({ onClose }: { onClose: () => void }) {
  const [editingEmail, setEditingEmail] = useState<{ email: CampaignEmail; segmentName: string } | null>(null);

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "80vw", height: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between shrink-0">
          <div>
            <p className="text-[15px] text-foreground" style={{ fontWeight: 600 }}>Email Sequence</p>
            <p className="text-[12px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
              Re-engage Stalled Pipeline Deals · 8 emails across 3 segments
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {SEQ_SEGMENTS.map((seg) => (
            <div key={seg.key}>
              {/* Segment header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
                <p className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>{seg.name}</p>
                <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{seg.cadence}</span>
              </div>

              {/* Timeline */}
              <div className="relative pl-7 space-y-3">
                {/* Vertical connector */}
                <div className="absolute left-[7px] top-3 bottom-8 w-px bg-[#e9e9e7]" />

                {seg.emails.map((email, ei) => (
                  <div key={email.id} className="relative">
                    {/* Timeline dot */}
                    <div
                      className="absolute -left-7 top-3.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-1"
                      style={{ background: seg.color, outlineColor: seg.color }}
                    />
                    {/* Email card */}
                    <div className="border border-[#e9e9e7] rounded-xl p-4 hover:border-foreground/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f7f7f5] text-[#9b9a97]" style={{ fontWeight: 500 }}>
                              Day {email.day}
                            </span>
                            <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Email {ei + 1}</span>
                            {email.status === "sent" && (
                              <span className="text-[10px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200" style={{ fontWeight: 500 }}>Sent</span>
                            )}
                            {email.status === "scheduled" && (
                              <span className="text-[10px] px-1.5 py-px rounded bg-blue-50 text-blue-700 border border-blue-200" style={{ fontWeight: 500 }}>Scheduled</span>
                            )}
                            {email.status === "pending" && (
                              <span className="text-[10px] px-1.5 py-px rounded bg-[#f7f7f5] text-[#9b9a97] border border-[#e9e9e7]" style={{ fontWeight: 500 }}>Pending</span>
                            )}
                          </div>
                          <p className="text-[13px] text-foreground mb-1" style={{ fontWeight: 500 }}>"{email.subject}"</p>
                          <p className="text-[12px] text-[#9b9a97] mb-2.5" style={{ fontWeight: 400 }}>{email.preview}</p>
                          <span className="text-[11px] px-2 py-1 rounded-full bg-[#efefed] text-foreground" style={{ fontWeight: 400 }}>{email.cta}</span>
                        </div>
                        {/* Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toast.info("Timing editor coming soon")}
                            className="text-[11px] px-2 py-1 rounded-lg border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:border-[#c8c8c6] transition-colors"
                            style={{ fontWeight: 400 }}
                          >
                            Edit timing
                          </button>
                          <button
                            onClick={() => setEditingEmail({ email, segmentName: seg.name })}
                            className="text-[11px] px-2 py-1 rounded-lg border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:border-[#c8c8c6] transition-colors"
                            style={{ fontWeight: 400 }}
                          >
                            Edit
                          </button>
                          {seg.emails.length > 1 && (
                            <button
                              onClick={() => toast.success(`Removed email ${ei + 1} from Segment ${seg.key}`)}
                              className="text-[11px] px-2 py-1 rounded-lg border border-[#e9e9e7] text-red-500 hover:text-red-600 hover:border-red-200 transition-colors"
                              style={{ fontWeight: 400 }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add email button */}
                <div className="relative">
                  <div className="absolute -left-7 top-2 w-3.5 h-3.5 rounded-full border-2 border-[#e9e9e7] bg-white" />
                  <button
                    onClick={() => toast.success(`New email added to Segment ${seg.key}`)}
                    className="text-[11px] flex items-center gap-1.5 text-[#9b9a97] hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-dashed border-[#d4d4d1] hover:border-foreground/30"
                    style={{ fontWeight: 400 }}
                  >
                    + Add email to sequence
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {editingEmail && (
        <EmailEditModal
          email={editingEmail.email}
          segmentName={editingEmail.segmentName}
          onClose={() => setEditingEmail(null)}
        />
      )}
    </div>
  );
}

// ── Email Edit Modal ───────────────────────────────────────────────────────

// Generated email bodies keyed by prompt hash for demo
const GENERATED_EMAILS: Record<string, string> = {
  default: `Hi Sarah,

I noticed your team at Acme Corp has been exploring our manufacturing solutions — especially the pricing page and our SOC 2 compliance features.

Given your focus on enterprise security, I thought it'd be worth connecting. We've helped similar teams cut audit prep time by 60% while staying fully compliant.

If you're open to a quick chat, here's my calendar: docket.io/book/sandeep

Best,
Sandeep`,
  followup: `Hi Sarah,

Quick follow-up on my earlier note. I know things get buried — wanted to make sure this didn't slip through.

We've been working with a few teams in your space on audit trail automation, and the results have been pretty compelling (one team went from 3 weeks of prep to 2 days).

If that resonates, happy to walk you through it — just pick a time here: docket.io/book/sandeep

No pressure either way.

Sandeep`,
  reengagement: `Hi Sarah,

It's been a while since we last connected — and a lot has changed on our end.

We've rolled out a new pricing tier that addresses the concerns teams like yours have raised, plus some major improvements to our compliance automation.

Thought it might be worth a fresh look. Happy to send over the details, or if a quick call is easier: docket.io/book/sandeep

Best,
Sandeep`,
};

function getDefaultPrompt(email: CampaignEmail, segmentName: string): string {
  if (segmentName.includes("Re-engage")) {
    return "Write a re-engagement email acknowledging it's been a while. Mention what's changed and improved. Keep it warm and low-pressure. 3-4 sentences max.";
  }
  if (email.number === 1) {
    return "Write a personalized first-touch email referencing their recent activity and engagement signals. Be specific about what they've been exploring. Keep it concise — 3-4 sentences.";
  }
  return "Write a friendly follow-up to the previous email. Reference the earlier touchpoint without being pushy. Offer value and keep it brief — 2-3 sentences.";
}

function getGeneratedBody(prompt: string, email: CampaignEmail): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("re-engag") || lower.includes("been a while") || lower.includes("changed")) {
    return GENERATED_EMAILS.reengagement;
  }
  if (lower.includes("follow-up") || lower.includes("followup") || lower.includes("previous")) {
    return GENERATED_EMAILS.followup;
  }
  return GENERATED_EMAILS.default;
}

const PROMPT_TEMPLATES = [
  { label: "First touch — reference activity", value: "Write a personalized first-touch email referencing their recent activity and engagement signals. Be specific about what they've been exploring. Keep it concise — 3-4 sentences." },
  { label: "Warm follow-up", value: "Write a friendly follow-up to the previous email. Reference the earlier touchpoint without being pushy. Offer value and keep it brief — 2-3 sentences." },
  { label: "Re-engagement", value: "Write a re-engagement email acknowledging it's been a while. Mention what's changed and improved. Keep it warm and low-pressure. 3-4 sentences max." },
  { label: "Value-first — share insight", value: "Lead with a specific insight or data point relevant to their industry. Don't ask for anything — just share value. 2-3 sentences." },
  { label: "Social proof — case study angle", value: "Reference a relevant case study or customer win in their space. Tie it to their specific challenges. Keep it brief and credible — 3 sentences." },
];

const PREVIEW_LEADS = [
  { name: "Sarah Chen", company: "Acme Corp", email: "sarah@acmecorp.com", initial: "S" },
  { name: "Tom Liu", company: "Datadog", email: "tom@datadog.com", initial: "T" },
  { name: "James Wong", company: "CloudBase", email: "james@cloudbase.io", initial: "J" },
  { name: "Dave Kim", company: "StartupX", email: "dave@startupx.com", initial: "D" },
  { name: "Lisa Park", company: "OldCorp", email: "lisa@oldcorp.com", initial: "L" },
];

function EmailEditModal({
  email,
  segmentName,
  onClose,
}: {
  email: CampaignEmail;
  segmentName: string;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState(email.subject);
  const [prompt, setPrompt] = useState(getDefaultPrompt(email, segmentName));
  const [generatedBody, setGeneratedBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [ctaType, setCtaType] = useState<CTAType>("dynamic");
  const [tone, setTone] = useState<"professional" | "casual" | "urgent">("professional");
  const [aiLoading, setAiLoading] = useState(false);
  const [previewLeadIdx, setPreviewLeadIdx] = useState(0);
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const previewLead = PREVIEW_LEADS[previewLeadIdx];

  const handleAiImprove = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setSubject("One quick question about your evaluation, {{first_name}}");
      toast.success("Subject line improved");
    }, 1400);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setHasGenerated(false);

    // Simulate streaming-style generation
    const fullBody = getGeneratedBody(prompt, email);
    const words = fullBody.split(" ");
    let current = "";
    let i = 0;

    const interval = setInterval(() => {
      const chunk = Math.min(3, words.length - i); // 3 words at a time
      current += (i > 0 ? " " : "") + words.slice(i, i + chunk).join(" ");
      i += chunk;
      setGeneratedBody(current);

      if (i >= words.length) {
        clearInterval(interval);
        setIsGenerating(false);
        setHasGenerated(true);
        toast.success("Email generated");
      }
    }, 50);
  };

  const handleSave = () => {
    toast.success("Email updated");
    onClose();
  };

  // Auto-generate on first mount
  useState(() => {
    handleGenerate();
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ width: "min(92vw, 1080px)", height: "min(90vh, 780px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f7f7f5] border border-[#e9e9e7] flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Mail01Icon} size={14} />
            </div>
            <div>
              <p className="text-[15px] text-foreground" style={{ fontWeight: 600 }}>
                Edit Email {email.number}
              </p>
              <p className="text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                {segmentName} · Day {email.day}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-[12px] text-[#9b9a97] hover:text-foreground border border-[#e9e9e7] hover:border-[#c8c8c6] transition-colors"
              style={{ fontWeight: 400 }}
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={!hasGenerated}
              className="px-4 py-1.5 rounded-lg text-[12px] bg-foreground text-white hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ fontWeight: 500 }}
            >
              Save changes
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors ml-1"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={15} />
            </button>
          </div>
        </div>

        {/* ── Split body ── */}
        <div className="flex-1 overflow-hidden flex min-h-0">

          {/* Left — prompt editor */}
          <div className="w-[44%] border-r border-[#e9e9e7] flex flex-col overflow-y-auto">

            {/* Tone selector */}
            <div className="px-5 pt-4 pb-3.5 border-b border-[#e9e9e7]">
              <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-2" style={{ fontWeight: 500 }}>Tone</p>
              <div className="flex gap-1.5">
                {(["professional", "casual", "urgent"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1 rounded-full text-[11px] capitalize border transition-colors ${
                      tone === t
                        ? "bg-foreground text-white border-foreground"
                        : "text-[#9b9a97] border-[#e9e9e7] hover:border-[#c8c8c6] hover:text-foreground"
                    }`}
                    style={{ fontWeight: tone === t ? 500 : 400 }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject line */}
            <div className="px-5 py-4 border-b border-[#e9e9e7]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>Subject line</p>
                <button
                  onClick={handleAiImprove}
                  disabled={aiLoading}
                  className="flex items-center gap-1 text-[10px] text-[#9b9a97] hover:text-foreground transition-colors disabled:opacity-40"
                  style={{ fontWeight: 400 }}
                >
                  {aiLoading
                    ? <div className="w-2.5 h-2.5 rounded-full border border-t-foreground border-[#e9e9e7] animate-spin" />
                    : <HugeiconsIcon icon={SparklesIcon} size={10} />}
                  {aiLoading ? "Improving..." : "Improve with AI"}
                </button>
              </div>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-[13px] text-foreground bg-[#fafaf9] border border-[#e9e9e7] rounded-lg px-3 py-2 outline-none focus:border-foreground/30 transition-colors"
                style={{ fontWeight: 400 }}
                placeholder="Email subject…"
              />
              <p className="text-[10px] text-[#9b9a97] mt-1.5" style={{ fontWeight: 400 }}>
                {subject.length} chars · {subject.split(" ").filter(Boolean).length} words
              </p>
            </div>

            {/* Prompt — replaces the old email body textarea */}
            <div className="px-5 py-4 border-b border-[#e9e9e7] flex-1 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-foreground flex items-center justify-center">
                    <span className="text-white text-[8px]" style={{ fontWeight: 700 }}>AI</span>
                  </div>
                  <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>Prompt</p>
                </div>
                {/* Template dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                    className="flex items-center gap-1 text-[10px] text-[#9b9a97] hover:text-foreground transition-colors"
                    style={{ fontWeight: 400 }}
                  >
                    Templates <HugeiconsIcon icon={ArrowDown01Icon} size={10} />
                  </button>
                  {showTemplateDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowTemplateDropdown(false)} />
                      <div className="absolute right-0 top-6 z-20 w-[260px] bg-white rounded-lg border border-[#e9e9e7] shadow-lg py-1 animate-in fade-in duration-150">
                        {PROMPT_TEMPLATES.map((t) => (
                          <button
                            key={t.label}
                            onClick={() => { setPrompt(t.value); setShowTemplateDropdown(false); }}
                            className="w-full text-left px-3 py-2 text-[11px] text-foreground hover:bg-[#f7f7f5] transition-colors"
                            style={{ fontWeight: 400, lineHeight: 1.4 }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full text-[13px] text-foreground bg-[#fafaf9] border border-[#e9e9e7] rounded-lg px-3 py-2.5 outline-none focus:border-foreground/30 transition-colors resize-none flex-1"
                style={{ fontWeight: 400, lineHeight: 1.7, minHeight: 120 }}
                rows={5}
                placeholder="Describe what this email should say…"
              />

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Try:</span>
                {[
                  "Reference their pricing page visits",
                  "Mention the competitor switch",
                  "Keep it under 3 sentences",
                ].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setPrompt((p) => p + (p.endsWith(" ") || !p ? "" : " ") + hint + ".")}
                    className="text-[10px] px-1.5 py-px rounded border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:border-[#c8c8c6] hover:bg-[#fafaf9] transition-colors"
                    style={{ fontWeight: 400 }}
                  >
                    {hint}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full mt-1 px-4 py-2 rounded-lg text-[12px] bg-foreground text-white hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ fontWeight: 500 }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Generating…
                  </>
                ) : hasGenerated ? (
                  <>
                    <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={11} /> Show example with this prompt
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={SparklesIcon} size={11} /> Show example email
                  </>
                )}
              </button>
            </div>

            {/* CTA picker */}
            <div className="px-5 py-4">
              <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-2.5" style={{ fontWeight: 500 }}>Call to action</p>
              <div className="space-y-2">
                {/* Dynamic CTA — default */}
                <button
                  onClick={() => setCtaType("dynamic")}
                  className={`w-full px-3 py-2.5 rounded-lg text-left border transition-colors ${
                    ctaType === "dynamic"
                      ? "bg-foreground text-white border-foreground"
                      : "text-foreground border-[#e9e9e7] hover:border-[#c8c8c6] bg-[#fafaf9] hover:bg-white"
                  }`}
                >
                  <span className="text-[11px] block" style={{ fontWeight: 500 }}>
                    <HugeiconsIcon icon={AiMagicIcon} size={11} /> Dynamic CTA
                  </span>
                  <span className={`text-[10px] block mt-0.5 ${ctaType === "dynamic" ? "text-white/70" : "text-[#9b9a97]"}`} style={{ fontWeight: 400 }}>
                    AI picks the best CTA per lead based on their signals
                  </span>
                </button>

                {/* Manual options */}
                <p className="text-[9px] text-[#9b9a97] uppercase tracking-wider pt-0.5" style={{ fontWeight: 500 }}>Or set manually</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {CTA_OPTIONS.filter((opt) => opt.value !== "dynamic").map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCtaType(opt.value)}
                      className={`px-2.5 py-2 rounded-lg text-[11px] text-left border transition-colors ${
                        ctaType === opt.value
                          ? "bg-foreground text-white border-foreground"
                          : "text-foreground border-[#e9e9e7] hover:border-[#c8c8c6] bg-[#fafaf9] hover:bg-white"
                      }`}
                      style={{ fontWeight: ctaType === opt.value ? 500 : 400 }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — generated preview */}
          <div className="flex-1 bg-[#f7f7f5] flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e9e9e7] bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>Example email</p>
                {isGenerating && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                    <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Writing…</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Previewing as</span>
                <div className="relative">
                  <button
                    onClick={() => setShowLeadDropdown(!showLeadDropdown)}
                    className="flex items-center gap-1 text-[10px] text-foreground px-2 py-0.5 rounded-full bg-[#f7f7f5] border border-[#e9e9e7] hover:border-[#c8c8c6] transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    {previewLead.name} · {previewLead.company}
                    <HugeiconsIcon icon={ArrowDown01Icon} size={9} />
                  </button>
                  {showLeadDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowLeadDropdown(false)} />
                      <div className="absolute right-0 top-7 z-20 w-[220px] bg-white rounded-lg border border-[#e9e9e7] shadow-lg py-1 animate-in fade-in duration-150">
                        <p className="px-3 py-1.5 text-[9px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>Leads</p>
                        {PREVIEW_LEADS.map((lead, idx) => (
                          <button
                            key={lead.name}
                            onClick={() => { setPreviewLeadIdx(idx); setShowLeadDropdown(false); }}
                            className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#f7f7f5] transition-colors flex items-center gap-2 ${
                              idx === previewLeadIdx ? "text-foreground bg-[#f7f7f5]" : "text-[#9b9a97]"
                            }`}
                            style={{ fontWeight: idx === previewLeadIdx ? 500 : 400 }}
                          >
                            <div
                              className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center shrink-0"
                            >
                              <span className="text-white text-[7px]" style={{ fontWeight: 700 }}>{lead.initial}</span>
                            </div>
                            {lead.name} · {lead.company}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex justify-center">
              <div className="w-full max-w-[500px] space-y-3">

                {!generatedBody && !isGenerating ? (
                  /* Empty state — no email generated yet */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#f0f0ef] flex items-center justify-center mb-4">
                      <HugeiconsIcon icon={SparklesIcon} size={20} />
                    </div>
                    <p className="text-[14px] text-foreground mb-1" style={{ fontWeight: 500 }}>Write a prompt to see an example</p>
                    <p className="text-[12px] text-[#9b9a97] max-w-[280px]" style={{ fontWeight: 400 }}>
                      Describe what the email should say and we'll show you how it would look for each lead.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Email client card */}
                    <div className="bg-white rounded-xl border border-[#e9e9e7] shadow-sm overflow-hidden">
                      {/* Email "header" bar */}
                      <div className="px-5 pt-4 pb-3 border-b border-[#e9e9e7] bg-[#fafaf9]">
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center shrink-0">
                            <span className="text-white text-[10px]" style={{ fontWeight: 700 }}>S</span>
                          </div>
                          <div>
                            <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Sandeep from Docket</p>
                            <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>to: {previewLead.email}</p>
                          </div>
                        </div>
                        <p className="text-[14px] text-foreground leading-snug" style={{ fontWeight: 600 }}>
                          {subject.replace(/\{\{first_name\}\}/g, previewLead.name.split(" ")[0]).replace(/\{\{company\}\}/g, previewLead.company) || "—"}
                        </p>
                      </div>

                      {/* Email body */}
                      <div className="px-5 py-4 space-y-3">
                        <p
                          className="text-[13px] text-foreground whitespace-pre-wrap"
                          style={{ fontWeight: 400, lineHeight: 1.75 }}
                        >
                          {generatedBody
                            .replace(/\bSarah\b/g, previewLead.name.split(" ")[0])
                            .replace(/\bAcme Corp\b/g, previewLead.company)
                            .replace(/sarah@acmecorp\.com/g, previewLead.email)
                            .split(/(docket\.io\/\S+)/g).map((part, i) =>
                            /^docket\.io\//.test(part) ? (
                              <span key={i} className="text-blue-600 underline underline-offset-2">{part}</span>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                          {isGenerating && <span className="inline-block w-0.5 h-4 bg-foreground ml-0.5 animate-pulse align-text-bottom" />}
                        </p>
                      </div>
                    </div>

                    {/* Personalization note */}
                    {hasGenerated && (
                      <div className="px-3 py-2.5 bg-[#f7f7f5] border border-[#e9e9e7] rounded-lg flex items-start gap-2">
                        <div className="w-4 h-4 rounded bg-foreground flex items-center justify-center shrink-0 mt-px">
                          <span className="text-white text-[7px]" style={{ fontWeight: 700 }}>AI</span>
                        </div>
                        <p className="text-[11px] text-[#6b6a67]" style={{ fontWeight: 400, lineHeight: 1.55 }}>
                          This is an example for {previewLead.name}. Each lead gets a unique version based on their warm context, engagement history, and CRM signals.
                        </p>
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Dashboard Tab components ───────────────────────────────────────────────

interface DashEmailData {
  day: number;
  sent: number;
  openRate: number;
  clickRate: number;
  cta: string;
  ctaClicks: number;
  meetings: number;
  note?: string;
}

interface DashSegmentData {
  key: string;
  name: string;
  color: string;
  leads: number;
  sent: number;
  opens: number;
  clicks: number;
  replies: number;
  meetings: number;
  emails: DashEmailData[];
}

const DASH_SEGMENTS: DashSegmentData[] = [
  {
    key: "A",
    name: "Segment A (Hot)",
    color: "#ef4444",
    leads: 18,
    sent: 34,
    opens: 78,
    clicks: 33,
    replies: 2,
    meetings: 2,
    emails: [
      { day: 0, sent: 18, openRate: 78, clickRate: 33, cta: "Booking link", ctaClicks: 6, meetings: 2 },
      { day: 3, sent: 16, openRate: 63, clickRate: 25, cta: "Booking link", ctaClicks: 4, meetings: 1, note: "2 leads excluded (already booked)" },
    ],
  },
  {
    key: "B",
    name: "Segment B (Warm)",
    color: "#f59e0b",
    leads: 10,
    sent: 10,
    opens: 70,
    clicks: 20,
    replies: 0,
    meetings: 1,
    emails: [
      { day: 0, sent: 10, openRate: 70, clickRate: 20, cta: "Case study", ctaClicks: 2, meetings: 0 },
    ],
  },
  {
    key: "C",
    name: "Segment C (Re-engage)",
    color: "#22c55e",
    leads: 6,
    sent: 6,
    opens: 50,
    clicks: 17,
    replies: 0,
    meetings: 0,
    emails: [
      { day: 0, sent: 6, openRate: 50, clickRate: 17, cta: "Content", ctaClicks: 1, meetings: 0 },
    ],
  },
];

const FUNNEL_STAGES = [
  { label: "Sent",     value: 44, pct: 100, color: "#d1d5db" },
  { label: "Opened",  value: 34, pct: 77,  color: "#bfdbfe" },
  { label: "Clicked", value: 13, pct: 30,  color: "#93c5fd" },
  { label: "Replied", value: 2,  pct: 5,   color: "#60a5fa" },
  { label: "Meetings",value: 3,  pct: 7,   color: "#3b82f6" },
];

const AI_INTEL = [
  {
    category: "Best CTAs",
    confidence: "High",
    iconKey: "target",
    insights: [
      "Custom demo links: 35% CTR — highest performer for hot leads",
      "Case study links: 32% CTR — first touch champion",
      "Video walkthroughs: 31% CTR — strong for re-engagement",
      "ROI calculator: 28% CTR ↑ — better targeting improving results",
      "Meeting CTAs: 22% CTR — use after 2+ engagement signals",
    ],
  },
  {
    category: "Timing",
    confidence: "High",
    iconKey: "clock",
    insights: [
      "9:00 AM local time: 67% open rate (consistent top performer)",
      "Activity-triggered holds: 74% open rate vs. scheduled",
      "Tue–Thu: best days for B2B manufacturing",
      "Friday re-engage sends: 62% open rate (surprisingly effective)",
    ],
  },
  {
    category: "Messaging",
    confidence: "High",
    iconKey: "pencil",
    insights: [
      "Buying committee emails (ref. colleague activity): 45% reply rate",
      "Post-no-show video content: 3× more effective than rebooks",
      "Industry-specific subject lines: +25% open rate vs. generic",
      "Conversational tone outperforms formal for 80% of leads",
      "3-email sequences optimal for event leads; 5-email for content",
    ],
  },
  {
    category: "ICP Insights",
    confidence: "High",
    iconKey: "search",
    insights: [
      "Top verticals: Manufacturing 34%, FinServ 28%, Healthcare 22%",
      "VP+ titles: 2.5× meeting rate (up from 2.3×)",
      "Multi-threaded accounts: 4.5× meeting rate (up from 4×)",
      "West Coast leads engage ~30 min earlier on average",
      "Agent conversation leads convert 3× faster than badge scans",
    ],
  },
];

// Timeline includes both sent and upcoming emails per segment
const SEQUENCE_TIMELINE = [
  {
    key: "A", label: "Seg A", color: "#ef4444",
    emails: [{ day: 0, isSent: true }, { day: 3, isSent: true }],
  },
  {
    key: "B", label: "Seg B", color: "#f59e0b",
    emails: [{ day: 0, isSent: true }, { day: 3, isSent: false }, { day: 7, isSent: false }],
  },
  {
    key: "C", label: "Seg C", color: "#22c55e",
    emails: [{ day: 0, isSent: true }, { day: 3, isSent: false }, { day: 10, isSent: false }],
  },
];
const MAX_TIMELINE_DAY = 10;

// ─── Sub-components ───────────────────────────────────────────────────────

function MetricCard({ label, value, sub, trend }: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-[#e9e9e7] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-[10px] text-[#9b9a97] uppercase tracking-wide mb-1.5" style={{ fontWeight: 500 }}>
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <p className="text-[22px] text-foreground leading-none tracking-tight tabular-nums" style={{ fontWeight: 700 }}>
          {value}
        </p>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] ${trend === "up" ? "text-green-600" : "text-red-500"}`} style={{ fontWeight: 500 }}>
            <HugeiconsIcon icon={trend === "up" ? ArrowUp01Icon : ArrowDown01Icon} size={9} />
          </span>
        )}
      </div>
      {sub && (
        <p className="text-[10px] text-[#9b9a97] mt-1.5 leading-tight" style={{ fontWeight: 400 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function FunnelChart({ compact }: { compact: boolean }) {
  const FUNNEL_COLORS = ["#94a3b8", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8"];
  return (
    <div>
      {/* Horizontal funnel visualization */}
      <div className="relative flex items-stretch gap-0" style={{ height: compact ? 56 : 68 }}>
        {FUNNEL_STAGES.map((stage, i) => {
          const widthPct = Math.max(stage.pct, 8);
          const isFirst = i === 0;
          const isLast = i === FUNNEL_STAGES.length - 1;
          return (
            <div
              key={stage.label}
              className="relative flex flex-col items-center justify-center transition-all"
              style={{
                width: `${widthPct}%`,
                minWidth: 40,
                background: FUNNEL_COLORS[i],
                borderRadius: isFirst ? "8px 0 0 8px" : isLast ? "0 8px 8px 0" : 0,
                clipPath: isLast
                  ? undefined
                  : `polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%${!isFirst ? ", 8px 50%" : ""})`,
              }}
            >
              <span className="text-white text-[14px] tabular-nums" style={{ fontWeight: 700 }}>
                {stage.value}
              </span>
            </div>
          );
        })}
      </div>
      {/* Labels row below */}
      <div className="flex items-start gap-0 mt-2">
        {FUNNEL_STAGES.map((stage, i) => {
          const widthPct = Math.max(stage.pct, 8);
          return (
            <div
              key={stage.label}
              className="flex flex-col items-center"
              style={{ width: `${widthPct}%`, minWidth: 40 }}
            >
              <span className="text-[10px] text-[#64748b] truncate" style={{ fontWeight: 500 }}>
                {stage.label}
              </span>
              {i > 0 && (
                <span className="text-[9px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>
                  {stage.pct}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmailSequenceTimeline() {
  const DAY_MARKERS = [0, 3, 7, 10];
  return (
    <div>
      {/* Axis */}
      <div className="relative ml-12 mb-3">
        <div className="h-px bg-[#e9e9e7]" />
        {DAY_MARKERS.map((d) => (
          <div
            key={d}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${(d / MAX_TIMELINE_DAY) * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-px h-1.5 bg-[#d4d4d1]" />
            <span className="text-[9px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>D{d}</span>
          </div>
        ))}
      </div>

      {/* Segment rows */}
      <div className="space-y-3">
        {SEQUENCE_TIMELINE.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span
              className="text-[10px] text-[#9b9a97] text-right shrink-0"
              style={{ width: 44, fontWeight: 400 }}
            >
              {seg.label}
            </span>
            <div className="flex-1 relative" style={{ height: 20 }}>
              {/* Track */}
              <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-[#e9e9e7]" />
              {/* Dots */}
              {seg.emails.map((email, ei) => (
                <div
                  key={ei}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                  style={{ left: `${(email.day / MAX_TIMELINE_DAY) * 100}%` }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                    style={{
                      background: email.isSent ? seg.color : "white",
                      boxShadow: `0 0 0 1.5px ${email.isSent ? seg.color : "#d4d4d1"}`,
                    }}
                  >
                    {email.isSent && (
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                        <path d="M1 3l1.5 1.5L5 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-foreground text-white rounded-md px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                    <p className="text-[9px]" style={{ fontWeight: 500 }}>Email {ei + 1} · Day {email.day}</p>
                    <p className="text-[9px] text-white/70">{email.isSent ? "Sent ✓" : "Pending"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 ml-12">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#6b7280] flex items-center justify-center">
            <svg width="5" height="5" viewBox="0 0 6 6" fill="none">
              <path d="M1 3l1.5 1.5L5 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[9px] text-[#9b9a97]">Sent</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full border border-[#d4d4d1] bg-white" />
          <span className="text-[9px] text-[#9b9a97]">Pending</span>
        </div>
      </div>
    </div>
  );
}

function DashSegmentRow({ seg, expanded, onToggle }: {
  seg: DashSegmentData;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#e9e9e7] overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-start gap-2 hover:bg-[#fafaf9] transition-colors text-left"
      >
        <span className="text-[#9b9a97] shrink-0 mt-px flex items-center justify-center w-4">
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={11}
            className={expanded ? "" : "rotate-[-90deg]"}
          />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
              <p className="text-[11px] text-foreground" style={{ fontWeight: 600 }}>{seg.name}</p>
            </div>
            <span className="text-[10px] text-[#64748b] shrink-0 tabular-nums">{seg.leads} leads</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap text-[10px] text-[#9b9a97]">
            <span>Sent {seg.sent}</span>
            <span>·</span>
            <span>{seg.opens}% open</span>
            <span>·</span>
            <span>{seg.clicks}% click</span>
            {seg.replies > 0 && (
              <>
                <span>·</span>
                <span>{seg.replies} reply</span>
              </>
            )}
            <span>·</span>
            <span className={seg.meetings > 0 ? "text-green-600 font-medium" : ""}>{seg.meetings} mtg</span>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-[#e9e9e7] divide-y divide-[#e9e9e7] bg-[#fafaf9]">
          {seg.emails.map((email, i) => (
            <div key={i} className="px-3 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>
                  Email {i + 1} (Day {email.day})
                </p>
                <span className="text-[10px] text-[#9b9a97]">Sent: {email.sent}</span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] text-[#9b9a97]">Open: {email.openRate}%</span>
                <span className="text-[10px] text-[#9b9a97]">Click: {email.clickRate}%</span>
              </div>
              <p className="text-[10px] text-[#9b9a97]">
                CTA: {email.cta} — {email.ctaClicks} click{email.ctaClicks !== 1 ? "s" : ""}
                {email.meetings > 0 && (
                  <span className="text-green-600">, {email.meetings} meeting{email.meetings > 1 ? "s" : ""}</span>
                )}
              </p>
              {email.note && (
                <p className="text-[10px] text-[#9b9a97] mt-0.5 italic">{email.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AIIntelView() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 space-y-2.5">
        {AI_INTEL.map((section) => (
          <div key={section.category} className="border border-[#e9e9e7] rounded-xl overflow-hidden">
            <div className="px-3 py-2.5 flex items-center justify-between bg-[#fafaf9] border-b border-[#e9e9e7]">
              <div className="flex items-center gap-2">
                <IconFromKey iconKey={section.iconKey} size={13} />
                <p className="text-[11px] text-foreground" style={{ fontWeight: 600 }}>{section.category}</p>
              </div>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200"
                style={{ fontWeight: 500 }}
              >
                {section.confidence}
              </span>
            </div>
            <div className="px-3 py-2.5 space-y-1.5">
              {section.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-[#9b9a97] shrink-0 text-[10px] mt-0.5">·</span>
                  <p className="text-[11px] text-foreground leading-snug" style={{ fontWeight: 400 }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type DashView = "default" | "ai-intel" | "workflow";

// ── Workflow View ──────────────────────────────────────────────────────────

function WFConnector() {
  return (
    <div className="flex justify-center">
      <div className="w-px h-5 bg-[#e9e9e7]" />
    </div>
  );
}

function WFBranchDown() {
  return (
    <div className="relative w-full" style={{ height: 32 }}>
      <div className="absolute left-1/2 top-0 w-px h-4 bg-[#e9e9e7]" style={{ transform: "translateX(-50%)" }} />
      <div className="absolute top-4 h-px bg-[#e9e9e7]" style={{ left: "16.67%", right: "16.67%" }} />
      <div className="absolute top-4 w-px h-4 bg-[#e9e9e7]" style={{ left: "16.67%" }} />
      <div className="absolute top-4 left-1/2 w-px h-4 bg-[#e9e9e7]" style={{ transform: "translateX(-50%)" }} />
      <div className="absolute top-4 w-px h-4 bg-[#e9e9e7]" style={{ right: "16.67%" }} />
    </div>
  );
}

function WFBranchUp() {
  return (
    <div className="relative w-full" style={{ height: 32 }}>
      <div className="absolute top-0 w-px h-4 bg-[#e9e9e7]" style={{ left: "16.67%" }} />
      <div className="absolute top-0 left-1/2 w-px h-4 bg-[#e9e9e7]" style={{ transform: "translateX(-50%)" }} />
      <div className="absolute top-0 w-px h-4 bg-[#e9e9e7]" style={{ right: "16.67%" }} />
      <div className="absolute top-4 h-px bg-[#e9e9e7]" style={{ left: "16.67%", right: "16.67%" }} />
      <div className="absolute left-1/2 top-4 w-px h-4 bg-[#e9e9e7]" style={{ transform: "translateX(-50%)" }} />
    </div>
  );
}

function WFNode({ iconKey, title, desc, badge, agent = false, expanded, onToggle, children }: {
  iconKey: string;
  title: string;
  desc: string;
  badge?: string;
  agent?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}) {
  const hasDetail = !!children;
  return (
    <div className={`w-full border rounded-xl overflow-hidden ${agent ? "border-foreground/15" : "border-[#e9e9e7]"}`}>
      <div
        onClick={hasDetail ? onToggle : undefined}
        className={`flex items-center gap-2 p-3 ${agent ? "bg-white" : "bg-[#fafaf9]"} ${hasDetail ? "cursor-pointer hover:bg-[#efefed] transition-colors" : ""}`}
      >
        <span className="shrink-0"><IconFromKey iconKey={iconKey} size={13} /></span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>{title}</p>
          <p className="text-[11px] text-[#9b9a97] leading-snug">{desc}</p>
        </div>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 shrink-0" style={{ fontWeight: 500 }}>
            {badge}
          </span>
        )}
        {hasDetail && (
          <span className="text-[#9b9a97] shrink-0 ml-0.5">
            {expanded ? <HugeiconsIcon icon={ArrowDown01Icon} size={12} /> : <HugeiconsIcon icon={ArrowDown01Icon} size={12} className="rotate-[-90deg]" />}
          </span>
        )}
      </div>
      {expanded && hasDetail && (
        <div className="border-t border-[#e9e9e7]">
          {children}
        </div>
      )}
    </div>
  );
}

function WorkflowContent({ wide = false }: { wide?: boolean }) {
  const [exp, setExp] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExp((p) => ({ ...p, [id]: !p[id] }));
  const [selectedSeg, setSelectedSeg] = useState<string | null>(null);

  const segments = [
    {
      key: "A", label: "Hot", count: 18, color: "#ef4444", emails: "2 emails",
      description: "Pricing intent + recent agent convo",
      cadence: "2 emails · 3 days · Aggressive",
      emailList: ["Day 0: Demo offer → Booking link", "Day 3: Follow-up → Booking link"],
    },
    {
      key: "B", label: "Warm", count: 10, color: "#f59e0b", emails: "3 emails",
      description: "Some engagement, no pricing intent",
      cadence: "3 emails · 7 days · Moderate",
      emailList: ["Day 0: Case study → Read link", "Day 3: Value follow-up", "Day 7: Final nudge"],
    },
    {
      key: "C", label: "Re-eng", count: 6, color: "#22c55e", emails: "3 emails",
      description: "Previously closed-lost, grouped by reason",
      cadence: "3 emails · 10 days · Gentle",
      emailList: ["Day 0: Check-in → Content link", "Day 3: Value add", "Day 10: Re-engage"],
    },
  ];

  const activeSeg = selectedSeg ? segments.find((s) => s.key === selectedSeg) : null;

  return (
    <div className={wide ? "max-w-xl mx-auto py-8" : "p-4"}>

      {/* Trigger */}
      <WFNode
        iconKey="workflow"
        title="Campaign Trigger"
        desc="34 stalled pipeline deals · CRM + web signals"
        expanded={exp["trigger"]}
        onToggle={() => toggle("trigger")}
      >
        <div className="p-3 space-y-2.5">
          {([
            ["chart-bar", "CRM Signals", "34 stalled deals · avg 47 days idle"],
            ["globe", "Web Activity", "Pricing page visits · agent conversations"],
            ["mail", "Email History", "Past open & click engagement data"],
            ["dollar", "Pipeline Value", "$2.1M at risk across 34 accounts"],
          ] as const).map(([ico, label, value]) => (
            <div key={label} className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5"><IconFromKey iconKey={ico} size={11} /></span>
              <div>
                <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>{label}</p>
                <p className="text-[11px] text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </WFNode>

      <WFConnector />

      {/* AI Agent */}
      <WFNode
        iconKey="sparkle"
        title="AI Analysis Agent"
        desc="Analyzed signals · Segmented 34 leads · Drafted 8 email sequences"
        badge="Complete"
        agent
        expanded={exp["agent"]}
        onToggle={() => toggle("agent")}
      >
        <div className="p-3 space-y-2.5">
          {[
            { n: "1", text: "Pulled CRM signals: last activity, deal age, email history" },
            { n: "2", text: "Segmented 34 leads into 3 groups by engagement level" },
            { n: "3", text: "Drafted 8 personalized email sequences with targeted CTAs" },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-2">
              <span className="text-[9px] w-4 h-4 rounded-full bg-foreground text-white flex items-center justify-center shrink-0 mt-0.5" style={{ fontWeight: 600 }}>{n}</span>
              <p className="text-[11px] text-[#9b9a97] leading-snug">{text}</p>
            </div>
          ))}
          <p className="text-[10px] text-[#9b9a97] pl-6">Completed in ~8s</p>
        </div>
      </WFNode>

      <WFBranchDown />

      {/* Segment cards */}
      <div className="flex gap-2">
        {segments.map((seg) => (
          <button
            key={seg.key}
            onClick={() => setSelectedSeg(selectedSeg === seg.key ? null : seg.key)}
            className={`flex-1 border rounded-xl p-2.5 text-center transition-colors ${
              selectedSeg === seg.key
                ? "border-foreground/20 bg-[#efefed]"
                : "border-[#e9e9e7] bg-white hover:bg-[#fafaf9]"
            }`}
          >
            <div className="w-2 h-2 rounded-full mx-auto mb-1.5" style={{ background: seg.color }} />
            <p className="text-[11px] text-foreground" style={{ fontWeight: 600 }}>Seg {seg.key}</p>
            <p className="text-[10px] text-[#9b9a97]">{seg.label}</p>
            <p className="text-[13px] text-foreground mt-1" style={{ fontWeight: 600 }}>{seg.count}</p>
            <p className="text-[9px] text-[#9b9a97]">leads</p>
            <div className="mt-1.5 pt-1.5 border-t border-[#e9e9e7]">
              <p className="text-[9px] text-[#9b9a97]">{seg.emails}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Segment detail panel */}
      {activeSeg && (
        <div className="mt-2 border border-[#e9e9e7] rounded-xl p-3 bg-[#fafaf9]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: activeSeg.color }} />
            <p className="text-[11px] text-foreground" style={{ fontWeight: 600 }}>Segment {activeSeg.key}: {activeSeg.label}</p>
          </div>
          <p className="text-[11px] text-[#9b9a97] mb-1">{activeSeg.description}</p>
          <p className="text-[10px] text-[#9b9a97] mb-2" style={{ fontWeight: 500 }}>{activeSeg.cadence}</p>
          <div className="space-y-1">
            {activeSeg.emailList.map((email, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#9b9a97]">·</span>
                <p className="text-[11px] text-foreground">{email}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <WFBranchUp />

      {/* Email Delivery */}
      <WFNode
        iconKey="mail"
        title="Email Delivery"
        desc="44 emails sent · 8 sequences across 3 segments"
        badge="Live"
        expanded={exp["email"]}
        onToggle={() => toggle("email")}
      >
        <div className="p-3 space-y-2">
          {[
            { key: "A", color: "#ef4444", label: "Seg A (Hot)", sent: 34, opens: 78, clicks: 33 },
            { key: "B", color: "#f59e0b", label: "Seg B (Warm)", sent: 10, opens: 70, clicks: 20 },
            { key: "C", color: "#22c55e", label: "Seg C (Re-eng)", sent: 6, opens: 50, clicks: 17 },
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
              <p className="text-[11px] text-[#9b9a97] shrink-0" style={{ width: 72 }}>{s.label}</p>
              <p className="text-[10px] text-[#9b9a97]">{s.sent} sent · {s.opens}% opens · {s.clicks}% clicks</p>
            </div>
          ))}
        </div>
      </WFNode>

      <WFConnector />

      {/* AI Auto-Adjust */}
      <WFNode
        iconKey="flash"
        title="AI Auto-Adjust"
        desc="Monitoring signals · Upgrading CTAs in real-time"
        badge="Active"
        agent
        expanded={exp["adjust"]}
        onToggle={() => toggle("adjust")}
      >
        <div className="p-3">
          <p className="text-[10px] text-[#9b9a97] mb-2" style={{ fontWeight: 500 }}>Latest adjustment</p>
          <div className="border border-[#e9e9e7] rounded-lg p-2.5 bg-white space-y-0.5">
            <p className="text-[10px] text-[#9b9a97]">Feb 27, 2:01pm — James Wong (CloudBase)</p>
            <p className="text-[11px] text-[#9b9a97]">Signal: Pricing page visited 3× yesterday</p>
            <p className="text-[11px] text-foreground">Change: Case Study → Booking link</p>
            <p className="text-[11px] text-green-600 flex items-center gap-1">Result: Clicked and booked <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" /></p>
          </div>
        </div>
      </WFNode>

      <WFConnector />

      {/* Results */}
      <div className="w-full border border-[#e9e9e7] rounded-xl p-3 bg-[#fafaf9]">
        <div className="flex items-center gap-2 mb-2.5">
          <HugeiconsIcon icon={ChartLineData02Icon} size={13} />
          <p className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>Results</p>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200" style={{ fontWeight: 500 }}>Live</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[["3", "Meetings"], ["77%", "Opens"], ["$52K", "Pipeline"]].map(([val, lbl]) => (
            <div key={lbl}>
              <p className="text-[15px] text-foreground" style={{ fontWeight: 600 }}>{val}</p>
              <p className="text-[9px] text-[#9b9a97]">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const DASHBOARD_QA: { question: string; answer: string }[] = [
  {
    question: "Which segment is performing best?",
    answer: "Segment A (Hot) is the clear winner — 78% open rate, 25% CTR, and 2 of the 3 meetings booked came from this segment. The aggressive cadence and booking-link CTA are landing well with pricing-page visitors. Segment B is tracking at 52% opens but only 8% clicks — the Case Study CTA may need a swap.",
  },
  {
    question: "Why are 4 leads opening but not clicking?",
    answer: "4 leads in Segment B opened both emails but never clicked. The subject lines are resonating (they open), but the Case Study CTA isn't matching their intent signals. Their warm context shows they're evaluating competitors, not seeking education. Recommendation: switch their CTA from Case Study to a Reply Prompt — this has a 2.3× higher response rate for this profile.",
  },
  {
    question: "Should I pause Segment C?",
    answer: "Not yet. Segment C is slower by design — gentle cadence with re-engagement leads. The current 45% open rate is actually above the 30% benchmark for previously closed-lost deals. Give it through Day 7 before evaluating. The ROI calculator CTA for pricing-lost leads is showing early promise with 2 clicks so far.",
  },
  {
    question: "What's driving the 8.8% conversion rate?",
    answer: "Three key factors:\n\n1. Warm context personalization — each email references the lead's specific deal history, agent conversations, and web activity. This drives 3× higher engagement than generic templates.\n\n2. Pricing page visitor targeting — Segment A focuses on leads who visited pricing in the last 14 days, catching them at peak intent.\n\n3. Aggressive cadence for hot leads — 2 emails in 3 days means we're reaching them while the intent signal is still fresh. The 25% click-through on booking links confirms the timing is right.",
  },
];

function DashboardTab({ modeState }: { modeState: CampaignModeState }) {
  const [dashView, setDashView] = useState<DashView>("default");
  const [expandedSegs, setExpandedSegs] = useState<Record<string, boolean>>({ A: false, B: false, C: false });
  const [autoSend, setAutoSend] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [dashMessages, setDashMessages] = useState<{ role: "user" | "docket"; content: string }[]>([]);
  const [dashInput, setDashInput] = useState("");
  const [dashSending, setDashSending] = useState(false);
  const dashMsgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dashMsgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dashMessages]);

  const handleDashAsk = (question: string) => {
    if (!question.trim() || dashSending) return;
    setDashInput("");
    setDashSending(true);
    setDashMessages((prev) => [...prev, { role: "user", content: question.trim() }]);

    const match = DASHBOARD_QA.find((qa) =>
      question.toLowerCase().includes(qa.question.toLowerCase().slice(0, 20))
    );
    const response = match?.answer ?? "Based on the current data, I'd need to dig deeper into that. Let me analyze the campaign metrics and get back to you with a detailed breakdown.";

    setTimeout(() => {
      setDashMessages((prev) => [...prev, { role: "docket", content: response }]);
      setDashSending(false);
    }, 700);
  };

  const isRunning = modeState === "running";
  const isPostLaunch = modeState === "launched";

  // Before launch
  if (!isRunning && !isPostLaunch) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-[12px] text-[#9b9a97] text-center leading-relaxed">
          Campaign metrics will appear here once launched.
        </p>
      </div>
    );
  }

  // Just launched — sending in progress
  if (isPostLaunch) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
        <p className="text-[13px] text-foreground text-center" style={{ fontWeight: 500 }}>
          Sending... 18/34 emails sent
        </p>
        <div className="w-full h-1.5 rounded-full bg-[#e9e9e7] overflow-hidden">
          <div className="h-full rounded-full bg-foreground" style={{ width: `${(18 / 34) * 100}%` }} />
        </div>
        <p className="text-[11px] text-[#9b9a97]">Segment A sending now</p>
      </div>
    );
  }

  // ─── Running (Day 3) — default view content ───────────────────────────────
  const defaultContent = (wide: boolean) => (
    <div className="space-y-6">
      {/* Outcome hero — primary result at a glance */}
      <div className="rounded-xl bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1" style={{ fontWeight: 500 }}>
              Pipeline impact
            </p>
            <div className="flex items-baseline gap-3">
              <div>
                <p className="text-[26px] text-foreground leading-none tabular-nums" style={{ fontWeight: 700 }}>3</p>
                <p className="text-[10px] text-[#64748b] mt-0.5" style={{ fontWeight: 400 }}>meetings</p>
              </div>
              <span className="text-[#cbd5e1] text-[20px]" style={{ fontWeight: 300 }}>·</span>
              <div>
                <p className="text-[26px] text-foreground leading-none tabular-nums" style={{ fontWeight: 700 }}>$52K</p>
                <p className="text-[10px] text-[#64748b] mt-0.5" style={{ fontWeight: 400 }}>pipeline</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-[#e2e8f0]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Live</span>
          </div>
        </div>
      </div>

      {/* Auto-send — surfaced for quick control */}
      <div className="flex items-center justify-between gap-2 py-1">
        <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Sending mode</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAutoSend(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              autoSend ? "bg-foreground text-white" : "bg-[#f7f7f5] text-[#9b9a97] hover:bg-[#efefed]"
            }`}
            style={{ fontWeight: autoSend ? 500 : 400 }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoSend ? "bg-green-400" : "bg-[#c0bfbd]"}`} />
            Auto
          </button>
          <button
            onClick={() => setAutoSend(false)}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              !autoSend ? "bg-foreground text-white" : "bg-[#f7f7f5] text-[#9b9a97] hover:bg-[#efefed]"
            }`}
            style={{ fontWeight: !autoSend ? 500 : 400 }}
          >
            Approve each
          </button>
        </div>
      </div>

      {/* Performance metrics — engagement KPIs */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
          Engagement
        </p>
        <div className={`grid gap-2.5 ${wide ? "grid-cols-4" : "grid-cols-2"}`}>
          <MetricCard label="Open rate" value="77%" trend="up" sub="vs 42% industry" />
          <MetricCard label="Click rate" value="30%" trend="up" />
          <MetricCard label="Emails sent" value="44" sub="34 leads" />
          <MetricCard label="Replies" value="2" sub="5% of opened" />
        </div>
      </div>

      {/* Conversion funnel — the story */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
          Conversion funnel
        </p>
        <div className="rounded-xl border border-[#e9e9e7] bg-[#fafaf9]/50 p-4">
          <FunnelChart compact={!wide} />
        </div>
      </div>

      {/* Segment breakdown — drill-down */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
          By segment
        </p>
        <div className="space-y-1.5">
          {DASH_SEGMENTS.map((seg) => (
            <DashSegmentRow
              key={seg.key}
              seg={seg}
              expanded={expandedSegs[seg.key]}
              onToggle={() => setExpandedSegs((p) => ({ ...p, [seg.key]: !p[seg.key] }))}
            />
          ))}
        </div>
      </div>

      {/* Email cadence — sequence + timeline */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-2.5" style={{ fontWeight: 500 }}>
          Email cadence
        </p>
        <div className="rounded-xl border border-[#e9e9e7] p-3 pt-4">
          <EmailSequenceTimeline />
        </div>
      </div>

      {/* Pre-send adjustments — AI-driven changes */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-2.5" style={{ fontWeight: 500 }}>
          Pre-send adjustments
        </p>
        <div className="rounded-xl border border-[#e9e9e7] bg-[#fafaf9]/50 p-3">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-[#eff6ff] flex items-center justify-center shrink-0 mt-0.5">
              <HugeiconsIcon icon={SparklesIcon} size={12} color="#3b82f6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>James Wong · CloudBase</p>
              <p className="text-[10px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>Pricing page visited 3× yesterday</p>
              <p className="text-[11px] text-foreground mt-1" style={{ fontWeight: 400 }}>Case Study → Booking link</p>
              <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1" style={{ fontWeight: 500 }}>
                <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" />
                Clicked and booked
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Full-screen overlay ──────────────────────────────────────────────────
  if (isFullScreen) {
    return (
      <div
        className="fixed inset-0 bg-white z-50 flex flex-col"
        tabIndex={-1}
        onKeyDown={(e) => e.key === "Escape" && setIsFullScreen(false)}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <p className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>
              Re-engage Stalled Pipeline Deals
            </p>
            <span className="text-[10px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200" style={{ fontWeight: 500 }}>
              Live
            </span>
            <span className="text-[12px] text-[#9b9a97]">
              — {dashView === "ai-intel" ? "AI Intel" : dashView === "workflow" ? "Workflow" : "Metrics"}
            </span>
          </div>
          <button
            onClick={() => setIsFullScreen(false)}
            className="w-7 h-7 flex items-center justify-center rounded text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 pb-28">
          {dashView === "ai-intel" ? (
            <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
              {AI_INTEL.map((section) => (
                <div key={section.category} className="border border-[#e9e9e7] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between bg-[#fafaf9] border-b border-[#e9e9e7]">
                    <div className="flex items-center gap-2">
                      <IconFromKey iconKey={section.iconKey} size={15} />
                      <p className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>{section.category}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200" style={{ fontWeight: 500 }}>
                      {section.confidence} confidence
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {section.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#9b9a97] shrink-0 text-[11px] mt-0.5">·</span>
                        <p className="text-[12px] text-foreground leading-snug" style={{ fontWeight: 400 }}>{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : dashView === "workflow" ? (
            <WorkflowContent wide />
          ) : (
            <div className="max-w-4xl mx-auto">
              {defaultContent(true)}
            </div>
          )}
        </div>

        {/* Floating chat area */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-[600px] max-w-[calc(100%-2rem)] pointer-events-auto flex flex-col gap-2">
            {/* Messages */}
            {dashMessages.length > 0 && (
              <div className="max-h-[320px] overflow-y-auto bg-white/95 backdrop-blur-sm border border-[#e9e9e7] rounded-2xl shadow-lg p-4 space-y-3">
                {dashMessages.map((msg, i) =>
                  msg.role === "user" ? (
                    <div key={i} className="flex justify-end pl-8">
                      <div className="bg-foreground text-white rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[85%]">
                        <p className="text-[13px]" style={{ fontWeight: 400, lineHeight: 1.5 }}>{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-[8px]" style={{ fontWeight: 700 }}>D</span>
                      </div>
                      <div className="bg-[#fafaf9] border border-[#eeeeec] rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%]">
                        <p className="text-[13px] text-foreground whitespace-pre-line" style={{ fontWeight: 400, lineHeight: 1.6 }}>{msg.content}</p>
                      </div>
                    </div>
                  )
                )}
                {dashSending && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-[8px]" style={{ fontWeight: 700 }}>D</span>
                    </div>
                    <div className="bg-white border border-[#e9e9e7] rounded-2xl rounded-tl-md px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9b9a97] animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9b9a97] animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9b9a97] animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={dashMsgEndRef} />
              </div>
            )}

            {/* Suggested questions — hidden after first interaction */}
            {dashMessages.length === 0 && (
              <div className="flex flex-wrap justify-center gap-2 px-2">
                {DASHBOARD_QA.map((qa) => (
                  <button
                    key={qa.question}
                    onClick={() => handleDashAsk(qa.question)}
                    className="text-[12px] px-3 py-1.5 rounded-full border border-[#e9e9e7] bg-white/90 backdrop-blur-sm text-foreground hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors shadow-sm"
                    style={{ fontWeight: 400 }}
                  >
                    {qa.question}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 bg-white border border-[#e9e9e7] rounded-2xl shadow-lg px-4 py-2.5">
              <input
                type="text"
                placeholder="Ask about this dashboard..."
                className="flex-1 text-[13px] outline-none placeholder:text-[#9b9a97] bg-transparent"
                value={dashInput}
                onChange={(e) => setDashInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleDashAsk(dashInput); }}
              />
              <button
                onClick={() => handleDashAsk(dashInput)}
                className="w-6 h-6 rounded-md bg-foreground text-white flex items-center justify-center shrink-0"
              >
                <HugeiconsIcon icon={MailSend01Icon} size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Normal panel view ────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* View pills — Metrics | AI Intel | Workflow */}
      <div className="px-5 py-3 border-b border-[#e9e9e7] shrink-0 flex items-center gap-1.5 bg-[#fafaf9]/50">
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#f1f1ef]">
          <button
            onClick={() => setDashView("default")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] transition-all ${
              dashView === "default"
                ? "bg-white text-foreground shadow-sm"
                : "text-[#9b9a97] hover:text-foreground"
            }`}
            style={{ fontWeight: dashView === "default" ? 500 : 400 }}
          >
            <HugeiconsIcon icon={ChartLineData02Icon} size={11} />
            Metrics
            {dashView === "default" && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
          </button>
          <button
            onClick={() => setDashView("ai-intel")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] transition-all ${
              dashView === "ai-intel"
                ? "bg-white text-foreground shadow-sm"
                : "text-[#9b9a97] hover:text-foreground"
            }`}
            style={{ fontWeight: dashView === "ai-intel" ? 500 : 400 }}
          >
            <HugeiconsIcon icon={SparklesIcon} size={11} />
            AI Intel
          </button>
          <button
            onClick={() => setDashView("workflow")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] transition-all ${
              dashView === "workflow"
                ? "bg-white text-foreground shadow-sm"
                : "text-[#9b9a97] hover:text-foreground"
            }`}
            style={{ fontWeight: dashView === "workflow" ? 500 : 400 }}
          >
            <HugeiconsIcon icon={WorkflowCircle01Icon} size={11} />
            Workflow
          </button>
        </div>
        <button
          onClick={() => setIsFullScreen(true)}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-white/80 transition-colors"
          title="Expand to full screen"
        >
          <HugeiconsIcon icon={Maximize02Icon} size={13} />
        </button>
      </div>

      {/* Content */}
      {dashView === "ai-intel" ? (
        <AIIntelView />
      ) : dashView === "workflow" ? (
        <div className="flex-1 overflow-y-auto">
          <WorkflowContent />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {defaultContent(false)}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import {
  HugeiconsIcon,
  FlashIcon,
  SparklesIcon,
  ArrowDown01Icon,
  CheckmarkBadge02Icon,
} from "../../icons";
import type { CampaignModeState } from "../../types";
import { toast } from "sonner";

interface Props {
  campaignState: CampaignModeState;
  onExplainInChat?: (prompt: string) => void;
}

export function OverviewTab({ campaignState, onExplainInChat }: Props) {
  const isLaunched = campaignState === "launched" || campaignState === "running";
  const isDay3 = campaignState === "running";
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
      {/* Live status bar */}
      {isLaunched && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-green-50 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span className="text-[12px] text-green-700" style={{ fontWeight: 500 }}>Campaign Live</span>
          <span className="text-[11px] text-green-600/60 ml-auto" style={{ fontWeight: 400 }}>
            {isDay3 ? "Day 3" : "Just launched"}
          </span>
        </div>
      )}

      {/* ── Action Center — only when running (Day 3) ── */}
      {isDay3 && <ActionCenter onExplainInChat={onExplainInChat} />}

      {/* Campaign brief — pre-launch only */}
      {!isLaunched && (
        <div>
          <p className="text-[12px] text-[#9b9a97] mb-1" style={{ fontWeight: 400, lineHeight: 1.6 }}>
            34 deals stalled 30+ days. 18 visited pricing recently.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {(isLaunched
          ? isDay3
            ? [
                { label: "Emails Sent", value: "44", benchmark: "" },
                { label: "Open Rate", value: "68%", benchmark: "vs 45% avg" },
                { label: "Click Rate", value: "24%", benchmark: "vs 8% avg" },
                { label: "Meetings Booked", value: "3", benchmark: "8.8% conv." },
              ]
            : [
                { label: "Emails Sent", value: "18", benchmark: "" },
                { label: "Open Rate", value: "—", benchmark: "" },
                { label: "Click Rate", value: "—", benchmark: "" },
                { label: "Meetings Booked", value: "0", benchmark: "" },
              ]
          : [
              { label: "Total Leads", value: "34", benchmark: "" },
              { label: "Pipeline at Risk", value: "$180K", benchmark: "" },
              { label: "Pricing Visitors", value: "18", benchmark: "53% of leads" },
              { label: "Recent Touchpoints", value: "6", benchmark: "" },
            ]
        ).map((stat) => (
          <div key={stat.label} className="border border-[#e9e9e7] rounded-xl p-3.5 bg-white">
            <p className="text-[10px] text-[#9b9a97] mb-1.5" style={{ fontWeight: 500 }}>{stat.label}</p>
            <p className="text-[22px] text-foreground tabular-nums leading-none" style={{ fontWeight: 600 }}>{stat.value}</p>
            {stat.benchmark && <p className="text-[10px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>{stat.benchmark}</p>}
          </div>
        ))}
      </div>

      {/* Sequence step performance with mini-bars */}
      {isLaunched && (
        <div>
          <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>By Sequence Step</p>
          <div className="space-y-2.5">
            {[
              { step: "1", name: "Re-engagement opener", color: "#2563eb", sent: isDay3 ? 34 : 18, openPct: isDay3 ? 71 : 0, meetings: isDay3 ? 3 : 0 },
              { step: "2", name: "Proof follow-up", color: "#f59e0b", sent: isDay3 ? 16 : 0, openPct: isDay3 ? 63 : 0, meetings: isDay3 ? 0 : 0 },
              { step: "3", name: "Final nudge", color: "#22c55e", sent: 0, openPct: 0, meetings: 0 },
            ].map((row) => (
              <div key={row.step} className="border border-[#e9e9e7] rounded-xl px-4 py-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
                    <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>Step {row.step}: {row.name}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>
                    <span>{row.sent} sent</span>
                    <span>{row.meetings} mtgs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#f4f4f2] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${row.openPct}%`, background: row.color }} />
                  </div>
                  <span className="text-[10px] text-[#9b9a97] tabular-nums w-8 text-right" style={{ fontWeight: 500 }}>
                    {row.openPct > 0 ? `${row.openPct}%` : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Sources — pre-launch, collapsed */}
      {!isLaunched && (
        <div>
          <button onClick={() => setSourcesOpen(!sourcesOpen)} className="flex items-center gap-2 text-[11px] text-[#9b9a97] hover:text-foreground/70 transition-colors" style={{ fontWeight: 400 }}>
            <HugeiconsIcon icon={FlashIcon} size={11} className="text-foreground/30" />
            <span>Data Sources</span>
            <HugeiconsIcon icon={ArrowDown01Icon} size={10} className={`transition-transform ${sourcesOpen ? "" : "rotate-[-90deg]"}`} />
          </button>
          {sourcesOpen && (
            <div className="mt-2 pl-5 space-y-1 animate-in fade-in duration-200">
              {["HubSpot Pipeline: 34 stalled deals", "Web Analytics: 18 pricing page visitors", "Sales Activity: 6 CRM touchpoints", "Email History: 22 received marketing emails"].map((s) => (
                <p key={s} className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{s}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Action Center — Interactive insight cards ──

function ActionCenter({ onExplainInChat }: { onExplainInChat?: (prompt: string) => void }) {
  const [visibleCards, setVisibleCards] = useState({
    ctaMismatch: true,
    aeHandoff: true,
    preSendUpgrade: true,
  });

  const visibleCount = Object.values(visibleCards).filter(Boolean).length;

  const handleDiscardCard = (key: keyof typeof visibleCards) => {
    setVisibleCards((current) => ({ ...current, [key]: false }));
  };

  const handleDiscardAll = () => {
    setVisibleCards({
      ctaMismatch: false,
      aeHandoff: false,
      preSendUpgrade: false,
    });
    toast.success("Dismissed all Needs Attention cards");
  };

  const handleRestore = () => {
    setVisibleCards({
      ctaMismatch: true,
      aeHandoff: true,
      preSendUpgrade: true,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
          Needs Attention
        </p>
        {visibleCount > 0 && (
          <button
            onClick={handleDiscardAll}
            className="text-[10px] px-2 py-1 rounded-md border border-[#e0dfdd] text-[#6b6a67] bg-white hover:bg-[#f7f7f5] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Discard all
          </button>
        )}
      </div>

      {visibleCards.ctaMismatch && (
        <CTAMismatchCard onExplainInChat={onExplainInChat} onDismiss={() => handleDiscardCard("ctaMismatch")} />
      )}
      {visibleCards.aeHandoff && (
        <AEEscalationCard onDismiss={() => handleDiscardCard("aeHandoff")} />
      )}
      {visibleCards.preSendUpgrade && (
        <PreSendUpgradeCard onDismiss={() => handleDiscardCard("preSendUpgrade")} />
      )}

      {visibleCount === 0 && (
        <div className="border border-[#e9e9e7] rounded-xl bg-white px-4 py-3 flex items-center justify-between gap-2">
          <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
            All attention cards dismissed.
          </p>
          <button
            onClick={handleRestore}
            className="text-[10px] px-2.5 py-1 rounded-md border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Restore
          </button>
        </div>
      )}
    </div>
  );
}

// ── CTA Mismatch Card ──

function CTAMismatchCard({
  onExplainInChat,
  onDismiss,
}: {
  onExplainInChat?: (prompt: string) => void;
  onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [switched, setSwitched] = useState(false);

  const leads = [
    { name: "Dave Kim", company: "StartupX", currentCTA: "Case Study", suggested: "Technical Demo" },
    { name: "Mike Ross", company: "RetailCo", currentCTA: "Case Study", suggested: "Reply Prompt" },
    { name: "Lisa Park", company: "OldCorp", currentCTA: "ROI Calculator", suggested: "Reply Prompt" },
    { name: "Wei Zhang", company: "LogiCorp", currentCTA: "Content Piece", suggested: "Reply Prompt" },
  ];

  const handleSwitch = () => {
    setSwitching(true);
    setTimeout(() => {
      setSwitching(false);
      setSwitched(true);
      toast.success("CTAs updated for 4 leads");
    }, 1500);
  };

  return (
    <div className="border border-amber-200 rounded-xl overflow-hidden bg-amber-50/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-start gap-2.5 text-left hover:bg-amber-50/80 transition-colors"
      >
        <span className="text-amber-500 mt-0.5 text-[12px]">⚠</span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>
            4 leads in Email 2: CTA mismatch
          </p>
          <p className="text-[11px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
            Opening emails but not clicking — suggest switching CTAs
          </p>
        </div>
        <HugeiconsIcon icon={ArrowDown01Icon} size={10} className={`text-[#9b9a97] shrink-0 mt-1 transition-transform ${expanded ? "" : "rotate-[-90deg]"}`} />
      </button>

      <div className="px-4 -mt-1 pb-2">
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDismiss();
          }}
          className="text-[10px] px-2.5 py-1 rounded-md border border-amber-200 text-amber-700 bg-white hover:bg-amber-50 transition-colors"
          style={{ fontWeight: 500 }}
        >
          Discard card
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 animate-in fade-in duration-200">
          <div className="border border-[#e9e9e7] rounded-lg overflow-hidden bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e9e9e7] bg-[#fafaf9]">
                  {["Lead", "Current CTA", "Suggested"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[9px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={i} className="border-b border-[#e9e9e7]/60 last:border-0">
                    <td className="px-3 py-2">
                      <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>{lead.name}</p>
                      <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{lead.company}</p>
                    </td>
                    <td className="px-3 py-2 text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{lead.currentCTA}</td>
                    <td className="px-3 py-2 text-[10px] text-foreground" style={{ fontWeight: 500 }}>{lead.suggested}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {switched ? (
              <div className="flex items-center gap-1.5 text-[11px] text-green-700 animate-in fade-in">
                <HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" />
                <span style={{ fontWeight: 500 }}>CTAs updated for 4 leads</span>
              </div>
            ) : switching ? (
              <div className="flex items-center gap-2 text-[11px] text-[#9b9a97] animate-in fade-in">
                <div className="w-3 h-3 border border-[#9b9a97]/40 border-t-foreground/60 rounded-full animate-spin" />
                <span style={{ fontWeight: 400 }}>Switching CTAs...</span>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSwitch}
                  className="text-[11px] px-3.5 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
                  style={{ fontWeight: 500 }}
                >
                  Switch all 4 CTAs
                </button>
                <button
                  onClick={() => {
                    onExplainInChat?.("Explain the CTA mismatch for these 4 leads in Email 2 in detail — why are they not clicking, and what CTAs would work better?");
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  Explain in detail
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-[11px] px-3 py-1.5 rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AE Escalation Card ──

function AEEscalationCard({ onDismiss }: { onDismiss: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [handoffStep, setHandoffStep] = useState(0); // 0=idle, 1=connecting, 2=connected, 3=sending, 4=sent

  const handleHandoff = () => {
    setHandoffStep(1);
    setTimeout(() => setHandoffStep(2), 800);
    setTimeout(() => setHandoffStep(3), 1600);
    setTimeout(() => {
      setHandoffStep(4);
      toast.success("Slack message sent to AE team");
    }, 2400);
  };

  const handoffLabel = (() => {
    if (handoffStep === 1) return "Connecting to Slack...";
    if (handoffStep === 2) return "Connected to #sales-ae";
    if (handoffStep === 3) return "Sending handoff message...";
    if (handoffStep === 4) return "Handed off — message sent to #sales-ae on Slack";
    return "";
  })();

  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden bg-blue-50/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-start gap-2.5 text-left hover:bg-blue-50/80 transition-colors"
      >
        <span className="text-blue-500 mt-0.5 text-[12px]">↗</span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>
            Anna Kumar — ready for AE handoff
          </p>
          <p className="text-[11px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
            ICP 71 · Opened and clicked every email but no meeting
          </p>
        </div>
        <HugeiconsIcon icon={ArrowDown01Icon} size={10} className={`text-[#9b9a97] shrink-0 mt-1 transition-transform ${expanded ? "" : "rotate-[-90deg]"}`} />
      </button>

      <div className="px-4 -mt-1 pb-2">
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDismiss();
          }}
          className="text-[10px] px-2.5 py-1 rounded-md border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 transition-colors"
          style={{ fontWeight: 500 }}
        >
          Discard card
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 animate-in fade-in duration-200">
          <div className="border border-[#e9e9e7] rounded-lg p-3 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Anna Kumar · FinServ</p>
              <span className="text-[10px] px-1.5 py-px rounded bg-red-50 text-red-700 border border-red-200" style={{ fontWeight: 500 }}>ICP 71</span>
            </div>
            <div className="space-y-1 text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
              <p>✓ Opened Email 1 and Email 2</p>
              <p>✓ Clicked both CTAs</p>
              <p>✓ Visited pricing page</p>
              <p>✗ No meeting booked — likely needs human touch</p>
            </div>
          </div>

          <div className="mt-3">
            {handoffStep === 0 ? (
              <div className="flex items-center gap-2">
                <button onClick={handleHandoff} className="text-[11px] px-3.5 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity" style={{ fontWeight: 500 }}>
                  Handoff to AE
                </button>
                <button onClick={() => setExpanded(false)} className="text-[11px] px-3 py-1.5 rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors" style={{ fontWeight: 400 }}>
                  Skip
                </button>
              </div>
            ) : handoffStep < 4 ? (
              <div className="space-y-1.5 animate-in fade-in">
                {handoffStep >= 1 && (
                  <div className="flex items-center gap-2 text-[11px]">
                    {handoffStep === 1
                      ? <div className="w-3 h-3 border border-[#9b9a97]/40 border-t-foreground/60 rounded-full animate-spin shrink-0" />
                      : <HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" />
                    }
                    <span className={handoffStep > 1 ? "text-foreground" : "text-[#9b9a97]"} style={{ fontWeight: 400 }}>
                      {handoffStep === 1 ? "Connecting to Slack..." : "Connected to #sales-ae"}
                    </span>
                  </div>
                )}
                {handoffStep >= 3 && (
                  <div className="flex items-center gap-2 text-[11px] animate-in fade-in">
                    <div className="w-3 h-3 border border-[#9b9a97]/40 border-t-foreground/60 rounded-full animate-spin shrink-0" />
                    <span className="text-[#9b9a97]" style={{ fontWeight: 400 }}>Sending handoff message...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-[11px] text-green-700">
                  <HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" />
                  <span style={{ fontWeight: 500 }}>Handed off via Slack</span>
                </div>
                <div className="border border-[#e9e9e7] rounded-lg p-2.5 bg-[#fafaf9]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] px-1.5 py-px rounded bg-[#4A154B] text-white" style={{ fontWeight: 600 }}>S</span>
                    <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>#sales-ae · just now</span>
                  </div>
                  <p className="text-[11px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.5 }}>
                    🔥 <span style={{ fontWeight: 500 }}>AE Handoff: Anna Kumar (FinServ)</span> — ICP 71, opened & clicked all emails but hasn't booked. High intent, needs personal outreach. Automated emails paused.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pre-send Upgrade Win Card ──

function PreSendUpgradeCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="border border-green-200 rounded-xl overflow-hidden bg-green-50/50 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <HugeiconsIcon icon={CheckmarkBadge02Icon} size={13} color="#22c55e" className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>
            Pre-send upgrade worked — James Wong booked
          </p>
          <p className="text-[11px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
            CTA auto-upgraded from Case Study → Booking link after 3 pricing page visits. Meeting confirmed.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-[10px] px-2.5 py-1 rounded-md border border-green-200 text-green-700 bg-white hover:bg-green-50 transition-colors shrink-0"
          style={{ fontWeight: 500 }}
        >
          Discard card
        </button>
      </div>
    </div>
  );
}

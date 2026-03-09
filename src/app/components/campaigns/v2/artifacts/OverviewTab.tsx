import { useState } from "react";
import {
  HugeiconsIcon,
  FlashIcon,
  ArrowDown01Icon,
  CheckmarkBadge02Icon,
} from "../../icons";
import type { CampaignModeState } from "../../types";
import type { CampaignData } from "../../campaignData";
import { DEFAULT_CAMPAIGN } from "../../campaignData";
import { toast } from "sonner";

interface Props {
  campaignState: CampaignModeState;
  onExplainInChat?: (prompt: string) => void;
  campaignData?: CampaignData;
}

export function OverviewTab({ campaignState, onExplainInChat, campaignData }: Props) {
  const data = campaignData ?? DEFAULT_CAMPAIGN;
  const isLaunched = campaignState === "launched" || campaignState === "running";
  const isDay3 = campaignState === "running";
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [enabledSources, setEnabledSources] = useState<Record<string, boolean>>({
    hubspot: true,
    salesforce: false,
    agents: false,
  });

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
      {/* Live status bar */}
      {isLaunched && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-green-50 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span className="text-[12px] text-green-700" style={{ fontWeight: 500 }}>Campaign Live</span>
          <span className="text-[11px] text-green-600/60 ml-auto" style={{ fontWeight: 400 }}>
            {isDay3 ? data.overview.liveDay : "Just launched"}
          </span>
        </div>
      )}

      {/* ── Action Center — only when running (Day 3) ── */}
      {isDay3 && <ActionCenter onExplainInChat={onExplainInChat} actionCards={data.overview.actionCards} />}

      {/* Campaign brief — pre-launch only */}
      {!isLaunched && (
        <div>
          <p className="text-[12px] text-[#9b9a97] mb-1" style={{ fontWeight: 400, lineHeight: 1.6 }}>
            {data.overview.brief}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {(isLaunched
          ? isDay3
            ? data.overview.runningKPIs
            : data.overview.launchedKPIs
          : data.overview.preLaunchKPIs
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
            {data.overview.sequenceSteps.map((s) => {
              const sent = isDay3 ? s.runningSent : s.launchedSent;
              const openPct = isDay3 ? s.runningOpen : s.launchedOpen;
              const meetings = isDay3 ? s.runningMtgs : s.launchedMtgs;
              return { step: s.step, name: s.name, color: s.color, sent, openPct, meetings };
            }).map((row) => (
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

      {/* Data Sources — pre-launch, toggleable */}
      {!isLaunched && (
        <div>
          <button onClick={() => setSourcesOpen(!sourcesOpen)} className="flex items-center gap-2 text-[11px] text-[#9b9a97] hover:text-foreground/70 transition-colors" style={{ fontWeight: 400 }}>
            <HugeiconsIcon icon={FlashIcon} size={11} className="text-foreground/30" />
            <span>Data Sources</span>
            <HugeiconsIcon icon={ArrowDown01Icon} size={10} className={`transition-transform ${sourcesOpen ? "" : "rotate-[-90deg]"}`} />
          </button>
          {sourcesOpen && (
            <div className="mt-2.5 space-y-2 animate-in fade-in duration-200">
              {[
                { key: "hubspot", label: "HubSpot", desc: "CRM, Pipeline, Contact Data", icon: <span className="inline-flex items-center justify-center w-5 h-5 rounded text-white text-[8px] shrink-0" style={{ background: "#ff7a59", fontWeight: 700 }}>H</span> },
                { key: "salesforce", label: "Salesforce", desc: "Opportunities, Accounts, Activities", icon: <span className="inline-flex items-center justify-center w-5 h-5 rounded text-white text-[8px] shrink-0" style={{ background: "#00A1E0", fontWeight: 700 }}>S</span> },
                { key: "agents", label: "Conversational Agents", desc: "Reply routing, lead qualification", icon: <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[8px] shrink-0" style={{ background: "#8b5cf610", color: "#8b5cf6", fontWeight: 700 }}>A</span> },
              ].map((source) => (
                <div key={source.key} className="flex items-center gap-2.5 px-3 py-2.5 border border-[#e9e9e7] rounded-xl bg-white">
                  {source.icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>{source.label}</p>
                    <p className="text-[9px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{source.desc}</p>
                  </div>
                  <button
                    onClick={() => setEnabledSources(prev => ({ ...prev, [source.key]: !prev[source.key] }))}
                    className={`w-8 h-[18px] rounded-full relative transition-colors shrink-0 ${enabledSources[source.key] ? "bg-foreground" : "bg-[#d6d6d3]"}`}
                  >
                    <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all ${enabledSources[source.key] ? "left-[15px]" : "left-[2px]"}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Action Center — Interactive insight cards ──

function ActionCenter({ onExplainInChat, actionCards }: { onExplainInChat?: (prompt: string) => void; actionCards: import("../../campaignData").ActionCardData[] }) {
  const [expanded, setExpanded] = useState(true);
  const [actionedCards, setActionedCards] = useState<Set<number>>(new Set());

  const handleAction = (idx: number, toastMsg: string) => {
    setActionedCards((prev) => new Set(prev).add(idx));
    toast.success(toastMsg);
  };

  return (
    <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-2 hover:bg-[#fafaf9] transition-colors"
      >
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider flex-1 text-left" style={{ fontWeight: 500 }}>
          Needs Attention
        </p>
        <span className="text-[10px] px-1.5 py-px rounded-full bg-amber-100 text-amber-700 tabular-nums" style={{ fontWeight: 600 }}>
          {actionCards.length}
        </span>
        <HugeiconsIcon icon={ArrowDown01Icon} size={10} className={`text-[#9b9a97] transition-transform ${expanded ? "" : "rotate-[-90deg]"}`} />
      </button>

      {expanded && (
        <div className="border-t border-[#e9e9e7] space-y-2 p-3 animate-in fade-in duration-200">
          {actionCards.map((card, idx) => {
            const actioned = actionedCards.has(idx);
            return (
              <div key={idx} className={`border ${card.borderColor} rounded-xl overflow-hidden ${card.bgColor}`}>
                <div className="px-4 py-3 flex items-start gap-2.5">
                  <span className="mt-0.5 text-[12px] shrink-0">
                    {card.type === "success" ? <HugeiconsIcon icon={CheckmarkBadge02Icon} size={13} color="#22c55e" /> : card.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>{card.title}</p>
                    <p className="text-[11px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>{card.subtitle}</p>
                  </div>
                </div>
                {card.buttonLabel && (
                  <div className="px-4 pb-3">
                    {!actioned ? (
                      <button
                        onClick={() => handleAction(idx, card.buttonToast ?? "Done")}
                        className="text-[11px] px-3.5 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
                        style={{ fontWeight: 500 }}
                      >
                        {card.buttonLabel}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-green-700">
                        <HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" />
                        <span style={{ fontWeight: 500 }}>{card.buttonToast}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


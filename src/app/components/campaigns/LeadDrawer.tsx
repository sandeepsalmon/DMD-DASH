import { useState } from "react";
import {
  HugeiconsIcon,
  Cancel01Icon,
  LinkSquare01Icon,
  ArrowDown01Icon,
  CheckmarkBadge02Icon,
  HourglassIcon,
  FireIcon,
  BubbleChatIcon,
} from "./icons";
import { IconFromKey } from "./icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { Lead } from "./types";
import { CTA_OPTIONS } from "./types";
import { toast } from "sonner";

interface Props {
  lead: Lead;
  onClose: () => void;
  onTweakInChat: (leadName: string, company: string) => void;
}

type DrawerTab = "activity" | "warm-context" | "agent-activity" | "transcript";

// Parse warm context text into structured sections
function parseWarmContext(text: string): { intro: string; score?: string; signals?: string[] } {
  const paragraphs = text.split("\n\n").map((p) => p.trim()).filter(Boolean);
  const intro = paragraphs[0] || text;

  let score: string | undefined;
  let signals: string[] | undefined;

  for (const para of paragraphs.slice(1)) {
    if (para.startsWith("ICP Score:")) {
      score = para;
    } else if (para.startsWith("Key signals:")) {
      signals = para
        .split("\n")
        .slice(1)
        .map((s) => s.replace(/^·\s*/, "").trim())
        .filter(Boolean);
    }
  }

  return { intro, score, signals };
}

// Parse agent notes text into structured sections
function parseAgentNotes(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections: { heading: string; body: string[] }[] = [];
  let current: { heading: string; body: string[] } | null = null;

  for (const line of lines) {
    if (!line.startsWith("·") && !line.startsWith("-") && line.endsWith(":")) {
      if (current) sections.push(current);
      current = { heading: line.slice(0, -1), body: [] };
    } else if (current) {
      current.body.push(line);
    } else {
      // No heading yet — treat as standalone paragraph
      sections.push({ heading: "", body: [line] });
    }
  }
  if (current) sections.push(current);
  return sections;
}

export function LeadDrawer({ lead, onClose, onTweakInChat }: Props) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("activity");

  const SCORE_COLOR =
    lead.scoreLevel === "hot"
      ? "bg-red-50 text-red-700 border-red-200"
      : lead.scoreLevel === "warm"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : "bg-green-50 text-green-700 border-green-200";

  const warmCtx = parseWarmContext(lead.warmContext);
  const agentSections = parseAgentNotes(lead.agentNotes);

  return (
    <>
      {/* Backdrop — covers the full CampaignMode container */}
      <div className="absolute inset-0 bg-black/10 z-20" onClick={onClose} />

      {/* Drawer panel — slides in from right edge of CampaignMode */}
      <div className="absolute right-0 top-0 h-full w-[420px] bg-white border-l border-[#e9e9e7] shadow-2xl z-30 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#e9e9e7] shrink-0">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-[16px] text-foreground" style={{ fontWeight: 600 }}>
                {lead.name}
              </p>
              <p className="text-[12px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
                {lead.company} · {lead.role}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${SCORE_COLOR}`} style={{ fontWeight: 500 }}>
                {lead.score} {lead.scoreLevel === "hot" ? <HugeiconsIcon icon={FireIcon} size={11} color="#ef4444" /> : null}
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>
          </div>

          {/* HubSpot link */}
          <button className="flex items-center gap-1 text-[11px] text-[#9b9a97] hover:text-foreground transition-colors mt-1" style={{ fontWeight: 400 }}>
            <HugeiconsIcon icon={LinkSquare01Icon} size={10} />
            Open in HubSpot
          </button>

          {/* Journey breadcrumb */}
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            {lead.journey.map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    i === lead.journey.length - 1
                      ? "bg-foreground text-white"
                      : "bg-[#f7f7f5] text-[#9b9a97]"
                  }`}
                  style={{ fontWeight: i === lead.journey.length - 1 ? 500 : 400 }}
                >
                  {step}
                </span>
                {i < lead.journey.length - 1 && (
                  <HugeiconsIcon icon={ArrowDown01Icon} size={9} className="rotate-[-90deg] text-[#c8c8c6] shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-[#e9e9e7] shrink-0 px-2">
          {(
            [
              { key: "activity", label: "Activity" },
              { key: "warm-context", label: "Warm Context" },
              { key: "agent-activity", label: "Agent Activity" },
              { key: "transcript", label: "Transcript" },
            ] as { key: DrawerTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-3 text-[12px] whitespace-nowrap relative transition-colors ${
                activeTab === tab.key ? "text-foreground" : "text-[#9b9a97] hover:text-foreground/70"
              }`}
              style={{ fontWeight: activeTab === tab.key ? 500 : 400 }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Activity tab ─────────────────────────────── */}
          {activeTab === "activity" && (
            <div className="p-6 space-y-6">
              {/* Timeline */}
              <div>
                <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
                  Activity
                </p>
                <div className="relative pl-5">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#e9e9e7]" />
                  <div className="space-y-0">
                    {lead.activity.map((item) => {
                      const isHighlight = item.icon === "calendar" || item.icon === "checkmark";
                      return (
                        <div key={item.id} className="relative flex items-start gap-3 py-2.5">
                          <div
                            className="absolute -left-5 top-3.5 w-2.5 h-2.5 rounded-full border-2 border-white z-10 shrink-0"
                            style={{
                              background: isHighlight ? "#22c55e" : "#d4d4d1",
                              boxShadow: `0 0 0 1.5px ${isHighlight ? "#22c55e" : "#e9e9e7"}`,
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2.5">
                              <span className="shrink-0 mt-0.5">
                                <IconFromKey iconKey={item.icon} size={13} color={isHighlight ? "#22c55e" : undefined} />
                              </span>
                              <div>
                                <p className="text-[13px] text-foreground" style={{ fontWeight: isHighlight ? 500 : 400, lineHeight: 1.5 }}>
                                  {item.description}
                                </p>
                                <p className="text-[10px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
                                  {item.timestamp}
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

              {/* Email thread */}
              <div>
                <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
                  Email Thread
                </p>
                <div className="space-y-2.5">
                  {lead.emails.map((email, i) => {
                    const statusLabel = `Day ${email.day}`;
                    const statusSuffix = email.status === "sent" ? "Opened" : email.status === "scheduled" ? "Scheduled" : "Pending";
                    const statusIconEl = email.status === "sent"
                      ? <HugeiconsIcon icon={CheckmarkBadge02Icon} size={10} color="#22c55e" />
                      : email.status === "scheduled"
                      ? <HugeiconsIcon icon={HourglassIcon} size={10} color="#d97706" />
                      : <span className="w-2 h-2 rounded-full border border-[#c8c8c6] inline-block" />;

                    return (
                      <div key={i} className="border border-[#e9e9e7] rounded-xl p-3.5">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-[#9b9a97] flex items-center gap-1" style={{ fontWeight: 500 }}>{statusLabel} — {statusIconEl} {statusSuffix}</p>
                            <p className="text-[13px] text-foreground mt-1 leading-snug" style={{ fontWeight: 500 }}>
                              Email {email.number}
                            </p>
                            <p className="text-[12px] text-[#9b9a97] mt-0.5 leading-snug" style={{ fontWeight: 400 }}>
                              "{email.subject}"
                            </p>
                          </div>
                        </div>

                        {/* Metrics */}
                        {email.status === "sent" && email.openRate !== undefined && (
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                              {email.openRate}% opened
                            </span>
                            <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                              {email.clickRate}% clicked
                            </span>
                          </div>
                        )}

                        <p className="text-[12px] text-[#9b9a97] mb-2.5" style={{ fontWeight: 400 }}>
                          CTA: {email.cta}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="text-[11px] px-2 py-1 rounded-lg border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:border-[#c8c8c6] transition-colors flex items-center gap-1"
                                style={{ fontWeight: 400 }}
                              >
                                Change CTA ▾
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              {CTA_OPTIONS.map((opt) => (
                                <DropdownMenuItem
                                  key={opt.value}
                                  className="text-[12px]"
                                  onClick={() => toast.success(`CTA changed to ${opt.label}`)}
                                >
                                  {opt.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <button
                            className="text-[11px] px-2 py-1 rounded-lg border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:border-[#c8c8c6] transition-colors"
                            style={{ fontWeight: 400 }}
                            onClick={() => toast.info("Email editor coming soon")}
                          >
                            Edit
                          </button>

                          {email.status !== "sent" && (
                            <>
                              <button
                                className="text-[11px] px-2 py-1 rounded-lg border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:border-[#c8c8c6] transition-colors"
                                style={{ fontWeight: 400 }}
                                onClick={() => toast.info("Email skipped")}
                              >
                                Skip
                              </button>
                              <button
                                className="text-[11px] px-2 py-1 rounded-lg border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:border-[#c8c8c6] transition-colors"
                                style={{ fontWeight: 400 }}
                                onClick={() => toast.success("Email sequence paused")}
                              >
                                Pause
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Warm Context tab ─────────────────────────── */}
          {activeTab === "warm-context" && (
            <div className="p-6 space-y-5">
              <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                What We Know About {lead.name.split(" ")[0]}
              </p>

              {/* Intro paragraph */}
              <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.7 }}>
                {warmCtx.intro}
              </p>

              {/* ICP Score */}
              {warmCtx.score && (
                <div className="bg-[#fafaf9] border border-[#e9e9e7] rounded-xl p-4">
                  <p className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-2" style={{ fontWeight: 500 }}>
                    ICP Score Breakdown
                  </p>
                  <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
                    {warmCtx.score}
                  </p>
                </div>
              )}

              {/* Key signals */}
              {warmCtx.signals && warmCtx.signals.length > 0 && (
                <div>
                  <p className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
                    Key Signals
                  </p>
                  <div className="space-y-2">
                    {warmCtx.signals.map((signal, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-1 h-1 rounded-full bg-foreground/40 mt-[7px] shrink-0" />
                        <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.5 }}>
                          {signal}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Agent Activity tab ───────────────────────── */}
          {activeTab === "agent-activity" && (
            <div className="p-6 space-y-4">
              <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                Agent Decisions for {lead.name.split(" ")[0]}
              </p>
              {agentSections.map((section, i) => (
                <div key={i} className={section.heading ? "border border-[#e9e9e7] rounded-xl p-4" : ""}>
                  {section.heading && (
                    <p className="text-[12px] text-foreground mb-2" style={{ fontWeight: 600 }}>
                      {section.heading}
                    </p>
                  )}
                  <div className="space-y-1.5">
                    {section.body.map((line, j) => {
                      const isWarning = line.startsWith("Note:") || line.startsWith("Recommendation:");
                      const isNote = line.startsWith("Reason:");
                      return (
                        <p
                          key={j}
                          className={`text-[13px] ${isWarning ? "text-amber-600" : isNote ? "text-[#9b9a97]" : "text-foreground"}`}
                          style={{ fontWeight: isWarning ? 500 : 400, lineHeight: 1.6 }}
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Transcript tab ───────────────────────────── */}
          {activeTab === "transcript" && (
            <div className="p-6 flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-[13px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                No agent transcript available
              </p>
              <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                Transcripts appear when a lead has had a live agent conversation.
              </p>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="px-6 py-4 border-t border-[#e9e9e7] shrink-0 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { toast.success(`${lead.name} escalated to AE team`); onClose(); }}
              className="text-[12px] px-3.5 py-2 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors"
              style={{ fontWeight: 400 }}
            >
              Escalate to AE
            </button>
            <button
              onClick={() => toast.info("Move to campaign coming soon")}
              className="text-[12px] px-3.5 py-2 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors"
              style={{ fontWeight: 400 }}
            >
              Move to campaign
            </button>
            <button
              onClick={() => toast.success(`Emails paused for ${lead.name}`)}
              className="text-[12px] px-3.5 py-2 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors"
              style={{ fontWeight: 400 }}
            >
              Pause emails
            </button>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex-1 text-[12px] px-3.5 py-2 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  Change segment
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                {(["A", "B", "C"] as const).map((seg) => (
                  <DropdownMenuItem
                    key={seg}
                    className="text-[12px] gap-2"
                    onClick={() => toast.success(`${lead.name} moved to Segment ${seg}`)}
                  >
                    Segment {seg}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => {
                if (confirm(`Remove ${lead.name} from this campaign?`)) {
                  toast.success(`${lead.name} removed from campaign`);
                  onClose();
                }
              }}
              className="text-[12px] px-3.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              style={{ fontWeight: 400 }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

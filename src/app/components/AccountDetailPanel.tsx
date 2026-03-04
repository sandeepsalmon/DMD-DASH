import { useState } from "react";
import {
  X,
  ChevronRight,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import {
  HugeiconsIcon,
  FireIcon,
  BubbleChatIcon,
  Mail01Icon,
  Calendar03Icon,
  CheckmarkBadge02Icon,
  AlertCircleIcon,
  AiChat02Icon,
  Target02Icon,
  Globe02Icon,
  ChartLineData02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  HourglassIcon,
  LinkSquare01Icon,
  SparklesIcon,
} from "./campaigns/icons";
import { IconFromKey } from "./campaigns/icons";
import type { Lead, Account } from "./campaigns/types";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────

interface AccountInsight extends Account {
  conversationalSessions: number;
  avgSessionDuration: string;
  emailsSent: number;
  emailOpenRate: number;
  emailClickRate: number;
  lastActivity: string;
  lastActivityType: string;
  nurturingStage: string;
  trend: string;
  topSignal: string;
}

interface Props {
  account: AccountInsight;
  selectedLead: Lead | null;
  onClose: () => void;
  onLeadSelect: (lead: Lead | null) => void;
}

type PanelTab = "overview" | "leads" | "conversations" | "emails";

// ── Score helpers ────────────────────────────────────────────────────────

function ScoreBadge({ score, level }: { score: number; level: string }) {
  const config: Record<string, string> = {
    hot: "bg-red-50 text-red-700 border-red-200",
    warm: "bg-yellow-50 text-yellow-700 border-yellow-200",
    cool: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${config[level] || config.cool} flex items-center gap-1`} style={{ fontWeight: 500 }}>
      {score}
      {level === "hot" && <HugeiconsIcon icon={FireIcon} size={10} color="#ef4444" />}
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    awareness: { bg: "bg-slate-50 border-slate-200", text: "text-slate-600", label: "Awareness" },
    consideration: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Consideration" },
    decision: { bg: "bg-green-50 border-green-200", text: "text-green-700", label: "Decision" },
    closed: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", label: "Closed" },
  };
  const c = config[stage] || config.awareness;
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${c.bg} ${c.text}`} style={{ fontWeight: 500 }}>
      {c.label}
    </span>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────────

export function AccountDetailPanel({ account, selectedLead, onClose, onLeadSelect }: Props) {
  const [activeTab, setActiveTab] = useState<PanelTab>("overview");
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(selectedLead?.id || null);

  // If a lead is explicitly selected, show lead detail view
  if (selectedLead) {
    return (
      <LeadDetailView
        lead={selectedLead}
        account={account}
        onBack={() => onLeadSelect(null)}
        onClose={onClose}
      />
    );
  }

  const highestScoreLead = account.leads.reduce((a, b) => (b.score > a.score ? b : a), account.leads[0]);
  const scoreLevel = highestScoreLead?.scoreLevel || "cool";

  return (
    <div className="w-[440px] shrink-0 bg-white border-l border-[#e9e9e7] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#e9e9e7] shrink-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#f4f4f2] flex items-center justify-center text-foreground/50 text-[13px] shrink-0" style={{ fontWeight: 600 }}>
                {account.name.charAt(0)}
              </div>
              <div>
                <p className="text-[15px] text-foreground" style={{ fontWeight: 600 }}>
                  {account.name}
                </p>
                <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                  {account.leadCount} lead{account.leadCount > 1 ? "s" : ""} tracked
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ScoreBadge score={account.score} level={scoreLevel} />
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex items-center gap-3 mt-3">
          <StageBadge stage={account.nurturingStage} />
          <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
            Last activity: {account.lastActivity}
          </span>
        </div>

        {/* CRM link */}
        <button className="flex items-center gap-1 text-[11px] text-[#9b9a97] hover:text-foreground transition-colors mt-2.5" style={{ fontWeight: 400 }}>
          <HugeiconsIcon icon={LinkSquare01Icon} size={10} />
          Open in HubSpot
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#e9e9e7] shrink-0 px-2">
        {([
          { key: "overview" as PanelTab, label: "Overview" },
          { key: "leads" as PanelTab, label: `Leads (${account.leadCount})` },
          { key: "conversations" as PanelTab, label: "Conversations" },
          { key: "emails" as PanelTab, label: "Emails" },
        ]).map((tab) => (
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
        {activeTab === "overview" && <OverviewContent account={account} onLeadSelect={onLeadSelect} />}
        {activeTab === "leads" && <LeadsContent account={account} onLeadSelect={onLeadSelect} expandedLeadId={expandedLeadId} setExpandedLeadId={setExpandedLeadId} />}
        {activeTab === "conversations" && <ConversationsContent account={account} />}
        {activeTab === "emails" && <EmailsContent account={account} />}
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────

function OverviewContent({ account, onLeadSelect }: { account: AccountInsight; onLeadSelect: (lead: Lead) => void }) {
  return (
    <div className="p-5 space-y-5">
      {/* Agent Insights Summary */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
          Agent Performance
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Conversational Agent Card */}
          <div className="border border-[#e9e9e7] rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#8b5cf610" }}>
                <HugeiconsIcon icon={BubbleChatIcon} size={12} color="#8b5cf6" />
              </div>
              <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Conversational</span>
            </div>
            <p className="text-[18px] text-foreground tabular-nums leading-none" style={{ fontWeight: 600 }}>
              {account.conversationalSessions}
            </p>
            <p className="text-[10px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>
              sessions · {account.avgSessionDuration} avg
            </p>
          </div>

          {/* Email Agent Card */}
          <div className="border border-[#e9e9e7] rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#3b82f610" }}>
                <HugeiconsIcon icon={Mail01Icon} size={12} color="#3b82f6" />
              </div>
              <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Email</span>
            </div>
            <p className="text-[18px] text-foreground tabular-nums leading-none" style={{ fontWeight: 600 }}>
              {account.emailsSent}
            </p>
            <p className="text-[10px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>
              emails · {account.emailOpenRate}% open
            </p>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
          Engagement Breakdown
        </p>
        <div className="space-y-3">
          {[
            { label: "Email Open Rate", value: `${account.emailOpenRate}%`, bar: account.emailOpenRate, color: "#3b82f6" },
            { label: "Email Click Rate", value: `${account.emailClickRate}%`, bar: account.emailClickRate, color: "#f59e0b" },
            { label: "Conv. Engagement", value: account.conversationalSessions > 0 ? "Active" : "None", bar: account.conversationalSessions > 0 ? 60 : 0, color: "#8b5cf6" },
          ].map((metric) => (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#6b6a67]" style={{ fontWeight: 400 }}>{metric.label}</span>
                <span className="text-[11px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>{metric.value}</span>
              </div>
              <div className="h-1.5 bg-[#f4f4f2] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${metric.bar}%`, background: metric.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Signal / Top Insight */}
      {account.topSignal && (
        <div className="bg-[#fafaf9] border border-[#e9e9e7] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <HugeiconsIcon icon={SparklesIcon} size={12} color="#f59e0b" />
            <span className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
              AI Insight
            </span>
          </div>
          <p className="text-[12px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
            {account.topSignal}
          </p>
        </div>
      )}

      {/* Leads quick list */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
          Leads at this Account
        </p>
        <div className="space-y-1.5">
          {account.leads.map((lead) => {
            const statusColor: Record<string, string> = {
              "meeting-booked": "#22c55e",
              "high-engagement": "#3b82f6",
              "opened-no-click": "#f59e0b",
              "partial-engagement": "#9b9a97",
              "no-engagement": "#d4d4d1",
            };
            return (
              <button
                key={lead.id}
                onClick={() => onLeadSelect(lead)}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f7f7f5] transition-colors group"
              >
                <div className="w-6 h-6 rounded-full bg-[#f4f4f2] flex items-center justify-center text-[9px] text-foreground/50 shrink-0" style={{ fontWeight: 600 }}>
                  {lead.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>{lead.name}</p>
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{lead.role}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[lead.status] || "#d4d4d1" }} />
                  <span className="text-[11px] text-foreground tabular-nums" style={{ fontWeight: 500 }}>{lead.score}</span>
                  <ChevronRight size={12} className="text-[#c8c8c6] group-hover:text-[#9b9a97] transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => toast.success(`${account.name} escalated to AE team`)}
          className="text-[11px] px-3.5 py-2 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
          style={{ fontWeight: 500 }}
        >
          Escalate to AE
        </button>
        <button
          onClick={() => toast.info("Account exported")}
          className="text-[11px] px-3.5 py-2 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors"
          style={{ fontWeight: 400 }}
        >
          Export report
        </button>
      </div>
    </div>
  );
}

// ── Leads Tab ────────────────────────────────────────────────────────────

function LeadsContent({
  account,
  onLeadSelect,
  expandedLeadId,
  setExpandedLeadId,
}: {
  account: AccountInsight;
  onLeadSelect: (lead: Lead) => void;
  expandedLeadId: string | null;
  setExpandedLeadId: (id: string | null) => void;
}) {
  return (
    <div className="p-5 space-y-2">
      {account.leads.map((lead) => {
        const isExpanded = expandedLeadId === lead.id;
        const scoreColorClass = lead.scoreLevel === "hot" ? "bg-red-50 text-red-700 border-red-200" : lead.scoreLevel === "warm" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200";

        return (
          <div key={lead.id} className="border border-[#e9e9e7] rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#fafaf9] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#f4f4f2] flex items-center justify-center text-[9px] text-foreground/50 shrink-0" style={{ fontWeight: 600 }}>
                {lead.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>{lead.name}</p>
                  <span className={`text-[10px] px-1.5 py-px rounded-full border ${scoreColorClass}`} style={{ fontWeight: 500 }}>
                    {lead.score}
                  </span>
                </div>
                <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{lead.role} · Seg {lead.segment}</p>
              </div>
              {isExpanded ? <ChevronDown size={13} className="text-[#9b9a97]" /> : <ChevronRight size={13} className="text-[#9b9a97]" />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-[#e9e9e7] bg-[#fafaf9]/50 space-y-3">
                {/* Journey breadcrumb */}
                <div className="flex items-center gap-1 mt-3 flex-wrap">
                  {lead.journey.map((step, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          i === lead.journey.length - 1 ? "bg-foreground text-white" : "bg-[#f4f4f2] text-[#9b9a97]"
                        }`}
                        style={{ fontWeight: i === lead.journey.length - 1 ? 500 : 400 }}
                      >
                        {step}
                      </span>
                      {i < lead.journey.length - 1 && <span className="text-[#c8c8c6] text-[8px]">→</span>}
                    </div>
                  ))}
                </div>

                {/* Mini activity timeline */}
                <div>
                  <p className="text-[9px] text-[#9b9a97] uppercase tracking-wider mb-2" style={{ fontWeight: 500 }}>
                    Recent Activity
                  </p>
                  <div className="space-y-1.5">
                    {lead.activity.slice(0, 4).map((item) => {
                      const isHighlight = item.icon === "calendar" || item.icon === "checkmark";
                      return (
                        <div key={item.id} className="flex items-start gap-2">
                          <IconFromKey iconKey={item.icon} size={10} color={isHighlight ? "#22c55e" : "#9b9a97"} />
                          <p className={`text-[11px] flex-1 ${isHighlight ? "text-foreground" : "text-[#6b6a67]"}`} style={{ fontWeight: isHighlight ? 500 : 400, lineHeight: 1.4 }}>
                            {item.description}
                          </p>
                          <span className="text-[9px] text-[#9b9a97] shrink-0" style={{ fontWeight: 400 }}>{item.timestamp}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Email summary */}
                <div className="flex items-center gap-3 text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                  <span>{lead.emails.length} emails</span>
                  {lead.emails[0]?.openRate !== undefined && <span>{lead.emails[0].openRate}% open</span>}
                  {lead.emails[0]?.clickRate !== undefined && <span>{lead.emails[0].clickRate}% click</span>}
                </div>

                <button
                  onClick={() => onLeadSelect(lead)}
                  className="text-[11px] text-foreground hover:underline flex items-center gap-1"
                  style={{ fontWeight: 500 }}
                >
                  Full details <ChevronRight size={11} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Conversations Tab ────────────────────────────────────────────────────

function ConversationsContent({ account }: { account: AccountInsight }) {
  // Extract conversation activities from all leads
  const conversations = account.leads
    .flatMap((lead) =>
      lead.activity
        .filter((a) => a.type === "agent-convo")
        .map((a) => ({ ...a, leadName: lead.name, leadRole: lead.role, leadScore: lead.score }))
    )
    .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

  if (conversations.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-40 gap-2">
        <HugeiconsIcon icon={BubbleChatIcon} size={20} color="#d4d4d1" />
        <p className="text-[13px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
          No agent conversations yet
        </p>
        <p className="text-[11px] text-[#c8c8c6]" style={{ fontWeight: 400 }}>
          Conversations appear when leads interact with the conversational agent.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-3">
      <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
        Agent Conversations
      </p>
      {conversations.map((conv, i) => (
        <div key={i} className="border border-[#e9e9e7] rounded-xl p-3.5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={AiChat02Icon} size={11} color="#8b5cf6" />
              </div>
              <div>
                <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>{conv.leadName}</p>
                <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{conv.leadRole}</p>
              </div>
            </div>
            <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{conv.timestamp}</span>
          </div>
          <p className="text-[12px] text-[#6b6a67]" style={{ fontWeight: 400, lineHeight: 1.5 }}>
            {conv.description}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Emails Tab ───────────────────────────────────────────────────────────

function EmailsContent({ account }: { account: AccountInsight }) {
  return (
    <div className="p-5 space-y-4">
      {/* Aggregate email stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Sent", value: account.emailsSent.toString() },
          { label: "Open Rate", value: `${account.emailOpenRate}%` },
          { label: "Click Rate", value: `${account.emailClickRate}%` },
        ].map((stat) => (
          <div key={stat.label} className="border border-[#e9e9e7] rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#9b9a97] mb-1" style={{ fontWeight: 500 }}>{stat.label}</p>
            <p className="text-[16px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Per-lead email breakdown */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
          Email Thread by Lead
        </p>
        {account.leads.map((lead) => (
          <div key={lead.id} className="mb-3">
            <p className="text-[11px] text-foreground mb-2" style={{ fontWeight: 500 }}>
              {lead.name} <span className="text-[#9b9a97]" style={{ fontWeight: 400 }}>· Seg {lead.segment}</span>
            </p>
            <div className="space-y-1.5 pl-3 border-l-2 border-[#e9e9e7]">
              {lead.emails.map((email) => {
                const statusIcon =
                  email.status === "sent" ? (
                    <HugeiconsIcon icon={CheckmarkBadge02Icon} size={10} color="#22c55e" />
                  ) : email.status === "scheduled" ? (
                    <HugeiconsIcon icon={HourglassIcon} size={10} color="#d97706" />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-[#c8c8c6] inline-block" />
                  );

                return (
                  <div key={email.id} className="flex items-start gap-2 py-1.5">
                    <span className="mt-0.5 shrink-0">{statusIcon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-foreground" style={{ fontWeight: 400 }}>
                        Email {email.number}: "{email.subject}"
                      </p>
                      {email.status === "sent" && email.openRate !== undefined && (
                        <p className="text-[10px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
                          {email.openRate}% opened · {email.clickRate}% clicked
                        </p>
                      )}
                      {email.status === "scheduled" && email.scheduledFor && (
                        <p className="text-[10px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
                          Scheduled: {email.scheduledFor}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Lead Detail View (full panel takeover) ───────────────────────────────

function LeadDetailView({
  lead,
  account,
  onBack,
  onClose,
}: {
  lead: Lead;
  account: AccountInsight;
  onBack: () => void;
  onClose: () => void;
}) {
  const [leadTab, setLeadTab] = useState<"activity" | "warm-context" | "agent-notes">("activity");

  const SCORE_COLOR =
    lead.scoreLevel === "hot"
      ? "bg-red-50 text-red-700 border-red-200"
      : lead.scoreLevel === "warm"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : "bg-green-50 text-green-700 border-green-200";

  return (
    <div className="w-[440px] shrink-0 bg-white border-l border-[#e9e9e7] flex flex-col h-full overflow-hidden">
      {/* Back + Header */}
      <div className="px-5 pt-4 pb-4 border-b border-[#e9e9e7] shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-[11px] text-[#9b9a97] hover:text-foreground transition-colors mb-3" style={{ fontWeight: 400 }}>
          ← Back to {account.name}
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[15px] text-foreground" style={{ fontWeight: 600 }}>{lead.name}</p>
            <p className="text-[11px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
              {lead.company} · {lead.role}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${SCORE_COLOR} flex items-center gap-1`} style={{ fontWeight: 500 }}>
              {lead.score}
              {lead.scoreLevel === "hot" && <HugeiconsIcon icon={FireIcon} size={10} color="#ef4444" />}
            </span>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Journey */}
        <div className="flex items-center gap-1 mt-3 flex-wrap">
          {lead.journey.map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  i === lead.journey.length - 1 ? "bg-foreground text-white" : "bg-[#f4f4f2] text-[#9b9a97]"
                }`}
                style={{ fontWeight: i === lead.journey.length - 1 ? 500 : 400 }}
              >
                {step}
              </span>
              {i < lead.journey.length - 1 && <span className="text-[#c8c8c6] text-[8px]">→</span>}
            </div>
          ))}
        </div>

        {/* Quick agent summary */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#e9e9e7]/60">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={BubbleChatIcon} size={11} color="#8b5cf6" />
            <span className="text-[10px] text-[#6b6a67]" style={{ fontWeight: 400 }}>
              {lead.activity.filter((a) => a.type === "agent-convo").length} conversations
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Mail01Icon} size={11} color="#3b82f6" />
            <span className="text-[10px] text-[#6b6a67]" style={{ fontWeight: 400 }}>
              {lead.emails.length} emails
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Globe02Icon} size={11} color="#6b7280" />
            <span className="text-[10px] text-[#6b6a67]" style={{ fontWeight: 400 }}>
              {lead.activity.filter((a) => a.type === "web-visit").length} web visits
            </span>
          </div>
        </div>
      </div>

      {/* Lead tabs */}
      <div className="flex items-center border-b border-[#e9e9e7] shrink-0 px-2">
        {([
          { key: "activity" as const, label: "Unified Timeline" },
          { key: "warm-context" as const, label: "Context" },
          { key: "agent-notes" as const, label: "Agent Notes" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setLeadTab(tab.key)}
            className={`px-3.5 py-3 text-[12px] whitespace-nowrap relative transition-colors ${
              leadTab === tab.key ? "text-foreground" : "text-[#9b9a97] hover:text-foreground/70"
            }`}
            style={{ fontWeight: leadTab === tab.key ? 500 : 400 }}
          >
            {tab.label}
            {leadTab === tab.key && <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-foreground rounded-full" />}
          </button>
        ))}
      </div>

      {/* Lead tab content */}
      <div className="flex-1 overflow-y-auto">
        {leadTab === "activity" && <UnifiedTimeline lead={lead} />}
        {leadTab === "warm-context" && <WarmContextView lead={lead} />}
        {leadTab === "agent-notes" && <AgentNotesView lead={lead} />}
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 border-t border-[#e9e9e7] shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success(`${lead.name} escalated to AE team`)}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
            style={{ fontWeight: 500 }}
          >
            Escalate to AE
          </button>
          <button
            onClick={() => toast.success(`Emails paused for ${lead.name}`)}
            className="text-[11px] px-3 py-1.5 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] transition-colors"
            style={{ fontWeight: 400 }}
          >
            Pause emails
          </button>
          <button
            onClick={() => toast.info("Move to campaign")}
            className="text-[11px] px-3 py-1.5 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] transition-colors"
            style={{ fontWeight: 400 }}
          >
            Move to campaign
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Unified Timeline — merges email + conversation + web activity ────────

function UnifiedTimeline({ lead }: { lead: Lead }) {
  // Build unified timeline from activity + emails
  const timelineItems = [
    ...lead.activity.map((a) => ({
      type: a.type,
      icon: a.icon,
      description: a.description,
      timestamp: a.timestamp,
      source: a.type === "agent-convo" ? "conv" as const : a.type.startsWith("email") ? "email" as const : "web" as const,
    })),
  ];

  return (
    <div className="p-5 space-y-5">
      {/* Timeline */}
      <div>
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
          Unified Activity Timeline
        </p>
        <div className="relative pl-5">
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#e9e9e7]" />
          <div className="space-y-0">
            {timelineItems.map((item, i) => {
              const isHighlight = item.icon === "calendar" || item.icon === "checkmark";
              const sourceColor = item.source === "conv" ? "#8b5cf6" : item.source === "email" ? "#3b82f6" : "#6b7280";
              const sourceLabel = item.source === "conv" ? "Conv" : item.source === "email" ? "Email" : "Web";
              return (
                <div key={i} className="relative flex items-start gap-3 py-2.5">
                  <div
                    className="absolute -left-5 top-3.5 w-2.5 h-2.5 rounded-full border-2 border-white z-10 shrink-0"
                    style={{
                      background: isHighlight ? "#22c55e" : sourceColor,
                      boxShadow: `0 0 0 1.5px ${isHighlight ? "#22c55e" : "#e9e9e7"}`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span
                        className="text-[8px] px-1 py-px rounded mt-0.5 shrink-0"
                        style={{ background: `${sourceColor}15`, color: sourceColor, fontWeight: 600 }}
                      >
                        {sourceLabel}
                      </span>
                      <div className="flex-1">
                        <p className={`text-[12px] ${isHighlight ? "text-foreground" : "text-[#6b6a67]"}`} style={{ fontWeight: isHighlight ? 500 : 400, lineHeight: 1.5 }}>
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
        <div className="space-y-2">
          {lead.emails.map((email) => {
            const statusIcon =
              email.status === "sent" ? (
                <HugeiconsIcon icon={CheckmarkBadge02Icon} size={10} color="#22c55e" />
              ) : email.status === "scheduled" ? (
                <HugeiconsIcon icon={HourglassIcon} size={10} color="#d97706" />
              ) : (
                <span className="w-2 h-2 rounded-full border border-[#c8c8c6] inline-block" />
              );
            return (
              <div key={email.id} className="border border-[#e9e9e7] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  {statusIcon}
                  <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>
                    Day {email.day} · Email {email.number}
                  </span>
                </div>
                <p className="text-[12px] text-foreground mb-1" style={{ fontWeight: 400, lineHeight: 1.4 }}>
                  "{email.subject}"
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>CTA: {email.cta}</span>
                  {email.status === "sent" && email.openRate !== undefined && (
                    <>
                      <span className="text-[10px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>{email.openRate}% open</span>
                      <span className="text-[10px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>{email.clickRate}% click</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Warm Context View ────────────────────────────────────────────────────

function WarmContextView({ lead }: { lead: Lead }) {
  const paragraphs = lead.warmContext.split("\n\n").map((p) => p.trim()).filter(Boolean);
  const intro = paragraphs[0] || lead.warmContext;

  let score: string | undefined;
  let signals: string[] | undefined;
  for (const para of paragraphs.slice(1)) {
    if (para.startsWith("ICP Score:")) score = para;
    else if (para.startsWith("Key signals:")) {
      signals = para.split("\n").slice(1).map((s) => s.replace(/^·\s*/, "").trim()).filter(Boolean);
    }
  }

  return (
    <div className="p-5 space-y-5">
      <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
        What We Know About {lead.name.split(" ")[0]}
      </p>

      <p className="text-[12px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.7 }}>
        {intro}
      </p>

      {score && (
        <div className="bg-[#fafaf9] border border-[#e9e9e7] rounded-xl p-4">
          <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-2" style={{ fontWeight: 500 }}>ICP Score Breakdown</p>
          <p className="text-[12px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>{score}</p>
        </div>
      )}

      {signals && signals.length > 0 && (
        <div>
          <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>Key Signals</p>
          <div className="space-y-2">
            {signals.map((signal, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-1 h-1 rounded-full bg-foreground/40 mt-[6px] shrink-0" />
                <p className="text-[12px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.5 }}>{signal}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Agent Notes View ─────────────────────────────────────────────────────

function AgentNotesView({ lead }: { lead: Lead }) {
  const lines = lead.agentNotes.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections: { heading: string; body: string[] }[] = [];
  let current: { heading: string; body: string[] } | null = null;

  for (const line of lines) {
    if (!line.startsWith("·") && !line.startsWith("-") && line.endsWith(":")) {
      if (current) sections.push(current);
      current = { heading: line.slice(0, -1), body: [] };
    } else if (current) {
      current.body.push(line);
    } else {
      sections.push({ heading: "", body: [line] });
    }
  }
  if (current) sections.push(current);

  return (
    <div className="p-5 space-y-4">
      <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
        Agent Decisions for {lead.name.split(" ")[0]}
      </p>
      {sections.map((section, i) => (
        <div key={i} className={section.heading ? "border border-[#e9e9e7] rounded-xl p-4" : ""}>
          {section.heading && (
            <p className="text-[11px] text-foreground mb-2" style={{ fontWeight: 600 }}>{section.heading}</p>
          )}
          <div className="space-y-1.5">
            {section.body.map((line, j) => {
              const isWarning = line.startsWith("Note:") || line.startsWith("Recommendation:");
              const isNote = line.startsWith("Reason:");
              return (
                <p
                  key={j}
                  className={`text-[12px] ${isWarning ? "text-amber-600" : isNote ? "text-[#9b9a97]" : "text-foreground"}`}
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
  );
}

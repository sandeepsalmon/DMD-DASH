import { useState, useMemo } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  X,
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
  SparklesIcon,
} from "./campaigns/icons";
import type { Lead, Account } from "./campaigns/types";
import { LEADS, getAccountsFromLeads } from "./campaigns/types";
import { AccountDetailPanel } from "./AccountDetailPanel";

// ── Extended data for the unified dashboard ──────────────────────────────

interface AccountInsight extends Account {
  conversationalSessions: number;
  avgSessionDuration: string;
  emailsSent: number;
  emailOpenRate: number;
  emailClickRate: number;
  lastActivity: string;
  lastActivityType: "conversation" | "email-open" | "email-click" | "meeting" | "web-visit";
  nurturingStage: "awareness" | "consideration" | "decision" | "closed";
  trend: "up" | "down" | "stable";
  topSignal: string;
}

function enrichAccounts(): AccountInsight[] {
  const accounts = getAccountsFromLeads();
  const enrichmentMap: Record<string, Partial<AccountInsight>> = {
    "Acme Corp": {
      conversationalSessions: 3,
      avgSessionDuration: "8 min",
      emailsSent: 4,
      emailOpenRate: 78,
      emailClickRate: 33,
      lastActivity: "2h ago",
      lastActivityType: "meeting",
      nurturingStage: "decision",
      trend: "up",
      topSignal: "Meeting booked after 3 pricing visits",
    },
    Datadog: {
      conversationalSessions: 2,
      avgSessionDuration: "4 min",
      emailsSent: 4,
      emailOpenRate: 63,
      emailClickRate: 25,
      lastActivity: "3h ago",
      lastActivityType: "meeting",
      nurturingStage: "decision",
      trend: "up",
      topSignal: "Clicked booking link from Email 2",
    },
    FinServ: {
      conversationalSessions: 1,
      avgSessionDuration: "2 min",
      emailsSent: 4,
      emailOpenRate: 100,
      emailClickRate: 100,
      lastActivity: "5h ago",
      lastActivityType: "email-click",
      nurturingStage: "consideration",
      trend: "up",
      topSignal: "Clicked every CTA but no meeting — needs AE",
    },
    MegaCorp: {
      conversationalSessions: 0,
      avgSessionDuration: "—",
      emailsSent: 4,
      emailOpenRate: 75,
      emailClickRate: 50,
      lastActivity: "Today",
      lastActivityType: "email-open",
      nurturingStage: "consideration",
      trend: "down",
      topSignal: "Engagement declining Email 1 → 2",
    },
    CloudBase: {
      conversationalSessions: 1,
      avgSessionDuration: "3 min",
      emailsSent: 3,
      emailOpenRate: 70,
      emailClickRate: 20,
      lastActivity: "1h ago",
      lastActivityType: "meeting",
      nurturingStage: "decision",
      trend: "up",
      topSignal: "Pre-send CTA upgrade led to meeting",
    },
    StartupX: {
      conversationalSessions: 1,
      avgSessionDuration: "4 min",
      emailsSent: 3,
      emailOpenRate: 70,
      emailClickRate: 0,
      lastActivity: "Today",
      lastActivityType: "email-open",
      nurturingStage: "awareness",
      trend: "stable",
      topSignal: "Opens emails but never clicks — CTA mismatch",
    },
    RetailCo: {
      conversationalSessions: 1,
      avgSessionDuration: "2 min",
      emailsSent: 2,
      emailOpenRate: 50,
      emailClickRate: 0,
      lastActivity: "Yesterday",
      lastActivityType: "email-open",
      nurturingStage: "awareness",
      trend: "stable",
      topSignal: "Low engagement, monitoring",
    },
    OldCorp: {
      conversationalSessions: 1,
      avgSessionDuration: "3 min",
      emailsSent: 2,
      emailOpenRate: 50,
      emailClickRate: 0,
      lastActivity: "Yesterday",
      lastActivityType: "email-open",
      nurturingStage: "awareness",
      trend: "stable",
      topSignal: "Re-engage: lost on pricing",
    },
    TechFlow: {
      conversationalSessions: 1,
      avgSessionDuration: "5 min",
      emailsSent: 2,
      emailOpenRate: 0,
      emailClickRate: 0,
      lastActivity: "2 days ago",
      lastActivityType: "email-open",
      nurturingStage: "awareness",
      trend: "down",
      topSignal: "Re-engage: lost on timing (6mo almost up)",
    },
    LogiCorp: {
      conversationalSessions: 1,
      avgSessionDuration: "2 min",
      emailsSent: 1,
      emailOpenRate: 0,
      emailClickRate: 0,
      lastActivity: "2 days ago",
      lastActivityType: "email-open",
      nurturingStage: "awareness",
      trend: "down",
      topSignal: "Re-engage: lost on timing",
    },
  };

  return accounts.map((acc) => ({
    ...acc,
    conversationalSessions: 0,
    avgSessionDuration: "—",
    emailsSent: 0,
    emailOpenRate: 0,
    emailClickRate: 0,
    lastActivity: "—",
    lastActivityType: "email-open" as const,
    nurturingStage: "awareness" as const,
    trend: "stable" as const,
    topSignal: "",
    ...(enrichmentMap[acc.name] || {}),
  }));
}

// ── Helper components ────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up")
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
        <ArrowUpRight size={10} /> Rising
      </span>
    );
  if (trend === "down")
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
        <ArrowDownRight size={10} /> Declining
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-[10px] text-[#9b9a97] bg-[#f4f4f2] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
      Stable
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

function ActivityIcon({ type }: { type: string }) {
  const config: Record<string, { icon: React.ComponentType; color: string }> = {
    conversation: { icon: AiChat02Icon, color: "#8b5cf6" },
    "email-open": { icon: Mail01Icon, color: "#3b82f6" },
    "email-click": { icon: Target02Icon, color: "#f59e0b" },
    meeting: { icon: Calendar03Icon, color: "#22c55e" },
    "web-visit": { icon: Globe02Icon, color: "#6b7280" },
  };
  const c = config[type] || config["email-open"];
  return <HugeiconsIcon icon={c.icon} size={11} color={c.color} />;
}

// ── Aggregate KPIs ───────────────────────────────────────────────────────

function useKPIs(accounts: AccountInsight[]) {
  return useMemo(() => {
    const totalLeads = LEADS.length;
    const meetingsBooked = LEADS.filter((l) => l.status === "meeting-booked").length;
    const totalConvSessions = accounts.reduce((a, b) => a + b.conversationalSessions, 0);
    const totalEmailsSent = accounts.reduce((a, b) => a + b.emailsSent, 0);
    const avgOpenRate = Math.round(
      accounts.filter((a) => a.emailsSent > 0).reduce((a, b) => a + b.emailOpenRate, 0) /
        accounts.filter((a) => a.emailsSent > 0).length
    );
    const avgClickRate = Math.round(
      accounts.filter((a) => a.emailsSent > 0).reduce((a, b) => a + b.emailClickRate, 0) /
        accounts.filter((a) => a.emailsSent > 0).length
    );
    const hotAccounts = accounts.filter((a) => a.leads.some((l) => l.scoreLevel === "hot")).length;
    const accountsInDecision = accounts.filter((a) => a.nurturingStage === "decision").length;
    return { totalLeads, meetingsBooked, totalConvSessions, totalEmailsSent, avgOpenRate, avgClickRate, hotAccounts, accountsInDecision };
  }, [accounts]);
}

// ── Nurture funnel ───────────────────────────────────────────────────────

function NurtureFunnel({ accounts }: { accounts: AccountInsight[] }) {
  const stages = useMemo(() => {
    const counts = { awareness: 0, consideration: 0, decision: 0, closed: 0 };
    accounts.forEach((a) => counts[a.nurturingStage]++);
    const total = accounts.length || 1;
    return [
      { key: "awareness", label: "Awareness", count: counts.awareness, pct: Math.round((counts.awareness / total) * 100), color: "#94a3b8" },
      { key: "consideration", label: "Consideration", count: counts.consideration, pct: Math.round((counts.consideration / total) * 100), color: "#3b82f6" },
      { key: "decision", label: "Decision", count: counts.decision, pct: Math.round((counts.decision / total) * 100), color: "#22c55e" },
      { key: "closed", label: "Closed", count: counts.closed, pct: Math.round((counts.closed / total) * 100), color: "#8b5cf6" },
    ];
  }, [accounts]);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex-1 flex gap-1 h-2 rounded-full overflow-hidden bg-[#f4f4f2]">
          {stages.map((s) => (
            <div
              key={s.key}
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${s.pct}%`, background: s.color, minWidth: s.count > 0 ? 8 : 0 }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        {stages.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
              {s.label}
            </span>
            <span className="text-[10px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Agent activity feed ──────────────────────────────────────────────────

const AGENT_FEED = [
  { time: "2h ago", agent: "Email", icon: "calendar", text: "Sarah Chen booked a meeting after Email 2", highlight: true },
  { time: "3h ago", agent: "Email", icon: "checkmark", text: "Tom Liu confirmed meeting from booking link", highlight: true },
  { time: "5h ago", agent: "Email", icon: "flash", text: "Pre-send: James Wong CTA upgraded → Booking link", highlight: false },
  { time: "Today", agent: "Conv", icon: "robot", text: "Dave Kim asked about API integrations (4 min session)", highlight: false },
  { time: "Today", agent: "Email", icon: "alert", text: "Anna Kumar: high engagement, no meeting — AE recommended", highlight: false },
  { time: "Yesterday", agent: "Email", icon: "mail", text: "Segment B Email 1 sent to 10 leads (70% open rate)", highlight: false },
  { time: "Yesterday", agent: "Conv", icon: "robot", text: "Mike Ross: general inquiry about platform (2 min)", highlight: false },
];

// ── Main Dashboard ───────────────────────────────────────────────────────

type ViewMode = "accounts" | "leads";
type SortBy = "score" | "lastActivity" | "engagement";

export function DemandDashboardPage() {
  const enrichedAccounts = useMemo(() => enrichAccounts(), []);
  const kpis = useKPIs(enrichedAccounts);

  const [viewMode, setViewMode] = useState<ViewMode>("accounts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<AccountInsight | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortBy] = useState<SortBy>("score");
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [feedExpanded, setFeedExpanded] = useState(false);

  const filteredAccounts = useMemo(() => {
    let list = enrichedAccounts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.leads.some((l) => l.name.toLowerCase().includes(q) || l.role.toLowerCase().includes(q))
      );
    }
    if (stageFilter) list = list.filter((a) => a.nurturingStage === stageFilter);
    if (sortBy === "score") list = [...list].sort((a, b) => b.score - a.score);
    return list;
  }, [enrichedAccounts, searchQuery, sortBy, stageFilter]);

  const filteredLeads = useMemo(() => {
    let list = [...LEADS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.role.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.score - a.score);
  }, [searchQuery]);

  const handleAccountClick = (account: AccountInsight) => {
    setSelectedAccount(account);
    setSelectedLead(null);
  };

  const handleLeadClick = (lead: Lead) => {
    const acc = enrichedAccounts.find((a) => a.name === lead.company) || null;
    setSelectedAccount(acc);
    setSelectedLead(lead);
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main content */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden min-w-0 transition-all duration-300 ${selectedAccount ? "" : ""}`}>
        {/* Header */}
        <div className="h-11 px-5 flex items-center justify-between shrink-0 border-b border-black/[0.04]">
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>
              Demand Dashboard
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
              Last synced 2 min ago
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-6 pb-8 max-w-[920px] mx-auto">
            {/* ── Greeting + Summary ── */}
            <div className="mb-6">
              <p className="text-[15px] text-foreground mb-1" style={{ fontWeight: 500, lineHeight: 1.4 }}>
                Hey Sandeep
              </p>
              <p className="text-[13px] text-[#6b6a67] mb-4" style={{ fontWeight: 400, lineHeight: 1.6 }}>
                {kpis.meetingsBooked} meetings booked this cycle with a {kpis.avgOpenRate}% open rate across {enrichedAccounts.length} accounts.{" "}
                {kpis.accountsInDecision} accounts are in the decision stage — here's what needs your attention.
              </p>

              {/* Action cards */}
              <div className="flex gap-2.5">
                {/* AE Escalation */}
                {enrichedAccounts.some((a) => a.topSignal.toLowerCase().includes("needs ae") || a.topSignal.toLowerCase().includes("no meeting")) && (
                  <button
                    onClick={() => {
                      const acc = enrichedAccounts.find((a) => a.topSignal.toLowerCase().includes("needs ae") || a.topSignal.toLowerCase().includes("no meeting"));
                      if (acc) handleAccountClick(acc);
                    }}
                    className="flex-1 flex items-start gap-3 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors text-left group"
                  >
                    <span className="text-blue-500 text-[13px] mt-0.5 shrink-0">↗</span>
                    <div className="min-w-0">
                      <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>
                        Anna Kumar ready for AE handoff
                      </p>
                      <p className="text-[11px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
                        Clicked every CTA but hasn't booked — needs human touch
                      </p>
                    </div>
                  </button>
                )}

                {/* CTA Mismatch */}
                {enrichedAccounts.some((a) => a.topSignal.toLowerCase().includes("cta mismatch")) && (
                  <button
                    onClick={() => {
                      const acc = enrichedAccounts.find((a) => a.topSignal.toLowerCase().includes("cta mismatch"));
                      if (acc) handleAccountClick(acc);
                    }}
                    className="flex-1 flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors text-left group"
                  >
                    <span className="text-amber-500 text-[13px] mt-0.5 shrink-0">⚠</span>
                    <div className="min-w-0">
                      <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>
                        CTA mismatch on StartupX
                      </p>
                      <p className="text-[11px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
                        Dave Kim opens every email but never clicks — try Technical Demo
                      </p>
                    </div>
                  </button>
                )}

                {/* Re-engage timing */}
                {enrichedAccounts.some((a) => a.topSignal.toLowerCase().includes("6mo almost up")) && (
                  <button
                    onClick={() => {
                      const acc = enrichedAccounts.find((a) => a.topSignal.toLowerCase().includes("6mo almost up"));
                      if (acc) handleAccountClick(acc);
                    }}
                    className="flex-1 flex items-start gap-3 px-4 py-3 rounded-xl border border-green-200 bg-green-50/50 hover:bg-green-50 transition-colors text-left group"
                  >
                    <HugeiconsIcon icon={Calendar03Icon} size={13} color="#22c55e" className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>
                        TechFlow timing window opening
                      </p>
                      <p className="text-[11px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
                        6-month wait almost up — good time to re-engage
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* ── Top KPI Strip ── */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total Accounts", value: enrichedAccounts.length.toString(), sub: `${kpis.hotAccounts} hot`, icon: Target02Icon, iconColor: "#ef4444" },
                { label: "Meetings Booked", value: kpis.meetingsBooked.toString(), sub: `${Math.round((kpis.meetingsBooked / kpis.totalLeads) * 100)}% conv. rate`, icon: Calendar03Icon, iconColor: "#22c55e" },
                { label: "Avg Open Rate", value: `${kpis.avgOpenRate}%`, sub: "vs 45% benchmark", icon: Mail01Icon, iconColor: "#3b82f6" },
                { label: "Agent Sessions", value: (kpis.totalConvSessions + kpis.totalEmailsSent).toString(), sub: `${kpis.totalConvSessions} conv · ${kpis.totalEmailsSent} emails`, icon: AiChat02Icon, iconColor: "#8b5cf6" },
              ].map((stat) => (
                <div key={stat.label} className="border border-[#e9e9e7] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 500 }}>
                      {stat.label}
                    </span>
                    <HugeiconsIcon icon={stat.icon} size={13} color={stat.iconColor} />
                  </div>
                  <p className="text-[22px] text-foreground tabular-nums leading-none" style={{ fontWeight: 600 }}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-[#9b9a97] mt-1.5" style={{ fontWeight: 400 }}>
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Two-column: Funnel + Agent Channel Split ── */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Nurturing Funnel */}
              <div className="border border-[#e9e9e7] rounded-xl p-4">
                <p className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
                  Nurturing Funnel
                </p>
                <NurtureFunnel accounts={enrichedAccounts} />
              </div>

              {/* Agent Channel Performance */}
              <div className="border border-[#e9e9e7] rounded-xl p-4">
                <p className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>
                  Agent Channel Performance
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Conversational Agent", icon: BubbleChatIcon, color: "#8b5cf6", sessions: kpis.totalConvSessions, metric: "sessions", sub: "Avg 4 min duration" },
                    { label: "Email Agent", icon: Mail01Icon, color: "#3b82f6", sessions: kpis.totalEmailsSent, metric: "emails sent", sub: `${kpis.avgOpenRate}% open · ${kpis.avgClickRate}% click` },
                  ].map((ch) => (
                    <div key={ch.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ch.color}10` }}>
                        <HugeiconsIcon icon={ch.icon} size={14} color={ch.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>{ch.label}</p>
                          <p className="text-[12px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
                            {ch.sessions} <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{ch.metric}</span>
                          </p>
                        </div>
                        <p className="text-[10px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>{ch.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Recent Agent Activity Feed ── */}
            <div className="border border-[#e9e9e7] rounded-xl mb-6 overflow-hidden">
              <button
                onClick={() => setFeedExpanded(!feedExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#fafaf9] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={SparklesIcon} size={13} color="#f59e0b" />
                  <span className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>
                    Recent Agent Activity
                  </span>
                  <span className="text-[10px] text-[#9b9a97] bg-[#f4f4f2] px-1.5 py-0.5 rounded-full tabular-nums" style={{ fontWeight: 500 }}>
                    {AGENT_FEED.length}
                  </span>
                </div>
                {feedExpanded ? <ChevronDown size={14} className="text-[#9b9a97]" /> : <ChevronRight size={14} className="text-[#9b9a97]" />}
              </button>
              {feedExpanded && (
                <div className="px-4 pb-3 space-y-0 border-t border-[#e9e9e7]">
                  {AGENT_FEED.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[#e9e9e7]/40 last:border-0">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${item.agent === "Conv" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`} style={{ fontWeight: 600 }}>
                        {item.agent}
                      </span>
                      <p className={`text-[12px] flex-1 ${item.highlight ? "text-foreground" : "text-[#6b6a67]"}`} style={{ fontWeight: item.highlight ? 500 : 400, lineHeight: 1.5 }}>
                        {item.text}
                      </p>
                      <span className="text-[10px] text-[#9b9a97] shrink-0 mt-0.5" style={{ fontWeight: 400 }}>
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Accounts / Leads Table ── */}
            <div>
              {/* Table header with controls */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#f4f4f2] rounded-lg p-0.5 gap-0.5">
                    {(["accounts", "leads"] as ViewMode[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setViewMode(v)}
                        className={`px-3.5 py-1.5 rounded-md text-[11px] capitalize transition-all ${
                          viewMode === v ? "bg-white text-foreground shadow-sm" : "text-[#9b9a97] hover:text-foreground/70"
                        }`}
                        style={{ fontWeight: viewMode === v ? 500 : 400 }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>

                  {/* Stage filter pills (accounts view) */}
                  {viewMode === "accounts" && (
                    <div className="flex items-center gap-1 ml-2">
                      {[
                        { key: null, label: "All" },
                        { key: "decision", label: "Decision" },
                        { key: "consideration", label: "Consideration" },
                        { key: "awareness", label: "Awareness" },
                      ].map((f) => (
                        <button
                          key={f.key ?? "all"}
                          onClick={() => setStageFilter(f.key)}
                          className={`text-[10px] px-2.5 py-1 rounded-full transition-colors ${
                            stageFilter === f.key
                              ? "bg-foreground text-white"
                              : "bg-[#f4f4f2] text-[#9b9a97] hover:text-foreground"
                          }`}
                          style={{ fontWeight: 500 }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9b9a97]" />
                  <input
                    type="text"
                    placeholder={`Search ${viewMode}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 text-[12px] bg-[#f7f7f5] border border-transparent rounded-lg focus:border-[#e9e9e7] focus:bg-white outline-none transition-colors w-48"
                    style={{ fontWeight: 400 }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9b9a97] hover:text-foreground">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Accounts view */}
              {viewMode === "accounts" && (
                <div className="border border-[#e9e9e7] rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#fafaf9] border-b border-[#e9e9e7]">
                        {["Account", "Score", "Stage", "Conv. Agent", "Email Agent", "Last Activity", "Signal"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.map((account) => (
                        <tr
                          key={account.name}
                          onClick={() => handleAccountClick(account)}
                          className={`border-b border-[#e9e9e7]/40 last:border-0 hover:bg-[#f7f7f5] transition-colors cursor-pointer group ${
                            selectedAccount?.name === account.name ? "bg-[#f7f7f5]" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#f4f4f2] flex items-center justify-center text-[10px] text-foreground/50 shrink-0" style={{ fontWeight: 600 }}>
                                {account.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>{account.name}</p>
                                <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                                  {account.leadCount} lead{account.leadCount > 1 ? "s" : ""}
                                  {account.hotLeads > 0 && ` · ${account.hotLeads} hot`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>{account.score}</span>
                              <TrendBadge trend={account.trend} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StageBadge stage={account.nurturingStage} />
                          </td>
                          <td className="px-4 py-3">
                            {account.conversationalSessions > 0 ? (
                              <div>
                                <p className="text-[11px] text-foreground tabular-nums" style={{ fontWeight: 500 }}>
                                  {account.conversationalSessions} session{account.conversationalSessions > 1 ? "s" : ""}
                                </p>
                                <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{account.avgSessionDuration} avg</p>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#c8c8c6]" style={{ fontWeight: 400 }}>—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-[11px] text-foreground tabular-nums" style={{ fontWeight: 500 }}>
                                {account.emailOpenRate}% open
                              </p>
                              <p className="text-[10px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>
                                {account.emailClickRate}% click
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <ActivityIcon type={account.lastActivityType} />
                              <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{account.lastActivity}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <p className="text-[11px] text-[#6b6a67] line-clamp-2" style={{ fontWeight: 400, lineHeight: 1.4 }}>
                              {account.topSignal}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAccounts.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-[13px] text-[#9b9a97]" style={{ fontWeight: 400 }}>No accounts match your filters</p>
                    </div>
                  )}
                </div>
              )}

              {/* Leads view */}
              {viewMode === "leads" && (
                <div className="border border-[#e9e9e7] rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#fafaf9] border-b border-[#e9e9e7]">
                        {["Lead", "Company", "Seg", "Score", "Status", "Last Activity"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => {
                        const statusConfig: Record<string, { text: string; color: string }> = {
                          "meeting-booked": { text: "Meeting booked", color: "#22c55e" },
                          "high-engagement": { text: "High engagement", color: "#3b82f6" },
                          "opened-no-click": { text: "Opens, no clicks", color: "#f59e0b" },
                          "partial-engagement": { text: "Partial engagement", color: "#9b9a97" },
                          "no-engagement": { text: "No engagement", color: "#d4d4d1" },
                          "pre-send-upgrade": { text: "Pre-send upgrade", color: "#22c55e" },
                        };
                        const sc = statusConfig[lead.status] || statusConfig["no-engagement"];

                        return (
                          <tr
                            key={lead.id}
                            onClick={() => handleLeadClick(lead)}
                            className="border-b border-[#e9e9e7]/40 last:border-0 hover:bg-[#f7f7f5] transition-colors cursor-pointer group"
                          >
                            <td className="px-4 py-3">
                              <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>{lead.name}</p>
                              <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{lead.role}</p>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-[#6b6a67]" style={{ fontWeight: 400 }}>
                              {lead.company}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f4f4f2] text-[#6b6a67]" style={{ fontWeight: 500 }}>{lead.segment}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[12px] text-foreground tabular-nums flex items-center gap-1" style={{ fontWeight: 600 }}>
                                {lead.score}
                                {lead.scoreLevel === "hot" && <HugeiconsIcon icon={FireIcon} size={11} color="#ef4444" />}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1.5 text-[11px]" style={{ fontWeight: 400, color: sc.color }}>
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.color }} />
                                {sc.text}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                                {lead.activity[0]?.timestamp || "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Account Detail Side Panel ── */}
      {selectedAccount && (
        <AccountDetailPanel
          account={selectedAccount}
          selectedLead={selectedLead}
          onClose={() => {
            setSelectedAccount(null);
            setSelectedLead(null);
          }}
          onLeadSelect={setSelectedLead}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  HugeiconsIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
  Settings01Icon,
  Delete02Icon,
  Cancel01Icon,
} from "../icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import type { CampaignModeState, Lead } from "../types";
import type { CampaignData } from "../campaignData";
import { OverviewTab } from "./artifacts/OverviewTab";
import { EmailPlanArtifact } from "./artifacts/EmailPlanArtifact";
import { LeadsArtifact } from "./artifacts/LeadsArtifact";
import { AgentMultiSelect } from "../../agents/AgentMultiSelect";
import { toast } from "sonner";

export type RightPanelTab = "overview" | "emails" | "leads";

interface Props {
  campaignState: CampaignModeState;
  campaignName?: string;
  activeTab?: RightPanelTab;
  onTabChange?: (tab: RightPanelTab) => void;
  onLeadClick: (lead: Lead) => void;
  onExpandLeads: () => void;
  onAccountClick: (accountName: string) => void;
  marketingAgentCreated: boolean;
  onExplainInChat?: (prompt: string) => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
  campaignData?: CampaignData;
  connectedAgentId?: string | null;
  onConnectAgent?: (agentId: string | null) => void;
}

export function ArtifactPanel({
  campaignState,
  campaignName = "Re-engage Stalled Pipeline Deals",
  activeTab: controlledTab,
  onTabChange,
  onLeadClick,
  onExpandLeads,
  onAccountClick,
  marketingAgentCreated,
  onExplainInChat,
  isPaused,
  onTogglePause,
  campaignData,
  connectedAgentId,
  onConnectAgent,
}: Props) {
  const [internalTab, setInternalTab] = useState<RightPanelTab>("overview");
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    if (controlledTab) setInternalTab(controlledTab);
  }, [controlledTab]);

  const currentTab = controlledTab ?? internalTab;
  const isLaunched = campaignState === "launched" || campaignState === "running";
  const hasEmails = campaignState === "plan-ready" || isLaunched;
  const hasLeads = campaignState !== "initial";

  const tabs: { key: RightPanelTab; label: string }[] = [
    { key: "overview", label: "Overview" },
  ];
  if (hasEmails) tabs.push({ key: "emails", label: "Emails" });
  if (hasLeads) tabs.push({ key: "leads", label: "Audience" });

  const handleTabChange = (tab: RightPanelTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const tabAvailable = tabs.some((t) => t.key === currentTab);
  const resolvedTab = tabAvailable ? currentTab : "overview";

  return (
    <div
      className="shrink-0 flex flex-col h-full overflow-hidden bg-white rounded-xl shadow-sm border border-black/[0.04]"
      style={{ width: 420 }}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#e0dfdd] flex items-center justify-between shrink-0 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <p className="text-[13px] text-foreground truncate" style={{ fontWeight: 600 }}>
            {campaignName}
          </p>
          {isLaunched && (
            isPaused ? (
              <span className="text-[10px] px-1.5 py-px rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0" style={{ fontWeight: 500 }}>
                Paused
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200 shrink-0" style={{ fontWeight: 500 }}>
                Live
              </span>
            )
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {isLaunched && onTogglePause && (
            <button
              onClick={onTogglePause}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                isPaused
                  ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                  : "bg-[#f7f7f5] text-[#9b9a97] hover:text-foreground hover:bg-[#e9e9e7] border border-[#e9e9e7]"
              }`}
              title={isPaused ? "Resume campaign" : "Pause campaign"}
            >
              <HugeiconsIcon icon={isPaused ? PlayIcon : PauseIcon} size={12} />
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors border border-transparent hover:border-[#e9e9e7]">
                <HugeiconsIcon icon={MoreHorizontalIcon} size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isLaunched && (
                <>
                  <DropdownMenuItem
                    className="text-[12px] gap-2"
                    onClick={() => {
                      if (confirm("Cancel this campaign? Active emails will stop sending.")) toast.info("Campaign cancelled");
                    }}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} /> Cancel Campaign
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
            <DropdownMenuItem className="text-[12px] gap-2" onClick={() => setConfigOpen(true)}>
              <HugeiconsIcon icon={Settings01Icon} size={12} /> Sources & Configuration
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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

      {/* Tabs */}
      <div className="px-5 flex items-center gap-1 border-b border-[#e9e9e7] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-3 py-3 text-[12px] relative transition-colors ${
              resolvedTab === tab.key
                ? "text-foreground"
                : "text-[#9b9a97] hover:text-foreground/70"
            }`}
            style={{ fontWeight: resolvedTab === tab.key ? 500 : 400 }}
          >
            {tab.label}
            {resolvedTab === tab.key && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {resolvedTab === "overview" && <OverviewTab campaignState={campaignState} onExplainInChat={onExplainInChat} campaignData={campaignData} />}
        {resolvedTab === "emails" && hasEmails && (
          <EmailPlanArtifact campaignState={campaignState} marketingAgentCreated={marketingAgentCreated} onLeadClick={onLeadClick} campaignData={campaignData} connectedAgentId={connectedAgentId} />
        )}
        {resolvedTab === "leads" && hasLeads && (
          <LeadsArtifact onLeadClick={onLeadClick} onExpandLeads={onExpandLeads} onAccountClick={onAccountClick} campaignData={campaignData} />
        )}
      </div>

      {/* Sources & Configuration Modal */}
      {configOpen && (
        <SourcesConfigModal
          campaignName={campaignName}
          isPaused={!!isPaused}
          isLaunched={isLaunched}
          connectedAgentIds={connectedAgentId ? [connectedAgentId] : []}
          onConnectAgents={(ids) => onConnectAgent?.(ids[0] ?? null)}
          onClose={() => setConfigOpen(false)}
        />
      )}
    </div>
  );
}

// ── HubSpot Logo ──
function HubSpotLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 512 512" fill="none">
      <path d="M390.7 185.7V128c13.7-7.1 23-21.3 23-37.7 0-23.5-19-42.5-42.5-42.5s-42.5 19-42.5 42.5c0 16.4 9.3 30.6 23 37.7v57.7c-20.7 5.6-39.5 16-55.1 30.3L145.2 103.8c1.3-4.9 2.1-10.1 2.1-15.5C147.3 56.2 120 29 88 29S28.6 56.2 28.6 88.3s27.3 59.3 59.4 59.3c10.6 0 20.5-3.3 28.8-8.8l148.8 111c-12.5 17.4-19.9 38.7-19.9 61.7 0 25.2 8.8 48.3 23.5 66.5l-38.3 38.3c-3.5-1.1-7.2-1.8-11-1.8-19.4 0-35.2 15.8-35.2 35.2s15.8 35.2 35.2 35.2 35.2-15.8 35.2-35.2c0-3.8-.7-7.5-1.8-11l37.8-37.8c19.1 16.4 44 26.4 71.1 26.4 60.4 0 109.3-48.9 109.3-109.3 0-53.5-38.5-98-89.3-107.4zM371.2 389c-33.6 0-60.8-27.2-60.8-60.8s27.2-60.8 60.8-60.8 60.8 27.2 60.8 60.8-27.2 60.8-60.8 60.8z" fill="#ff7a59"/>
    </svg>
  );
}

// ── Salesforce Logo ──
function SalesforceLogo() {
  return (
    <svg width="24" height="17" viewBox="0 0 120 84" fill="none">
      <path d="M49.9 8.1C54.1 3 60.5 0 67.5 0c9.1 0 17 5.2 20.8 12.8 3.3-1.4 6.9-2.2 10.7-2.2 15.3 0 27.7 12.4 27.7 27.7 0 .3 0 .6 0 .9C116 39.6 120 47 120 55.3c0 13.3-10.8 24.1-24.1 24.1-2 0-3.9-.2-5.8-.7-3.5 5.5-9.7 9.2-16.7 9.2-4 0-7.8-1.2-10.9-3.3-3.5 6.1-10 10.2-17.5 10.2-7.1 0-13.3-3.7-16.9-9.2-1.8.3-3.6.5-5.5.5C10 86.1 0 76.1 0 63.7c0-7.6 3.8-14.3 9.6-18.3-.6-2.2-.9-4.5-.9-6.9 0-13.3 10.8-24.1 24.1-24.1 6.4 0 12.2 2.5 16.5 6.5l.6-12.8z" fill="#00A1E0"/>
    </svg>
  );
}

// ── Sources & Configuration Modal ──
function SourcesConfigModal({
  campaignName,
  isPaused,
  isLaunched,
  connectedAgentIds: initialAgentIds,
  onConnectAgents,
  onClose,
}: {
  campaignName: string;
  isPaused: boolean;
  isLaunched: boolean;
  connectedAgentIds: string[];
  onConnectAgents: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [agentIds, setAgentIds] = useState<string[]>(initialAgentIds);
  const [customPrompt, setCustomPrompt] = useState("Lead mentions they are evaluating a competitor and asks for a comparison");
  const [customTarget, setCustomTarget] = useState("competitive-displacement");

  const handleAgentChange = (ids: string[]) => {
    setAgentIds(ids);
    onConnectAgents(ids);
  };

  const exitCriteria = [
    { trigger: "Meeting booked", action: "Remove from nurture sequence", target: null, enabled: true },
    { trigger: "No engagement after 3 emails", action: "Move to", target: "Re-engage Stalled Pipeline", enabled: true },
    { trigger: "Replied with objection", action: "Move to", target: "Competitive Displacement", enabled: false },
  ];

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/45 flex items-center justify-center p-6"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        className="w-[min(92vw,560px)] max-h-[min(90vh,720px)] rounded-2xl border border-[#e9e9e7] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#e9e9e7] bg-[#fafaf9] shrink-0">
          <p className="text-[14px] text-foreground" style={{ fontWeight: 600 }}>
            Sources & Configuration
          </p>
          <p className="text-[11px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>
            Manage data sources, agents, and exit criteria for this campaign.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Campaign info */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-[#e9e9e7] rounded-lg px-3 py-2 bg-[#fcfcfb]">
              <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Campaign</p>
              <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>{campaignName}</p>
            </div>
            <div className="border border-[#e9e9e7] rounded-lg px-3 py-2 bg-[#fcfcfb]">
              <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Status</p>
              <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>
                {isPaused ? "Paused" : isLaunched ? "Live" : "Draft"}
              </p>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <p className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-2.5" style={{ fontWeight: 500 }}>
              Data Sources
            </p>
            <div className="space-y-2">
              {/* HubSpot */}
              <div className="flex items-center gap-3 px-3.5 py-3 border border-[#e9e9e7] rounded-xl bg-white">
                <HubSpotLogo />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>HubSpot</p>
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>CRM, Pipeline, Contact Data</p>
                </div>
                <span className="text-[9px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200 shrink-0" style={{ fontWeight: 500 }}>
                  Connected
                </span>
              </div>
              {/* Salesforce */}
              <div className="flex items-center gap-3 px-3.5 py-3 border border-[#e9e9e7] rounded-xl bg-white">
                <SalesforceLogo />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>Salesforce</p>
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Opportunities, Accounts, Activities</p>
                </div>
                <button
                  onClick={() => toast.success("Salesforce connected")}
                  className="text-[9px] px-2 py-1 rounded-md border border-[#e9e9e7] text-[#6b6a67] bg-white hover:bg-[#f7f7f5] transition-colors shrink-0"
                  style={{ fontWeight: 500 }}
                >
                  Connect
                </button>
              </div>
              {/* Conversational Agents as data source */}
              <div className="border border-[#e9e9e7] rounded-xl bg-white overflow-hidden">
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <div className="w-5 h-5 rounded bg-[#8b5cf6]/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px]" style={{ fontWeight: 700, color: "#8b5cf6" }}>A</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>Conversational Agents</p>
                    <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Reply routing, lead qualification, agent conversations</p>
                  </div>
                  {agentIds.length > 0 && (
                    <span className="text-[9px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200 shrink-0" style={{ fontWeight: 500 }}>
                      {agentIds.length} active
                    </span>
                  )}
                </div>
                <div className="px-3.5 pb-3">
                  <AgentMultiSelect
                    selectedIds={agentIds}
                    onChange={handleAgentChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exit Criteria */}
          <div>
            <p className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-1" style={{ fontWeight: 500 }}>
              Exit Criteria
            </p>
            <p className="text-[10px] text-[#9b9a97] mb-2.5" style={{ fontWeight: 400 }}>
              When a condition is met, the lead exits this campaign and optionally moves to another.
            </p>
            <div className="space-y-2">
              {exitCriteria.map((c, i) => (
                <div key={i} className="border border-[#e9e9e7] rounded-xl bg-white overflow-hidden">
                  <div className="flex items-center gap-3 px-3.5 py-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.enabled ? "bg-green-500" : "bg-[#d6d6d3]"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>If: {c.trigger}</p>
                      <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                        Then: {c.action}{c.target ? ` → ${c.target}` : ""}
                      </p>
                    </div>
                    <button
                      className={`w-8 h-[18px] rounded-full relative transition-colors shrink-0 ${c.enabled ? "bg-foreground" : "bg-[#d6d6d3]"}`}
                      onClick={() => toast.info(`Toggle ${c.trigger}`)}
                    >
                      <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all ${c.enabled ? "left-[15px]" : "left-[2px]"}`} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Custom exit criteria */}
              <div className="border border-blue-200 rounded-xl bg-blue-50/30 overflow-hidden">
                <div className="flex items-center gap-3 px-3.5 py-2.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500" />
                  <p className="text-[11px] text-foreground flex-1" style={{ fontWeight: 500 }}>Custom condition</p>
                  <button
                    className="w-8 h-[18px] rounded-full relative transition-colors shrink-0 bg-foreground"
                    onClick={() => toast.info("Toggle custom criteria")}
                  >
                    <span className="absolute top-[2px] left-[15px] w-[14px] h-[14px] rounded-full bg-white" />
                  </button>
                </div>
                <div className="px-3.5 pb-3 space-y-2">
                  <div>
                    <p className="text-[10px] text-[#9b9a97] mb-1" style={{ fontWeight: 500 }}>If this condition is matched:</p>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={2}
                      className="w-full text-[11px] text-foreground bg-white border border-[#e9e9e7] rounded-lg px-2.5 py-2 outline-none focus:border-foreground/20 resize-none"
                      style={{ fontWeight: 400, lineHeight: 1.5 }}
                      placeholder="Describe the condition..."
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#9b9a97] mb-1" style={{ fontWeight: 500 }}>Then move lead to:</p>
                    <select
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value)}
                      className="w-full text-[11px] text-foreground bg-white border border-[#e9e9e7] rounded-lg px-2.5 py-1.5 outline-none"
                      style={{ fontWeight: 500 }}
                    >
                      <option value="reengage-pipeline">Re-engage Stalled Pipeline Deals</option>
                      <option value="webinar-followup">Webinar Follow-Up: Security Summit</option>
                      <option value="trial-nurture">Product-Led Trial Nurture</option>
                      <option value="enterprise-upsell">Enterprise Expansion Upsell</option>
                      <option value="competitive-displacement">Competitive Displacement (Acme)</option>
                      <option value="remove">Remove from all campaigns</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#e9e9e7] bg-white flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="text-[11px] px-3.5 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
            style={{ fontWeight: 500 }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

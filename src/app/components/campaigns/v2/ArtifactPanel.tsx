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
import { OverviewTab } from "./artifacts/OverviewTab";
import { EmailPlanArtifact } from "./artifacts/EmailPlanArtifact";
import { LeadsArtifact } from "./artifacts/LeadsArtifact";
import { ActivityArtifact } from "./artifacts/ActivityArtifact";
import { toast } from "sonner";

export type RightPanelTab = "overview" | "emails" | "leads" | "activity";

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
}: Props) {
  const [internalTab, setInternalTab] = useState<RightPanelTab>("overview");

  // Sync with controlled tab from parent
  useEffect(() => {
    if (controlledTab) setInternalTab(controlledTab);
  }, [controlledTab]);

  const currentTab = controlledTab ?? internalTab;
  const isLaunched = campaignState === "launched" || campaignState === "running";
  const hasEmails = campaignState === "plan-ready" || isLaunched;
  const hasLeads = campaignState !== "initial";
  const hasActivity = isLaunched;

  const tabs: { key: RightPanelTab; label: string }[] = [
    { key: "overview", label: "Overview" },
  ];
  if (hasEmails) tabs.push({ key: "emails", label: "Emails" });
  if (hasLeads) tabs.push({ key: "leads", label: "Leads" });
  if (hasActivity) tabs.push({ key: "activity", label: "Activity" });

  // Auto-switch to emails tab when plan becomes ready
  useEffect(() => {
    if (campaignState === "plan-ready" && currentTab === "overview") {
      handleTabChange("emails");
    }
  }, [campaignState]);

  const handleTabChange = (tab: RightPanelTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  // Fall back to overview if active tab is no longer available
  const tabAvailable = tabs.some((t) => t.key === currentTab);
  const resolvedTab = tabAvailable ? currentTab : "overview";

  return (
    <div
      className="shrink-0 flex flex-col h-full overflow-hidden bg-white rounded-xl shadow-sm border border-black/[0.04]"
      style={{ width: 420 }}
    >
      {/* Header with campaign name + pause/play + actions */}
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
          {/* Pause/Play toggle — always visible when launched */}
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

          {/* Actions dropdown */}
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
            <DropdownMenuItem className="text-[12px] gap-2" onClick={() => toast.info("Campaign settings coming soon")}>
              <HugeiconsIcon icon={Settings01Icon} size={12} /> Configuration
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
        {resolvedTab === "overview" && <OverviewTab campaignState={campaignState} onExplainInChat={onExplainInChat} />}
        {resolvedTab === "emails" && hasEmails && (
          <EmailPlanArtifact campaignState={campaignState} marketingAgentCreated={marketingAgentCreated} />
        )}
        {resolvedTab === "leads" && hasLeads && (
          <LeadsArtifact onLeadClick={onLeadClick} onExpandLeads={onExpandLeads} onAccountClick={onAccountClick} />
        )}
        {resolvedTab === "activity" && hasActivity && <ActivityArtifact />}
      </div>
    </div>
  );
}

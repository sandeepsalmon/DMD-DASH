import { useState, useEffect, useCallback } from "react";
import type { CampaignModeState, Lead } from "../types";
import { LEADS } from "../types";
import { useCampaignState } from "./hooks/useCampaignState";
import { CampaignListPanelV2 } from "./CampaignListPanelV2";
import { CampaignChatPanelV2 } from "./CampaignChatPanelV2";
import { ArtifactPanel, type RightPanelTab } from "./ArtifactPanel";
import { LeadDrawer } from "../LeadDrawer";
import { LeadsExpandModal } from "../LeadsExpandModal";
import { useLayoutPanels } from "../../LayoutPanelContext";
import { toast } from "sonner";

interface Props {
  initialState: CampaignModeState;
  onGoHome: () => void;
  onCampaignLaunched: () => void;
}

export function CampaignModeV2({ initialState, onGoHome, onCampaignLaunched }: Props) {
  const { state, marketingAgentAccepted, handleStart, handleMarketingAgentDecided, handleApproveAndLaunch } =
    useCampaignState(initialState);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadsExpandOpen, setLeadsExpandOpen] = useState(false);
  const [chatPreFill, setChatPreFill] = useState("");
  const [activeTab, setActiveTab] = useState<RightPanelTab>("overview");
  const [isPaused, setIsPaused] = useState(false);
  // Queue for prompts sent from the right panel to the chat
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null);
  const { setLeftPanel, setRightPanel } = useLayoutPanels();

  const isLaunched = state === "launched" || state === "running";
  const isNewCampaign = initialState === "initial" && !isLaunched;

  const handleTogglePause = useCallback(() => {
    setIsPaused((p) => {
      const next = !p;
      toast.success(next ? "Campaign paused" : "Campaign resumed");
      return next;
    });
  }, []);

  const handleExplainInChat = useCallback((prompt: string) => {
    setPendingChatPrompt(prompt);
  }, []);

  // Inject left panel
  useEffect(() => {
    setLeftPanel(
      <CampaignListPanelV2
        campaignState={state}
        onGoHome={onGoHome}
        onNewCampaign={() => {}}
        isNewCampaign={isNewCampaign}
      />
    );
  }, [state, onGoHome, setLeftPanel, isNewCampaign]);

  // Inject right panel — hide during onboarding (initial state), show once agents start
  useEffect(() => {
    if (state === "initial") {
      setRightPanel(null);
    } else {
      setRightPanel(
        <ArtifactPanel
          campaignState={state}
          campaignName={isNewCampaign ? "New Campaign" : "Re-engage Stalled Pipeline Deals"}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLeadClick={(lead) => setSelectedLead(lead)}
          onExpandLeads={() => setLeadsExpandOpen(true)}
          onAccountClick={handleAccountClick}
          marketingAgentCreated={marketingAgentAccepted}
          onExplainInChat={handleExplainInChat}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
        />
      );
    }
  }, [state, activeTab, setRightPanel, marketingAgentAccepted, isPaused, handleTogglePause, handleExplainInChat]);

  // Clean up panels on unmount
  useEffect(() => {
    return () => {
      setLeftPanel(null);
      setRightPanel(null);
    };
  }, [setLeftPanel, setRightPanel]);

  const handleAccountClick = (accountName: string) => {
    const lead = LEADS.find((l) => l.company === accountName);
    if (lead) setSelectedLead(lead);
  };

  const handlePromptClick = (prompt: string) => {
    if (prompt === "Approve & Launch") {
      handleApproveAndLaunch(() => {
        onCampaignLaunched();
      });
    }
  };

  const handleSwitchTab = (tab: RightPanelTab) => {
    setActiveTab(tab);
  };

  const handleTweakInChat = (leadName: string, company: string) => {
    setSelectedLead(null);
    setChatPreFill(`For ${leadName} (${company}): `);
  };

  // Clear pendingChatPrompt after it's consumed by the chat panel
  const handleChatPromptConsumed = useCallback(() => {
    setPendingChatPrompt(null);
  }, []);

  useEffect(() => {
    if (chatPreFill) {
      const timer = setTimeout(() => setChatPreFill(""), 300);
      return () => clearTimeout(timer);
    }
  }, [chatPreFill]);

  return (
    <div className="flex-1 flex h-full overflow-hidden relative">
      <CampaignChatPanelV2
        campaignState={state}
        chatPreFill={chatPreFill}
        onStart={handleStart}
        onPromptClick={handlePromptClick}
        onViewCampaign={() => {}}
        onMarketingAgentDecided={handleMarketingAgentDecided}
        onSwitchTab={handleSwitchTab}
        isPaused={isPaused}
        pendingPrompt={pendingChatPrompt}
        onPromptConsumed={handleChatPromptConsumed}
      />

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onTweakInChat={handleTweakInChat}
        />
      )}

      {leadsExpandOpen && (
        <LeadsExpandModal
          onClose={() => setLeadsExpandOpen(false)}
          onTweakInChat={(name, company) => {
            setLeadsExpandOpen(false);
            setChatPreFill(`For ${name} (${company}): `);
          }}
        />
      )}
    </div>
  );
}

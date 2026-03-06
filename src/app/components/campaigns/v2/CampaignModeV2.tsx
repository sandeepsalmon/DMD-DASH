import { useState, useEffect, useCallback } from "react";
import type { CampaignModeState, Lead, SuggestedCampaignContext } from "../types";
import { useCampaignState } from "./hooks/useCampaignState";
import { CampaignListPanelV2 } from "./CampaignListPanelV2";
import { CampaignChatPanelV2 } from "./CampaignChatPanelV2";
import { ArtifactPanel, type RightPanelTab } from "./ArtifactPanel";
import { LeadDrawer } from "../LeadDrawer";
import { LeadsExpandModal } from "../LeadsExpandModal";
import { useLayoutPanels } from "../../LayoutPanelContext";
import { toast } from "sonner";
import { getCampaignData } from "../campaignData";
import { getAgentById } from "../../agents/agentData";

interface Props {
  initialState: CampaignModeState;
  onGoHome: () => void;
  onCampaignLaunched: () => void;
  onboardingMode?: "new" | "suggested";
  suggestedCampaign?: SuggestedCampaignContext | null;
  campaignSlug?: string;
}

export function CampaignModeV2({
  initialState,
  onGoHome,
  onCampaignLaunched,
  onboardingMode = "new",
  suggestedCampaign = null,
  campaignSlug = "reengage-pipeline",
}: Props) {
  const { state, selectedAgentId, handleStart, handleAgentSelected, handleApproveAndLaunch } =
    useCampaignState(initialState);

  const campaignData = getCampaignData(campaignSlug);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadsExpandOpen, setLeadsExpandOpen] = useState(false);
  const [chatPreFill, setChatPreFill] = useState("");
  const [activeTab, setActiveTab] = useState<RightPanelTab>("overview");
  const [isPaused, setIsPaused] = useState(false);
  const [launchConfirmOpen, setLaunchConfirmOpen] = useState(false);
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null);
  const { setLeftPanel, setRightPanel } = useLayoutPanels();

  const isLaunched = state === "launched" || state === "running";
  const isNewCampaign = onboardingMode === "new" && initialState === "initial" && !isLaunched;
  const campaignName = isNewCampaign
    ? "New Campaign"
    : suggestedCampaign?.title ?? campaignData.name;

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

  const handleConnectAgent = useCallback((agentId: string | null) => {
    handleAgentSelected(agentId);
    const agentName = agentId ? getAgentById(agentId)?.name : null;
    toast.success(agentName ? `${agentName} connected to campaign` : "Agent disconnected from campaign");
  }, [handleAgentSelected]);

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
          campaignName={campaignName}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLeadClick={(lead) => setSelectedLead(lead)}
          onExpandLeads={() => setLeadsExpandOpen(true)}
          onAccountClick={handleAccountClick}
          marketingAgentCreated={!!selectedAgentId}
          onExplainInChat={handleExplainInChat}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          campaignData={campaignData}
          connectedAgentId={selectedAgentId}
          onConnectAgent={handleConnectAgent}
        />
      );
    }
  }, [state, activeTab, setRightPanel, selectedAgentId, isPaused, handleTogglePause, handleExplainInChat, campaignName]);

  // Clean up panels on unmount
  useEffect(() => {
    return () => {
      setLeftPanel(null);
      setRightPanel(null);
    };
  }, [setLeftPanel, setRightPanel]);

  const handleAccountClick = (accountName: string) => {
    const lead = campaignData.leads.find((l) => l.company === accountName);
    if (lead) setSelectedLead(lead);
  };

  const handlePromptClick = (prompt: string) => {
    if (prompt === "Approve & Launch") {
      setLaunchConfirmOpen(true);
    }
  };

  const handleConfirmLaunch = () => {
    setLaunchConfirmOpen(false);
    handleApproveAndLaunch(() => {
      onCampaignLaunched();
    });
  };

  const handleSwitchTab = (tab: RightPanelTab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (state === "launched" || state === "running") {
      setActiveTab("overview");
    }
  }, [state]);

  useEffect(() => {
    if (state !== "plan-ready") {
      setLaunchConfirmOpen(false);
    }
  }, [state]);

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
        onAgentSelected={handleAgentSelected}
        onSwitchTab={handleSwitchTab}
        isPaused={isPaused}
        pendingPrompt={pendingChatPrompt}
        onPromptConsumed={handleChatPromptConsumed}
        onboardingMode={onboardingMode}
        suggestedCampaign={suggestedCampaign}
        campaignData={campaignData}
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

      {launchConfirmOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/45 flex items-center justify-center p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setLaunchConfirmOpen(false);
          }}
        >
          <div
            className="w-[min(92vw,560px)] rounded-2xl border border-[#e9e9e7] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#e9e9e7] bg-[#fafaf9]">
              <p className="text-[14px] text-foreground" style={{ fontWeight: 600 }}>
                Confirm Campaign Launch
              </p>
              <p className="text-[11px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>
                Here are the campaign settings. Everything correct?
              </p>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-[#e9e9e7] rounded-lg px-3 py-2 bg-[#fcfcfb]">
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Campaign</p>
                  <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>{campaignName}</p>
                </div>
                <div className="border border-[#e9e9e7] rounded-lg px-3 py-2 bg-[#fcfcfb]">
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Audience</p>
                  <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>{campaignData.launchConfig.audience}</p>
                </div>
                <div className="border border-[#e9e9e7] rounded-lg px-3 py-2 bg-[#fcfcfb]">
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Sequence</p>
                  <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>{campaignData.launchConfig.sequence}</p>
                </div>
                <div className="border border-[#e9e9e7] rounded-lg px-3 py-2 bg-[#fcfcfb]">
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Conversational Agent</p>
                  <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>
                    {selectedAgentId ? getAgentById(selectedAgentId)?.name ?? "Unknown" : "None"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-[#e9e9e7] bg-white px-3 py-2.5">
                <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Send timing</p>
                <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 400 }}>
                  Emails are sent in each prospect&apos;s local-time window based on campaign configuration.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#e9e9e7] bg-white flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setLaunchConfirmOpen(false);
                  setActiveTab("emails");
                }}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-[#e9e9e7] bg-white hover:bg-[#f7f7f5] transition-colors"
                style={{ fontWeight: 500 }}
              >
                Review Emails
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLaunchConfirmOpen(false)}
                  className="text-[11px] px-3 py-1.5 rounded-lg border border-[#e9e9e7] bg-white hover:bg-[#f7f7f5] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLaunch}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
                  style={{ fontWeight: 500 }}
                >
                  Approve & Launch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import type { CampaignModeState, Lead } from "./types";
import { LEADS } from "./types";
import { CampaignListPanel } from "./CampaignListPanel";
import { CampaignChatPanel } from "./CampaignChatPanel";
import { CampaignRightPanel } from "./CampaignRightPanel";
import { LeadDrawer } from "./LeadDrawer";
import { LeadsExpandModal } from "./LeadsExpandModal";
import { useLayoutPanels } from "../LayoutPanelContext";

interface Props {
  initialState: CampaignModeState;
  onGoHome: () => void;
  onCampaignLaunched: () => void;
}

export function CampaignMode({ initialState, onGoHome, onCampaignLaunched }: Props) {
  const [modeState, setModeState] = useState<CampaignModeState>(initialState);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadsExpandOpen, setLeadsExpandOpen] = useState(false);
  const [chatPreFill, setChatPreFill] = useState("");
  const [marketingAgentAccepted, setMarketingAgentAccepted] = useState(false);
  const { setLeftPanel, setRightPanel } = useLayoutPanels();

  const showRightPanel =
    modeState === "agents-running" ||
    modeState === "agent-suggestion" ||
    modeState === "plan-ready" ||
    modeState === "launched" ||
    modeState === "running";

  // Push left panel into Layout slot
  useEffect(() => {
    setLeftPanel(
      <CampaignListPanel
        modeState={modeState}
        onGoHome={onGoHome}
        onNewCampaign={() => {}}
      />
    );
  }, [modeState, onGoHome, setLeftPanel]);

  // Push right panel into Layout slot
  useEffect(() => {
    if (showRightPanel) {
      setRightPanel(
        <CampaignRightPanel
          modeState={modeState}
          onLeadClick={(lead) => setSelectedLead(lead)}
          onExpandLeads={() => setLeadsExpandOpen(true)}
          onAccountClick={handleAccountClick}
          marketingAgentCreated={marketingAgentAccepted}
        />
      );
    } else {
      setRightPanel(null);
    }
  }, [modeState, showRightPanel, setRightPanel]);

  // Clean up panels on unmount
  useEffect(() => {
    return () => {
      setLeftPanel(null);
      setRightPanel(null);
    };
  }, [setLeftPanel, setRightPanel]);

  // Account click — find first lead for this account and open drawer
  const handleAccountClick = (accountName: string) => {
    const lead = LEADS.find((l) => l.company === accountName);
    if (lead) setSelectedLead(lead);
  };

  // Screen 2 → 3: click Start
  // Total animation time: 3×900ms (chain) + 600ms buffer + 4×1200ms (leader) + 500ms buffer = 8800ms
  const handleStart = () => {
    setModeState("agents-running");
    setTimeout(() => setModeState("agent-suggestion"), 8800);
  };

  // Marketing agent suggestion decision
  const handleMarketingAgentDecided = (accepted: boolean) => {
    setMarketingAgentAccepted(accepted);
    if (accepted) {
      setTimeout(() => setModeState("plan-ready"), 2500);
    } else {
      setTimeout(() => setModeState("plan-ready"), 500);
    }
  };

  // Screen 4 / plan-ready: prompt click handler
  const handlePromptClick = (prompt: string) => {
    if (prompt === "Approve & Launch") {
      setModeState("launched");
      setTimeout(() => {
        onCampaignLaunched();
      }, 5000);
    }
  };

  const handleViewCampaign = () => {
    onCampaignLaunched();
  };

  const handleTweakInChat = (leadName: string, company: string) => {
    setSelectedLead(null);
    setChatPreFill(`For ${leadName} (${company}): `);
  };

  useEffect(() => {
    if (chatPreFill) {
      const timer = setTimeout(() => setChatPreFill(""), 300);
      return () => clearTimeout(timer);
    }
  }, [chatPreFill]);

  return (
    <div className="flex-1 flex h-full overflow-hidden relative">
      {/* Center chat panel — only this stays inside the white surface */}
      <CampaignChatPanel
        modeState={modeState}
        chatPreFill={chatPreFill}
        onStart={handleStart}
        onPromptClick={handlePromptClick}
        onViewCampaign={handleViewCampaign}
        onMarketingAgentDecided={handleMarketingAgentDecided}
      />

      {/* Lead drawer — fixed overlay */}
      {selectedLead && showRightPanel && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onTweakInChat={handleTweakInChat}
        />
      )}

      {/* Leads expand modal — fixed overlay */}
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

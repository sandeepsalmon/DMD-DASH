import { useState } from "react";
import type { AppView, HomepageState, CampaignModeState } from "./campaigns/types";
import { CampaignHomepage } from "./campaigns/CampaignHomepage";
import { CampaignMode } from "./campaigns/CampaignMode";

export function CampaignsPage() {
  const [view, setView] = useState<AppView>("homepage");
  const [homepageState, setHomepageState] = useState<HomepageState>("empty");
  const [campaignModeInitialState, setCampaignModeInitialState] = useState<CampaignModeState>("initial");
  const [chatInput, setChatInput] = useState("");

  const handleSuggestedCampaignClick = (title: string) => {
    if (title === "Re-engage Stalled Pipeline Deals") {
      setCampaignModeInitialState("initial");
      setView("campaign-mode");
    }
    // Other campaigns: no-op for now (demo)
  };

  const handleActiveCampaignClick = () => {
    setCampaignModeInitialState("running");
    setView("campaign-mode");
  };

  const handleGoHome = () => {
    setView("homepage");
  };

  const handleCampaignLaunched = () => {
    setHomepageState("dense");
    setView("homepage");
  };

  if (view === "campaign-mode") {
    return (
      <CampaignMode
        initialState={campaignModeInitialState}
        onGoHome={handleGoHome}
        onCampaignLaunched={handleCampaignLaunched}
      />
    );
  }

  return (
    <CampaignHomepage
      state={homepageState}
      chatInput={chatInput}
      onChatInput={setChatInput}
      onChatSubmit={() => {}}
      onSuggestedCampaignClick={handleSuggestedCampaignClick}
      onActiveCampaignClick={handleActiveCampaignClick}
    />
  );
}

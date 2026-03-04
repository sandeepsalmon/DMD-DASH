import { useState, useRef } from "react";
import { Plus, Search } from "lucide-react";
import {
  HugeiconsIcon,
  SparklesIcon,
  ArrowUp01Icon,
  Attachment01Icon,
  FlashIcon,
} from "./campaigns/icons";
import { IconFromKey } from "./campaigns/icons";
import type { AppView, HomepageState, CampaignModeState } from "./campaigns/types";
// import { CampaignMode } from "./campaigns/CampaignMode";
import { CampaignModeV2 } from "./campaigns/v2/CampaignModeV2";

const suggestedCampaigns = [
  {
    title: "Re-engage Stalled Pipeline Deals",
    description:
      "34 deals have stalled for 30+ days. 18 visited your pricing page recently.",
    stats: "34 leads · $180K pipeline at risk",
    source: "Based on HubSpot pipeline data",
  },
  {
    title: "Follow Up with Webinar Attendees",
    description:
      "47 attended your Security Webinar. 12 had agent conversations after.",
    stats: "47 leads · Last Thursday",
    source: "Based on HubSpot event data",
  },
];

export function EmailAgentPage() {
  const [campaignView, setCampaignView] = useState<AppView>("homepage");
  const [homepageState, setHomepageState] = useState<HomepageState>("empty");
  const [campaignModeInitialState, setCampaignModeInitialState] =
    useState<CampaignModeState>("initial");
  const [chatInput, setChatInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSuggestedCampaignClick = (title: string) => {
    setCampaignModeInitialState("initial");
    setCampaignView("campaign-mode");
  };

  const handleActiveCampaignClick = () => {
    setCampaignModeInitialState("running");
    setCampaignView("campaign-mode");
  };

  const handleGoHome = () => {
    setCampaignView("homepage");
  };

  const handleCampaignLaunched = () => {
    // Just mark the homepage as "dense" — stay in campaign view (don't navigate back)
    setHomepageState("dense");
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  };

  if (campaignView === "campaign-mode") {
    return (
      <CampaignModeV2
        initialState={campaignModeInitialState}
        onGoHome={handleGoHome}
        onCampaignLaunched={handleCampaignLaunched}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-11 px-5 flex items-center justify-between shrink-0 border-b border-black/[0.04]">
        <span
          className="text-[13px] text-foreground"
          style={{ fontWeight: 500 }}
        >
          Email Agent
        </span>
        <button className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-foreground text-white text-[12px] hover:bg-foreground/90 transition-colors" style={{ fontWeight: 500 }}>
          <Plus size={13} strokeWidth={2} />
          Create Campaign
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-8 pb-8 max-w-[860px] mx-auto">
          {/* Title */}
          <p
            className="text-[20px] text-foreground mb-1"
            style={{ fontWeight: 600, lineHeight: 1.3 }}
          >
            {homepageState === "dense"
              ? "Your pipeline re-engagement campaign is live."
              : "Good morning, Sandeep."}
          </p>
          <p
            className="text-[13px] text-[#9b9a97] mb-5"
            style={{ fontWeight: 400, lineHeight: 1.5 }}
          >
            {homepageState === "dense"
              ? "Campaigns are running. Here's what's happening."
              : "I've analyzed your CRM — here are a few campaigns worth running."}
          </p>

          {/* Qualification Funnel */}
          <div className="border border-[#e9e9e7] rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <HugeiconsIcon
                icon={FlashIcon}
                size={13}
                className="text-foreground/40"
              />
              <p
                className="text-[12px] text-foreground"
                style={{ fontWeight: 500 }}
              >
                Qualification Funnel
              </p>
            </div>
            <div className="flex items-end gap-2">
              {[
                { label: "Leads", count: "847", height: 48 },
                { label: "MQLs", count: "312", height: 36 },
                { label: "SQLs", count: "89", height: 24 },
                { label: "Meetings", count: "34", height: 16 },
                { label: "Attended", count: "28", height: 13 },
                { label: "Won", count: "8", height: 8 },
              ].map((step) => (
                <div
                  key={step.label}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <p
                    className="text-[11px] text-foreground tabular-nums"
                    style={{ fontWeight: 500 }}
                  >
                    {step.count}
                  </p>
                  <div
                    className="w-full rounded bg-[#efefed]"
                    style={{ height: step.height }}
                  />
                  <p
                    className="text-[10px] text-[#9b9a97]"
                    style={{ fontWeight: 400 }}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Pipeline Generated", value: "$0" },
              { label: "Emails Sent", value: "0" },
              { label: "Open Rate", value: "0%" },
              { label: "Meetings Booked", value: "0" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border border-[#e9e9e7] rounded-xl p-3.5 bg-white"
              >
                <p className="text-[10px] text-[#9b9a97] mb-1.5" style={{ fontWeight: 500 }}>
                  {stat.label}
                </p>
                <p className="text-[18px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="border border-[#e9e9e7] rounded-lg flex items-end gap-1 px-3 py-2 focus-within:border-foreground/20 transition-colors bg-white mb-6">
            <button className="w-6 h-6 flex items-center justify-center shrink-0 text-[#9b9a97] hover:text-foreground/60 transition-colors">
              <HugeiconsIcon icon={Attachment01Icon} size={14} />
            </button>
            <textarea
              ref={textareaRef}
              value={chatInput}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask Docket anything or describe a campaign you want to run..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-[13px] text-foreground placeholder:text-[#9b9a97] outline-none py-0.5"
              style={{ fontWeight: 400, lineHeight: "20px", maxHeight: 120 }}
            />
            <button
              disabled={!chatInput.trim()}
              className="w-6 h-6 rounded bg-foreground text-white flex items-center justify-center shrink-0 disabled:opacity-20 transition-opacity"
            >
              <HugeiconsIcon icon={ArrowUp01Icon} size={13} />
            </button>
          </div>

          {/* Active Campaigns (dense state only) */}
          {homepageState === "dense" && (
            <div className="mb-6">
              <p
                className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3"
                style={{ fontWeight: 500 }}
              >
                Active Campaigns
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleActiveCampaignClick}
                  className="w-full text-left rounded-xl border border-[#e9e9e7] p-4 transition-colors hover:shadow-sm hover:border-[#c8c8c6] group bg-white"
                >
                  {/* Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-[6px] h-[6px] rounded-full bg-[#22B07D]" />
                      <span className="text-[10px] text-[#22B07D]" style={{ fontWeight: 500 }}>
                        Live
                      </span>
                    </div>
                    <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                      Started just now
                    </span>
                  </div>

                  {/* Name */}
                  <p className="text-[14px] text-foreground mb-0.5" style={{ fontWeight: 600 }}>
                    Re-engage Stalled Pipeline Deals
                  </p>
                  <p className="text-[11px] text-[#9b9a97] mb-3" style={{ fontWeight: 400, lineHeight: 1.4 }}>
                    34 leads across 3 segments
                  </p>

                  {/* Stats */}
                  <div className="border-t border-[#e9e9e7] pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 500 }}>
                          Emails Sent
                        </p>
                        <p className="text-[16px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
                          18
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 500 }}>
                          Open Rate
                        </p>
                        <p className="text-[16px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
                          24.3%
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 500 }}>
                          Pipeline
                        </p>
                        <p className="text-[16px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
                          $0
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 500 }}>
                          Meetings
                        </p>
                        <p className="text-[16px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
                          0
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Suggested Campaigns — filter out already-active ones */}
          {(() => {
            const available = homepageState === "dense"
              ? suggestedCampaigns.filter((c) => c.title !== "Re-engage Stalled Pipeline Deals")
              : suggestedCampaigns;

            return available.length > 0 ? (
              <>
                <p
                  className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3"
                  style={{ fontWeight: 500 }}
                >
                  Suggested Campaigns
                </p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {available.map((campaign) => (
                    <button
                      key={campaign.title}
                      onClick={() => handleSuggestedCampaignClick(campaign.title)}
                      className="campaign-card-glow group text-left p-[1.5px] transition-transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <div className="glow-spinner" />
                      <div className="relative bg-white rounded-[10.5px] p-4 h-full flex flex-col z-10">
                        <div className="flex items-center gap-1.5 mb-2">
                          <HugeiconsIcon
                            icon={SparklesIcon}
                            size={12}
                            className="text-foreground/40 shrink-0"
                          />
                          <span
                            className="text-[13px] text-foreground leading-tight"
                            style={{ fontWeight: 500 }}
                          >
                            {campaign.title}
                          </span>
                        </div>
                        <p
                          className="text-[12px] text-[#9b9a97] mb-3"
                          style={{ fontWeight: 400, lineHeight: 1.5 }}
                        >
                          {campaign.description}
                        </p>
                        <div className="mt-auto">
                          <p
                            className="text-[11px] text-foreground/80 mb-1"
                            style={{ fontWeight: 500 }}
                          >
                            {campaign.stats}
                          </p>
                          <p
                            className="text-[10px] text-[#9b9a97]"
                            style={{ fontWeight: 400 }}
                          >
                            {campaign.source}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Create New Campaign Card */}
                  <button
                    onClick={() => handleSuggestedCampaignClick("")}
                    className="group text-left rounded-xl border-[1.5px] border-dashed border-[#e9e9e7] p-4 flex flex-col hover:border-[#c8c8c6] hover:bg-[#fafaf9] transition-colors"
                  >
                    <span
                      className="text-[13px] text-foreground mb-2"
                      style={{ fontWeight: 500 }}
                    >
                      + Create New Campaign
                    </span>
                    <p
                      className="text-[12px] text-[#9b9a97]"
                      style={{ fontWeight: 400, lineHeight: 1.5 }}
                    >
                      Describe what you want to do, and we'll build it together.
                    </p>
                  </button>
                </div>
              </>
            ) : null;
          })()}

          {/* AI Insights */}
          {homepageState === "dense" && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <HugeiconsIcon icon={SparklesIcon} size={12} className="text-foreground/40" />
                <p
                  className="text-[11px] text-[#9b9a97] uppercase tracking-wider"
                  style={{ fontWeight: 500 }}
                >
                  AI Insights
                </p>
              </div>
              <div className="space-y-2">
                {[
                  {
                    icon: "sparkle",
                    text: "Re-engage Pipeline campaign is performing 2.9x above benchmark (8.8% vs 3% conversion rate)",
                  },
                  {
                    icon: "sparkle",
                    text: "4 Segment B leads are opening emails but not clicking — suggest switching to Reply Prompt CTA",
                  },
                  {
                    icon: "sparkle",
                    text: "Anna Kumar (ICP 71) has high engagement but no meeting — recommend AE escalation",
                  },
                  {
                    icon: "sparkle",
                    text: "Webinar follow-up campaign could capture 47 leads — 12 already had agent conversations",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[#fafaf9] transition-colors">
                    <span className="mt-px shrink-0 text-foreground/30">
                      <IconFromKey iconKey={item.icon} size={12} />
                    </span>
                    <p
                      className="text-[12px] text-foreground flex-1"
                      style={{ fontWeight: 400, lineHeight: 1.5 }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

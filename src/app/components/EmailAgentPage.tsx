import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import {
  HugeiconsIcon,
  SparklesIcon,
  ArrowUp01Icon,
  Attachment01Icon,
  FlashIcon,
} from "./campaigns/icons";
import { IconFromKey } from "./campaigns/icons";
import type {
  AppView,
  HomepageState,
  CampaignModeState,
  SuggestedCampaignContext,
} from "./campaigns/types";
import { CampaignModeV2 } from "./campaigns/v2/CampaignModeV2";

type CampaignEntryMode = "new" | "suggested";

const suggestedCampaigns: SuggestedCampaignContext[] = [
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
  {
    title: "Win Back Churned Accounts",
    description:
      "12 accounts churned in the last 90 days. 5 had usage spikes before cancellation.",
    stats: "12 accounts · $92K lost ARR",
    source: "Based on billing + usage data",
  },
  {
    title: "Nurture Conference Leads",
    description:
      "68 badge scans from SaaStr Annual. 23 visited your booth and left contact info.",
    stats: "68 leads · 2 weeks ago",
    source: "Based on event + CRM data",
  },
];

interface ActiveCampaignCard {
  slug: string;
  name: string;
  status: "Live" | "Paused";
  statusColor: string;
  startLabel: string;
  leads: number;
  segments: number;
  emailsSent: number;
  openRate: string;
  pipeline: string;
  meetings: number;
}

const ACTIVE_CAMPAIGNS: ActiveCampaignCard[] = [
  { slug: "reengage-pipeline", name: "Re-engage Stalled Pipeline Deals", status: "Live", statusColor: "#22B07D", startLabel: "Day 3", leads: 34, segments: 3, emailsSent: 44, openRate: "68%", pipeline: "$84K", meetings: 3 },
  { slug: "webinar-followup", name: "Webinar Follow-Up: Security Summit", status: "Live", statusColor: "#22B07D", startLabel: "Day 5", leads: 47, segments: 3, emailsSent: 94, openRate: "51%", pipeline: "$62K", meetings: 5 },
  { slug: "trial-nurture", name: "Product-Led Trial Nurture", status: "Live", statusColor: "#22B07D", startLabel: "Day 2", leads: 128, segments: 3, emailsSent: 256, openRate: "31%", pipeline: "$41K", meetings: 8 },
  { slug: "enterprise-upsell", name: "Enterprise Expansion Upsell", status: "Paused", statusColor: "#E8A600", startLabel: "Day 12", leads: 22, segments: 3, emailsSent: 66, openRate: "45%", pipeline: "$210K", meetings: 4 },
  { slug: "competitive-displacement", name: "Competitive Displacement (Acme)", status: "Live", statusColor: "#22B07D", startLabel: "Day 1", leads: 19, segments: 3, emailsSent: 38, openRate: "53%", pipeline: "$97K", meetings: 2 },
];

const EMPTY_QUICK_STATS = [
  { label: "Pipeline Generated", value: "$0" },
  { label: "Emails Sent", value: "0" },
  { label: "Open Rate", value: "0%" },
  { label: "Meetings Booked", value: "0" },
];

const ACTIVE_QUICK_STATS = [
  { label: "Pipeline Generated", value: "$494K" },
  { label: "Emails Sent", value: "498" },
  { label: "Open Rate", value: "42.1%" },
  { label: "Meetings Booked", value: "22" },
];

const ACTION_INSIGHTS = [
  {
    icon: "fire",
    title: "4 leads opening but not clicking",
    text: "Re-engage Pipeline: Dave Kim, Mike Ross, Lisa Park, and Wei Zhang are opening emails but not clicking CTAs. Switching to Reply Prompt CTA could recover these.",
    action: "Switch CTAs for 4 leads",
    slug: "reengage-pipeline",
    prompt: "Switch the CTA for Dave Kim, Mike Ross, Lisa Park, and Wei Zhang from Case Study to Reply Prompt — they're opening but not clicking. Apply this to their next scheduled email.",
  },
  {
    icon: "alert",
    title: "Enterprise Upsell paused — 3 leads active",
    text: "Laura Martinez, Stephanie Adams, and Richard Nguyen have been visiting pricing pages since campaign paused 9 days ago. Resume with refreshed copy before renewal windows close.",
    action: "Resume campaign",
    slug: "enterprise-upsell",
    prompt: "Resume the Enterprise Upsell campaign with refreshed copy for the 3 leads showing renewed pricing activity — Laura Martinez, Stephanie Adams, and Richard Nguyen. Coordinate with CSM before sending to Laura.",
  },
];

export function EmailAgentPage() {
  const [campaignView, setCampaignView] = useState<AppView>("homepage");
  const [homepageState, setHomepageState] = useState<HomepageState>("empty");
  const [campaignModeInitialState, setCampaignModeInitialState] =
    useState<CampaignModeState>("initial");
  const [campaignEntryMode, setCampaignEntryMode] = useState<CampaignEntryMode>("new");
  const [selectedSuggestedCampaign, setSelectedSuggestedCampaign] =
    useState<SuggestedCampaignContext | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [selectedCampaignSlug, setSelectedCampaignSlug] = useState<string>("reengage-pipeline");
  const [insightPrompt, setInsightPrompt] = useState<string | null>(null);
  const [dismissedInsights, setDismissedInsights] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSuggestedCampaignClick = (campaign: SuggestedCampaignContext) => {
    setCampaignEntryMode("suggested");
    setSelectedSuggestedCampaign(campaign);
    setCampaignModeInitialState("initial");
    setSelectedCampaignSlug("reengage-pipeline");
    setCampaignView("campaign-mode");
  };

  const handleCreateNewCampaignClick = () => {
    setCampaignEntryMode("new");
    setSelectedSuggestedCampaign(null);
    setCampaignModeInitialState("initial");
    setSelectedCampaignSlug("reengage-pipeline");
    setCampaignView("campaign-mode");
  };

  const handleActiveCampaignClick = (slug: string) => {
    setCampaignEntryMode("new");
    setSelectedSuggestedCampaign(null);
    setCampaignModeInitialState("running");
    setSelectedCampaignSlug(slug);
    setCampaignView("campaign-mode");
  };

  const handleGoHome = () => {
    setInsightPrompt(null);
    setCampaignView("homepage");
  };

  const handleInsightAction = (slug: string, prompt: string) => {
    setCampaignEntryMode("new");
    setSelectedSuggestedCampaign(null);
    setCampaignModeInitialState("running");
    setSelectedCampaignSlug(slug);
    setInsightPrompt(prompt);
    setCampaignView("campaign-mode");
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
        onboardingMode={campaignEntryMode}
        suggestedCampaign={selectedSuggestedCampaign}
        campaignSlug={selectedCampaignSlug}
        initialChatPrompt={insightPrompt}
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
        <button
          onClick={handleCreateNewCampaignClick}
          className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-foreground text-white text-[12px] hover:bg-foreground/90 transition-colors"
          style={{ fontWeight: 500 }}
        >
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
              ? "Your campaigns are live and generating pipeline."
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

          {/* Qualification Funnel (only when campaigns are active) */}
          {homepageState === "dense" && <div className="border border-[#e9e9e7] rounded-xl p-4 mb-6">
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
          </div>}

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {(homepageState === "dense" ? ACTIVE_QUICK_STATS : EMPTY_QUICK_STATS).map((stat) => (
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

          {/* AI Insights (right after stats) */}
          {homepageState === "dense" && (() => {
            const visible = ACTION_INSIGHTS.filter((_, i) => !dismissedInsights.has(i));
            if (visible.length === 0) return null;
            return (
              <div className="mb-6 space-y-2">
                {ACTION_INSIGHTS.map((insight, i) => {
                  if (dismissedInsights.has(i)) return null;
                  return (
                    <div key={i} className="border border-[#e9e9e7] rounded-xl p-4 bg-white">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0 text-foreground/40">
                          <IconFromKey iconKey={insight.icon} size={13} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-foreground mb-1" style={{ fontWeight: 600 }}>
                            {insight.title}
                          </p>
                          <p className="text-[11px] text-[#9b9a97] mb-3" style={{ fontWeight: 400, lineHeight: 1.5 }}>
                            {insight.text}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleInsightAction(insight.slug, insight.prompt)}
                              className="text-[11px] px-3 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
                              style={{ fontWeight: 500 }}
                            >
                              {insight.action}
                            </button>
                            <button
                              onClick={() => setDismissedInsights((prev) => new Set(prev).add(i))}
                              className="text-[11px] px-2.5 py-1.5 rounded-lg border border-[#e9e9e7] text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors"
                              style={{ fontWeight: 500 }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

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

          {/* Active Campaigns + Create New (dense state only) */}
          {homepageState === "dense" && (
            <div className="mb-6">
              <p
                className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3"
                style={{ fontWeight: 500 }}
              >
                Active Campaigns
              </p>
              <div className="grid grid-cols-3 gap-3">
                {ACTIVE_CAMPAIGNS.map((campaign) => (
                  <button
                    key={campaign.slug}
                    onClick={() => handleActiveCampaignClick(campaign.slug)}
                    className="w-full text-left rounded-xl border border-[#e9e9e7] p-4 transition-colors hover:shadow-sm hover:border-[#c8c8c6] group bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-[6px] h-[6px] rounded-full" style={{ background: campaign.statusColor }} />
                        <span className="text-[10px]" style={{ fontWeight: 500, color: campaign.statusColor }}>
                          {campaign.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                        {campaign.startLabel}
                      </span>
                    </div>
                    <p className="text-[13px] text-foreground mb-0.5 leading-tight" style={{ fontWeight: 600 }}>
                      {campaign.name}
                    </p>
                    <p className="text-[11px] text-[#9b9a97] mb-3" style={{ fontWeight: 400, lineHeight: 1.4 }}>
                      {campaign.leads} leads across {campaign.segments} segments
                    </p>
                    <div className="border-t border-[#e9e9e7] pt-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[9px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 500 }}>Emails Sent</p>
                          <p className="text-[15px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>{campaign.emailsSent}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 500 }}>Open Rate</p>
                          <p className="text-[15px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>{campaign.openRate}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 500 }}>Pipeline</p>
                          <p className="text-[15px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>{campaign.pipeline}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 500 }}>Meetings</p>
                          <p className="text-[15px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>{campaign.meetings}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Create New Campaign Card — inside active grid */}
                <button
                  onClick={handleCreateNewCampaignClick}
                  className="w-full text-left rounded-xl border-[1.5px] border-dashed border-[#e9e9e7] p-4 flex flex-col items-center justify-center hover:border-[#c8c8c6] hover:bg-[#fafaf9] transition-colors min-h-[140px]"
                >
                  <Plus size={18} strokeWidth={1.5} className="text-[#9b9a97] mb-2" />
                  <span className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>
                    Create Campaign
                  </span>
                  <p className="text-[10px] text-[#9b9a97] mt-1 text-center" style={{ fontWeight: 400, lineHeight: 1.4 }}>
                    Describe what you want to do
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Suggested Campaigns */}
          {(() => {
            const activeTitles = ACTIVE_CAMPAIGNS.map((c) => c.name);
            const available = homepageState === "dense"
              ? suggestedCampaigns.filter((c) => !activeTitles.includes(c.title)).slice(0, 2)
              : suggestedCampaigns.slice(0, 2);

            if (available.length === 0) return null;

            const isDense = homepageState === "dense";

            return (
              <>
                <p
                  className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3"
                  style={{ fontWeight: 500 }}
                >
                  Suggested Campaigns
                </p>
                <div className={`grid gap-3 mb-3 ${isDense ? "grid-cols-2" : "grid-cols-3"}`}>
                  {available.map((campaign) => (
                    <button
                      key={campaign.title}
                      onClick={() => handleSuggestedCampaignClick(campaign)}
                      className="campaign-card-glow group text-left p-[1.5px] transition-transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <div className="glow-spinner" />
                      <div className={`relative bg-white rounded-[10.5px] h-full flex flex-col z-10 ${isDense ? "p-3" : "p-4"}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <HugeiconsIcon
                            icon={SparklesIcon}
                            size={11}
                            className="text-foreground/40 shrink-0"
                          />
                          <span
                            className={`text-foreground leading-tight ${isDense ? "text-[12px]" : "text-[13px]"}`}
                            style={{ fontWeight: 500 }}
                          >
                            {campaign.title}
                          </span>
                        </div>
                        {!isDense && (
                          <p
                            className="text-[12px] text-[#9b9a97] mb-3"
                            style={{ fontWeight: 400, lineHeight: 1.5 }}
                          >
                            {campaign.description}
                          </p>
                        )}
                        <div className={isDense ? "" : "mt-auto"}>
                          <p
                            className={`text-foreground/80 ${isDense ? "text-[10px]" : "text-[11px] mb-1"}`}
                            style={{ fontWeight: 500 }}
                          >
                            {campaign.stats}
                          </p>
                          {!isDense && (
                            <p
                              className="text-[10px] text-[#9b9a97]"
                              style={{ fontWeight: 400 }}
                            >
                              {campaign.source}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Create New Campaign Card — only in empty state */}
                  {!isDense && (
                    <button
                      onClick={handleCreateNewCampaignClick}
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
                  )}
                </div>
              </>
            );
          })()}


        </div>
      </div>

      {/* Prototype Controller */}
      <div className="fixed bottom-4 left-16 z-50 flex items-center gap-2.5 bg-white border border-[#e9e9e7] rounded-lg shadow-sm px-3 py-1.5">
        <IconFromKey iconKey="settings" size={12} className="text-[#9b9a97]" />
        <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 500 }}>
          Prototype
        </span>
        <div className="flex bg-[#f7f7f5] rounded-md p-0.5 gap-0.5">
          <button
            onClick={() => setHomepageState("empty")}
            className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
              homepageState === "empty"
                ? "bg-foreground text-white"
                : "text-[#9b9a97] hover:bg-[#efefed]"
            }`}
            style={{ fontWeight: 500 }}
          >
            Empty
          </button>
          <button
            onClick={() => setHomepageState("dense")}
            className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
              homepageState === "dense"
                ? "bg-foreground text-white"
                : "text-[#9b9a97] hover:bg-[#efefed]"
            }`}
            style={{ fontWeight: 500 }}
          >
            Active
          </button>
        </div>
      </div>
    </div>
  );
}

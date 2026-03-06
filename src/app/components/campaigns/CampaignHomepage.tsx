import { useRef } from "react";
import {
  HugeiconsIcon,
  SparklesIcon,
  ArrowUp01Icon,
  Attachment01Icon,
  FlashIcon,
  Mail01Icon,
  AiChat02Icon,
  BarChartIcon,
} from "./icons";
import { IconFromKey } from "./icons";
import type { HomepageState } from "./types";

interface Props {
  state: HomepageState;
  chatInput: string;
  onChatInput: (v: string) => void;
  onChatSubmit: () => void;
  onSuggestedCampaignClick: (title: string) => void;
  onActiveCampaignClick: () => void;
}

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

export function CampaignHomepage({
  state,
  chatInput,
  onChatInput,
  onChatSubmit,
  onSuggestedCampaignClick,
  onActiveCampaignClick,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChatInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onChatSubmit();
    }
  };

  const greeting =
    state === "dense"
      ? "Good afternoon, Sandeep. Your pipeline re-engagement campaign is live — 18 emails sent so far."
      : "Good morning, Sandeep.";

  const subtitle =
    state === "dense"
      ? "Campaigns are running. Here's what's happening."
      : "I've analyzed your CRM — here are a few campaigns worth running.";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-12 pb-8 max-w-[700px] mx-auto">
          {/* Greeting */}
          <p
            className="text-[22px] text-foreground mb-1"
            style={{ fontWeight: 500, lineHeight: 1.3 }}
          >
            {greeting}
          </p>
          <p
            className="text-[14px] text-[#9b9a97] mb-6"
            style={{ fontWeight: 400, lineHeight: 1.5 }}
          >
            {subtitle}
          </p>

          {/* Chat Input */}
          <div className="border border-[#e9e9e7] rounded-lg flex items-end gap-1 px-3 py-2 focus-within:border-foreground/20 transition-colors bg-white mb-8">
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
              onClick={onChatSubmit}
              className="w-6 h-6 rounded bg-foreground text-white flex items-center justify-center shrink-0 disabled:opacity-20 transition-opacity"
            >
              <HugeiconsIcon icon={ArrowUp01Icon} size={13} />
            </button>
          </div>

          {/* Active Campaigns (dense state only) */}
          {state === "dense" && (
            <div className="mb-8">
              <p
                className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3"
                style={{ fontWeight: 500 }}
              >
                Active Campaigns
              </p>
              <button
                onClick={onActiveCampaignClick}
                className="w-full text-left rounded-xl border border-[#e9e9e7] hover:border-[#c8c8c6] hover:bg-[#fafaf9] transition-colors p-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[13px] text-foreground"
                        style={{ fontWeight: 500 }}
                      >
                        Re-engage Stalled Pipeline Deals
                      </span>
                      <span className="text-[10px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200 shrink-0" style={{ fontWeight: 500 }}>
                        Live
                      </span>
                    </div>
                    <p className="text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                      34 leads · 18 emails sent · 0 meetings yet · Started just now
                    </p>
                  </div>
                  <span className="text-[#9b9a97] text-[12px] group-hover:text-foreground/50 transition-colors">→</span>
                </div>
              </button>
            </div>
          )}

          {/* Suggested Campaign Cards */}
          <div className="mb-3">
            <p
              className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3"
              style={{ fontWeight: 500 }}
            >
              Suggested Campaigns
            </p>
            <div className="grid grid-cols-3 gap-3">
              {suggestedCampaigns.map((campaign) => (
                <button
                  key={campaign.title}
                  onClick={() => onSuggestedCampaignClick(campaign.title)}
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
                onClick={() => onSuggestedCampaignClick("")}
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
          </div>

          {/* Recent Activity (dense state only) */}
          {state === "dense" && (
            <div className="mt-8">
              <p
                className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3"
                style={{ fontWeight: 500 }}
              >
                Recent Activity
              </p>
              <div className="space-y-2">
                {[
                  { time: "Just now", icon: "mail", text: "18 emails sent to Segment A (Re-engage Pipeline)" },
                  { time: "Just now", icon: "robot", text: "Campaign launched: Re-engage Stalled Pipeline Deals" },
                  { time: "Earlier", icon: "chart-bar", text: "CRM synced: 847 leads, 312 MQLs" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-1.5">
                    <span className="mt-px shrink-0 text-[#9b9a97]"><IconFromKey iconKey={item.icon} size={13} /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-foreground" style={{ fontWeight: 400 }}>
                        {item.text}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#9b9a97] shrink-0" style={{ fontWeight: 400 }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qualification Funnel (only when campaigns are active) */}
          {state === "dense" && <div className="mt-8 border border-[#e9e9e7] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <HugeiconsIcon icon={FlashIcon} size={13} className="text-foreground/40" />
              <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>
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
                <div key={step.label} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[11px] text-foreground tabular-nums" style={{ fontWeight: 500 }}>
                    {step.count}
                  </p>
                  <div
                    className="w-full rounded bg-[#efefed]"
                    style={{ height: step.height }}
                  />
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

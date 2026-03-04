import { HugeiconsIcon, FlashIcon, SparklesIcon } from "../../icons";

export function CampaignOverviewArtifact() {
  return (
    <div className="px-5 py-5 space-y-4">
      {/* Campaign brief */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <HugeiconsIcon icon={SparklesIcon} size={13} className="text-foreground/40" />
          <p className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>
            Re-engage Stalled Pipeline Deals
          </p>
        </div>
        <p className="text-[12px] text-[#9b9a97]" style={{ fontWeight: 400, lineHeight: 1.6 }}>
          34 deals have stalled for 30+ days. 18 visited your pricing page recently.
          AI has identified high-intent signals across these stalled deals and recommends
          a segmented re-engagement campaign.
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Leads", value: "34" },
          { label: "Pipeline at Risk", value: "$180K" },
          { label: "Pricing Visitors", value: "18" },
          { label: "Agent Convos", value: "6" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-[#e9e9e7] rounded-xl p-3 bg-white"
          >
            <p className="text-[10px] text-[#9b9a97] mb-1" style={{ fontWeight: 500 }}>
              {stat.label}
            </p>
            <p className="text-[16px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Source */}
      <div className="border border-[#e9e9e7] rounded-xl p-3.5 bg-[#fafaf9]">
        <div className="flex items-center gap-2 mb-1.5">
          <HugeiconsIcon icon={FlashIcon} size={12} className="text-foreground/40" />
          <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Data Sources</p>
        </div>
        <div className="space-y-1">
          {[
            "HubSpot Pipeline: 34 stalled deals",
            "Web Analytics: 18 pricing page visitors",
            "Agent History: 6 prior conversations",
            "Email History: 22 received marketing emails",
          ].map((source) => (
            <p key={source} className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
              {source}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

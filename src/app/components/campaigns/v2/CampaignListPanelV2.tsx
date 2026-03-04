import { useState } from "react";
import {
  HugeiconsIcon,
  ArrowDown01Icon,
  MoreHorizontalIcon,
  PauseIcon,
  Settings01Icon,
  Copy01Icon,
  Archive01Icon,
  Delete02Icon,
} from "../icons";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import type { CampaignModeState } from "../types";
import { toast } from "sonner";

interface Props {
  campaignState: CampaignModeState;
  onGoHome: () => void;
  onNewCampaign: () => void;
  isNewCampaign?: boolean;
}

// Only show campaigns the user has actually created (not suggestions)
const allCampaigns = [
  {
    id: "reengage",
    name: "Re-engage Stalled Pipeline Deals",
    status: "active" as const,
  },
];

export function CampaignListPanelV2({ campaignState, onGoHome, onNewCampaign, isNewCampaign }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isRunning = campaignState === "running" || campaignState === "launched";

  return (
    <div className="w-[220px] shrink-0 flex flex-col h-full overflow-hidden">
      {/* Back button */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 text-[12px] text-[#9b9a97] hover:text-foreground transition-colors py-1 px-1 rounded hover:bg-[#f7f7f5] w-full text-left"
          style={{ fontWeight: 400 }}
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={12} className="rotate-90" />
          Campaign Home
        </button>
      </div>

      {/* Campaign list */}
      <div className="flex-1 overflow-y-auto px-2">
        {/* New Campaign item — shown when creating */}
        {isNewCampaign && (
          <div className="relative group">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-[#efefed] text-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 animate-pulse" />
              <span className="flex-1 text-[12px] leading-tight line-clamp-2" style={{ fontWeight: 500 }}>
                New Campaign
              </span>
            </div>
          </div>
        )}

        {allCampaigns.map((campaign) => {
          const isActive = campaign.id === "reengage" && !isNewCampaign;
          const isHovered = hoveredId === campaign.id;

          return (
            <div
              key={campaign.id}
              className="relative group"
              onMouseEnter={() => setHoveredId(campaign.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#efefed] text-foreground"
                    : "text-[#9b9a97] hover:bg-[#f7f7f5]"
                }`}
              >
                {isActive && isRunning && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                )}
                <span
                  className="flex-1 text-[12px] leading-tight line-clamp-2"
                  style={{ fontWeight: isActive ? 500 : 400 }}
                >
                  {campaign.name}
                </span>

                {isHovered && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="w-5 h-5 flex items-center justify-center rounded text-[#9b9a97] hover:text-foreground hover:bg-[#e9e9e7] shrink-0 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HugeiconsIcon icon={MoreHorizontalIcon} size={12} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="text-[12px] gap-2" onClick={() => toast.info("Campaign settings coming soon")}>
                        <HugeiconsIcon icon={Settings01Icon} size={12} /> Campaign Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[12px] gap-2" onClick={() => toast.success("Campaign paused")}>
                        <HugeiconsIcon icon={PauseIcon} size={12} /> Pause Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[12px] gap-2" onClick={() => toast.success("Campaign duplicated")}>
                        <HugeiconsIcon icon={Copy01Icon} size={12} /> Duplicate Campaign
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-[12px] gap-2" onClick={() => toast.info("Campaign archived")}>
                        <HugeiconsIcon icon={Archive01Icon} size={12} /> Archive Campaign
                      </DropdownMenuItem>
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
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Campaign button */}
      <div className="px-2 pb-3 pt-2 shrink-0">
        <button
          onClick={onNewCampaign}
          className="w-full flex items-center gap-1.5 px-2 py-2 text-[12px] text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] rounded-lg transition-colors"
          style={{ fontWeight: 400 }}
        >
          <HugeiconsIcon icon={Add01Icon} size={12} />
          New Campaign
        </button>
      </div>
    </div>
  );
}

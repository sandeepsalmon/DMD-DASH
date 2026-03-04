import { HugeiconsIcon, ArrowDown01Icon } from "../icons";
import type { Artifact } from "./hooks/useArtifacts";
import type { CampaignModeState } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

interface Props {
  artifacts: Artifact[];
  activeArtifactId: string;
  onSelectArtifact: (id: string) => void;
  onNavigate: (direction: "prev" | "next") => void;
  campaignState: CampaignModeState;
}

export function ArtifactPanelHeader({
  artifacts,
  activeArtifactId,
  onSelectArtifact,
  onNavigate,
  campaignState,
}: Props) {
  const activeIdx = artifacts.findIndex((a) => a.id === activeArtifactId);
  const activeArtifact = artifacts[activeIdx];
  const isLaunched = campaignState === "launched" || campaignState === "running";

  return (
    <div className="px-4 py-3 border-b border-[#e0dfdd] flex items-center justify-between shrink-0 bg-white/90 backdrop-blur-sm">
      {/* Left: Artifact title with dropdown */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-[13px] text-foreground hover:text-foreground/80 transition-colors min-w-0">
              <span className="truncate" style={{ fontWeight: 600 }}>
                {activeArtifact?.title ?? "Campaign"}
              </span>
              <HugeiconsIcon icon={ArrowDown01Icon} size={12} className="shrink-0 text-[#9b9a97]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {artifacts.map((artifact) => (
              <DropdownMenuItem
                key={artifact.id}
                onClick={() => onSelectArtifact(artifact.id)}
                className={`text-[12px] gap-2 ${artifact.id === activeArtifactId ? "bg-[#f7f7f5]" : ""}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  artifact.state === "generating" ? "bg-foreground/30 animate-pulse" : "bg-foreground/20"
                }`} />
                <span style={{ fontWeight: artifact.id === activeArtifactId ? 500 : 400 }}>
                  {artifact.title}
                </span>
                {artifact.state === "generating" && (
                  <span className="text-[10px] text-[#9b9a97] ml-auto">Loading...</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isLaunched && (
          <span className="text-[10px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200 shrink-0" style={{ fontWeight: 500 }}>
            Live
          </span>
        )}
      </div>

      {/* Right: Navigation arrows + count */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <span className="text-[10px] text-[#9b9a97] tabular-nums mr-1" style={{ fontWeight: 400 }}>
          {activeIdx + 1} / {artifacts.length}
        </span>
        <button
          onClick={() => onNavigate("prev")}
          disabled={activeIdx <= 0}
          className="w-6 h-6 flex items-center justify-center rounded text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors disabled:opacity-30"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={12} className="rotate-90" />
        </button>
        <button
          onClick={() => onNavigate("next")}
          disabled={activeIdx >= artifacts.length - 1}
          className="w-6 h-6 flex items-center justify-center rounded text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors disabled:opacity-30"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={12} className="-rotate-90" />
        </button>
      </div>
    </div>
  );
}

import { HugeiconsIcon, SparklesIcon, Mail01Icon, ChartLineData02Icon, FlashIcon } from "../../icons";
import type { ArtifactType } from "../hooks/useArtifacts";

const ARTIFACT_ICON_MAP: Record<ArtifactType, typeof SparklesIcon> = {
  "campaign-overview": SparklesIcon,
  "leads": SparklesIcon,
  "segment-analysis": FlashIcon,
  "email-plan": Mail01Icon,
  "email-preview": Mail01Icon,
  "dashboard": ChartLineData02Icon,
  "activity": ChartLineData02Icon,
};

interface ArtifactCardProps {
  title: string;
  subtitle: string;
  artifactType: ArtifactType;
  isActive?: boolean;
  onClick: () => void;
}

export function ArtifactCard({ title, subtitle, artifactType, isActive, onClick }: ArtifactCardProps) {
  const icon = ARTIFACT_ICON_MAP[artifactType] ?? SparklesIcon;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left border rounded-xl px-4 py-3 transition-all hover:border-foreground/20 hover:shadow-sm ${
        isActive
          ? "border-foreground/20 bg-[#fafaf9] shadow-sm"
          : "border-[#e9e9e7] bg-white"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-[#f4f4f2] flex items-center justify-center shrink-0 mt-0.5">
          <HugeiconsIcon icon={icon} size={12} className="text-foreground/50" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>{title}</p>
          <p className="text-[11px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>{subtitle}</p>
        </div>
        <span className="text-[10px] text-[#9b9a97] shrink-0 mt-1" style={{ fontWeight: 400 }}>
          View →
        </span>
      </div>
    </button>
  );
}

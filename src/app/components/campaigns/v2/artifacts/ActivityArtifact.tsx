import { IconFromKey } from "../../icons";
import { ACTIVITY_LOG } from "../../types";
import type { CampaignData } from "../../campaignData";

interface Props {
  campaignData?: CampaignData;
}

export function ActivityArtifact({ campaignData }: Props) {
  const activityLog = campaignData?.activityLog ?? ACTIVITY_LOG;
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="relative pl-5">
        {/* Vertical timeline line */}
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#e9e9e7]" />
        <div className="space-y-0">
          {activityLog.map((item, i) => {
            const isHighlight = item.icon === "calendar" || item.icon === "checkmark";
            return (
              <div key={i} className="relative flex items-start gap-3 py-2.5 group">
                {/* Timeline dot */}
                <div
                  className="absolute -left-5 top-3.5 w-2.5 h-2.5 rounded-full border-2 border-white z-10 shrink-0"
                  style={{
                    background: isHighlight ? "#22c55e" : "#d4d4d1",
                    boxShadow: `0 0 0 1.5px ${isHighlight ? "#22c55e" : "#e9e9e7"}`,
                  }}
                />
                <div
                  className={`flex-1 min-w-0 rounded-xl px-3.5 py-2.5 transition-colors ${
                    isHighlight
                      ? "bg-green-50/60 border border-green-100"
                      : "group-hover:bg-[#fafaf9]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5">
                      <IconFromKey iconKey={item.icon} size={13} color={isHighlight ? "#22c55e" : undefined} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-foreground" style={{ fontWeight: isHighlight ? 500 : 400, lineHeight: 1.5 }}>
                        {item.text}
                      </p>
                      <p className="text-[10px] text-[#9b9a97] mt-0.5" style={{ fontWeight: 400 }}>
                        {item.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

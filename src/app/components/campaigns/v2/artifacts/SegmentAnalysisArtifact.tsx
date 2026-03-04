import {
  HugeiconsIcon,
  Search01Icon,
  Idea01Icon,
  Target02Icon,
} from "../../icons";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtItem,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
} from "@/components/prompt-kit/chain-of-thought";

interface Props {
  isGenerating: boolean;
}

export function SegmentAnalysisArtifact({ isGenerating }: Props) {
  if (isGenerating) {
    return (
      <div className="px-5 py-5">
        <div className="bg-white border border-[#e0dfdd] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin shrink-0" />
            <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
              Building plan...
            </p>
          </div>
          <ChainOfThought>
            <ChainOfThoughtStep defaultOpen>
              <ChainOfThoughtTrigger leftIcon={<HugeiconsIcon icon={Search01Icon} size={14} />}>
                Analyzing 34 stalled pipeline deals
              </ChainOfThoughtTrigger>
              <ChainOfThoughtContent>
                <ChainOfThoughtItem>Pulling CRM signals: last activity, deal age, email history</ChainOfThoughtItem>
                <ChainOfThoughtItem>Identifying common drop-off patterns across accounts</ChainOfThoughtItem>
                <ChainOfThoughtItem>Cross-referencing pricing page visits and agent conversations</ChainOfThoughtItem>
              </ChainOfThoughtContent>
            </ChainOfThoughtStep>

            <ChainOfThoughtStep defaultOpen>
              <ChainOfThoughtTrigger leftIcon={<HugeiconsIcon icon={Idea01Icon} size={14} />}>
                Segmenting by engagement signals
              </ChainOfThoughtTrigger>
              <ChainOfThoughtContent>
                <ChainOfThoughtItem>Segment A (Hot): pricing intent + recent agent convo — 18 leads</ChainOfThoughtItem>
                <ChainOfThoughtItem>Segment B (Warm): some engagement, no purchase signal — 10 leads</ChainOfThoughtItem>
                <ChainOfThoughtItem>Segment C (Re-engage): previously closed-lost, grouped by reason — 6 leads</ChainOfThoughtItem>
              </ChainOfThoughtContent>
            </ChainOfThoughtStep>

            <ChainOfThoughtStep>
              <ChainOfThoughtTrigger leftIcon={<HugeiconsIcon icon={Target02Icon} size={14} />}>
                Drafting personalized email sequences
              </ChainOfThoughtTrigger>
              <ChainOfThoughtContent>
                <ChainOfThoughtItem>Matching tone and CTA to segment urgency level</ChainOfThoughtItem>
                <ChainOfThoughtItem>Scheduling send windows based on past open-time patterns</ChainOfThoughtItem>
                <ChainOfThoughtItem>Preparing fallback sequences for non-openers</ChainOfThoughtItem>
              </ChainOfThoughtContent>
            </ChainOfThoughtStep>
          </ChainOfThought>
        </div>
      </div>
    );
  }

  // Ready state — show segment summary
  return (
    <div className="px-5 py-5 space-y-3">
      <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
        Segment Breakdown
      </p>

      {[
        {
          name: "Segment A: Hot",
          count: 18,
          color: "#ef4444",
          description: "Pricing page visitors + agent conversations. Highest intent — aggressive cadence.",
          cadence: "2 emails · 3 days",
        },
        {
          name: "Segment B: Warm",
          count: 10,
          color: "#f59e0b",
          description: "Some engagement (downloads, site visits) but no pricing signals. Moderate cadence.",
          cadence: "3 emails · 7 days",
        },
        {
          name: "Segment C: Re-engage",
          count: 6,
          color: "#22c55e",
          description: "Previously closed-lost. Sub-segmented by lost reason (pricing, timing, competitor).",
          cadence: "3 emails · 10 days",
        },
      ].map((seg) => (
        <div
          key={seg.name}
          className="border border-[#e9e9e7] rounded-xl p-4 bg-white"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
            <p className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>{seg.name}</p>
            <span className="text-[10px] px-1.5 py-px rounded bg-[#f4f4f2] text-[#6b6a67]" style={{ fontWeight: 500 }}>
              {seg.count}
            </span>
          </div>
          <p className="text-[11px] text-[#9b9a97] mb-1" style={{ fontWeight: 400, lineHeight: 1.5 }}>
            {seg.description}
          </p>
          <p className="text-[10px] text-[#b8b8b5]" style={{ fontWeight: 400 }}>{seg.cadence}</p>
        </div>
      ))}
    </div>
  );
}

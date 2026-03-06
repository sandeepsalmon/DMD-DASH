import { useEffect, useRef, useState } from "react";
import {
  HugeiconsIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Attachment01Icon,
  CheckmarkBadge02Icon,
  StopIcon,
  MailSend01Icon,
  Calendar03Icon,
  AiChat02Icon,
} from "../icons";
import { IconFromKey } from "../icons";
import type { CampaignModeState, SuggestedCampaignContext } from "../types";
import type { CampaignData } from "../campaignData";
import { getAgentById } from "../../agents/agentData";
import { AgentPicker } from "../../agents/AgentPicker";
import { TextShimmer } from "@/components/prompt-kit/text-shimmer";
import { Loader } from "@/components/prompt-kit/loader";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { DocketMessage, UserMessage } from "./shared/ChatMessage";
import { CampaignQuestions, type QuestionAnswer } from "./shared/CampaignQuestions";
import type { RightPanelTab } from "./ArtifactPanel";

interface Props {
  campaignState: CampaignModeState;
  chatPreFill: string;
  onStart: () => void;
  onPromptClick: (prompt: string) => void;
  onViewCampaign: () => void;
  onAgentSelected: (agentId: string | null) => void;
  onSwitchTab: (tab: RightPanelTab) => void;
  isPaused?: boolean;
  pendingPrompt?: string | null;
  onPromptConsumed?: () => void;
  onboardingMode?: "new" | "suggested";
  suggestedCampaign?: SuggestedCampaignContext | null;
  campaignData?: CampaignData;
}

const CHAIN_OF_THOUGHT = [
  { iconKey: "checkmark", title: "Pulled 34 deals from HubSpot pipeline" },
  { iconKey: "checkmark", title: "Enriched warm context for 34 leads (28 accounts)" },
  { iconKey: "clock", title: "Evaluating best approach..." },
];

const PLAN_THOUGHT_CHAIN = [
  "Reviewed prior closed-lost reasons (pricing, timing, competitor) for stalled deals.",
  "Matched each reason to the most relevant proof asset and CTA strategy.",
  "Mapped leads into one adaptive sequence with intent-based prompt variants.",
  "Built a 3-step plan with warm-context personalization and send-time optimization.",
];

const PLAN_PREVIEW_SEQUENCE = [
  {
    name: "Re-engagement opener",
    subject: "Short Re-engagement Email",
    prompt:
      "Write a short re-engagement email. Mention recent warm signals and propose one clear next step in a consultative tone.",
    cta: "Dynamic CTA (escalates to booking when pricing intent is high).",
  },
  {
    name: "Context + proof follow-up",
    subject: "Proof-Led Follow-Up Email",
    prompt:
      "Write a follow-up email with one focused proof point. Ask one specific question that helps qualify urgency.",
    cta: "Proof-led CTA with reply prompt fallback for low click propensity.",
  },
  {
    name: "Final CTA and close-the-loop",
    subject: "Close-the-Loop Email",
    prompt:
      "Write a final close-the-loop email. Be direct, respectful, and offer one clear path to continue or pause.",
    cta: "Close-the-loop CTA with optional conversational-agent route for replies.",
  },
] as const;

type FollowUpProfile = {
  label: string;
  description: string;
  cadence: string;
  duration: string;
  touches: string;
  decisionRule: string;
  stepSchedule: [string, string, string];
};

const FOLLOW_UP_PERSISTENCE_LEVELS = [
  {
    label: "Light",
    description: "Send 1 email per week for 4 weeks, then pause unless there is fresh intent.",
    cadence: "1 email / week",
    duration: "4 weeks",
    touches: "Up to 4 touches",
    decisionRule: "Pause after 2 no-engagement sends unless intent spikes.",
    stepSchedule: ["Day 0", "Day 7", "Day 21"],
  },
  {
    label: "Moderate",
    description: "Send 2 to 3 emails per week for 6 weeks, increasing engagement intensity based on lead activity.",
    cadence: "2-3 emails / week",
    duration: "6 weeks",
    touches: "6-10 touches",
    decisionRule: "Increase intensity on opens/clicks, taper on low response.",
    stepSchedule: ["Day 0", "Day 3", "Day 7"],
  },
  {
    label: "Persistent",
    description: "Send 3 to 4 emails per week for 8 weeks with stronger escalation for engaged leads.",
    cadence: "3-4 emails / week",
    duration: "8 weeks",
    touches: "10-14 touches",
    decisionRule: "Escalate CTA quickly for repeated opens and pricing visits.",
    stepSchedule: ["Day 0", "Day 2", "Day 5"],
  },
  {
    label: "Aggressive",
    description: "Send daily follow-ups in active windows for high-intent leads, then taper quickly on low engagement.",
    cadence: "Daily in active windows",
    duration: "2-3 weeks",
    touches: "12+ touches",
    decisionRule: "Fast escalation for hot leads, stop quickly on negative signals.",
    stepSchedule: ["Day 0", "Day 1", "Day 3"],
  },
] as const satisfies FollowUpProfile[];

const DOCKET_INITIAL = `I found 34 deals in your HubSpot pipeline that have been stalled for over 30 days. 18 of them have visited your pricing page in the last 2 weeks — that's a strong buying signal going to waste.

I'll analyze each deal's warm context — web activity, sales notes, email history, and CRM data.`;

const DOCKET_PIPELINE_SUGGESTION = `I found 34 deals in your HubSpot pipeline that have been stalled for over 30 days. 18 of them have visited your pricing page in the last 2 weeks — that's a strong buying signal going to waste.

Would you like to run a re-engagement campaign for these stalled deals?`;

const DOCKET_QUESTIONS_INTRO = `Great! Let me ask a few quick questions to tailor this campaign. Just click the option that fits — or type your own.`;

const DOCKET_CUSTOM_PROMPT = `No problem! What type of campaign are you looking to run? Describe what you have in mind and I'll help you build it.`;
const CUSTOM_CAMPAIGN_QUICK_STARTS = [
  "Follow up with webinar attendees",
  "Re-engage closed-lost opportunities",
  "Nurture new inbound signups",
] as const;

const SUGGESTED_CAMPAIGN_SNAPSHOT = "__SUGGESTED_CAMPAIGN_SNAPSHOT__";

const SUGGESTED_REENGAGE_TEXT = `I found a strong re-engagement opportunity in your pipeline.

34 deals are stalled for 30+ days, but 18 of those accounts still show active intent (recent pricing visits and prior conversations). This is a high-signal recovery motion.

I recommend launching a single adaptive email sequence so we can move from fast re-engagement to proof and final follow-up with the right CTA at each step.

If this looks right, click "Yes, let's proceed" and I'll build the campaign.`;

function buildSuggestedCampaignText(campaign: SuggestedCampaignContext): string {
  if (campaign.title === "Re-engage Stalled Pipeline Deals") {
    return SUGGESTED_REENGAGE_TEXT;
  }

  return `I found an opportunity worth running.

Campaign:
• ${campaign.title}

Signal:
• ${campaign.description}

Scope:
• ${campaign.stats}

Source:
• ${campaign.source}

I can now build the email sequence, CTA strategy, and launch plan.
Would you like me to proceed?`;
}

function buildSuggestedCampaignSeedMessages(campaign: SuggestedCampaignContext): ChatMsg[] {
  return [
    { id: "seed-suggested-brief", role: "docket", content: buildSuggestedCampaignText(campaign) },
    { id: "seed-suggested-snapshot", role: "docket", content: SUGGESTED_CAMPAIGN_SNAPSHOT },
  ];
}

type OnboardingStep = "blank" | "pipeline-suggested" | "questions" | "custom-describe" | "done";

const DAVE_KIM_RESPONSE = `Done. Updated Dave Kim's remaining emails to use technical documentation links instead. His warm context shows he cares about API depth, not sales conversations.`;
const ANNA_ESCALATE_RESPONSE = `Escalating Anna Kumar to AE team. She's opened and clicked every email but hasn't booked — flagged in HubSpot as "High Priority," assigned to deal owner, automated emails paused.`;
const PRIYA_CTA_RESPONSE = `Switched Priya Mehta's CTA to Reply Prompt. Reply prompts have 2.3x higher response rate in this sequence stage.`;

interface ChatMsg { id: string; role: "docket" | "user"; content: string; }

function SuggestedCampaignSnapshot({ campaign }: { campaign: SuggestedCampaignContext | null }) {
  if (!campaign) return null;

  const isReengage = campaign.title === "Re-engage Stalled Pipeline Deals";
  const kpis = isReengage
    ? [
        { label: "Stalled Deals", value: "34", tone: "#ef4444" },
        { label: "Active Intent", value: "18", tone: "#f59e0b" },
        { label: "Pipeline at Risk", value: "$180K", tone: "#2563eb" },
      ]
    : [
        { label: "Campaign Scope", value: campaign.stats, tone: "#2563eb" },
        { label: "Primary Signal", value: "High", tone: "#f59e0b" },
        { label: "Actionability", value: "Ready", tone: "#22c55e" },
      ];

  const rows = isReengage
    ? [
        { step: "Email 1", audience: "High-intent leads", rationale: "Recent pricing signals", action: "Launch immediately" },
        { step: "Email 2", audience: "Active non-responders", rationale: "Opened or clicked but no meeting", action: "Proof-led follow-up" },
        { step: "Email 3", audience: "Remaining opportunities", rationale: "No reply after first 2 touches", action: "Close-the-loop nudge" },
      ]
    : [
        { step: "Email 1", audience: "Top accounts", rationale: campaign.description, action: "Personalized opener" },
        { step: "Email 2", audience: "Engaged leads", rationale: "Interest without conversion", action: "Context + CTA follow-up" },
        { step: "Email 3", audience: "Low-response leads", rationale: "Needs re-activation", action: "Final reminder" },
      ];

  return (
    <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-white">
      <div className="px-3 py-2.5 bg-[#fafaf9] border-b border-[#e9e9e7]">
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
          Opportunity Snapshot
        </p>
        <p className="text-[12px] text-foreground mt-1" style={{ fontWeight: 500 }}>
          {campaign.title}
        </p>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="border border-[#e9e9e7] rounded-lg p-2.5 bg-[#fafaf9]">
              <p className="text-[9px] text-[#9b9a97] mb-1" style={{ fontWeight: 500 }}>{kpi.label}</p>
              <p className="text-[14px] leading-none" style={{ fontWeight: 600, color: kpi.tone }}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="border border-[#e9e9e7] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#fafaf9] border-b border-[#e9e9e7]">
                {["Step", "Audience", "Why", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-2.5 py-2 text-left text-[9px] text-[#9b9a97] uppercase tracking-wider"
                    style={{ fontWeight: 500 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[#e9e9e7]/70 last:border-0">
                  <td className="px-2.5 py-2 text-[10px] text-foreground" style={{ fontWeight: 500 }}>{row.step}</td>
                  <td className="px-2.5 py-2 text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{row.audience}</td>
                  <td className="px-2.5 py-2 text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{row.rationale}</td>
                  <td className="px-2.5 py-2 text-[10px] text-foreground" style={{ fontWeight: 500 }}>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
          Source: {campaign.source}
        </p>
      </div>
    </div>
  );
}

function HighICPTable() {
  const rows = [
    { name: "Anna Kumar", company: "FinServ", icp: 71, engage: "High", issue: "No meeting" },
    { name: "Priya Mehta", company: "MegaCorp", icp: 68, engage: "Med", issue: "No click" },
    { name: "Dave Kim", company: "StartupX", icp: 61, engage: "Med", issue: "CTA mismatch" },
    { name: "Mike Ross", company: "RetailCo", icp: 52, engage: "Low", issue: "Partial" },
    { name: "Lisa Park", company: "OldCorp", icp: 45, engage: "Low", issue: "Slow" },
  ];
  return (
    <div className="border border-[#e9e9e7] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead><tr className="border-b border-[#e9e9e7] bg-[#fafaf9]">
          {["Lead", "Company", "ICP", "Engage", "Issue"].map((h) => (
            <th key={h} className="px-3 py-2 text-left text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i} className="border-b border-[#e9e9e7]/60 last:border-0">
            <td className="px-3 py-2 text-[11px] text-foreground" style={{ fontWeight: 500 }}>{r.name}</td>
            <td className="px-3 py-2 text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{r.company}</td>
            <td className="px-3 py-2 text-[11px] text-foreground tabular-nums" style={{ fontWeight: 500 }}>{r.icp}</td>
            <td className="px-3 py-2 text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{r.engage}</td>
            <td className="px-3 py-2 text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{r.issue}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function FollowUpPersistenceCard({
  value,
  onChange,
  disabled,
  showConfirmButton,
  confirming,
  confirmed,
  onConfirm,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showConfirmButton?: boolean;
  confirming?: boolean;
  confirmed?: boolean;
  onConfirm?: () => void;
}) {
  const clampedValue = Math.max(0, Math.min(value, FOLLOW_UP_PERSISTENCE_LEVELS.length - 1));
  const selected = FOLLOW_UP_PERSISTENCE_LEVELS[clampedValue];
  const ratio = FOLLOW_UP_PERSISTENCE_LEVELS.length === 1 ? 0 : clampedValue / (FOLLOW_UP_PERSISTENCE_LEVELS.length - 1);
  const isLocked = !!disabled || !!confirming;

  return (
    <div className="border border-[#e9e9e7] rounded-xl p-3.5 bg-white">
      <p className="text-[13px] text-foreground mb-2.5" style={{ fontWeight: 500 }}>
        How persistent should the follow-up with the lead be?
      </p>

      <div className="border border-[#e9e9e7] rounded-xl p-3 bg-white">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] text-foreground" style={{ fontWeight: 600 }}>
            {selected.label}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-1 rounded-full border border-foreground/15 bg-foreground/5 text-foreground/80" style={{ fontWeight: 500 }}>
              {selected.cadence}
            </span>
            {confirmed && (
              <span className="text-[10px] px-2 py-1 rounded-full border border-green-200 bg-green-50 text-green-700" style={{ fontWeight: 500 }}>
                Confirmed
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 px-1">
          <div className="relative h-2">
            <div className="h-2 rounded-full bg-[#e5e5e2] overflow-hidden">
              <div className="h-full rounded-full bg-foreground/55 transition-all" style={{ width: `${ratio * 100}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={FOLLOW_UP_PERSISTENCE_LEVELS.length - 1}
              step={1}
              value={clampedValue}
              disabled={isLocked}
              onChange={(event) => onChange(Number(event.target.value))}
              className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Follow-up persistence"
            />
            <span
              className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] bg-foreground pointer-events-none"
              style={{ left: `calc(${ratio * 100}% - 9px)` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-[#9b9a97]" style={{ fontWeight: 500 }}>
            {FOLLOW_UP_PERSISTENCE_LEVELS.map((level) => (
              <span key={level.label}>{level.label}</span>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-[#9b9a97] mt-2.5" style={{ fontWeight: 500 }}>
          {selected.duration} • {selected.touches} • {selected.cadence}
        </p>
        <p className="text-[11px] text-[#6b6a67] mt-1.5" style={{ fontWeight: 400, lineHeight: 1.5 }}>
          {selected.description}
        </p>
        <p className="text-[10px] text-[#9b9a97] mt-1.5" style={{ fontWeight: 400, lineHeight: 1.4 }}>
          {selected.decisionRule}
        </p>

        {showConfirmButton && (
          <div className="mt-2.5">
            <button
              onClick={onConfirm}
              disabled={confirming}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ fontWeight: 500 }}
            >
              {confirming ? "Confirming..." : "Confirm persistence"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CompactCampaignPlan({
  onPreview,
  followUpProfile,
  showDecision,
  selectedAgentId,
  onSelectAgent,
  onConfirmPlan,
  confirming,
  selectionLocked,
}: {
  onPreview: () => void;
  followUpProfile: FollowUpProfile;
  showDecision?: boolean;
  selectedAgentId?: string | null;
  onSelectAgent?: (agentId: string | null) => void;
  onConfirmPlan?: () => void;
  confirming?: boolean;
  selectionLocked?: boolean;
}) {
  return (
    <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-white">
      <div className="px-3.5 py-2.5 border-b border-[#e9e9e7] bg-[#fafaf9]">
        <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
          Agent Plan
        </p>
        <p className="text-[12px] text-foreground mt-1" style={{ fontWeight: 500 }}>
          Campaign execution plan from HubSpot/Salesforce analysis
        </p>
      </div>

      <div className="p-3 space-y-2.5">
        {[
          "Pull stalled opportunities and intent signals from CRM",
          `Set follow-up persistence: ${followUpProfile.label}`,
          `Cadence: ${followUpProfile.cadence} for ${followUpProfile.duration}`,
          `Step schedule: ${followUpProfile.stepSchedule.join(" → ")}`,
          "Generate prompt-first 3-step email sequence",
          "Select CTA strategy by sequence step",
          "Add optional conversational agent routing",
          "Launch and monitor with step-level optimizations",
        ].map((line, index) => (
          <div key={line} className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-[#f4f4f2] text-[9px] text-[#6b6a67] inline-flex items-center justify-center shrink-0 mt-px" style={{ fontWeight: 600 }}>
              {index + 1}
            </span>
            <p className="text-[11px] text-foreground" style={{ fontWeight: 400 }}>
              {line}
            </p>
          </div>
        ))}

        <div className="pt-1 flex items-center gap-2">
          <button
            onClick={onPreview}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
            style={{ fontWeight: 500 }}
          >
            Preview plan
          </button>
          <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
            Compact view before launch
          </span>
        </div>

        {(showDecision || selectionLocked) && (
          <div className="mt-2.5 border border-[#e9e9e7] rounded-lg bg-[#fcfcfb] p-2.5">
            <p className="text-[11px] text-foreground mb-1" style={{ fontWeight: 500 }}>
              Conversational Agent
            </p>
            <p className="text-[10px] text-[#9b9a97] mb-2" style={{ fontWeight: 400 }}>
              Select an agent to qualify leads before AE handoff.
            </p>
            <AgentPicker
              selectedAgentId={selectedAgentId ?? null}
              onSelect={(id) => onSelectAgent?.(id)}
              disabled={!showDecision}
            />

            {showDecision && (
              <div className="pt-2.5">
                <button
                  onClick={onConfirmPlan}
                  disabled={confirming}
                  className="text-[11px] px-3 py-1.5 rounded-lg border border-[#e9e9e7] bg-white hover:bg-[#f7f7f5] disabled:opacity-50 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {confirming ? "Applying plan..." : "Use this plan"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface Suggestion { label: string; primary?: boolean; tooltip?: string; }

function getSuggestionsForState(
  state: CampaignModeState,
  demoStep: number,
): Suggestion[] {
  if (state === "initial") return [];
  if (state === "agents-running") return [];
  if (state === "agent-suggestion") return [];
  if (state === "plan-ready") {
    if (demoStep === 0) return [
      { label: "Preview Emails" },
      {
        label: "Approve & Launch",
        primary: true,
        tooltip:
          "Before launch: generate and validate all personalized drafts. After launch: send Step 1 now and schedule remaining steps by recipient local time.",
      },
    ];
    if (demoStep === 1) return [
      {
        label: "Approve & Launch",
        primary: true,
        tooltip:
          "Before launch: generate and validate all personalized drafts. After launch: send Step 1 now and schedule remaining steps by recipient local time.",
      },
      { label: "Change CTAs" },
    ];
    return [];
  }
  if (state === "launched") return [];
  if (state === "running") {
    if (demoStep === 0) return [
      { label: "Yes, switch CTA for those 4", primary: true },
      { label: "Show high-ICP leads" },
    ];
    if (demoStep === 1) return [
      { label: "Escalate Anna Kumar to AE", primary: true },
      { label: "Switch Priya's CTA" },
    ];
    return [];
  }
  return [];
}

const CTA_EXPLAIN_RESPONSE = `Here's a detailed breakdown of the CTA mismatch for 4 mid-sequence leads:

**Dave Kim (StartupX)** — Downloaded integration whitepaper, had 4-min agent conversation about API. Opens emails consistently but never clicks sales CTAs. He wants technical depth. → Switch to Technical Demo CTA.

**Mike Ross (RetailCo)** — Brief agent conversation, opened Email 1 but didn't click. Low engagement overall — the Case Study CTA feels too "salesy." → Switch to Reply Prompt to invite a casual response.

**Lisa Park (OldCorp)** — Previous closed-lost on pricing. Opened re-engagement email but ROI Calculator CTA didn't land — she already knows pricing. → Switch to Reply Prompt with "what's changed" angle.

**Wei Zhang (LogiCorp)** — Lost on timing, mid-implementation of another tool. Content Piece CTA is too generic. → Switch to Reply Prompt asking if implementation is complete.

The common pattern: these leads engage with subject lines but the CTA ask is misaligned with their intent. Reply Prompts and Technical CTAs have 2.3x higher response rates in this sequence stage.`;

export function CampaignChatPanelV2({
  campaignState,
  chatPreFill = "",
  onStart,
  onPromptClick,
  onAgentSelected,
  onSwitchTab,
  isPaused,
  pendingPrompt,
  onPromptConsumed,
  onboardingMode = "new",
  suggestedCampaign = null,
  campaignData,
}: Props) {
  const timeline = campaignData?.timeline;
  const chainOfThought = campaignData?.chainOfThought ?? CHAIN_OF_THOUGHT;
  const [chatInput, setChatInput] = useState(chatPreFill);
  const [isSending, setIsSending] = useState(false);
  const [buildPhase, setBuildPhase] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [leaderMsgIndex, setLeaderMsgIndex] = useState(0);
  const [leaderDone, setLeaderDone] = useState(false);
  const [showFullDiscussion, setShowFullDiscussion] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>("sam");
  const [followUpPersistence, setFollowUpPersistence] = useState(1);
  const [followUpConfirming, setFollowUpConfirming] = useState(false);
  const [followUpConfirmed, setFollowUpConfirmed] = useState(false);
  const [planApplying, setPlanApplying] = useState(false);
  const [planApplied, setPlanApplied] = useState(false);
  const [planPreviewOpen, setPlanPreviewOpen] = useState(false);
  const [planPreviewOpenStep, setPlanPreviewOpenStep] = useState<number | null>(0);
  const [planDemoStep, setPlanDemoStep] = useState(0);
  const [runningDemoStep, setRunningDemoStep] = useState(0);

  const isSuggestedOnboarding =
    campaignState === "initial" &&
    onboardingMode === "suggested" &&
    !!suggestedCampaign;

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(
    isSuggestedOnboarding ? "pipeline-suggested" : "blank"
  );
  const [onboardingMessages, setOnboardingMessages] = useState<ChatMsg[]>(
    isSuggestedOnboarding && suggestedCampaign
      ? buildSuggestedCampaignSeedMessages(suggestedCampaign)
      : []
  );
  const [completedAnswers, setCompletedAnswers] = useState<QuestionAnswer[]>([]);
  const [followUpMessages, setFollowUpMessages] = useState<ChatMsg[]>([]);

  // Post-onboarding messages (for running state interactions, etc.)
  const initialChatHistory = campaignData?.chatHistory ?? [];
  const enteringRunning = campaignState === "running" && initialChatHistory.length > 0;
  const [postMessages, setPostMessages] = useState<ChatMsg[]>(enteringRunning ? initialChatHistory : []);
  const [runningPostStartIndex, setRunningPostStartIndex] = useState<number | null>(enteringRunning ? 0 : null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldStickToBottomRef = useRef(true);

  useEffect(() => {
    if (chatPreFill) {
      setChatInput(chatPreFill);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [chatPreFill]);

  // agents-running animations
  useEffect(() => {
    if (campaignState === "agents-running") {
      setBuildPhase(0); setVisibleSteps(0); setLeaderMsgIndex(0); setLeaderDone(false);
      const t: ReturnType<typeof setTimeout>[] = [];
      t.push(setTimeout(() => setBuildPhase(1), 80));
      t.push(setTimeout(() => setBuildPhase(2), 1200));
      t.push(setTimeout(() => setBuildPhase(3), 3000));
      chainOfThought.forEach((_, i) => t.push(setTimeout(() => setVisibleSteps(i + 1), 1500 * (i + 1))));
      const agentBase = 1500 * chainOfThought.length + 1200;
      PLAN_THOUGHT_CHAIN.forEach((_, i) => t.push(setTimeout(() => setLeaderMsgIndex(i + 1), agentBase + 1500 * i)));
      t.push(setTimeout(() => setLeaderDone(true), agentBase + 1500 * PLAN_THOUGHT_CHAIN.length));
      return () => t.forEach(clearTimeout);
    }
  }, [campaignState]);

  useEffect(() => {
    if (campaignState === "launched") {
      setLaunchStep(0);
      const t = [setTimeout(() => setLaunchStep(1), 400), setTimeout(() => setLaunchStep(2), 1400), setTimeout(() => setLaunchStep(3), 2400), setTimeout(() => setLaunchStep(4), 3200)];
      return () => t.forEach(clearTimeout);
    }
  }, [campaignState]);

  useEffect(() => {
    if (campaignState === "agent-suggestion") {
      setPlanApplied(false);
      setPlanApplying(false);
      setPlanPreviewOpen(false);
      setShowFullDiscussion(true);
      setSelectedAgentId("sam");
      setFollowUpPersistence(1);
      setFollowUpConfirming(false);
      setFollowUpConfirmed(false);
      setFollowUpMessages([]);
    }
  }, [campaignState]);

  useEffect(() => {
    setRunningPostStartIndex((prev) => {
      if (campaignState !== "running") return null;
      return prev === null ? postMessages.length : prev;
    });
  }, [campaignState, postMessages.length]);

  useEffect(() => {
    if (!shouldStickToBottomRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [campaignState, visibleSteps, leaderMsgIndex, leaderDone, onboardingMessages, followUpMessages, postMessages, launchStep, onboardingStep, planApplying, planApplied, followUpConfirming, followUpConfirmed, planPreviewOpen]);

  // Handle prompts sent from the right panel
  useEffect(() => {
    if (pendingPrompt) {
      setPostMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content: pendingPrompt }]);
      onPromptConsumed?.();
      setIsSending(true);
      setTimeout(() => {
        let response = "I'll look into that for you.";
        if (pendingPrompt.toLowerCase().includes("cta mismatch")) response = CTA_EXPLAIN_RESPONSE;
        setPostMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: response }]);
        setIsSending(false);
      }, 800);
    }
  }, [pendingPrompt]);

  const handleSubmit = () => {
    if (!chatInput.trim() || isSending) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsSending(true);

    // ── Onboarding phase submissions ──
    if (campaignState === "initial") {
      setOnboardingMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content: userMsg }]);

      if (onboardingStep === "blank") {
        setTimeout(() => {
          setOnboardingMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: DOCKET_PIPELINE_SUGGESTION }]);
          setOnboardingStep("pipeline-suggested");
          setIsSending(false);
        }, 600);
        return;
      }

      if (onboardingStep === "pipeline-suggested") {
        const normalized = userMsg.toLowerCase();

        if (
          normalized.includes("yes") ||
          normalized.includes("proceed") ||
          normalized.includes("go ahead") ||
          normalized.includes("start")
        ) {
          if (onboardingMode === "suggested") {
            setTimeout(() => {
              setOnboardingMessages((cur) => [
                ...cur,
                {
                  id: `${Date.now()}-d`,
                  role: "docket",
                  content:
                    "Perfect. Building the agent plan now from warm context, CRM history, and prior engagement signals.",
                },
              ]);
              setOnboardingStep("done");
              setIsSending(false);
              setTimeout(() => onStart(), 500);
            }, 450);
          } else {
            setTimeout(() => {
              setOnboardingMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: DOCKET_QUESTIONS_INTRO }]);
              setOnboardingStep("questions");
              setIsSending(false);
            }, 500);
          }
          return;
        }

        if (
          normalized.includes("no") ||
          normalized.includes("something else") ||
          normalized.includes("different")
        ) {
          setTimeout(() => {
            setOnboardingMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: DOCKET_CUSTOM_PROMPT }]);
            setOnboardingStep("custom-describe");
            setIsSending(false);
          }, 500);
          return;
        }

        setTimeout(() => {
          setOnboardingMessages((cur) => [
            ...cur,
            {
              id: `${Date.now()}-d`,
              role: "docket",
              content:
                onboardingMode === "suggested"
                  ? "If this campaign looks right, click \"Yes, let's proceed\" and I'll start building it."
                  : "If this campaign looks right, click \"Yes, let's do it\" and I'll start building it.",
            },
          ]);
          setIsSending(false);
        }, 400);
        return;
      }

      if (onboardingStep === "custom-describe") {
        setTimeout(() => {
          setOnboardingMessages((cur) => [
            ...cur,
            { id: `${Date.now()}-d`, role: "docket", content: `Got it — "${userMsg}". Let me set that up. I'll analyze your CRM data and create a tailored plan.` },
          ]);
          setOnboardingStep("done");
          setIsSending(false);
          setTimeout(() => onStart(), 800);
        }, 600);
        return;
      }

      setIsSending(false);
      return;
    }

    // ── Post-onboarding submissions ──
    setPostMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content: userMsg }]);

    let response = "Got it — I'll look into that.";
    if (userMsg.toLowerCase().includes("dave") || userMsg.toLowerCase().includes("api")) response = DAVE_KIM_RESPONSE;
    else if (userMsg.toLowerCase().includes("anna") || userMsg.toLowerCase().includes("escalat")) response = ANNA_ESCALATE_RESPONSE;
    else if (userMsg.toLowerCase().includes("priya") || userMsg.toLowerCase().includes("switch")) response = PRIYA_CTA_RESPONSE;

    if (isPaused) {
      response += "\n\nNote: The campaign is currently paused. I can prepare these changes, but they won't take effect until the campaign is resumed. Would you like to resume the campaign?";
    }

    setTimeout(() => {
      setPostMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: response }]);
      setIsSending(false);
    }, 700);
  };

  // ── Onboarding handlers ──

const handlePipelineYes = () => {
    const confirmation = onboardingMode === "suggested" ? "Yes, let's proceed" : "Yes, let's do it";
    setOnboardingMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content: confirmation }]);
    setIsSending(true);
    if (onboardingMode === "suggested") {
      setTimeout(() => {
        setOnboardingMessages((cur) => [
          ...cur,
          {
            id: `${Date.now()}-d`,
            role: "docket",
            content: "Perfect. Building the agent plan now from warm context, CRM history, and prior engagement signals.",
          },
        ]);
        setOnboardingStep("done");
        setIsSending(false);
        setTimeout(() => onStart(), 500);
      }, 450);
      return;
    }
    setTimeout(() => {
      setOnboardingMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: DOCKET_QUESTIONS_INTRO }]);
      setOnboardingStep("questions");
      setIsSending(false);
    }, 500);
  };

  const handlePipelineNo = () => {
    setOnboardingMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content: "No, something else" }]);
    setIsSending(true);
    setTimeout(() => {
      setOnboardingMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: DOCKET_CUSTOM_PROMPT }]);
      setOnboardingStep("custom-describe");
      setIsSending(false);
    }, 500);
  };

  const handleQuestionsComplete = (answers: QuestionAnswer[]) => {
    setCompletedAnswers(answers);
    setOnboardingStep("done");
    setTimeout(() => onStart(), 600);
  };

  const handleQuestionsSkipAll = () => {
    setOnboardingStep("done");
    onStart();
  };

  const handleCustomDescribeSuggestion = (idea: string) => {
    setOnboardingMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content: idea }]);
    setIsSending(true);
    setTimeout(() => {
      setOnboardingMessages((cur) => [
        ...cur,
        { id: `${Date.now()}-d`, role: "docket", content: `Got it — "${idea}". Let me set that up. I'll analyze your CRM data and create a tailored plan.` },
      ]);
      setOnboardingStep("done");
      setIsSending(false);
      setTimeout(() => onStart(), 800);
    }, 500);
  };

  const handleConfirmFollowUpPersistence = () => {
    if (campaignState !== "agent-suggestion" || followUpConfirming || followUpConfirmed) return;
    const selected = FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence];

    setFollowUpConfirming(true);
    setFollowUpMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-u`,
        role: "user",
        content: `Follow-up persistence: ${selected.label}. Confirm and continue.`,
      },
    ]);

    setTimeout(() => {
      setFollowUpMessages((cur) => [
        ...cur,
        {
          id: `${Date.now()}-d`,
          role: "docket",
          content: `Confirmed. I will use ${selected.cadence} for ${selected.duration} and prepare the plan now.`,
        },
      ]);
      setFollowUpConfirming(false);
      setFollowUpConfirmed(true);
    }, 650);
  };

  const handleApplyPlan = () => {
    if (campaignState === "agent-suggestion" && !followUpConfirmed) return;
    if (planApplying || planApplied) return;
    setPlanApplying(true);
    setPostMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-u`,
        role: "user",
        content: `Use this plan (${FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].label}: ${FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].cadence}${selectedAgentId ? ` + ${getAgentById(selectedAgentId)?.name ?? "agent"}` : ""})`,
      },
    ]);
    setTimeout(() => {
      setPlanApplying(false);
      setPlanApplied(true);
      setPostMessages((cur) => [
        ...cur,
        {
          id: `${Date.now()}-d`,
          role: "docket",
          content: "Plan applied. Review the sequence and click Approve & Launch when you're ready.",
        },
      ]);
      onAgentSelected(selectedAgentId);
    }, 450);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 90;
  };

  // ── Suggestion click handler ──

  const handleSuggestionClick = (label: string) => {
    if (label === "Yes, let's proceed") {
      handlePipelineYes();
      return;
    }

    if (label === "No, something else") {
      handlePipelineNo();
      return;
    }

    if (label === "Create a new campaign") {
      setOnboardingMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content: label }]);
      setIsSending(true);
      setTimeout(() => {
        setOnboardingMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: DOCKET_PIPELINE_SUGGESTION }]);
        setOnboardingStep("pipeline-suggested");
        setIsSending(false);
      }, 600);
      return;
    }

    if (campaignState === "initial" && onboardingStep === "custom-describe") {
      if (CUSTOM_CAMPAIGN_QUICK_STARTS.includes(label as (typeof CUSTOM_CAMPAIGN_QUICK_STARTS)[number])) {
        handleCustomDescribeSuggestion(label);
        return;
      }
    }

    // Post-onboarding suggestions
    setPostMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content: label }]);

    if (label === "Preview Emails") {
      setPlanDemoStep(1);
      setTimeout(() => {
        setPostMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: "Showing email previews in the panel →" }]);
        onSwitchTab("emails");
      }, 400);
      return;
    }
    if (label === "Approve & Launch") {
      onPromptClick("Approve & Launch");
      return;
    }
    if (label === "Yes, switch CTA for those 4") {
      setRunningDemoStep(1);
      setTimeout(() => {
        setPostMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: "Done. Switched CTA from Case Study to Reply Prompt for 4 mid-sequence leads. Reply prompts have 2.3x higher response rate in this stage." }]);
      }, 700);
      return;
    }
    if (label === "Show high-ICP leads") {
      setRunningDemoStep(1);
      setTimeout(() => {
        setPostMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: "__HIGH_ICP_TABLE__" }]);
      }, 500);
      return;
    }
    if (label === "Escalate Anna Kumar to AE") {
      setRunningDemoStep(2);
      setTimeout(() => {
        setPostMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: ANNA_ESCALATE_RESPONSE }]);
      }, 700);
      return;
    }
    if (label === "Switch Priya's CTA") {
      setRunningDemoStep(2);
      setTimeout(() => {
        setPostMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: PRIYA_CTA_RESPONSE }]);
      }, 700);
      return;
    }
    if (label === "Change CTAs") {
      setPlanDemoStep(1);
      setTimeout(() => {
        setPostMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: "You can edit CTA and prompt by sequence step in the Emails tab →" }]);
        onSwitchTab("emails");
      }, 400);
      return;
    }
    onPromptClick(label);
  };

  const hasCampaignStarted = campaignState !== "initial";
  const hasAgentPlanningStage =
    campaignState === "agent-suggestion" ||
    campaignState === "plan-ready" ||
    campaignState === "launched" ||
    campaignState === "running";
  const hasPlanReadyHistory =
    campaignState === "plan-ready" ||
    campaignState === "launched" ||
    campaignState === "running";
  const hasLaunchHistory = campaignState === "launched" || campaignState === "running";
  const showPlanContent = hasAgentPlanningStage && (campaignState !== "agent-suggestion" || followUpConfirmed);
  const showAgentDiscussion = hasAgentPlanningStage;
  const demoStep = campaignState === "plan-ready" ? planDemoStep : campaignState === "running" ? runningDemoStep : 0;
  const preRunningPostMessages =
    runningPostStartIndex === null ? postMessages : postMessages.slice(0, runningPostStartIndex);
  const runningOnlyPostMessages =
    runningPostStartIndex === null ? [] : postMessages.slice(runningPostStartIndex);

  let suggestions: Suggestion[];
  if (campaignState === "initial") {
    if (onboardingStep === "blank") {
      suggestions = [{ label: "Create a new campaign", primary: true }];
    } else if (onboardingStep === "pipeline-suggested" && onboardingMode === "suggested") {
      suggestions = [
        { label: "Yes, let's proceed", primary: true },
        { label: "No, something else" },
      ];
    } else if (onboardingStep === "custom-describe") {
      suggestions = [
        { label: CUSTOM_CAMPAIGN_QUICK_STARTS[0], primary: true },
        { label: CUSTOM_CAMPAIGN_QUICK_STARTS[1] },
        { label: CUSTOM_CAMPAIGN_QUICK_STARTS[2] },
      ];
    } else {
      suggestions = [];
    }
  } else {
    suggestions = getSuggestionsForState(campaignState, demoStep);
  }

  // Helper to render a message
  const renderMsg = (msg: ChatMsg) => {
    if (msg.role === "user") return <UserMessage content={msg.content} />;
    if (msg.content === SUGGESTED_CAMPAIGN_SNAPSHOT) {
      return <div className="pl-10"><SuggestedCampaignSnapshot campaign={suggestedCampaign} /></div>;
    }
    if (msg.content === "__HIGH_ICP_TABLE__") {
      return (
        <DocketMessage>
          <p className="text-[13px] text-foreground mb-3" style={{ fontWeight: 400 }}>Found 5 leads with ICP score above 60 but who haven't booked meetings yet:</p>
          <HighICPTable />
          <div className="mt-3 space-y-1">
            <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>Recommendations:</p>
            {["Anna Kumar → Escalate to AE", "Priya Mehta → Switch CTA to Reply Prompt", "Dave Kim → Already adjusted (technical focus)", "Mike & Lisa → Keep in sequence, monitor"].map((r, i) => (
              <p key={i} className="text-[11px] text-[#9b9a97] ml-2" style={{ fontWeight: 400 }}>{r}</p>
            ))}
          </div>
        </DocketMessage>
      );
    }
    return <DocketMessage><p className="text-[13px] text-foreground whitespace-pre-line" style={{ fontWeight: 400, lineHeight: 1.6 }}>{msg.content}</p></DocketMessage>;
  };

  const handlePreviewPlan = () => {
    setShowFullDiscussion(true);
    setPlanPreviewOpenStep(0);
    setPlanPreviewOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
      {/* Scrollable chat area */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-10 py-8 space-y-8">

          {/* ═══ 1. ONBOARDING (initial state only) ═══ */}

          {/* Blank hero */}
          {campaignState === "initial" && onboardingStep === "blank" && onboardingMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500">
              <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center mb-4">
                <span className="text-white text-[14px]" style={{ fontWeight: 700 }}>D</span>
              </div>
              <p className="text-[15px] text-foreground mb-1" style={{ fontWeight: 500 }}>Create a new campaign</p>
              <p className="text-[13px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Describe what you want, or click the suggestion below to get started.</p>
            </div>
          )}

          {/* Onboarding conversation (persist in thread so history is always scrollable) */}
          {onboardingMessages.map((msg) => (
            <div key={msg.id}>{renderMsg(msg)}</div>
          ))}

          {/* Yes/No buttons */}
          {campaignState === "initial" && onboardingStep === "pipeline-suggested" && onboardingMode !== "suggested" && (
            <div className="flex gap-2 animate-in fade-in duration-300">
              <button onClick={handlePipelineYes} className="text-[12px] px-4 py-2 rounded-xl bg-foreground text-white hover:opacity-90 transition-opacity" style={{ fontWeight: 500 }}>Yes, let's do it</button>
              <button onClick={handlePipelineNo} className="text-[12px] px-4 py-2 rounded-xl border border-[#e0dfdd] text-foreground bg-white hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors" style={{ fontWeight: 400 }}>No, something else</button>
            </div>
          )}

          {/* Questions component */}
          {campaignState === "initial" && onboardingStep === "questions" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CampaignQuestions onComplete={handleQuestionsComplete} onSkipAll={handleQuestionsSkipAll} />
            </div>
          )}

          {/* ═══ 2. POST-ONBOARDING (agents-running and beyond) ═══ */}

          {/* Persistent answers context (expanded, not collapsed) */}
          {campaignState !== "initial" && onboardingStep === "done" && completedAnswers.length > 0 && (
            <DocketMessage>
              <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-white">
                <div className="px-3.5 py-2.5 border-b border-[#e9e9e7] bg-[#fafaf9] flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" />
                  <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>
                    Campaign inputs used
                  </p>
                </div>
                <div className="px-3.5 py-2.5 space-y-2">
                  {completedAnswers.map((answer) => (
                    <div key={answer.questionId}>
                      <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                        {answer.question}
                      </p>
                      <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>
                        {answer.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </DocketMessage>
          )}

          {/* Docket "analyzing" intro */}
          {hasCampaignStarted && (
            <DocketMessage>
              <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>{DOCKET_INITIAL}</p>
            </DocketMessage>
          )}

          {/* agents-running animation */}
          {campaignState === "agents-running" && (
            <DocketMessage>
              <div className="space-y-3">
                {buildPhase >= 1 && (
                  <div className="flex items-center gap-2 animate-in fade-in duration-300">
                    <Loader className="text-[#9b9a97]" />
                    <TextShimmer className="text-[12px]" duration={1.8}>Analyzing pipeline...</TextShimmer>
                  </div>
                )}
                {buildPhase >= 2 && (
                  <div className="flex items-center gap-2 animate-in fade-in duration-300">
                    <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded text-white text-[8px] shrink-0" style={{ background: "#ff7a59", fontWeight: 700 }}>H</span>
                    {buildPhase < 3
                      ? <TextShimmer className="text-[11px]" duration={1.5}>Connecting to HubSpot...</TextShimmer>
                      : <span className="text-[11px] text-[#9b9a97] animate-in fade-in" style={{ fontWeight: 400 }}><HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" className="inline-block mr-1" /> HubSpot connected · 34 deals</span>
                    }
                  </div>
                )}
                {buildPhase >= 3 && visibleSteps > 0 && (
                  <div className="space-y-1">
                    {chainOfThought.slice(0, visibleSteps).map((step, i) => (
                      <div key={i} className="text-[11px] flex items-center gap-1.5 animate-in fade-in duration-200">
                        <IconFromKey iconKey={step.iconKey} size={11} color={step.iconKey === "checkmark" ? "#22c55e" : "#d97706"} />
                        <span className="text-foreground" style={{ fontWeight: 400 }}>{step.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                {buildPhase >= 3 && visibleSteps >= 1 && (
                  <div className="border border-[#e9e9e7] rounded-lg overflow-hidden animate-in fade-in duration-300">
                    <div className="px-3 py-2 bg-[#fafaf9] border-b border-[#e9e9e7] flex items-center gap-2">
                      <span className="text-[10px] text-foreground" style={{ fontWeight: 500 }}>Agent plan reasoning</span>
                      <span className="ml-auto text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                        {Math.min(leaderMsgIndex, PLAN_THOUGHT_CHAIN.length)}/{PLAN_THOUGHT_CHAIN.length}
                      </span>
                      {!leaderDone && <div className="w-2.5 h-2.5 border border-[#9b9a97]/40 border-t-foreground/60 rounded-full animate-spin shrink-0" />}
                    </div>
                    <div className="px-3 py-2 space-y-1 max-h-[180px] overflow-y-auto">
                      {leaderMsgIndex === 0
                        ? <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Building plan...</p>
                        : PLAN_THOUGHT_CHAIN.slice(0, leaderMsgIndex).map((line, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-[#f4f4f2] text-[9px] text-[#6b6a67] inline-flex items-center justify-center shrink-0 mt-px" style={{ fontWeight: 600 }}>
                                {i + 1}
                              </span>
                              <p className="text-[11px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.45 }}>{line}</p>
                            </div>
                          ))
                      }
                      {leaderDone && (
                        <div className="flex items-center gap-1.5 pt-1 animate-in fade-in duration-300">
                          <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" />
                          <p className="text-[10px] text-foreground" style={{ fontWeight: 500 }}>Agent plan ready</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DocketMessage>
          )}

          {hasAgentPlanningStage && (
            <DocketMessage>
              <FollowUpPersistenceCard
                value={followUpPersistence}
                onChange={setFollowUpPersistence}
                disabled={campaignState !== "agent-suggestion" || followUpConfirming || followUpConfirmed}
                showConfirmButton={campaignState === "agent-suggestion" && !followUpConfirmed}
                confirming={followUpConfirming}
                confirmed={followUpConfirmed}
                onConfirm={handleConfirmFollowUpPersistence}
              />
            </DocketMessage>
          )}

          {campaignState === "agent-suggestion" && followUpConfirming && !followUpConfirmed && (
            <DocketMessage>
              <div className="border border-[#e9e9e7] rounded-xl p-3 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-[#9b9a97]/40 border-t-foreground/60 rounded-full animate-spin shrink-0" />
                  <p className="text-[11px] text-foreground" style={{ fontWeight: 400 }}>
                    Preparing agent plan based on your persistence selection...
                  </p>
                </div>
              </div>
            </DocketMessage>
          )}

          {followUpMessages.map((msg) => (
            <div key={msg.id}>{renderMsg(msg)}</div>
          ))}

          {/* Agent discussion history (always visible after analysis) */}
          {showAgentDiscussion && (
            <div className="border border-[#e9e9e7] rounded-lg overflow-hidden">
              <button onClick={() => setShowFullDiscussion(!showFullDiscussion)} className="w-full px-3 py-2.5 bg-[#fafaf9] flex items-center gap-2 hover:bg-[#f4f4f2] transition-colors text-left">
                <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" />
                <span className="text-[11px] text-foreground flex-1" style={{ fontWeight: 400 }}>Agent discussion history: warm-context analysis and sequence strategy</span>
                <HugeiconsIcon icon={ArrowDown01Icon} size={10} className={`text-[#9b9a97] transition-transform ${showFullDiscussion ? "" : "rotate-[-90deg]"}`} />
              </button>
              {showFullDiscussion && (
                <div className="px-3 py-2 border-t border-[#e9e9e7] space-y-1">
                  {PLAN_THOUGHT_CHAIN.map((line, i) => (
                    <div key={line} className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#f4f4f2] text-[9px] text-[#6b6a67] inline-flex items-center justify-center shrink-0 mt-px" style={{ fontWeight: 600 }}>
                        {i + 1}
                      </span>
                      <p className="text-[11px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.45 }}>{line}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showPlanContent && (
            <DocketMessage>
              <CompactCampaignPlan
                onPreview={handlePreviewPlan}
                followUpProfile={FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence]}
                showDecision={campaignState === "agent-suggestion"}
                selectedAgentId={selectedAgentId}
                onSelectAgent={setSelectedAgentId}
                onConfirmPlan={handleApplyPlan}
                confirming={planApplying}
                selectionLocked={campaignState !== "agent-suggestion" || planApplied}
              />
            </DocketMessage>
          )}

          {/* Pre-launch interaction messages should appear before plan-ready/launch summaries */}
          {hasCampaignStarted && preRunningPostMessages.map((msg) => (
            <div key={msg.id}>{renderMsg(msg)}</div>
          ))}

          {/* Plan Ready */}
          {hasPlanReadyHistory && (
            <DocketMessage>
              <p className="text-[13px] text-foreground mb-3" style={{ fontWeight: 400, lineHeight: 1.6 }}>
                Plan confirmed. Sequence schedule and intensity now follow the selected follow-up persistence.
              </p>
              <button onClick={() => onSwitchTab("emails")} className="w-full text-left border border-[#e9e9e7] rounded-xl p-3.5 hover:border-foreground/20 hover:shadow-sm transition-all bg-white">
                <p className="text-[11px] text-[#9b9a97] mb-2" style={{ fontWeight: 500 }}>EMAIL SEQUENCE</p>
                <div className="space-y-1.5">
                  {[
                    { color: "#2563eb", text: `Step 1 (${FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].stepSchedule[0]}): Re-engagement opener` },
                    { color: "#f59e0b", text: `Step 2 (${FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].stepSchedule[1]}): Context + proof follow-up` },
                    { color: "#22c55e", text: `Step 3 (${FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].stepSchedule[2]}): Final CTA and close-the-loop` },
                  ].map((row) => (
                    <div key={row.text} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.color }} />
                      <p className="text-[11px] text-foreground" style={{ fontWeight: 400 }}>{row.text}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#9b9a97] mt-2.5" style={{ fontWeight: 400 }}>
                  34 leads · {FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].cadence} · {FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].duration} · View in Emails tab →
                </p>
              </button>
              <p className="text-[10px] text-[#9b9a97] mt-2" style={{ fontWeight: 400 }}>
                Follow-up: {FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].label} · Agent: {selectedAgentId ? getAgentById(selectedAgentId)?.name ?? "Unknown" : "None"}
              </p>
            </DocketMessage>
          )}

          {/* Launch sequence */}
          {hasLaunchHistory && (
            <>
              <UserMessage content="Approve and launch the campaign" />
              <DocketMessage>
                <p className="text-[13px] text-foreground mb-2" style={{ fontWeight: 500 }}>Launching campaign.</p>
                <div className="space-y-1.5">
                  {launchStep >= 1 && <p className="text-[12px] text-[#9b9a97] animate-in fade-in" style={{ fontWeight: 400 }}><HugeiconsIcon icon={MailSend01Icon} size={12} className="inline-block mr-1" /> Generating 34 emails...</p>}
                  {launchStep >= 2 && <p className="text-[12px] text-foreground animate-in fade-in" style={{ fontWeight: 400 }}><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" className="inline-block mr-1" /> Step 1: sending now</p>}
                  {launchStep >= 3 && <><p className="text-[12px] text-foreground animate-in fade-in" style={{ fontWeight: 400 }}><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" className="inline-block mr-1" /> Step 2 ({FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].stepSchedule[1]}): queued for each lead&apos;s local send window</p><p className="text-[12px] text-foreground animate-in fade-in" style={{ fontWeight: 400 }}><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" className="inline-block mr-1" /> Step 3 ({FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].stepSchedule[2]}): queued with timezone-aware cadence</p></>}
                  {launchStep >= 4 && <p className="text-[12px] text-foreground mt-2 animate-in fade-in" style={{ fontWeight: 400 }}>Campaign is live. Tracking in Overview tab.</p>}
                </div>
              </DocketMessage>
            </>
          )}

          {/* Running — campaign-specific timeline */}
          {campaignState === "running" && timeline && (
            <>
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>── {timeline.day1Label} ──</p>
                <div className="space-y-1 text-[12px]" style={{ fontWeight: 400 }}>
                  {timeline.day1Items.map((item, i) => (
                    <p key={i} className="text-foreground flex items-center gap-1.5">
                      <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color={item.isGreen ? "#22c55e" : "#9b9a97"} /> {item.text}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>── {timeline.dayNLabel} ──</p>
                <div className="space-y-1 text-[12px]" style={{ fontWeight: 400 }}>
                  {timeline.dayNItems.map((item, i) => (
                    <p key={i} className="text-foreground flex items-center gap-1.5">
                      <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color={item.isGreen ? "#22c55e" : "#9b9a97"} /> {item.text}
                    </p>
                  ))}
                  {timeline.preSendNote && (
                    <div className="border border-[#e9e9e7] rounded-lg p-2.5 bg-[#fafaf9] ml-3 mt-1">
                      <p className="text-foreground flex items-center gap-1 text-[11px]" style={{ fontWeight: 500 }}><HugeiconsIcon icon={AiChat02Icon} size={11} /> {timeline.preSendNote.title}</p>
                      <p className="text-[#9b9a97] text-[10px]">{timeline.preSendNote.subtitle}</p>
                    </div>
                  )}
                  <p className="text-foreground mt-2 flex items-center gap-1.5"><HugeiconsIcon icon={Calendar03Icon} size={11} /> {timeline.meetingsText}</p>
                </div>
              </div>

              {/* Metrics card */}
              <DocketMessage>
                <button onClick={() => onSwitchTab("overview")} className="w-full text-left border border-[#e9e9e7] rounded-xl p-3.5 hover:border-foreground/20 hover:shadow-sm transition-all bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>{timeline.metricsCard.dayLabel}</p>
                    <span className="text-[10px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200" style={{ fontWeight: 500 }}>{timeline.metricsCard.badge}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>
                    {timeline.metricsCard.stats.map((s, i) => <span key={i}>{s}</span>)}
                  </div>
                  {timeline.metricsCard.warning && (
                    <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1" style={{ fontWeight: 400 }}>⚠ {timeline.metricsCard.warning}</p>
                  )}
                  <p className="text-[10px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>View details →</p>
                </button>
              </DocketMessage>
            </>
          )}

          {/* Running-state interaction messages stay after the live timeline */}
          {campaignState === "running" && runningOnlyPostMessages.map((msg) => (
            <div key={msg.id}>{renderMsg(msg)}</div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {planPreviewOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/45 flex items-center justify-center p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPlanPreviewOpen(false);
          }}
        >
          <div
            className="w-[min(94vw,620px)] rounded-2xl border border-[#e9e9e7] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#e9e9e7] bg-[#fafaf9]">
              <p className="text-[14px] text-foreground" style={{ fontWeight: 600 }}>
                Plan Preview
              </p>
              <p className="text-[11px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>
                Quick review before you continue.
              </p>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-[#e9e9e7] rounded-lg px-3 py-2 bg-[#fcfcfb]">
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Follow-up persistence</p>
                  <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>{FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].label}</p>
                </div>
                <div className="border border-[#e9e9e7] rounded-lg px-3 py-2 bg-[#fcfcfb]">
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Cadence</p>
                  <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>{FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].cadence}</p>
                </div>
              </div>

              <div className="border border-[#e9e9e7] rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-[#fafaf9] border-b border-[#e9e9e7]">
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Email sequence</p>
                </div>
                <div className="divide-y divide-[#efefec]">
                  {PLAN_PREVIEW_SEQUENCE.map((email, index) => {
                    const isOpen = planPreviewOpenStep === index;
                    return (
                      <div key={email.name}>
                        <button
                          onClick={() => setPlanPreviewOpenStep((current) => (current === index ? null : index))}
                          className="w-full text-left px-3 py-2.5 hover:bg-[#fafaf9] transition-colors flex items-center gap-2"
                        >
                          <span className="text-[10px] text-foreground shrink-0" style={{ fontWeight: 600 }}>
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>
                              Step {index + 1} ({FOLLOW_UP_PERSISTENCE_LEVELS[followUpPersistence].stepSchedule[index]}): {email.name}
                            </p>
                            <p className="text-[10px] text-[#9b9a97] line-clamp-1" style={{ fontWeight: 400 }}>
                              {email.subject}
                            </p>
                          </div>
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            size={10}
                            className={`text-[#9b9a97] transition-transform ${isOpen ? "" : "rotate-[-90deg]"}`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-2.5 space-y-2 animate-in fade-in duration-150">
                            <div className="border border-[#e9e9e7] rounded-md bg-[#fcfcfb] px-2.5 py-2">
                              <p className="text-[9px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                                Subject
                              </p>
                              <p className="text-[10px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>
                                {email.subject}
                              </p>
                            </div>
                            <div className="border border-[#e9e9e7] rounded-md bg-[#fcfcfb] px-2.5 py-2">
                              <p className="text-[9px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                                Prompt
                              </p>
                              <p className="text-[10px] text-foreground mt-0.5" style={{ fontWeight: 400, lineHeight: 1.5 }}>
                                {email.prompt}
                              </p>
                            </div>
                            <p className="text-[10px] text-[#6b6a67]" style={{ fontWeight: 400 }}>
                              CTA strategy: {email.cta}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                Agent routing: {selectedAgentId ? getAgentById(selectedAgentId)?.name ?? "Unknown" : "None"}
              </p>
            </div>

            <div className="px-5 py-3 border-t border-[#e9e9e7] bg-white flex items-center justify-end gap-2">
              <button
                onClick={() => setPlanPreviewOpen(false)}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-[#e9e9e7] bg-white hover:bg-[#f7f7f5] transition-colors"
                style={{ fontWeight: 500 }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setPlanPreviewOpen(false);
                  onSwitchTab("emails");
                }}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
                style={{ fontWeight: 500 }}
              >
                Review Emails
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom bar: Suggestions + Input ── */}
      <div className="shrink-0 border-t border-[#e9e9e7] bg-white">
        <div className="max-w-[720px] mx-auto px-10">
          {suggestions.length > 0 && (
            <div className="flex items-center gap-2 pt-3 pb-1 flex-wrap">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSuggestionClick(s.label)}
                  title={s.tooltip}
                  className={`text-[12px] px-4 py-2 rounded-xl transition-all ${
                    s.primary
                      ? "bg-foreground text-white hover:opacity-90"
                      : "border border-[#e0dfdd] text-foreground bg-white hover:bg-[#f7f7f5] hover:border-[#c8c8c6] hover:shadow-sm"
                  }`}
                  style={{ fontWeight: s.primary ? 500 : 400 }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <div className="py-3">
            <PromptInput value={chatInput} onValueChange={setChatInput} isLoading={isSending} onSubmit={handleSubmit}>
              <PromptInputTextarea
                ref={textareaRef}
                placeholder={
                  campaignState === "initial" && onboardingStep === "blank"
                    ? "Describe the campaign you want to create..."
                    : campaignState === "initial" && onboardingStep === "custom-describe"
                    ? "Describe your campaign idea..."
                    : "Type a message..."
                }
              />
              <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
                <PromptInputAction tooltip="Attach files">
                  <button className="w-6 h-6 flex items-center justify-center shrink-0 text-[#9b9a97] hover:text-foreground/60 transition-colors"><HugeiconsIcon icon={Attachment01Icon} size={14} /></button>
                </PromptInputAction>
                <PromptInputAction tooltip={isSending ? "Stop" : "Send"}>
                  <button disabled={!chatInput.trim() && !isSending} onClick={handleSubmit} className="w-7 h-7 rounded-lg bg-foreground text-white flex items-center justify-center shrink-0 disabled:opacity-20 transition-opacity">
                    {isSending ? <HugeiconsIcon icon={StopIcon} size={10} /> : <HugeiconsIcon icon={ArrowUp01Icon} size={13} />}
                  </button>
                </PromptInputAction>
              </PromptInputActions>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}

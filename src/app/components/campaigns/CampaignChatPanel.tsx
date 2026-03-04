import { useEffect, useRef, useState } from "react";
import {
  HugeiconsIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Attachment01Icon,
  CheckmarkBadge02Icon,
  Clock01Icon,
  PlayIcon,
  StopIcon,
  Mail01Icon,
  AiMagicIcon,
  EyeIcon,
  ArrowReloadHorizontalIcon,
  PencilEdit02Icon,
  ClipboardIcon,
  Presentation01Icon,
  Calendar03Icon,
  AiChat02Icon,
  MailSend01Icon,
} from "./icons";
import { IconFromKey } from "./icons";
import type { CampaignModeState } from "./types";
import { AGENT_DISCUSSION_FULL } from "./types";
import { TextShimmer } from "@/components/prompt-kit/text-shimmer";
import { Loader, PulseLoader } from "@/components/prompt-kit/loader";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";

interface Props {
  modeState: CampaignModeState;
  chatPreFill?: string;
  onStart: () => void;
  onPromptClick: (prompt: string) => void;
  onViewCampaign: () => void;
  onMarketingAgentDecided: (accepted: boolean) => void;
}

const CHAIN_OF_THOUGHT = [
  {
    iconKey: "checkmark" as const,
    title: "Pulled 34 deals from HubSpot pipeline",
    detail: "Excluded: Closed-Lost, Active opportunities\nSource: HubSpot Deals API",
  },
  {
    iconKey: "checkmark" as const,
    title: "Enriched warm context for 34 leads across 28 accounts",
    detail:
      "Web activity: 18 with recent pricing visits\nAgent conversations: 6 had prior chats\nEmail history: 22 received marketing emails before\nIntent signals: 8 researching competitors on G2",
  },
  {
    iconKey: "clock" as const,
    title: "Evaluating best approach...",
    detail: "",
  },
];

// Agents that participate in the discussion
const AGENT_ROWS = [
  { key: "CRM Agent",        short: "CR", color: "#2563eb" },
  { key: "Content Agent",    short: "CN", color: "#16a34a" },
  { key: "Lead Analyst",     short: "LA", color: "#d97706" },
  { key: "Email Strategist", short: "ES", color: "#9333ea" },
] as const;

const DOCKET_INITIAL = `I found 34 deals in your HubSpot pipeline that have been stalled for over 30 days. 18 of them have visited your pricing page in the last 2 weeks — that's a strong buying signal going to waste.

Before I create a campaign plan, I need to analyze each deal's full warm context — their web activity, any agent conversations, email history, and CRM data. This takes about 60 seconds.`;

const DOCKET_PLAN = `Here's my plan for re-engaging your 34 stalled deals:

I split them into 3 segments based on warm context:

**Segment A: Hot — 18 leads**
Visited pricing page in last 14 days. 6 had agent conversations.
→ 2 emails over 3 days, aggressive cadence
→ CTA: Booking link (routed to deal owner)

**Segment B: Warm — 10 leads**
Some engagement (email opens, site visits) but no pricing intent.
→ 3 emails over 7 days, moderate cadence
→ CTA: Case study first, then booking link

**Segment C: Re-engage — 6 leads**
Previous closed-lost deals. Split by lost reason:
- 3 lost on pricing → ROI calculator + new pricing tier
- 2 lost on timing → 'Things have changed' + Q4 case study
- 1 lost to competitor → Competitive switching guide
→ 3 emails over 10 days, gentle cadence
→ CTA: Content piece, then booking link

**Total: 34 leads, 3 segments, 8 unique emails.**
Each email will be personalized per lead using their full warm context.`;

const DOCKET_RUNNING = `Day 3 update: 3 meetings booked so far from 34 leads. That's an 8.8% conversion rate — well above the 3% benchmark for re-engagement campaigns.

Segment A is performing strong (78% open rate). The booking link CTA is working well — clicking through at 25%, which is above benchmark for re-engagement. We can switch CTAs at any point based on engagement signals.

Segment C is slower but expected — these are re-engagement leads.

I noticed 4 leads in Segment B opened both emails but never clicked. Likely a CTA mismatch — the subject line is working but the ask isn't landing. Want me to switch their CTA from Case Study to a Reply Prompt?`;

const DAVE_KIM_RESPONSE = `Done. Updated Dave Kim's remaining emails:

**Email 3 (Day 7):**
- Subject: 'Our REST API docs + webhook setup guide'
- Body: References his agent conversation about API integrations
- CTA: Technical documentation link

This is a better fit — Dave's warm context shows he cares about technical depth, not sales conversations. I'll also flag him for your engineering team if he engages with the docs.`;

const ANNA_ESCALATE_RESPONSE = `Escalating Anna Kumar to the AE team now.

Anna Kumar (FinServ, ICP 71) has opened and clicked every email but hasn't booked. This is a hand-raise that needs a human touch.

I've:
· Flagged her in HubSpot as "High Priority — AE Follow-up"
· Assigned to her deal owner for same-day outreach
· Paused her automated email sequence so no duplicate messaging

I'll notify you when the meeting is booked.`;

const HIGH_ICP_TABLE_MSG = `Found 5 leads with ICP score above 60 but who haven't qualified or booked meetings yet:`;

const SLIDES_LOADING_STEPS = [
  "Pulling campaign performance data...",
  "Writing slide copy for each segment...",
  "Building presentation layout...",
];

const PRIYA_CTA_RESPONSE = `Switched Priya Mehta's remaining email CTA from ROI Calculator to Reply Prompt.

New CTA: "Quick question about your evaluation — is there anything specific slowing down the decision?"

Reply prompts have 2.3x higher response rate than calculator CTAs for this segment.`;

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} className="text-[13px] text-foreground mt-3 mb-1" style={{ fontWeight: 600 }}>
          {line.slice(2, -2)}
        </p>
      );
    }
    if (line.startsWith("- ") || line.startsWith("· ")) {
      return (
        <p key={i} className="text-[13px] text-[#37352f] ml-3" style={{ fontWeight: 400, lineHeight: 1.6 }}>
          {line}
        </p>
      );
    }
    if (line.startsWith("→ ")) {
      return (
        <p key={i} className="text-[12px] text-[#9b9a97] ml-3 mt-0.5" style={{ fontWeight: 400, lineHeight: 1.5 }}>
          {line}
        </p>
      );
    }
    if (line === "") return <div key={i} className="h-1" />;
    return (
      <p key={i} className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
        {line}
      </p>
    );
  });
}

interface ChatMessage {
  id: string;
  role: "docket" | "user";
  content: string;
  type?: "table-artifact";
}

export function CampaignChatPanel({
  modeState,
  chatPreFill = "",
  onStart,
  onPromptClick,
  onViewCampaign,
  onMarketingAgentDecided,
}: Props) {
  const [chatInput, setChatInput] = useState(chatPreFill);
  const [isSending, setIsSending] = useState(false);
  // 0=idle 1=thinking 2=hubspot-connecting 3=hubspot-done+chain
  const [buildPhase, setBuildPhase] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [leaderMsgIndex, setLeaderMsgIndex] = useState(0);
  const [leaderDone, setLeaderDone] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [showFullDiscussion, setShowFullDiscussion] = useState(false);
  const [showDay1History, setShowDay1History] = useState(false);
  // Email preview is local state — stays in plan-ready mode
  const [emailPreviewShown, setEmailPreviewShown] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [launchStep, setLaunchStep] = useState(0);
  const [slidesStep, setSlidesStep] = useState(0); // 0=hidden, 1-3=loading, 4=artifact shown
  const [slidesModalOpen, setSlidesModalOpen] = useState(false);
  // Marketing Agent intermediate step
  const [marketingAgentChoice, setMarketingAgentChoice] = useState<"pending" | "yes" | "no" | null>(null);
  const [marketingAgentCreating, setMarketingAgentCreating] = useState(false);
  const [marketingAgentCreated, setMarketingAgentCreated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync chatPreFill from parent (e.g. "For Dave Kim (StartupX): ")
  useEffect(() => {
    if (chatPreFill) {
      setChatInput(chatPreFill);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [chatPreFill]);

  // Stagger build phases → chain-of-thought → agent discussion
  useEffect(() => {
    if (modeState === "agents-running") {
      setBuildPhase(0);
      setVisibleSteps(0);
      setLeaderMsgIndex(0);
      setLeaderDone(false);
      const t: ReturnType<typeof setTimeout>[] = [];

      // Phase 1: thinking shimmer (immediate)
      t.push(setTimeout(() => setBuildPhase(1), 80));
      // Phase 2: HubSpot connecting
      t.push(setTimeout(() => setBuildPhase(2), 1200));
      // Phase 3: HubSpot done → chain steps start appearing alongside
      t.push(setTimeout(() => setBuildPhase(3), 3000));

      // Chain steps: 1500 ms cadence — deliberate, visible pacing
      CHAIN_OF_THOUGHT.forEach((_, i) => {
        t.push(setTimeout(() => setVisibleSteps(i + 1), 1500 * (i + 1)));
      });

      // Agent discussion: 1200 ms after last chain step
      const agentBase = 1500 * CHAIN_OF_THOUGHT.length + 1200;
      AGENT_DISCUSSION_FULL.forEach((_, i) => {
        t.push(setTimeout(() => setLeaderMsgIndex(i + 1), agentBase + 1800 * i));
      });
      t.push(setTimeout(() => setLeaderDone(true), agentBase + 1800 * AGENT_DISCUSSION_FULL.length));

      return () => t.forEach(clearTimeout);
    }
  }, [modeState]);

  // Launch sequence animation
  useEffect(() => {
    if (modeState === "launched") {
      setLaunchStep(0);
      const timers = [
        setTimeout(() => setLaunchStep(1), 400),
        setTimeout(() => setLaunchStep(2), 1400),
        setTimeout(() => setLaunchStep(3), 2400),
        setTimeout(() => setLaunchStep(4), 3200),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [modeState]);

  // Slides chain animation: step 1-3 loads, then 4 = done
  useEffect(() => {
    if (slidesStep >= 1 && slidesStep <= 3) {
      const timer = setTimeout(() => setSlidesStep((s) => s + 1), 900);
      return () => clearTimeout(timer);
    }
  }, [slidesStep]);

  // Marketing Agent suggestion — show buttons after a brief delay
  useEffect(() => {
    if (modeState === "agent-suggestion") {
      const timer = setTimeout(() => setMarketingAgentChoice("pending"), 600);
      return () => clearTimeout(timer);
    }
  }, [modeState]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [modeState, visibleSteps, leaderMsgIndex, leaderDone, messages, launchStep, emailPreviewShown, slidesStep, marketingAgentChoice, marketingAgentCreating, marketingAgentCreated]);

  const handleSubmit = () => {
    if (!chatInput.trim() || isSending) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsSending(true);

    const prev = [...messages, { id: `${Date.now()}-u`, role: "user" as const, content: userMsg }];
    setMessages(prev);

    let response = "Got it — I'll look into that and get back to you shortly.";
    if (userMsg.toLowerCase().includes("dave kim") || userMsg.toLowerCase().includes("api") || userMsg.toLowerCase().includes("technical")) {
      response = DAVE_KIM_RESPONSE;
    } else if (userMsg.toLowerCase().includes("anna") || userMsg.toLowerCase().includes("escalat")) {
      response = ANNA_ESCALATE_RESPONSE;
    } else if (userMsg.toLowerCase().includes("priya") || userMsg.toLowerCase().includes("switch")) {
      response = PRIYA_CTA_RESPONSE;
    }

    setTimeout(() => {
      setMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: response }]);
      setIsSending(false);
    }, 700);
  };

  const handlePromptClick = (prompt: string) => {
    // Email preview is handled locally — stay in plan-ready, just show artifact
    if (prompt === "Preview Emails") {
      setEmailPreviewShown(true);
      return;
    }
    // Table artifact handled locally in running mode
    if (prompt === "Show non-qualified leads with high ICP score") {
      const prev = [
        ...messages,
        { id: `${Date.now()}-u`, role: "user" as const, content: prompt },
        { id: `${Date.now()}-d`, role: "docket" as const, content: HIGH_ICP_TABLE_MSG, type: "table-artifact" as const },
      ];
      setMessages(prev);
      return;
    }
    // "Looks good, launch it" → same as Approve & Launch
    if (prompt === "Looks good, launch it") {
      onPromptClick("Approve & Launch");
      return;
    }
    // Custom slides — show loading chain then artifact
    if (prompt === "Create custom slides") {
      setMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user" as const, content: "Create custom slides for this campaign" }]);
      setSlidesStep(1);
      return;
    }
    onPromptClick(prompt);
  };

  // Prompt sets per state
  const planReadyPrompts = emailPreviewShown
    ? ["Show Tom Liu's version", "Show Segment B emails", "Change tone to more casual", "Looks good, launch it"]
    : ["Approve & Launch", "Preview Emails", "Change CTAs", "Modify Segments"];

  const runningPrompts = ["Yes, switch CTA for those 4", "Show me the 4 leads", "Show non-qualified leads with high ICP score", "How's Segment C doing?", "Create custom slides"];

  const currentPrompts = modeState === "plan-ready" ? planReadyPrompts : modeState === "running" ? runningPrompts : [];

  // Whether agents have already run (agent-suggestion and beyond)
  const agentsRan = modeState === "agent-suggestion" || modeState === "plan-ready" || modeState === "launched" || modeState === "running";

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
      {/* Artifact index — right edge strip */}
      {agentsRan && (
        <div className="absolute right-2 top-4 flex flex-col gap-2 z-10">
          {modeState !== "running" && (
            <>
              <IndexMarker label="Chain of thought" active={false} />
              <IndexMarker label="Docket Leader" active={false} />
            </>
          )}
          <IndexMarker
            label={modeState === "running" ? "Day 3 results" : "Campaign Plan"}
            active
          />
        </div>
      )}

      {/* ── Scrollable chat area ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-10 py-8 space-y-6">

        {/* Initial Docket message — visible in all non-running states */}
        {modeState !== "running" && (
          <DocketMessage>{renderMarkdown(DOCKET_INITIAL)}</DocketMessage>
        )}

        {/* ── agents-running: rich animated build experience ─────────────── */}
        {modeState === "agents-running" && (
          <div className="space-y-3">
            {/* Phase 1: thinking shimmer + dots */}
            {buildPhase >= 1 && (
              <div className="flex items-center gap-2 animate-in fade-in duration-300">
                <Loader className="text-[#9b9a97]" />
                <TextShimmer duration={1.8}>Thinking of next steps...</TextShimmer>
              </div>
            )}

            {/* Phase 2+: HubSpot connection */}
            {buildPhase >= 2 && (
              <div className="flex items-center gap-2 animate-in fade-in duration-300">
                <span
                  className="inline-flex items-center justify-center w-[18px] h-[18px] rounded text-white text-[9px] shrink-0"
                  style={{ background: "#ff7a59", fontWeight: 700 }}
                >
                  H
                </span>
                {buildPhase < 3 ? (
                  <TextShimmer className="text-[12px]" duration={1.5}>
                    Connecting to HubSpot · pulling latest pipeline data
                  </TextShimmer>
                ) : (
                  <span className="text-[12px] text-[#9b9a97] animate-in fade-in duration-300" style={{ fontWeight: 400 }}>
                    <HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" className="inline-block mr-1" /> HubSpot connected · 34 stalled deals found
                  </span>
                )}
              </div>
            )}

            {/* Phase 3+: chain of thought steps */}
            {buildPhase >= 3 && visibleSteps > 0 && (
              <div className="space-y-1.5">
                {CHAIN_OF_THOUGHT.slice(0, visibleSteps).map((step, i) => (
                  <div
                    key={i}
                    className="text-[12px] text-[#9b9a97] flex items-start gap-2 animate-in fade-in duration-300"
                    style={{ fontWeight: 400, lineHeight: 1.5 }}
                  >
                    <span className="shrink-0 mt-px"><IconFromKey iconKey={step.iconKey} size={12} color={step.iconKey === "checkmark" ? "#22c55e" : "#d97706"} /></span>
                    <div>
                      <span className="text-foreground" style={{ fontWeight: 500 }}>{step.title}</span>
                      {step.detail && (
                        <p className="text-[#9b9a97] whitespace-pre-line mt-0.5">{step.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Agent discussion — appears after HubSpot done + first step visible */}
            {buildPhase >= 3 && visibleSteps >= 1 && (
              <div className="border border-[#e9e9e7] rounded-xl overflow-hidden animate-in fade-in duration-300">
                {/* Header */}
                <div className="px-3 py-2.5 bg-[#fafaf9] border-b border-[#e9e9e7] space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                      <span className="text-white text-[9px]" style={{ fontWeight: 700 }}>D</span>
                    </div>
                    <span className="text-[11px] text-foreground" style={{ fontWeight: 600 }}>Docket</span>
                    <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>· Agent discussion</span>
                    {!leaderDone && (
                      <div className="ml-auto w-3 h-3 border border-[#9b9a97]/40 border-t-foreground/60 rounded-full animate-spin shrink-0" />
                    )}
                  </div>
                  {/* Agent status shimmer */}
                  {!leaderDone && (
                    <TextShimmer className="text-[11px]" duration={2.2}>
                      Agents are analyzing lead signals and discussing segmentation strategy...
                    </TextShimmer>
                  )}
                  {/* Co-agent rows with pulse loaders */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {AGENT_ROWS.map((agent) => {
                      const hasSpoken = leaderMsgIndex > 0 &&
                        AGENT_DISCUSSION_FULL.slice(0, leaderMsgIndex).some((m) => m.agent === agent.key);
                      return (
                        <div key={agent.key} className="flex items-center gap-1.5">
                          <PulseLoader color={agent.color} done={hasSpoken} />
                          <span className="text-[9px]" style={{ color: agent.color, fontWeight: 700 }}>{agent.short}</span>
                          <span className="text-[10px] text-[#9b9a97] truncate" style={{ fontWeight: 400 }}>{agent.key}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Messages */}
                <div className="p-3 space-y-2">
                  {leaderMsgIndex === 0 ? (
                    <p className="text-[12px] text-[#9b9a97] py-1 pl-1" style={{ fontWeight: 400 }}>Starting agent discussion...</p>
                  ) : (
                    AGENT_DISCUSSION_FULL.slice(0, leaderMsgIndex).map((msg, i) => (
                      <AgentChatBubble key={i} msg={msg} />
                    ))
                  )}
                  {leaderDone && (
                    <div className="flex items-center gap-1.5 py-1 pl-1 animate-in fade-in duration-300">
                      <HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" />
                      <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Analysis complete — building plan...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── agentsRan: collapsed historical view ───────────────────────── */}
        {agentsRan && (
          <>
            <div className="space-y-1">
              {CHAIN_OF_THOUGHT.map((step, i) => {
                if (!showAllSteps && i < CHAIN_OF_THOUGHT.length - 2) return null;
                return (
                  <div key={i} className="text-[12px] text-[#9b9a97] flex items-start gap-2" style={{ fontWeight: 400, lineHeight: 1.5 }}>
                    <span className="shrink-0 mt-px"><IconFromKey iconKey={step.iconKey} size={12} color={step.iconKey === "checkmark" ? "#22c55e" : "#d97706"} /></span>
                    <div>
                      <span className="text-foreground" style={{ fontWeight: 500 }}>{step.title}</span>
                      {step.detail && <p className="text-[#9b9a97] whitespace-pre-line mt-0.5">{step.detail}</p>}
                    </div>
                  </div>
                );
              })}
              {CHAIN_OF_THOUGHT.length > 2 && (
                <button
                  onClick={() => setShowAllSteps(!showAllSteps)}
                  className="text-[11px] text-[#9b9a97] hover:text-foreground/70 transition-colors flex items-center gap-1 ml-1 mt-1"
                >
                  {showAllSteps
                    ? <><HugeiconsIcon icon={ArrowDown01Icon} size={10} /> Hide earlier steps</>
                    : <><HugeiconsIcon icon={ArrowDown01Icon} size={10} className="rotate-[-90deg]" /> Show earlier steps ({CHAIN_OF_THOUGHT.length - 2} collapsed)</>}
                </button>
              )}
            </div>

            <div className="border border-[#e9e9e7] rounded-xl overflow-hidden">
              <div className="px-3 py-2.5 bg-[#fafaf9] border-b border-[#e9e9e7] space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                    <span className="text-white text-[9px]" style={{ fontWeight: 700 }}>D</span>
                  </div>
                  <span className="text-[11px] text-foreground" style={{ fontWeight: 600 }}>Docket</span>
                  <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>· Agent discussion</span>
                </div>
                <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                  4 agents analyzed lead signals, segmented by engagement, and planned email strategy
                </p>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-1.5 py-1 pl-1">
                  <HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" />
                  <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Analysis complete</p>
                </div>
                {showFullDiscussion && AGENT_DISCUSSION_FULL.map((msg, i) => (
                  <AgentChatBubble key={i} msg={msg} />
                ))}
                <button
                  onClick={() => setShowFullDiscussion(!showFullDiscussion)}
                  className="text-[11px] text-[#9b9a97] hover:text-foreground/70 transition-colors flex items-center gap-1 pl-1 mt-0.5"
                >
                  {showFullDiscussion
                    ? <><HugeiconsIcon icon={ArrowDown01Icon} size={10} /> Collapse</>
                    : <><HugeiconsIcon icon={ArrowDown01Icon} size={10} className="rotate-[-90deg]" /> View discussion ({AGENT_DISCUSSION_FULL.length} messages)</>}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Marketing Agent suggestion — intermediate step */}
        {(modeState === "agent-suggestion" ||
          ((modeState === "plan-ready" || modeState === "launched") && marketingAgentChoice !== null)) && (
          <DocketMessage>
            <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
              For this campaign, we suggest creating a dedicated <span style={{ fontWeight: 600 }}>Marketing Agent</span>. When sending outbound emails, recipients can interact with this agent to learn more — enriching their context and warming them up before your team engages.
            </p>

            {/* Yes/No buttons — only when pending */}
            {marketingAgentChoice === "pending" && (
              <div className="flex gap-2 mt-3 animate-in fade-in duration-300">
                <button
                  onClick={() => {
                    setMarketingAgentChoice("yes");
                    setMarketingAgentCreating(true);
                    onMarketingAgentDecided(true);
                    setTimeout(() => {
                      setMarketingAgentCreating(false);
                      setMarketingAgentCreated(true);
                    }, 2000);
                  }}
                  className="text-[12px] px-4 py-2 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
                  style={{ fontWeight: 500 }}
                >
                  Yes, create it
                </button>
                <button
                  onClick={() => {
                    setMarketingAgentChoice("no");
                    onMarketingAgentDecided(false);
                  }}
                  className="text-[12px] px-4 py-2 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  No, skip
                </button>
              </div>
            )}

            {/* User chose "Yes" — show selected pill */}
            {marketingAgentChoice === "yes" && (
              <div className="mt-3 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-white text-[12px]"
                  style={{ fontWeight: 500 }}>
                  <HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="white" /> Yes, create it
                </div>
              </div>
            )}

            {/* User chose "No" — show skipped pill */}
            {marketingAgentChoice === "no" && (
              <div className="mt-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f7f7f5] border border-[#e9e9e7] text-[12px] text-[#9b9a97]"
                  style={{ fontWeight: 400 }}>
                  Skipped
                </div>
              </div>
            )}

            {/* Creating shimmer */}
            {marketingAgentCreating && (
              <div className="flex items-center gap-2 mt-3 animate-in fade-in duration-300">
                <Loader className="text-[#9b9a97]" />
                <TextShimmer duration={1.8}>Creating a marketing agent for this campaign...</TextShimmer>
              </div>
            )}

            {/* Created confirmation */}
            {marketingAgentCreated && (
              <div className="mt-3 flex items-center gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkBadge02Icon} size={14} color="#22c55e" />
                  <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>
                    Marketing Agent created
                  </p>
                </div>
                <button
                  onClick={() => window.open("#", "_blank")}
                  className="text-[12px] px-3 py-1.5 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] hover:border-[#c8c8c6] transition-colors flex items-center gap-1.5"
                  style={{ fontWeight: 400 }}
                >
                  Open in New Tab <span className="text-[10px]">↗</span>
                </button>
              </div>
            )}
          </DocketMessage>
        )}

        {/* Plan Ready — Docket plan message */}
        {(modeState === "plan-ready" || modeState === "launched") && (
          <DocketMessage>{renderMarkdown(DOCKET_PLAN)}</DocketMessage>
        )}

        {/* Email preview artifact — local state, stays in plan-ready */}
        {modeState === "plan-ready" && emailPreviewShown && (
          <>
            <UserMessage content="Preview Emails" />
            <DocketMessage>
              <p className="text-[13px] text-foreground mb-3" style={{ fontWeight: 400 }}>
                Here's Email 1 for Segment A. Each lead gets a personalized version. Showing Sarah Chen's version:
              </p>
              <EmailPreviewCard />
            </DocketMessage>
          </>
        )}

        {/* Launch sequence */}
        {modeState === "launched" && (
          <>
          <UserMessage content="Approve & Launch" />
          <DocketMessage>
            <p className="text-[13px] text-foreground mb-2.5" style={{ fontWeight: 500 }}>
              Launching Re-engage Stalled Pipeline Deals.
            </p>
            <div className="space-y-1.5">
              {launchStep >= 1 && (
                <p className="text-[13px] text-[#9b9a97] animate-in fade-in" style={{ fontWeight: 400 }}>
                  <HugeiconsIcon icon={MailSend01Icon} size={13} color="currentColor" className="inline-block mr-1" /> 34 personalized emails being generated...
                </p>
              )}
              {launchStep >= 2 && (
                <p className="text-[13px] text-foreground animate-in fade-in" style={{ fontWeight: 400 }}>
                  <HugeiconsIcon icon={CheckmarkBadge02Icon} size={13} color="#22c55e" className="inline-block mr-1" /> Segment A (18 leads): Emails ready, sending now
                </p>
              )}
              {launchStep >= 3 && (
                <>
                  <p className="text-[13px] text-foreground animate-in fade-in" style={{ fontWeight: 400 }}>
                    <HugeiconsIcon icon={CheckmarkBadge02Icon} size={13} color="#22c55e" className="inline-block mr-1" /> Segment B (10 leads): Emails generated, sending at 9am tomorrow
                  </p>
                  <p className="text-[13px] text-foreground animate-in fade-in" style={{ fontWeight: 400 }}>
                    <HugeiconsIcon icon={CheckmarkBadge02Icon} size={13} color="#22c55e" className="inline-block mr-1" /> Segment C (6 leads): Emails generated, sending at 9am tomorrow
                  </p>
                </>
              )}
              {launchStep >= 4 && (
                <div className="mt-3 animate-in fade-in">
                  <p className="text-[13px] text-foreground mb-3" style={{ fontWeight: 400 }}>
                    Campaign is live. I'll monitor engagement and alert you if anything needs attention. Redirecting you to the campaign homepage…
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={onViewCampaign}
                      className="text-[12px] px-3 py-1.5 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity"
                      style={{ fontWeight: 500 }}
                    >
                      View Campaign →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </DocketMessage>
          </>
        )}

        {/* Running campaign — Day 3 demo */}
        {modeState === "running" && (
          <>
            <button
              onClick={() => setShowDay1History(!showDay1History)}
              className="text-[11px] text-[#9b9a97] hover:text-foreground/70 transition-colors flex items-center gap-1"
            >
              {showDay1History ? <HugeiconsIcon icon={ArrowDown01Icon} size={10} /> : <HugeiconsIcon icon={ArrowDown01Icon} size={10} className="rotate-[-90deg]" />}
              Campaign creation conversation (collapsed)
            </button>
            {showDay1History && (
              <div className="border border-[#e9e9e7] rounded-xl p-4 bg-[#fafaf9]">
                <p className="text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                  [Campaign planning, agent discussion, and email preview from Day 0]
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>── DAY 1 ──</p>
              <div className="space-y-1 text-[12px]" style={{ fontWeight: 400 }}>
                <p className="text-foreground flex items-center gap-1"><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" /> Segment A: Email 1 sent to 18 leads</p>
                <p className="text-[#9b9a97] ml-5">Opened: 14 (78%) · Clicked: 6 (33%) · Replied: 2</p>
                <p className="text-foreground flex items-center gap-1"><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" /> Segment B: Email 1 sent to 10 leads</p>
                <p className="text-[#9b9a97] ml-5">Opened: 7 (70%) · Clicked: 2 (20%)</p>
                <p className="text-foreground flex items-center gap-1"><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" /> Segment C: Email 1 sent to 6 leads</p>
                <p className="text-[#9b9a97] ml-5">Opened: 3 (50%) · Clicked: 1 (17%)</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>── DAY 3 (Today) ──</p>
              <div className="space-y-1 text-[12px]" style={{ fontWeight: 400 }}>
                <p className="text-foreground flex items-center gap-1"><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" /> Segment A: Email 2 sent to 16 leads</p>
                <p className="text-[#9b9a97] ml-3">(2 excluded: Sarah Chen replied, Tom Liu booked)</p>
                <p className="text-[#9b9a97] ml-3">Opened: 10 (63%) · Clicked: 4 (25%)</p>
                <div className="border border-[#e9e9e7] rounded-lg p-3 bg-[#fafaf9] ml-3 mt-1.5">
                  <p className="text-foreground mb-1 flex items-center gap-1" style={{ fontWeight: 500 }}><HugeiconsIcon icon={AiChat02Icon} size={12} /> Pre-send adjustment: Email 2 for James Wong</p>
                  <p className="text-[#9b9a97]">Signal: Visited pricing page 3x yesterday</p>
                  <p className="text-[#9b9a97]">Change: CTA upgraded from Case Study → Booking link</p>
                  <p className="text-foreground mt-0.5 flex items-center gap-1">Result: James clicked and booked <HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" /></p>
                </div>
                <p className="text-foreground mt-2 flex items-center gap-1"><HugeiconsIcon icon={Calendar03Icon} size={12} /> Meetings booked: 3</p>
                <p className="text-[#9b9a97] ml-3">Sarah Chen (Acme) — replied, booked with AE</p>
                <p className="text-[#9b9a97] ml-3">Tom Liu (Datadog) — clicked booking link</p>
                <p className="text-[#9b9a97] ml-3">James Wong (CloudBase) — pre-send upgrade worked</p>
              </div>
            </div>

            <DocketMessage>{renderMarkdown(DOCKET_RUNNING)}</DocketMessage>

            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === "user" ? (
                  <UserMessage content={msg.content} />
                ) : msg.type === "table-artifact" ? (
                  <DocketMessage>
                    <p className="text-[13px] text-foreground mb-3" style={{ fontWeight: 400 }}>{msg.content}</p>
                    <HighICPTable />
                    <div className="mt-3 space-y-1">
                      <p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>Recommendations:</p>
                      {[
                        "1. Anna Kumar → Escalate to AE immediately",
                        "2. Priya Mehta → Switch CTA to Reply Prompt",
                        "3. Dave Kim → Already adjusted (technical focus)",
                        "4. Mike & Lisa → Keep in sequence, monitor",
                      ].map((r, i) => (
                        <p key={i} className="text-[12px] text-[#9b9a97] ml-2" style={{ fontWeight: 400 }}>{r}</p>
                      ))}
                    </div>
                  </DocketMessage>
                ) : (
                  <DocketMessage>{renderMarkdown(msg.content)}</DocketMessage>
                )}
              </div>
            ))}

            {/* Slides loading chain + artifact */}
            {slidesStep >= 1 && (
              <DocketMessage>
                <div className="space-y-1.5">
                  {SLIDES_LOADING_STEPS.slice(0, Math.min(slidesStep, 3)).map((step, i) => (
                    <div key={i} className="flex items-center gap-2 animate-in fade-in duration-300 text-[12px]">
                      <span>{slidesStep > i + 1 || slidesStep >= 4 ? <HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" /> : <HugeiconsIcon icon={Clock01Icon} size={12} color="#d97706" />}</span>
                      <span className={slidesStep > i + 1 || slidesStep >= 4 ? "text-foreground" : "text-[#9b9a97]"} style={{ fontWeight: 400 }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
                {slidesStep >= 4 && (
                  <div className="mt-3">
                    <p className="text-[13px] text-foreground mb-2.5 animate-in fade-in" style={{ fontWeight: 400 }}>
                      Here are your campaign slides — I've pulled the Day 3 results into 4 slides. Click to open in full view.
                    </p>
                    <SlidesArtifact onOpen={() => setSlidesModalOpen(true)} />
                  </div>
                )}
              </DocketMessage>
            )}
          </>
        )}

        {/* Suggested prompt pills */}
        {currentPrompts.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {currentPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handlePromptClick(p)}
                className="text-[12px] px-4 py-2 rounded-xl border border-[#e0dfdd] text-foreground bg-white hover:bg-[#f7f7f5] hover:border-[#c8c8c6] hover:shadow-sm transition-all"
                style={{ fontWeight: 450 }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Secondary prompts after high-ICP table */}
        {modeState === "running" && messages.some((m) => m.type === "table-artifact") && (
          <div className="flex flex-wrap gap-2">
            {["Escalate Anna Kumar to AE", "Switch Priya's CTA", "Show me Anna's full warm context"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  const prev = [...messages, { id: `${Date.now()}-u`, role: "user" as const, content: p }];
                  let response = "Got it — on it!";
                  if (p.includes("Anna") && p.includes("Escalat")) response = ANNA_ESCALATE_RESPONSE;
                  else if (p.includes("Priya")) response = PRIYA_CTA_RESPONSE;
                  else if (p.includes("Anna") && p.includes("warm")) response = "Anna Kumar has visited our pricing page, opened every email, and clicked every CTA. She's clearly evaluating — but hasn't booked. She likely needs a direct, personal touch from an AE rather than another automated email. ICP Score: 71.";
                  setMessages(prev);
                  setTimeout(() => setMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: response }]), 700);
                }}
                className="text-[12px] px-4 py-2 rounded-xl border border-[#e0dfdd] text-foreground bg-white hover:bg-[#f7f7f5] hover:border-[#c8c8c6] hover:shadow-sm transition-all"
                style={{ fontWeight: 450 }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
        </div>
      </div>

      {/* Start button — initial state only */}
      {modeState === "initial" && (
        <div className="shrink-0 flex justify-center pb-6">
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-foreground text-white text-[14px] hover:opacity-90 transition-opacity shadow-sm"
            style={{ fontWeight: 500 }}
          >
            <HugeiconsIcon icon={PlayIcon} size={14} /> Start
          </button>
        </div>
      )}

      {/* Chat input */}
      <div className="shrink-0 border-t border-[#e9e9e7] bg-white">
        <div className="max-w-[720px] mx-auto px-10 py-4">
          <PromptInput
            value={chatInput}
            onValueChange={setChatInput}
            isLoading={isSending}
            onSubmit={handleSubmit}
          >
            <PromptInputTextarea ref={textareaRef} placeholder="Type a message..." />
            <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
              <PromptInputAction tooltip="Attach files">
                <button className="w-6 h-6 flex items-center justify-center shrink-0 text-[#9b9a97] hover:text-foreground/60 transition-colors">
                  <HugeiconsIcon icon={Attachment01Icon} size={14} />
                </button>
              </PromptInputAction>
              <PromptInputAction tooltip={isSending ? "Stop generation" : "Send message"}>
                <button
                  disabled={!chatInput.trim() && !isSending}
                  onClick={handleSubmit}
                  className="w-7 h-7 rounded-lg bg-foreground text-white flex items-center justify-center shrink-0 disabled:opacity-20 transition-opacity"
                >
                  {isSending
                    ? <HugeiconsIcon icon={StopIcon} size={10} />
                    : <HugeiconsIcon icon={ArrowUp01Icon} size={13} />}
                </button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>

      {/* Slides full-view modal */}
      {slidesModalOpen && <SlidesModal onClose={() => setSlidesModalOpen(false)} />}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

const AGENT_META: Record<string, { color: string; bg: string; short: string }> = {
  "CRM Agent":       { color: "#2563eb", bg: "#eff6ff", short: "CR" },
  "Content Agent":   { color: "#16a34a", bg: "#f0fdf4", short: "CN" },
  "Lead Analyst":    { color: "#d97706", bg: "#fffbeb", short: "LA" },
  "Email Strategist":{ color: "#9333ea", bg: "#faf5ff", short: "ES" },
};

function AgentChatBubble({ msg }: { msg: { agent: string; message: string } }) {
  const meta = AGENT_META[msg.agent] ?? { color: "#37352f", bg: "#f7f7f5", short: "?" };
  return (
    <div className="flex items-start gap-2 animate-in fade-in duration-300">
      {/* Agent avatar */}
      <div
        className="w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[8px]"
        style={{ background: meta.bg, color: meta.color, fontWeight: 700 }}
      >
        {meta.short}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] mb-0.5" style={{ fontWeight: 600, color: meta.color }}>{msg.agent}</p>
        <div className="rounded-xl rounded-tl-none px-3 py-2" style={{ background: meta.bg }}>
          <p className="text-[12px] text-[#37352f]" style={{ fontWeight: 400, lineHeight: 1.5 }}>{msg.message}</p>
        </div>
      </div>
    </div>
  );
}

function IndexMarker({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-foreground" : "bg-[#c8c8c6]"}`} />
      <span
        className={`text-[10px] ${active ? "text-foreground" : "text-[#9b9a97]"}`}
        style={{ fontWeight: active ? 500 : 400 }}
      >
        {label}
      </span>
    </div>
  );
}

function DocketMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-1">
        <span className="text-white text-[11px]" style={{ fontWeight: 700 }}>D</span>
      </div>
      <div className="flex-1 min-w-0 bg-[#fafaf9] rounded-2xl rounded-tl-md px-5 py-4 border border-[#eeeeec]">{children}</div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end pl-12">
      <div className="bg-foreground text-white rounded-2xl rounded-tr-md px-5 py-3">
        <p className="text-[13px]" style={{ fontWeight: 400, lineHeight: 1.5 }}>{content}</p>
      </div>
    </div>
  );
}

function EmailPreviewCard() {
  return (
    <div className="border border-[#e9e9e7] rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-[#f7f7f5] border-b border-[#e9e9e7]">
        <span className="text-[12px] text-foreground flex items-center gap-1.5" style={{ fontWeight: 500 }}><HugeiconsIcon icon={Mail01Icon} size={12} /> EMAIL PREVIEW</span>
      </div>
      <div className="px-4 py-4 space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>To: Sarah Chen (Acme Corp)</p>
          <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Subject: "Quick question about your manufacturing stack evaluation"</p>
        </div>
        <div className="border-t border-[#e9e9e7] pt-3 space-y-2.5">
          <p className="text-[13px] text-foreground" style={{ fontWeight: 400 }}>Hi Sarah,</p>
          <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
            I noticed your team has been exploring our manufacturing solutions — you've visited our pricing page a few times this month, and we had a great conversation about enterprise security compliance back in February.
          </p>
          <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
            Since then, we've launched our SOC 2 compliance module — which directly addresses the concerns you raised about audit trails.
          </p>
          <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
            Worth a quick chat? Here's my calendar if you'd like to pick a time: <span className="text-blue-600 underline underline-offset-2">docket.io/book/sandeep</span>
          </p>
          <p className="text-[13px] text-foreground pt-1" style={{ fontWeight: 400 }}>Best,<br />Sandeep</p>
        </div>
        <div className="border-t border-[#e9e9e7] pt-2.5 flex items-center gap-3">
          <button className="text-[11px] text-[#9b9a97] hover:text-foreground transition-colors" style={{ fontWeight: 400 }}>Open full view</button>
          <button className="text-[11px] text-[#9b9a97] hover:text-foreground transition-colors" style={{ fontWeight: 400 }}>Pin to right panel</button>
        </div>
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
      <div className="px-4 py-2.5 bg-[#f7f7f5] border-b border-[#e9e9e7] flex items-center justify-between">
        <span className="text-[12px] text-foreground flex items-center gap-1.5" style={{ fontWeight: 500 }}><HugeiconsIcon icon={ClipboardIcon} size={12} /> HIGH ICP, NOT CONVERTED</span>
        <button className="text-[11px] text-[#9b9a97] hover:text-foreground transition-colors" style={{ fontWeight: 400 }}>
          Pin to right panel
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#e9e9e7]">
            {["LEAD", "COMPANY", "ICP", "ENGAGE", "ISSUE"].map((h) => (
              <th key={h} className="px-4 py-2 text-left text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#e9e9e7]/60 last:border-0 hover:bg-[#fafaf9]">
              <td className="px-4 py-2.5 text-[12px] text-foreground" style={{ fontWeight: 500 }}>{row.name}</td>
              <td className="px-4 py-2.5 text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{row.company}</td>
              <td className="px-4 py-2.5 text-[12px] text-foreground" style={{ fontWeight: 500 }}>{row.icp}</td>
              <td className="px-4 py-2.5 text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{row.engage}</td>
              <td className="px-4 py-2.5 text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{row.issue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Slides components ───────────────────────────────────────────────────────

function SlidesArtifact({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      className="border border-[#e9e9e7] rounded-xl overflow-hidden cursor-pointer hover:border-[#c8c8c6] transition-colors animate-in fade-in duration-300"
      onClick={onOpen}
    >
      <div className="px-4 py-2.5 bg-[#f7f7f5] border-b border-[#e9e9e7] flex items-center justify-between">
        <span className="text-[12px] text-foreground flex items-center gap-1.5" style={{ fontWeight: 500 }}><HugeiconsIcon icon={Presentation01Icon} size={12} /> CAMPAIGN SLIDES · 4 slides</span>
        <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Click to expand</span>
      </div>
      <div className="px-4 py-3">
        <div className="rounded-lg bg-foreground p-4 text-white mb-3">
          <p className="text-[10px] uppercase tracking-wider opacity-50 mb-1" style={{ fontWeight: 500 }}>Day 3 Summary</p>
          <p className="text-[15px]" style={{ fontWeight: 700 }}>Re-engage Stalled Pipeline</p>
          <div className="flex gap-4 mt-2">
            <span className="text-[11px] opacity-70">8.8% conversion rate</span>
            <span className="text-[11px] opacity-70">3 meetings booked</span>
            <span className="text-[11px] opacity-70">34 leads</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Will be added to Email 3 for Segment B leads</p>
          <span className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Open full view →</span>
        </div>
      </div>
    </div>
  );
}

const SLIDES_DATA = [
  {
    label: "01 · Overview",
    title: "Re-engage Stalled Pipeline",
    subtitle: "Day 3 Campaign Results",
    body: [
      "34 deals stalled 30+ days — 18 visited pricing recently",
      "3 segments: Hot (18), Warm (10), Re-engage (6)",
      "8.8% conversion rate vs 3% benchmark",
    ],
    accent: "#1a1a1a",
  },
  {
    label: "02 · Performance",
    title: "Results by Segment",
    subtitle: "Open rates & engagement",
    body: [
      "Segment A (Hot): 78% open · 25% click · 2 meetings",
      "Segment B (Warm): 70% open · 20% click · 0 meetings",
      "Segment C (Re-engage): 50% open · 17% click · 1 meeting",
    ],
    accent: "#2563eb",
  },
  {
    label: "03 · Key Wins",
    title: "3 Meetings Booked",
    subtitle: "Conversion highlights",
    body: [
      "Sarah Chen (Acme) — replied, booked with AE",
      "Tom Liu (Datadog) — clicked booking link directly",
      "James Wong (CloudBase) — pre-send CTA upgrade worked",
    ],
    accent: "#16a34a",
  },
  {
    label: "04 · Next Steps",
    title: "Recommended Actions",
    subtitle: "To improve Segment B",
    body: [
      "Switch 4 Segment B leads: Case Study → Reply Prompt CTA",
      "Escalate Anna Kumar (ICP 71) to AE for personal outreach",
      "Monitor Segment C — Email 2 sends tomorrow at 9am",
    ],
    accent: "#d97706",
  },
];

function SlidesModal({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(0);
  const slide = SLIDES_DATA[active];

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-[700px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between shrink-0">
          <div>
            <p className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>Campaign Slides</p>
            <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Re-engage Stalled Pipeline · Day 3</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f7f7f5] flex items-center justify-center text-[#9b9a97] hover:bg-[#e9e9e7] transition-colors text-[14px]"
          >
            ✕
          </button>
        </div>

        {/* Slide thumbnails strip */}
        <div className="flex gap-2 px-6 py-3 border-b border-[#e9e9e7] overflow-x-auto shrink-0">
          {SLIDES_DATA.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-28 h-16 rounded-lg border-2 transition-all flex flex-col items-start justify-end p-2 ${
                i === active ? "border-foreground" : "border-transparent hover:border-[#c8c8c6]"
              }`}
              style={{ background: s.accent }}
            >
              <p className="text-[9px] text-white opacity-60 leading-none" style={{ fontWeight: 500 }}>{s.label}</p>
            </button>
          ))}
        </div>

        {/* Active slide */}
        <div className="flex-1 px-8 py-8 overflow-y-auto">
          <div
            className="rounded-2xl p-8 min-h-[240px] flex flex-col justify-between"
            style={{ background: slide.accent }}
          >
            <div>
              <p className="text-[11px] text-white opacity-50 uppercase tracking-wider mb-2" style={{ fontWeight: 500 }}>{slide.label}</p>
              <p className="text-[24px] text-white mb-1" style={{ fontWeight: 700, lineHeight: 1.2 }}>{slide.title}</p>
              <p className="text-[13px] text-white opacity-60" style={{ fontWeight: 400 }}>{slide.subtitle}</p>
            </div>
            <div className="mt-6 space-y-2">
              {slide.body.map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-white opacity-40 text-[12px] mt-0.5">→</span>
                  <p className="text-[13px] text-white opacity-90" style={{ fontWeight: 400, lineHeight: 1.5 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#e9e9e7] bg-[#fafaf9] flex items-center justify-between shrink-0">
          <p className="text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
            Will be added to Email 3 for Segment B leads
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActive((a) => Math.max(0, a - 1))}
              disabled={active === 0}
              className="text-[12px] text-[#9b9a97] hover:text-foreground disabled:opacity-30 transition-colors"
              style={{ fontWeight: 400 }}
            >
              ← Prev
            </button>
            <span className="text-[11px] text-[#9b9a97]">{active + 1} / {SLIDES_DATA.length}</span>
            <button
              onClick={() => setActive((a) => Math.min(SLIDES_DATA.length - 1, a + 1))}
              disabled={active === SLIDES_DATA.length - 1}
              className="text-[12px] text-[#9b9a97] hover:text-foreground disabled:opacity-30 transition-colors"
              style={{ fontWeight: 400 }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

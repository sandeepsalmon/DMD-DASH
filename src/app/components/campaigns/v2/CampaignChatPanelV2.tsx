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
import type { CampaignModeState } from "../types";
import { AGENT_DISCUSSION_FULL } from "../types";
import { TextShimmer } from "@/components/prompt-kit/text-shimmer";
import { Loader, PulseLoader } from "@/components/prompt-kit/loader";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { DocketMessage, UserMessage, CompactAgentBubble } from "./shared/ChatMessage";
import { CampaignQuestions, type QuestionAnswer } from "./shared/CampaignQuestions";
import type { RightPanelTab } from "./ArtifactPanel";

interface Props {
  campaignState: CampaignModeState;
  chatPreFill: string;
  onStart: () => void;
  onPromptClick: (prompt: string) => void;
  onViewCampaign: () => void;
  onMarketingAgentDecided: (accepted: boolean) => void;
  onSwitchTab: (tab: RightPanelTab) => void;
  isPaused?: boolean;
  pendingPrompt?: string | null;
  onPromptConsumed?: () => void;
}

const CHAIN_OF_THOUGHT = [
  { iconKey: "checkmark", title: "Pulled 34 deals from HubSpot pipeline" },
  { iconKey: "checkmark", title: "Enriched warm context for 34 leads (28 accounts)" },
  { iconKey: "clock", title: "Evaluating best approach..." },
];

const AGENT_ROWS = [
  { key: "CRM Agent", short: "CR", color: "#2563eb" },
  { key: "Content Agent", short: "CN", color: "#16a34a" },
  { key: "Lead Analyst", short: "LA", color: "#d97706" },
  { key: "Email Strategist", short: "ES", color: "#9333ea" },
] as const;

const DOCKET_INITIAL = `I found 34 deals in your HubSpot pipeline that have been stalled for over 30 days. 18 of them have visited your pricing page in the last 2 weeks — that's a strong buying signal going to waste.

I'll analyze each deal's warm context — web activity, agent conversations, email history, and CRM data.`;

const DOCKET_PIPELINE_SUGGESTION = `I found 34 deals in your HubSpot pipeline that have been stalled for over 30 days. 18 of them have visited your pricing page in the last 2 weeks — that's a strong buying signal going to waste.

Would you like to run a re-engagement campaign for these stalled deals?`;

const DOCKET_QUESTIONS_INTRO = `Great! Let me ask a few quick questions to tailor this campaign. Just click the option that fits — or type your own.`;

const DOCKET_CUSTOM_PROMPT = `No problem! What type of campaign are you looking to run? Describe what you have in mind and I'll help you build it.`;

type OnboardingStep = "blank" | "pipeline-suggested" | "questions" | "custom-describe" | "done";

const DAVE_KIM_RESPONSE = `Done. Updated Dave Kim's remaining emails to use technical documentation links instead. His warm context shows he cares about API depth, not sales conversations.`;
const ANNA_ESCALATE_RESPONSE = `Escalating Anna Kumar to AE team. She's opened and clicked every email but hasn't booked — flagged in HubSpot as "High Priority," assigned to deal owner, automated emails paused.`;
const PRIYA_CTA_RESPONSE = `Switched Priya Mehta's CTA to Reply Prompt. Reply prompts have 2.3x higher response rate for this segment.`;

interface ChatMsg { id: string; role: "docket" | "user"; content: string; }

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

interface Suggestion { label: string; primary?: boolean; }

function getSuggestionsForState(
  state: CampaignModeState,
  caChoice: string | null,
  demoStep: number,
): Suggestion[] {
  if (state === "initial") return [];
  if (state === "agents-running") return [];
  if (state === "agent-suggestion") {
    if (caChoice === "pending") return [];
    return [];
  }
  if (state === "plan-ready") {
    if (demoStep === 0) return [
      { label: "Preview Emails" },
      { label: "Approve & Launch", primary: true },
    ];
    if (demoStep === 1) return [
      { label: "Approve & Launch", primary: true },
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

const CTA_EXPLAIN_RESPONSE = `Here's a detailed breakdown of the CTA mismatch for 4 Segment B leads:

**Dave Kim (StartupX)** — Downloaded integration whitepaper, had 4-min agent conversation about API. Opens emails consistently but never clicks sales CTAs. He wants technical depth. → Switch to Technical Demo CTA.

**Mike Ross (RetailCo)** — Brief agent conversation, opened Email 1 but didn't click. Low engagement overall — the Case Study CTA feels too "salesy." → Switch to Reply Prompt to invite a casual response.

**Lisa Park (OldCorp)** — Previous closed-lost on pricing. Opened re-engagement email but ROI Calculator CTA didn't land — she already knows pricing. → Switch to Reply Prompt with "what's changed" angle.

**Wei Zhang (LogiCorp)** — Lost on timing, mid-implementation of another tool. Content Piece CTA is too generic. → Switch to Reply Prompt asking if implementation is complete.

The common pattern: these leads engage with subject lines but the CTA ask is misaligned with their intent. Reply Prompts and Technical CTAs have 2.3x higher response rates for this segment.`;

export function CampaignChatPanelV2({
  campaignState,
  chatPreFill = "",
  onStart,
  onPromptClick,
  onMarketingAgentDecided,
  onSwitchTab,
  isPaused,
  pendingPrompt,
  onPromptConsumed,
}: Props) {
  const [chatInput, setChatInput] = useState(chatPreFill);
  const [isSending, setIsSending] = useState(false);
  const [buildPhase, setBuildPhase] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [leaderMsgIndex, setLeaderMsgIndex] = useState(0);
  const [leaderDone, setLeaderDone] = useState(false);
  const [showFullDiscussion, setShowFullDiscussion] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [caChoice, setCaChoice] = useState<"pending" | "yes" | "no" | null>(null);
  const [caCreating, setCaCreating] = useState(false);
  const [caCreated, setCaCreated] = useState(false);
  const [showDay1History, setShowDay1History] = useState(false);
  const [planDemoStep, setPlanDemoStep] = useState(0);
  const [runningDemoStep, setRunningDemoStep] = useState(0);

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("blank");
  const [onboardingMessages, setOnboardingMessages] = useState<ChatMsg[]>([]);
  const [completedAnswers, setCompletedAnswers] = useState<QuestionAnswer[]>([]);

  // Post-onboarding messages (for running state interactions, etc.)
  const [postMessages, setPostMessages] = useState<ChatMsg[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      CHAIN_OF_THOUGHT.forEach((_, i) => t.push(setTimeout(() => setVisibleSteps(i + 1), 1500 * (i + 1))));
      const agentBase = 1500 * CHAIN_OF_THOUGHT.length + 1200;
      AGENT_DISCUSSION_FULL.forEach((_, i) => t.push(setTimeout(() => setLeaderMsgIndex(i + 1), agentBase + 1800 * i)));
      t.push(setTimeout(() => setLeaderDone(true), agentBase + 1800 * AGENT_DISCUSSION_FULL.length));
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
      const t = setTimeout(() => setCaChoice("pending"), 600);
      return () => clearTimeout(t);
    }
  }, [campaignState]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [campaignState, visibleSteps, leaderMsgIndex, leaderDone, onboardingMessages, postMessages, launchStep, caChoice, caCreating, caCreated, onboardingStep]);

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
    setOnboardingMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content: "Yes, let's do it" }]);
    setIsSending(true);
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

  // ── Suggestion click handler ──

  const handleSuggestionClick = (label: string) => {
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
        setPostMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: "Done. Switched CTA from Case Study to Reply Prompt for 4 Segment B leads. Reply prompts have 2.3x higher response rate for this segment." }]);
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
        setPostMessages((cur) => [...cur, { id: `${Date.now()}-d`, role: "docket", content: "You can change CTAs per segment in the Emails tab →" }]);
        onSwitchTab("emails");
      }, 400);
      return;
    }
    onPromptClick(label);
  };

  const agentsRan = campaignState === "agent-suggestion" || campaignState === "plan-ready" || campaignState === "launched" || campaignState === "running";
  const demoStep = campaignState === "plan-ready" ? planDemoStep : campaignState === "running" ? runningDemoStep : 0;

  let suggestions: Suggestion[];
  if (campaignState === "initial") {
    if (onboardingStep === "blank") {
      suggestions = [{ label: "Create a new campaign", primary: true }];
    } else {
      suggestions = [];
    }
  } else {
    suggestions = getSuggestionsForState(campaignState, caChoice, demoStep);
  }

  // Helper to render a message
  const renderMsg = (msg: ChatMsg) => {
    if (msg.role === "user") return <UserMessage content={msg.content} />;
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

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
      {/* Scrollable chat area */}
      <div className="flex-1 overflow-y-auto">
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

          {/* Onboarding conversation */}
          {campaignState === "initial" && onboardingMessages.map((msg) => (
            <div key={msg.id}>{renderMsg(msg)}</div>
          ))}

          {/* Yes/No buttons */}
          {campaignState === "initial" && onboardingStep === "pipeline-suggested" && (
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

          {/* Collapsed onboarding summary */}
          {campaignState !== "initial" && onboardingStep === "done" && (onboardingMessages.length > 0 || completedAnswers.length > 0) && (
            <div className="border border-[#e9e9e7] rounded-lg overflow-hidden">
              <div className="px-3 py-2.5 bg-[#fafaf9] flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" />
                <span className="text-[11px] text-foreground flex-1" style={{ fontWeight: 400 }}>
                  {completedAnswers.length > 0
                    ? `Campaign preferences collected (${completedAnswers.length} answers)`
                    : "Campaign setup complete"}
                </span>
              </div>
            </div>
          )}

          {/* Docket "analyzing" intro */}
          {campaignState !== "initial" && campaignState !== "running" && (
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
                    {CHAIN_OF_THOUGHT.slice(0, visibleSteps).map((step, i) => (
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
                      <span className="text-[10px] text-foreground" style={{ fontWeight: 500 }}>Agent discussion</span>
                      <div className="flex items-center gap-1 ml-auto">
                        {AGENT_ROWS.map((a) => {
                          const hasSpoken = leaderMsgIndex > 0 && AGENT_DISCUSSION_FULL.slice(0, leaderMsgIndex).some((m) => m.agent === a.key);
                          return (
                            <div key={a.key} className="flex items-center gap-0.5">
                              <PulseLoader color={a.color} done={hasSpoken} />
                              <span className="text-[8px]" style={{ color: a.color, fontWeight: 700 }}>{a.short}</span>
                            </div>
                          );
                        })}
                      </div>
                      {!leaderDone && <div className="w-2.5 h-2.5 border border-[#9b9a97]/40 border-t-foreground/60 rounded-full animate-spin shrink-0" />}
                    </div>
                    <div className="px-3 py-2 space-y-0.5 max-h-[160px] overflow-y-auto">
                      {leaderMsgIndex === 0
                        ? <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Starting discussion...</p>
                        : AGENT_DISCUSSION_FULL.slice(0, leaderMsgIndex).map((msg, i) => <CompactAgentBubble key={i} msg={msg} />)
                      }
                      {leaderDone && (
                        <div className="flex items-center gap-1.5 pt-1 animate-in fade-in duration-300">
                          <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" />
                          <p className="text-[10px] text-foreground" style={{ fontWeight: 500 }}>Analysis complete</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DocketMessage>
          )}

          {/* Collapsed agent discussion (post-agents) */}
          {agentsRan && (
            <div className="border border-[#e9e9e7] rounded-lg overflow-hidden">
              <button onClick={() => setShowFullDiscussion(!showFullDiscussion)} className="w-full px-3 py-2.5 bg-[#fafaf9] flex items-center gap-2 hover:bg-[#f4f4f2] transition-colors text-left">
                <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" />
                <span className="text-[11px] text-foreground flex-1" style={{ fontWeight: 400 }}>4 agents analyzed leads, segmentation, and email strategy</span>
                <HugeiconsIcon icon={ArrowDown01Icon} size={10} className={`text-[#9b9a97] transition-transform ${showFullDiscussion ? "" : "rotate-[-90deg]"}`} />
              </button>
              {showFullDiscussion && (
                <div className="px-3 py-2 border-t border-[#e9e9e7] space-y-0.5">
                  {AGENT_DISCUSSION_FULL.map((msg, i) => <CompactAgentBubble key={i} msg={msg} />)}
                </div>
              )}
            </div>
          )}

          {/* Conversational Agent suggestion */}
          {(campaignState === "agent-suggestion" || ((campaignState === "plan-ready" || campaignState === "launched" || campaignState === "running") && caChoice !== null)) && (
            <DocketMessage>
              <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
                Suggest creating a <span style={{ fontWeight: 600 }}>Conversational Agent</span> for this campaign. Recipients can interact with it to learn more, warming them up before your team engages.
              </p>
              {caChoice === "pending" && (
                <div className="flex gap-2 mt-3 animate-in fade-in duration-300">
                  <button onClick={() => { setCaChoice("yes"); setCaCreating(true); onMarketingAgentDecided(true); setTimeout(() => { setCaCreating(false); setCaCreated(true); }, 2000); }} className="text-[12px] px-4 py-2 rounded-lg bg-foreground text-white hover:opacity-90 transition-opacity" style={{ fontWeight: 500 }}>Yes, create it</button>
                  <button onClick={() => { setCaChoice("no"); onMarketingAgentDecided(false); }} className="text-[12px] px-4 py-2 rounded-lg border border-[#e9e9e7] text-foreground hover:bg-[#f7f7f5] transition-colors" style={{ fontWeight: 400 }}>Skip</button>
                </div>
              )}
              {caChoice === "yes" && !caCreating && !caCreated && (
                <div className="mt-3"><div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground text-white text-[11px]" style={{ fontWeight: 500 }}><HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="white" /> Yes, create it</div></div>
              )}
              {caChoice === "no" && <div className="mt-3"><div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f7f7f5] border border-[#e9e9e7] text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Skipped</div></div>}
              {caCreating && <div className="flex items-center gap-2 mt-3 animate-in fade-in"><Loader className="text-[#9b9a97]" /><TextShimmer className="text-[11px]" duration={1.8}>Creating conversational agent...</TextShimmer></div>}
              {caCreated && <div className="mt-3 flex items-center gap-2 animate-in fade-in"><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" /><p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Conversational Agent created</p></div>}
            </DocketMessage>
          )}

          {caChoice === "yes" && (campaignState === "plan-ready" || campaignState === "launched" || campaignState === "running") && <UserMessage content="Yes, add conversational agent" />}
          {caChoice === "no" && (campaignState === "plan-ready" || campaignState === "launched" || campaignState === "running") && <UserMessage content="No, skip for now" />}

          {/* Plan Ready */}
          {(campaignState === "plan-ready" || campaignState === "launched") && (
            <DocketMessage>
              <p className="text-[13px] text-foreground mb-3" style={{ fontWeight: 400, lineHeight: 1.6 }}>
                Here's the campaign plan. Each email is personalized per lead using their warm context.
              </p>
              <button onClick={() => onSwitchTab("emails")} className="w-full text-left border border-[#e9e9e7] rounded-xl p-3.5 hover:border-foreground/20 hover:shadow-sm transition-all bg-white">
                <p className="text-[11px] text-[#9b9a97] mb-2" style={{ fontWeight: 500 }}>CAMPAIGN PLAN</p>
                <div className="space-y-1.5">
                  {[
                    { color: "#ef4444", text: "Seg A: Hot · 18 leads · 2 emails · 3 days" },
                    { color: "#f59e0b", text: "Seg B: Warm · 10 leads · 3 emails · 7 days" },
                    { color: "#22c55e", text: "Seg C: Re-engage · 6 leads · 3 emails · 10 days" },
                  ].map((row) => (
                    <div key={row.text} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.color }} />
                      <p className="text-[11px] text-foreground" style={{ fontWeight: 400 }}>{row.text}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#9b9a97] mt-2.5" style={{ fontWeight: 400 }}>34 leads · 8 emails · View in Emails tab →</p>
              </button>
            </DocketMessage>
          )}

          {/* Launch sequence */}
          {campaignState === "launched" && (
            <>
              <UserMessage content="Approve and launch the campaign" />
              <DocketMessage>
                <p className="text-[13px] text-foreground mb-2" style={{ fontWeight: 500 }}>Launching campaign.</p>
                <div className="space-y-1.5">
                  {launchStep >= 1 && <p className="text-[12px] text-[#9b9a97] animate-in fade-in" style={{ fontWeight: 400 }}><HugeiconsIcon icon={MailSend01Icon} size={12} className="inline-block mr-1" /> Generating 34 emails...</p>}
                  {launchStep >= 2 && <p className="text-[12px] text-foreground animate-in fade-in" style={{ fontWeight: 400 }}><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" className="inline-block mr-1" /> Seg A: sending now</p>}
                  {launchStep >= 3 && <><p className="text-[12px] text-foreground animate-in fade-in" style={{ fontWeight: 400 }}><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" className="inline-block mr-1" /> Seg B: sending 9am tomorrow</p><p className="text-[12px] text-foreground animate-in fade-in" style={{ fontWeight: 400 }}><HugeiconsIcon icon={CheckmarkBadge02Icon} size={12} color="#22c55e" className="inline-block mr-1" /> Seg C: sending 9am tomorrow</p></>}
                  {launchStep >= 4 && <p className="text-[12px] text-foreground mt-2 animate-in fade-in" style={{ fontWeight: 400 }}>Campaign is live. Tracking in Overview tab.</p>}
                </div>
              </DocketMessage>
            </>
          )}

          {/* Running — Day 3 */}
          {campaignState === "running" && (
            <>
              <button onClick={() => setShowDay1History(!showDay1History)} className="text-[11px] text-[#9b9a97] hover:text-foreground/70 transition-colors flex items-center gap-1">
                <HugeiconsIcon icon={ArrowDown01Icon} size={10} className={showDay1History ? "" : "rotate-[-90deg]"} />
                Campaign creation conversation
              </button>
              {showDay1History && <div className="border border-[#e9e9e7] rounded-xl p-4 bg-[#fafaf9]"><p className="text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>[Day 0 conversation collapsed]</p></div>}

              <div className="space-y-1.5">
                <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>── DAY 1 ──</p>
                <div className="space-y-1 text-[12px]" style={{ fontWeight: 400 }}>
                  <p className="text-foreground flex items-center gap-1.5"><HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" /> Seg A: 18 sent · 78% open · 33% click</p>
                  <p className="text-foreground flex items-center gap-1.5"><HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" /> Seg B: 10 sent · 70% open · 20% click</p>
                  <p className="text-foreground flex items-center gap-1.5"><HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" /> Seg C: 6 sent · 50% open · 17% click</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>── DAY 3 (Today) ──</p>
                <div className="space-y-1 text-[12px]" style={{ fontWeight: 400 }}>
                  <p className="text-foreground flex items-center gap-1.5"><HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" /> Seg A Email 2: 16 sent · 63% open · 25% click</p>
                  <div className="border border-[#e9e9e7] rounded-lg p-2.5 bg-[#fafaf9] ml-3 mt-1">
                    <p className="text-foreground flex items-center gap-1 text-[11px]" style={{ fontWeight: 500 }}><HugeiconsIcon icon={AiChat02Icon} size={11} /> Pre-send: James Wong CTA → Booking link</p>
                    <p className="text-[#9b9a97] text-[10px]">3 pricing visits detected · Result: meeting booked ✓</p>
                  </div>
                  <p className="text-foreground mt-2 flex items-center gap-1.5"><HugeiconsIcon icon={Calendar03Icon} size={11} /> 3 meetings booked</p>
                </div>
              </div>

              {/* Day 3 metrics card */}
              <DocketMessage>
                <button onClick={() => onSwitchTab("overview")} className="w-full text-left border border-[#e9e9e7] rounded-xl p-3.5 hover:border-foreground/20 hover:shadow-sm transition-all bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Day 3 Results</p>
                    <span className="text-[10px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200" style={{ fontWeight: 500 }}>8.8% conv.</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>
                    <span>3 meetings</span><span>44 sent</span><span>68% open</span>
                  </div>
                  <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1" style={{ fontWeight: 400 }}>⚠ 4 Seg B leads: CTA mismatch — switch to Reply Prompt?</p>
                  <p className="text-[10px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>View details →</p>
                </button>
              </DocketMessage>
            </>
          )}

          {/* ═══ 3. POST MESSAGES (interactions after campaign is built) ═══ */}
          {campaignState !== "initial" && postMessages.map((msg) => (
            <div key={msg.id}>{renderMsg(msg)}</div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Bottom bar: Suggestions + Input ── */}
      <div className="shrink-0 border-t border-[#e9e9e7] bg-white">
        <div className="max-w-[720px] mx-auto px-10">
          {suggestions.length > 0 && (
            <div className="flex items-center gap-2 pt-3 pb-1 flex-wrap">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSuggestionClick(s.label)}
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

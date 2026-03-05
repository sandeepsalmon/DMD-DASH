import { useEffect, useMemo, useState } from "react";
import {
  HugeiconsIcon,
  CheckmarkBadge02Icon,
  HourglassIcon,
  ArrowDown01Icon,
  ArrowReloadHorizontalIcon,
  LinkSquare01Icon,
  AiChat02Icon,
  Cancel01Icon,
  Delete02Icon,
} from "../../icons";
import type { CampaignModeState, Lead } from "../../types";
import { LEADS } from "../../types";
import { toast } from "sonner";

interface Props {
  campaignState: CampaignModeState;
  marketingAgentCreated: boolean;
  onLeadClick?: (lead: Lead) => void;
}

type AttachmentMode = "dynamic" | "slides" | "choose";
type PrimaryCTA = "dynamic" | "book-meeting" | "conversational-agent" | "custom-link";
type SendTiming = "morning" | "evening" | "night" | "agent";

type SequenceEmail = {
  id: string;
  day: number;
  subject: string;
  preview: string;
  status: "sent" | "scheduled" | "pending";
  scheduledFor?: string;
  sentCount?: number;
  openRate?: number;
  clickRate?: number;
  templateKey: string;
  promptTemplate: string;
  primaryCta: PrimaryCTA;
  ctaLink: string;
  attachmentsEnabled: boolean;
  attachmentMode: AttachmentMode;
  manualFiles: number;
  sendTiming: SendTiming;
  suggested: boolean;
  accepted: boolean;
};

type PreviewLead = {
  id: string;
  name: string;
  company: string;
  email: string;
  signal: string;
};

type PromptTemplate = {
  key: string;
  label: string;
  body: string;
};

type EmailDraft = {
  prompt: string;
  templateKey: string;
  primaryCta: PrimaryCTA;
  ctaLink: string;
  attachmentsEnabled: boolean;
  attachmentMode: AttachmentMode;
  manualFiles: number;
  sendTiming: SendTiming;
};

type SequenceLeadRow = {
  lead: Lead;
  delivery: string;
  reply: string;
};

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    key: "reengage",
    label: "Re-engagement opener",
    body:
      "Write a short re-engagement email. Mention recent warm signals and propose one clear next step in a consultative tone.",
  },
  {
    key: "proof",
    label: "Proof-led follow-up",
    body:
      "Write a follow-up email with one focused proof point. Ask one specific question that helps qualify urgency.",
  },
  {
    key: "close-loop",
    label: "Close-the-loop",
    body:
      "Write a final close-the-loop email. Be direct, respectful, and offer one clear path to continue or pause.",
  },
  {
    key: "exec-note",
    label: "Executive nudge",
    body:
      "Write a concise executive-friendly note that summarizes risk, opportunity, and a lightweight next action.",
  },
];

const INITIAL_EMAIL_SEQUENCE: SequenceEmail[] = [
  {
    id: "seq-email-1",
    day: 0,
    subject: "Short Re-engagement Email",
    preview: "Write a short re-engagement email. Mention recent warm signals and propose one clear next step in a consultative tone.",
    status: "sent",
    sentCount: 18,
    openRate: 78,
    clickRate: 33,
    templateKey: "reengage",
    promptTemplate:
      "Write a short re-engagement email. Mention recent warm signals and propose one clear next step in a consultative tone.",
    primaryCta: "dynamic",
    ctaLink: "",
    attachmentsEnabled: false,
    attachmentMode: "dynamic",
    manualFiles: 0,
    sendTiming: "agent",
    suggested: false,
    accepted: true,
  },
  {
    id: "seq-email-2",
    day: 3,
    subject: "Proof-Led Follow-Up Email",
    preview: "Write a follow-up email with one focused proof point. Ask one specific question that helps qualify urgency.",
    status: "scheduled",
    scheduledFor: "Recipient local window",
    templateKey: "proof",
    promptTemplate:
      "Write a follow-up email with one focused proof point. Ask one specific question that helps qualify urgency.",
    primaryCta: "conversational-agent",
    ctaLink: "",
    attachmentsEnabled: false,
    attachmentMode: "dynamic",
    manualFiles: 0,
    sendTiming: "agent",
    suggested: false,
    accepted: true,
  },
  {
    id: "seq-email-3",
    day: 7,
    subject: "Close-the-Loop Email",
    preview: "Write a final close-the-loop email. Be direct, respectful, and offer one clear path to continue or pause.",
    status: "pending",
    templateKey: "close-loop",
    promptTemplate:
      "Write a final close-the-loop email. Be direct, respectful, and offer one clear path to continue or pause.",
    primaryCta: "book-meeting",
    ctaLink: "https://docket.io/book/sandeep",
    attachmentsEnabled: false,
    attachmentMode: "dynamic",
    manualFiles: 0,
    sendTiming: "agent",
    suggested: false,
    accepted: true,
  },
];

function toCompanyEmail(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/^$/, "company") + ".com";
}

function getLeadSignal(lead: Lead): string {
  return lead.activity[0]?.description ?? "recent engagement";
}

const PREVIEW_LEADS: PreviewLead[] = LEADS.slice(0, 6).map((lead) => {
  const first = lead.name.split(" ")[0].toLowerCase();
  const companyDomain = toCompanyEmail(lead.company);
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: `${first}@${companyDomain}`,
    signal: getLeadSignal(lead),
  };
});

function getSequenceLeadRows(step: number, isLaunched: boolean): SequenceLeadRow[] {
  const pool = LEADS.slice((step - 1) * 2, (step - 1) * 2 + 4);
  const fallbackPool = pool.length > 0 ? pool : LEADS.slice(0, 4);

  return fallbackPool.map((lead, idx) => {
    if (!isLaunched) {
      return { lead, delivery: "Queued", reply: "—" };
    }

    if (step === 1) {
      const deliveryStates = ["Sent", "Sent", "Sent", "Sent"];
      const replyStates = ["Opened", "Replied", "Clicked", "Opened"];
      return { lead, delivery: deliveryStates[idx] ?? "Sent", reply: replyStates[idx] ?? "Opened" };
    }

    if (step === 2) {
      const deliveryStates = ["Scheduled", "Scheduled", "Scheduled", "Scheduled"];
      const replyStates = ["Local AM window", "Local PM window", "Local AM window", "Local PM window"];
      return { lead, delivery: deliveryStates[idx] ?? "Scheduled", reply: replyStates[idx] ?? "Local window" };
    }

    return { lead, delivery: "Pending", reply: "Wait for step 2 outcome" };
  });
}

function labelForPrimaryCta(primaryCta: PrimaryCTA): string {
  if (primaryCta === "dynamic") return "Dynamic CTA";
  if (primaryCta === "book-meeting") return "Book a meeting";
  if (primaryCta === "conversational-agent") return "Conversational agent";
  return "Custom link";
}

function previewSnippetFromPrompt(prompt: string): string {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  if (!normalized) return "Prompt not set";
  return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
}

function defaultPromptFromTemplate(templateKey: string): string {
  return PROMPT_TEMPLATES.find((template) => template.key === templateKey)?.body ?? PROMPT_TEMPLATES[0].body;
}

function regeneratePrompt(templateKey: string, step: number, lead: PreviewLead, pass: number): string {
  const base = defaultPromptFromTemplate(templateKey);
  const direction = [
    "Keep it concise and action-oriented.",
    "Anchor it on warm context first.",
    "Use a consultative and direct tone.",
    "Ask for one concrete next step only.",
  ][pass % 4];

  return `${base} Mention ${lead.company}'s signal: ${lead.signal}. Sequence step ${step}. ${direction}`;
}

function generateSubject(prompt: string, step: number, variant: number): string {
  const words = prompt
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 9);

  const compact = words.join(" ");
  if (!compact) return `Step ${step} follow-up idea`;

  const suffix = ["", " — quick follow-up", " — next step", " — should we continue?"][variant % 4];
  const title = compact.charAt(0).toUpperCase() + compact.slice(1);
  const subject = `${title}${suffix}`;
  return subject.length > 88 ? `${subject.slice(0, 85)}...` : subject;
}

function titleFromPrompt(prompt: string, fallback: string): string {
  const normalized = prompt.trim();
  if (!normalized) return fallback;

  const lower = normalized.toLowerCase();
  if (lower.includes("short re-engagement email")) return "Short Re-engagement Email";
  if (lower.includes("proof point")) return "Proof-Led Follow-Up Email";
  if (lower.includes("close-the-loop")) return "Close-the-Loop Email";
  if (lower.includes("executive")) return "Executive Nudge Email";

  const firstSentence = normalized.split(/[.?!]/)[0]?.replace(/^write\s+(a|an)\s+/i, "").trim() ?? "";
  if (!firstSentence) return fallback;
  const title = firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
  return title.length > 56 ? `${title.slice(0, 53)}...` : title;
}

type EmailHistoryEvent = {
  time: string;
  event: string;
  detail: string;
};

type AgentActivityEvent = {
  title: string;
  detail: string;
  insight?: string;
};

type TranscriptLine = {
  speaker: "Lead" | "Agent";
  line: string;
};

function getEmailHistory(step: number, isLaunched: boolean): EmailHistoryEvent[] {
  if (!isLaunched) return [];
  if (step === 1) {
    return [
      { time: "Day 0 · 09:10", event: "Sent", detail: "34 recipients entered Step 1" },
      { time: "Day 0 · 10:45", event: "Opened", detail: "24 opens detected across 18 accounts" },
      { time: "Day 0 · 12:20", event: "Replies", detail: "3 replies tagged as high intent" },
    ];
  }
  if (step === 2) {
    return [
      { time: "Day 3 · Queue", event: "Scheduled", detail: "16 recipients in local send windows" },
      { time: "Day 3 · Pre-send", event: "Personalized", detail: "4 CTA updates based on warm context" },
      { time: "Day 3 · In-flight", event: "Delivering", detail: "Timezone-aware rollout in progress" },
    ];
  }
  return [
    { time: "Day 7 · Planned", event: "Pending", detail: "Awaiting engagement outcomes from Step 2" },
    { time: "Day 7 · Planned", event: "Guardrails", detail: "Suppresses leads already moved to AE" },
    { time: "Day 7 · Planned", event: "Fallback", detail: "Uses reply prompt if CTA confidence drops" },
  ];
}

function getWorkflowContext(step: number): string[] {
  if (step === 1) {
    return [
      "Entry trigger: stalled deals with recent intent signals",
      "Audience source: HubSpot pipeline + CRM owner mapping",
      "Goal: restart conversation and identify active opportunities",
    ];
  }
  if (step === 2) {
    return [
      "Entry trigger: opened/clicked Step 1 without meeting booked",
      "Audience source: engagement-qualified leads from Step 1",
      "Goal: move from interest to a concrete next action",
    ];
  }
  return [
    "Entry trigger: no conversion after Step 2",
    "Audience source: remaining eligible leads in sequence",
    "Goal: final conversion attempt or graceful close-the-loop",
  ];
}

function getAgentActivity(step: number): AgentActivityEvent[] {
  if (step === 1) {
    return [
      {
        title: "Warm-context synthesis",
        detail: "Combined web visits, prior replies, and CRM notes for each recipient.",
        insight: "Leads with pricing revisit in last 48h convert 2.1x better with direct CTA.",
      },
      {
        title: "Subject calibration",
        detail: "Adjusted subject variants by historical open behavior.",
      },
    ];
  }
  if (step === 2) {
    return [
      {
        title: "CTA refinement",
        detail: "Replaced low-performing CTA for 4 leads before send.",
        insight: "Reply-prompt CTA is outperforming case-study CTA by 2.3x in this stage.",
      },
      {
        title: "Send-window optimization",
        detail: "Queued by prospect timezone preference and response patterns.",
      },
    ];
  }
  return [
    {
      title: "Risk control",
      detail: "Excludes leads already escalated to AE or marked inactive.",
      insight: "Likely-to-churn recipients are held back to protect deliverability.",
    },
    {
      title: "Conversation fallback",
      detail: "Prepares conversational-agent route when confidence is medium.",
    },
  ];
}

function getTranscript(step: number): TranscriptLine[] {
  if (step === 1) {
    return [
      { speaker: "Agent", line: "I noticed your team revisited pricing recently. Want the fastest path to evaluate fit?" },
      { speaker: "Lead", line: "Yes, we are evaluating timing and integration effort this quarter." },
      { speaker: "Agent", line: "Understood. I can share a short implementation proof point tailored to your stack." },
    ];
  }
  if (step === 2) {
    return [
      { speaker: "Agent", line: "Sharing the most relevant proof point based on your current evaluation stage." },
      { speaker: "Lead", line: "Can we compare rollout effort for our existing workflow?" },
      { speaker: "Agent", line: "Yes. I included a concise comparison and a direct route to discuss specifics." },
    ];
  }
  return [
    { speaker: "Agent", line: "Last note from my side. Should I keep this thread active or pause for now?" },
    { speaker: "Lead", line: "Pause for now, we may revisit next month." },
    { speaker: "Agent", line: "Got it. I will pause follow-up and keep your context ready for when you return." },
  ];
}

function createDraftEmail(step: number, day: number): SequenceEmail {
  const prompt = "";
  return {
    id: `seq-email-${Date.now()}`,
    day,
    subject: `Step ${step} draft`,
    preview: previewSnippetFromPrompt(prompt),
    status: "pending",
    templateKey: "reengage",
    promptTemplate: prompt,
    primaryCta: "dynamic",
    ctaLink: "",
    attachmentsEnabled: false,
    attachmentMode: "dynamic",
    manualFiles: 0,
    sendTiming: "agent",
    suggested: false,
    accepted: true,
  };
}

function createSuggestedSequenceEmail(day: number): SequenceEmail {
  const prompt =
    "Write a short objection-handling follow-up email for leads who engaged but did not convert. Acknowledge likely blockers, offer one practical path forward, and ask for a simple reply.";

  return {
    id: `seq-email-suggested-${Date.now()}`,
    day,
    subject: "Objection-Handling Follow-Up Email",
    preview: previewSnippetFromPrompt(prompt),
    status: "pending",
    templateKey: "exec-note",
    promptTemplate: prompt,
    primaryCta: "dynamic",
    ctaLink: "",
    attachmentsEnabled: false,
    attachmentMode: "dynamic",
    manualFiles: 0,
    sendTiming: "agent",
    suggested: true,
    accepted: false,
  };
}

function buildPreviewBody(
  draft: EmailDraft,
  lead: PreviewLead,
  step: number,
): string {
  const firstName = lead.name.split(" ")[0];
  const lowerPrompt = draft.prompt.toLowerCase();

  const toneHint = lowerPrompt.includes("technical")
    ? "I can include deeper technical detail if useful."
    : lowerPrompt.includes("casual")
    ? "Happy to keep this light and practical."
    : "I can adapt this to your exact buying criteria.";

  const ctaLine = (() => {
    if (draft.primaryCta === "dynamic") {
      return "I will suggest the best next action based on your current context.";
    }
    if (draft.primaryCta === "book-meeting") {
      return `If useful, here is a direct booking link: ${draft.ctaLink || "https://docket.io/book/sandeep"}`;
    }
    if (draft.primaryCta === "conversational-agent") {
      return "If easier, reply and the conversational agent will respond instantly with context-aware answers.";
    }
    return `You can review details here: ${draft.ctaLink || "https://docket.io"}`;
  })();

  const attachmentLine = draft.attachmentsEnabled
    ? draft.attachmentMode === "choose"
      ? `I can attach ${Math.max(1, draft.manualFiles)} selected file(s) for your use case.`
      : "I can include relevant attachments based on your configuration."
    : "";

  if (step === 1) {
    return [
      `Hi ${firstName},`,
      "",
      `I noticed renewed activity from ${lead.company}, especially around ${lead.signal.toLowerCase()}.`,
      "I wanted to share one focused way to move this forward quickly.",
      toneHint,
      "",
      ctaLine,
      attachmentLine,
      "",
      "Best,",
      "Sandeep",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (step === 2) {
    return [
      `Hi ${firstName},`,
      "",
      `Quick follow-up: I pulled the proof points most relevant to ${lead.company}'s evaluation stage.`,
      "This should help your team make a decision with less back-and-forth.",
      toneHint,
      "",
      ctaLine,
      attachmentLine,
      "",
      "Best,",
      "Sandeep",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Hi ${firstName},`,
    "",
    "Final note from my side before I close this loop.",
    `If ${lead.company} is still evaluating, I can send the exact next-step package in one pass.`,
    toneHint,
    "",
    ctaLine,
    attachmentLine,
    "",
    "Best,",
    "Sandeep",
  ]
    .filter(Boolean)
    .join("\n");
}

function draftFromEmail(email: SequenceEmail): EmailDraft {
  return {
    prompt: email.promptTemplate,
    templateKey: email.templateKey,
    primaryCta: email.primaryCta,
    ctaLink: email.ctaLink,
    attachmentsEnabled: email.attachmentsEnabled,
    attachmentMode: email.attachmentMode,
    manualFiles: email.manualFiles,
    sendTiming: email.sendTiming,
  };
}

export function EmailPlanArtifact({ campaignState, marketingAgentCreated, onLeadClick }: Props) {
  const isLaunched = campaignState === "launched" || campaignState === "running";
  const [emails, setEmails] = useState<SequenceEmail[]>(INITIAL_EMAIL_SEQUENCE);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [suggestedSequenceState, setSuggestedSequenceState] = useState<"available" | "dismissed" | "accepted">("available");
  const totalTargetLeads = 34;
  const sentSoFar = emails.reduce((sum, email) => sum + (email.status === "sent" ? email.sentCount ?? 0 : 0), 0);
  const suggestedDay = (emails[emails.length - 1]?.day ?? 0) + 3;
  const suggestedStep = emails.length + 1;
  const suggestedEmail = useMemo(() => createSuggestedSequenceEmail(suggestedDay), [suggestedDay]);
  const showSuggestedSequence = suggestedSequenceState === "available";

  const editingEmail = editingIndex !== null ? emails[editingIndex] : null;

  const handleSaveEmail = (index: number, updatedEmail: SequenceEmail) => {
    setEmails((current) => current.map((email, idx) => (idx === index ? updatedEmail : email)));
    toast.success(`Saved Step ${index + 1}`);
  };

  const handleAcceptSuggestedEmail = (index: number) => {
    setEmails((current) =>
      current.map((email, idx) =>
        idx === index
          ? { ...email, suggested: false, accepted: true, subject: email.subject.replace(/^Suggested\s*/i, "") }
          : email,
      ),
    );
    toast.success(`Accepted suggested Step ${index + 1}`);
  };

  const handleAddStep = () => {
    const nextStep = emails.length + 1;
    const nextDay = (emails[emails.length - 1]?.day ?? 0) + 3;
    const nextEmail = createDraftEmail(nextStep, nextDay);
    setEmails((current) => [...current, nextEmail]);
    setEditingIndex(nextStep - 1);
    toast.success(`Step ${nextStep} added`);
  };

  const handleDeleteStep = (index: number) => {
    if (emails.length <= 1) {
      toast.error("At least one sequence step is required");
      return;
    }

    const removedStep = index + 1;
    setEmails((current) => current.filter((_, idx) => idx !== index));
    setEditingIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
    toast.success(`Deleted Step ${removedStep}`);
  };

  const handleAcceptSuggestedSequence = () => {
    setEmails((current) => [
      ...current,
      {
        ...suggestedEmail,
        id: `seq-email-${Date.now()}`,
        suggested: false,
        accepted: true,
      },
    ]);
    setSuggestedSequenceState("accepted");
    toast.success(`Added suggested Step ${suggestedStep}`);
  };

  const handleDiscardSuggestedSequence = () => {
    setSuggestedSequenceState("dismissed");
    toast.success("Suggested sequence discarded");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 py-3 border-b border-[#e9e9e7] shrink-0 bg-white">
        <p className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>
          Email Sequence
        </p>
        <p className="text-[10px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>
          {isLaunched
            ? `Sent ${sentSoFar}/${totalTargetLeads} emails · Remaining sends use recipient local-time windows`
            : "Prompt-first sequence editing with lead-based preview"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {emails.map((email, index) => (
          <EmailCard
            key={email.id}
            email={email}
            step={index + 1}
            isLaunched={isLaunched}
            onEdit={() => setEditingIndex(index)}
            onAcceptSuggestion={() => handleAcceptSuggestedEmail(index)}
            onDelete={() => handleDeleteStep(index)}
            canDelete={emails.length > 1}
            onLeadClick={onLeadClick}
          />
        ))}

        <div className="px-5 py-3 border-t border-[#e9e9e7] bg-white flex items-center justify-center">
          <button
            onClick={handleAddStep}
            className="w-8 h-8 rounded-lg border border-[#e9e9e7] text-[#6b6a67] hover:text-foreground hover:border-[#c8c8c6] hover:bg-[#fafaf9] transition-colors"
            style={{ fontWeight: 500 }}
            aria-label="Add email step"
          >
            +
          </button>
        </div>

        {showSuggestedSequence && (
          <SuggestedSequenceCard
            email={suggestedEmail}
            step={suggestedStep}
            onAccept={handleAcceptSuggestedSequence}
            onDiscard={handleDiscardSuggestedSequence}
          />
        )}

        {marketingAgentCreated && (
          <div className="px-5 py-3 border-t border-[#e9e9e7] bg-[#fcfcfb]">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-[#e9e9e7]">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#faf5ff" }}>
                <span className="text-[8px]" style={{ color: "#9333ea", fontWeight: 700 }}>CA</span>
              </div>
              <p className="text-[11px] text-foreground flex-1" style={{ fontWeight: 400 }}>
                Conversational Agent active. CTA can route replies here automatically.
              </p>
              {isLaunched && (
                <span className="text-[9px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200" style={{ fontWeight: 500 }}>
                  Active
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {editingEmail && editingIndex !== null && (
        <EmailEditorModal
          key={editingEmail.id}
          email={editingEmail}
          step={editingIndex + 1}
          marketingAgentCreated={marketingAgentCreated}
          onClose={() => setEditingIndex(null)}
          onSave={(updated) => handleSaveEmail(editingIndex, updated)}
          onAcceptSuggestion={() => handleAcceptSuggestedEmail(editingIndex)}
        />
      )}
    </div>
  );
}

function SuggestedSequenceCard({
  email,
  step,
  onAccept,
  onDiscard,
}: {
  email: SequenceEmail;
  step: number;
  onAccept: () => void;
  onDiscard: () => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewLead = PREVIEW_LEADS[0];
  const previewBody = useMemo(
    () => buildPreviewBody(draftFromEmail(email), previewLead, step),
    [email, previewLead, step],
  );

  return (
    <div className="px-5 py-3 border-t border-[#e9e9e7] bg-[#fcfcfb]">
      <div className="border border-blue-200 rounded-xl overflow-hidden bg-white">
        <button
          onClick={() => setPreviewOpen((current) => !current)}
          className="w-full text-left px-3.5 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <span className="text-[9px] px-1.5 py-px rounded border border-blue-200 bg-white text-blue-700" style={{ fontWeight: 500 }}>
            Suggested step {step}
          </span>
          <p className="text-[11px] text-foreground flex-1" style={{ fontWeight: 500 }}>
            Add an objection-handling follow-up
          </p>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={11}
            className={`text-[#6b6a67] transition-transform ${previewOpen ? "" : "rotate-[-90deg]"}`}
          />
        </button>

        <div className="px-3.5 py-2.5">
          <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Subject line</p>
          <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>
            {titleFromPrompt(email.promptTemplate, email.subject)}
          </p>
          <p className="text-[10px] text-[#9b9a97] mt-1.5" style={{ fontWeight: 400 }}>
            Day {email.day} · {labelForPrimaryCta(email.primaryCta)}
          </p>
        </div>

        {previewOpen && (
          <div className="px-3.5 pb-2.5 space-y-2 animate-in fade-in duration-200">
            <div className="border border-[#e9e9e7] rounded-lg bg-[#fafaf9] p-2.5">
              <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Prompt</p>
              <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 400, lineHeight: 1.55 }}>
                {email.promptTemplate}
              </p>
            </div>
            <div className="border border-[#e9e9e7] rounded-lg bg-white p-2.5">
              <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>
                Preview for {previewLead.name} · {previewLead.company}
              </p>
              <p className="text-[10px] text-foreground whitespace-pre-wrap mt-1" style={{ fontWeight: 400, lineHeight: 1.55 }}>
                {previewBody}
              </p>
            </div>
          </div>
        )}

        <div className="px-3.5 py-2.5 border-t border-[#e9e9e7] flex items-center gap-1.5">
          <button
            onClick={onAccept}
            className="text-[10px] px-2.5 py-1.5 rounded-md bg-foreground text-white hover:opacity-90 transition-opacity"
            style={{ fontWeight: 500 }}
          >
            Accept and add
          </button>
          <button
            onClick={onDiscard}
            className="text-[10px] px-2.5 py-1.5 rounded-md border border-[#e0dfdd] text-[#6b6a67] bg-white hover:bg-[#f7f7f5] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailCard({
  email,
  step,
  isLaunched,
  onEdit,
  onAcceptSuggestion,
  onDelete,
  canDelete,
  onLeadClick,
}: {
  email: SequenceEmail;
  step: number;
  isLaunched: boolean;
  onEdit: () => void;
  onAcceptSuggestion: () => void;
  onDelete: () => void;
  canDelete: boolean;
  onLeadClick?: (lead: Lead) => void;
}) {
  const [expanded, setExpanded] = useState(step === 1);
  const leadRows = getSequenceLeadRows(step, isLaunched);
  const displayTitle = titleFromPrompt(email.promptTemplate, email.subject);
  const emailHistory = getEmailHistory(step, isLaunched);
  const workflowContext = getWorkflowContext(step);
  const agentActivity = getAgentActivity(step);
  const transcript = getTranscript(step);

  const statusConfig = (() => {
    if (email.status === "sent" && isLaunched) {
      return {
        label: "Sent",
        labelClass: "bg-green-50 text-green-700 border-green-200",
        icon: <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} color="#22c55e" />,
      };
    }
    if (email.status === "scheduled" && isLaunched) {
      return {
        label: email.scheduledFor ?? "Scheduled",
        labelClass: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <HugeiconsIcon icon={HourglassIcon} size={11} color="#d97706" />,
      };
    }
    return {
      label: `Day ${email.day}`,
      labelClass: "bg-[#f7f7f5] text-[#9b9a97] border-[#e9e9e7]",
      icon: null,
    };
  })();

  const promptPanel = (
    <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-[#fafaf9]">
      <div className="px-3.5 py-2.5 border-b border-[#e9e9e7]">
        <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Prompt</p>
        <p className="text-[11px] text-foreground mt-0.5 whitespace-pre-wrap" style={{ fontWeight: 500 }}>
          {email.promptTemplate || "Prompt not set"}
        </p>
        <div className="mt-2 pt-2 border-t border-[#e9e9e7]">
          <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Subject line</p>
          <p className="text-[11px] text-foreground mt-0.5" style={{ fontWeight: 500 }}>{email.subject}</p>
        </div>
      </div>
      <div className="px-3.5 py-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {email.suggested && !email.accepted && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onAcceptSuggestion();
              }}
              className="text-[10px] px-2.5 py-1.5 rounded-md border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              style={{ fontWeight: 500 }}
            >
              Accept suggestion
            </button>
          )}
          <button
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            className="text-[10px] px-2.5 py-1.5 rounded-md bg-foreground text-white hover:opacity-90 transition-opacity"
            style={{ fontWeight: 500 }}
          >
            Edit
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              if (!canDelete) return;
              if (confirm(`Delete Step ${step} from this sequence?`)) onDelete();
            }}
            disabled={!canDelete}
            className="text-[10px] px-2.5 py-1.5 rounded-md border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            style={{ fontWeight: 500 }}
          >
            <HugeiconsIcon icon={Delete02Icon} size={10} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const leadDeliveryPanel = (
    <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-white">
      <div className="px-3.5 py-2.5 border-b border-[#e9e9e7] bg-[#fafaf9] flex items-center justify-between">
        <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>
          Lead delivery details
        </p>
        <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
          {isLaunched ? "Click lead to open detail" : "Will populate after launch"}
        </span>
      </div>
      <div className="divide-y divide-[#f0f0ee]">
        {leadRows.map((row) => (
          <button
            key={`${email.id}-${row.lead.id}`}
            onClick={() => onLeadClick?.(row.lead)}
            className="w-full px-3.5 py-2 text-left hover:bg-[#fafaf9] transition-colors disabled:hover:bg-white disabled:cursor-default"
            disabled={!onLeadClick}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-foreground truncate" style={{ fontWeight: 500 }}>
                  {row.lead.name}
                </p>
                <p className="text-[10px] text-[#9b9a97] truncate" style={{ fontWeight: 400 }}>
                  {row.lead.company}
                </p>
              </div>
              <span className="text-[9px] px-1.5 py-px rounded border border-[#e9e9e7] text-[#6b6a67]" style={{ fontWeight: 500 }}>
                {row.delivery}
              </span>
              <span className="text-[9px] text-[#9b9a97] min-w-[92px] text-right" style={{ fontWeight: 400 }}>
                {row.reply}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="border-b border-[#e9e9e7] last:border-0 bg-white">
      <button
        onClick={() => setExpanded((current) => !current)}
        className="w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-[#fafaf9] transition-colors"
      >
        <div className="w-5 h-5 rounded-md bg-[#f4f4f2] flex items-center justify-center text-[10px] text-foreground shrink-0 mt-0.5" style={{ fontWeight: 600 }}>
          {step}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[9px] px-1.5 py-px rounded border ${statusConfig.labelClass}`} style={{ fontWeight: 500 }}>
              {statusConfig.label}
            </span>
            {email.suggested && !email.accepted && (
              <span className="text-[9px] px-1.5 py-px rounded border border-blue-200 bg-blue-50 text-blue-700" style={{ fontWeight: 500 }}>
                Suggested email
              </span>
            )}
            <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{labelForPrimaryCta(email.primaryCta)}</span>
          </div>

          <p className="text-[12px] text-foreground line-clamp-1 mb-1" style={{ fontWeight: 500 }}>
            {displayTitle}
          </p>
          {email.status === "sent" && isLaunched && email.openRate !== undefined && (
            <div className="flex items-center gap-3 text-[10px] text-[#9b9a97] tabular-nums" style={{ fontWeight: 400 }}>
              <span>{email.openRate}% opened</span>
              <span>{email.clickRate}% clicked</span>
              {email.sentCount && <span>{email.sentCount} sent</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 mt-1">
          {statusConfig.icon}
          <HugeiconsIcon icon={ArrowDown01Icon} size={11} className={`text-[#9b9a97] transition-transform ${expanded ? "" : "rotate-[-90deg]"}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 pl-12 animate-in fade-in duration-200 space-y-3">
          {isLaunched ? leadDeliveryPanel : promptPanel}
          {isLaunched ? promptPanel : leadDeliveryPanel}

          {isLaunched && (
            <>
              <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-white">
                <div className="px-3.5 py-2.5 border-b border-[#e9e9e7] bg-[#fafaf9]">
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Email history</p>
                </div>
                <div className="divide-y divide-[#f0f0ee]">
                  {emailHistory.map((event) => (
                    <div key={`${event.time}-${event.event}`} className="px-3.5 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-foreground" style={{ fontWeight: 500 }}>
                          {event.event}
                        </p>
                        <p className="text-[9px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                          {event.time}
                        </p>
                      </div>
                      <p className="text-[10px] text-[#6b6a67] mt-0.5" style={{ fontWeight: 400 }}>
                        {event.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-white">
                  <div className="px-3.5 py-2.5 border-b border-[#e9e9e7] bg-[#fafaf9]">
                    <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Workflow context</p>
                  </div>
                  <div className="px-3.5 py-2.5 space-y-1.5">
                    {workflowContext.map((item) => (
                      <p key={item} className="text-[10px] text-[#6b6a67]" style={{ fontWeight: 400, lineHeight: 1.55 }}>
                        • {item}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-white">
                  <div className="px-3.5 py-2.5 border-b border-[#e9e9e7] bg-[#fafaf9]">
                    <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Agent activity</p>
                  </div>
                  <div className="px-3.5 py-2.5 space-y-2">
                    {agentActivity.map((activity) => (
                      <div key={activity.title} className="border border-[#efefec] rounded-lg px-2.5 py-2 bg-[#fcfcfb]">
                        <p className="text-[10px] text-foreground" style={{ fontWeight: 500 }}>{activity.title}</p>
                        <p className="text-[10px] text-[#6b6a67] mt-0.5" style={{ fontWeight: 400, lineHeight: 1.55 }}>
                          {activity.detail}
                        </p>
                        {activity.insight && (
                          <p className="text-[10px] text-blue-700 mt-1" style={{ fontWeight: 500, lineHeight: 1.55 }}>
                            AI insight: {activity.insight}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-white">
                <div className="px-3.5 py-2.5 border-b border-[#e9e9e7] bg-[#fafaf9]">
                  <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Transcript</p>
                </div>
                <div className="px-3.5 py-2.5 space-y-2">
                  {transcript.map((item, idx) => (
                    <div
                      key={`${item.speaker}-${idx}`}
                      className={`max-w-[92%] rounded-lg px-2.5 py-2 border ${
                        item.speaker === "Agent"
                          ? "ml-0 bg-[#f8fafc] border-[#dbeafe]"
                          : "ml-auto bg-[#fafaf9] border-[#e9e9e7]"
                      }`}
                    >
                      <p className="text-[9px] text-[#9b9a97]" style={{ fontWeight: 500 }}>{item.speaker}</p>
                      <p className="text-[10px] text-foreground mt-0.5" style={{ fontWeight: 400, lineHeight: 1.55 }}>
                        {item.line}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EmailEditorModal({
  email,
  step,
  marketingAgentCreated,
  onClose,
  onSave,
  onAcceptSuggestion,
}: {
  email: SequenceEmail;
  step: number;
  marketingAgentCreated: boolean;
  onClose: () => void;
  onSave: (updated: SequenceEmail) => void;
  onAcceptSuggestion: () => void;
}) {
  const [draft, setDraft] = useState<EmailDraft>(() => draftFromEmail(email));
  const [subjectVariant, setSubjectVariant] = useState(0);
  const [previewLeadIdx, setPreviewLeadIdx] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [regenPromptPass, setRegenPromptPass] = useState(0);

  const previewLead = PREVIEW_LEADS[previewLeadIdx] ?? PREVIEW_LEADS[0];

  const generatedSubject = useMemo(
    () => generateSubject(draft.prompt, step, subjectVariant),
    [draft.prompt, step, subjectVariant],
  );

  const previewBody = useMemo(() => buildPreviewBody(draft, previewLead, step), [draft, previewLead, step]);

  useEffect(() => {
    if (!previewLoading) return;
    const timer = setTimeout(() => setPreviewLoading(false), 700);
    return () => clearTimeout(timer);
  }, [previewLoading]);

  const handleRegeneratePrompt = () => {
    const nextPass = regenPromptPass + 1;
    setRegenPromptPass(nextPass);
    setDraft((current) => ({
      ...current,
      prompt: regeneratePrompt(current.templateKey, step, previewLead, nextPass),
    }));
    setPreviewLoading(true);
  };

  const handleTemplateChange = (templateKey: string) => {
    setDraft((current) => ({
      ...current,
      templateKey,
      prompt: defaultPromptFromTemplate(templateKey),
    }));
    setPreviewLoading(true);
  };

  const handlePreviewLeadChange = (nextIndex: number) => {
    if (nextIndex === previewLeadIdx) return;
    setPreviewLeadIdx(nextIndex);
    setPreviewLoading(true);
  };

  const handleSave = () => {
    if (!draft.prompt.trim()) {
      toast.error("Prompt cannot be empty");
      return;
    }

    onSave({
      ...email,
      subject: generatedSubject,
      templateKey: draft.templateKey,
      promptTemplate: draft.prompt,
      preview: previewSnippetFromPrompt(draft.prompt),
      primaryCta: draft.primaryCta,
      ctaLink: draft.ctaLink,
      attachmentsEnabled: draft.attachmentsEnabled,
      attachmentMode: draft.attachmentMode,
      manualFiles: draft.manualFiles,
      sendTiming: draft.sendTiming,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/55 z-[80] flex items-center justify-center p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ width: "min(95vw, 1160px)", height: "min(90vh, 760px)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between shrink-0">
          <div>
            <p className="text-[15px] text-foreground" style={{ fontWeight: 600 }}>
              Edit Step {step}
            </p>
            <p className="text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
              Prompt first. Subject is generated automatically from your prompt.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {email.suggested && !email.accepted && (
              <button
                onClick={onAcceptSuggestion}
                className="px-3 py-1.5 rounded-lg text-[12px] border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                style={{ fontWeight: 500 }}
              >
                Accept suggestion
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-lg text-[12px] bg-foreground text-white hover:opacity-90 transition-opacity"
              style={{ fontWeight: 500 }}
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5]"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-[45%_55%]">
          <div className="border-r border-[#e9e9e7] overflow-y-auto p-5 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                  Prompt
                </p>
                <button
                  onClick={handleRegeneratePrompt}
                  className="text-[10px] text-[#6b6a67] hover:text-foreground flex items-center gap-1"
                  style={{ fontWeight: 500 }}
                >
                  <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={10} />
                  Regenerate prompt
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <select
                  value={draft.templateKey}
                  onChange={(event) => handleTemplateChange(event.target.value)}
                  className="flex-1 text-[11px] text-foreground bg-[#fafaf9] border border-[#e9e9e7] rounded-lg px-2.5 py-1.5 outline-none"
                  style={{ fontWeight: 500 }}
                >
                  {PROMPT_TEMPLATES.map((template) => (
                    <option key={template.key} value={template.key}>{template.label}</option>
                  ))}
                </select>
              </div>

              <textarea
                value={draft.prompt}
                onChange={(event) => setDraft((current) => ({ ...current, prompt: event.target.value }))}
                rows={8}
                className="w-full text-[12px] text-foreground bg-[#fafaf9] border border-[#e9e9e7] rounded-lg px-3 py-2.5 outline-none focus:border-foreground/30 resize-none"
                style={{ fontWeight: 400, lineHeight: 1.6 }}
                placeholder="Describe what the email should say"
              />
            </div>

            <div className="border border-[#e9e9e7] rounded-xl p-3 bg-[#fcfcfb]">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                  Auto subject
                </p>
                <button
                  onClick={() => setSubjectVariant((current) => current + 1)}
                  className="text-[10px] text-[#6b6a67] hover:text-foreground"
                  style={{ fontWeight: 500 }}
                >
                  Regenerate subject
                </button>
              </div>
              <p className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>{generatedSubject}</p>
            </div>

            <div className="border border-[#e9e9e7] rounded-xl p-3 bg-[#fcfcfb] space-y-2.5">
              <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                Primary CTA
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: "dynamic" as const, label: "Dynamic" },
                  { key: "book-meeting" as const, label: "Book a meeting" },
                  { key: "conversational-agent" as const, label: "Conversational agent" },
                  { key: "custom-link" as const, label: "Add link" },
                ].map((cta) => {
                  const disabled = cta.key === "conversational-agent" && !marketingAgentCreated;
                  return (
                    <button
                      key={cta.key}
                      disabled={disabled}
                      onClick={() => setDraft((current) => ({ ...current, primaryCta: cta.key }))}
                      className={`text-[10px] px-2 py-1.5 rounded-md border transition-colors ${
                        draft.primaryCta === cta.key
                          ? "bg-foreground text-white border-foreground"
                          : "bg-white text-[#6b6a67] border-[#e9e9e7] hover:border-[#c8c8c6]"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                      style={{ fontWeight: 500 }}
                    >
                      {cta.label}
                    </button>
                  );
                })}
              </div>

              {(draft.primaryCta === "custom-link" || draft.primaryCta === "book-meeting") && (
                <div className="flex items-center gap-2 border border-[#e9e9e7] rounded-lg px-2.5 py-2 bg-white">
                  <HugeiconsIcon icon={LinkSquare01Icon} size={11} className="text-[#9b9a97]" />
                  <input
                    value={draft.ctaLink}
                    onChange={(event) => setDraft((current) => ({ ...current, ctaLink: event.target.value }))}
                    className="flex-1 text-[10px] text-foreground outline-none"
                    style={{ fontWeight: 400 }}
                    placeholder="https://docket.io/book/sandeep"
                  />
                </div>
              )}
            </div>

            <div className="border border-[#e9e9e7] rounded-xl p-3 bg-[#fcfcfb] space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Attachments</p>
                <button
                  onClick={() => setDraft((current) => ({ ...current, attachmentsEnabled: !current.attachmentsEnabled }))}
                  className={`w-9 h-5 rounded-full relative transition-colors ${draft.attachmentsEnabled ? "bg-foreground" : "bg-[#d6d6d3]"}`}
                  aria-label="Toggle attachments"
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${draft.attachmentsEnabled ? "left-[18px]" : "left-0.5"}`}
                  />
                </button>
              </div>

              {draft.attachmentsEnabled && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: "dynamic" as const, label: "Dynamic" },
                      { key: "slides" as const, label: "Agent slides" },
                      { key: "choose" as const, label: "Choose" },
                    ].map((mode) => (
                      <button
                        key={mode.key}
                        onClick={() => setDraft((current) => ({ ...current, attachmentMode: mode.key }))}
                        className={`text-[10px] px-2 py-1.5 rounded-md border transition-colors ${
                          draft.attachmentMode === mode.key
                            ? "bg-foreground text-white border-foreground"
                            : "bg-white text-[#6b6a67] border-[#e9e9e7] hover:border-[#c8c8c6]"
                        }`}
                        style={{ fontWeight: 500 }}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {draft.attachmentMode === "choose" && (
                    <div className="flex items-center justify-between border border-[#e9e9e7] rounded-lg px-2.5 py-2 bg-white">
                      <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                        {draft.manualFiles > 0 ? `${draft.manualFiles} file(s) selected` : "No files selected"}
                      </p>
                      <button
                        onClick={() => setDraft((current) => ({ ...current, manualFiles: current.manualFiles + 1 }))}
                        className="text-[10px] px-2.5 py-1 rounded-md border border-[#e9e9e7] hover:border-[#c8c8c6] bg-[#fafaf9]"
                        style={{ fontWeight: 500 }}
                      >
                        Choose files
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border border-[#e9e9e7] rounded-xl p-3 bg-[#fcfcfb]">
              <p className="text-[10px] text-[#9b9a97] uppercase tracking-wider mb-1.5" style={{ fontWeight: 500 }}>
                Send timing
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: "morning" as const, label: "Morning" },
                  { key: "evening" as const, label: "Evening" },
                  { key: "night" as const, label: "At night" },
                  { key: "agent" as const, label: "Let agent decide" },
                ].map((timing) => (
                  <button
                    key={timing.key}
                    onClick={() => setDraft((current) => ({ ...current, sendTiming: timing.key }))}
                    className={`text-[10px] px-2 py-1.5 rounded-md border transition-colors ${
                      draft.sendTiming === timing.key
                        ? "bg-foreground text-white border-foreground"
                        : "bg-white text-[#6b6a67] border-[#e9e9e7] hover:border-[#c8c8c6]"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {timing.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#9b9a97] mt-2" style={{ fontWeight: 400, lineHeight: 1.55 }}>
                It will be sent based on the client&apos;s input at the prospect&apos;s timezone.
              </p>
            </div>
          </div>

          <div className="bg-[#f7f7f5] flex flex-col min-h-0">
            <div className="px-4 py-3 border-y border-[#e9e9e7] bg-white flex items-center justify-between gap-2">
              <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Preview by lead</p>
              <select
                value={previewLeadIdx}
                onChange={(event) => handlePreviewLeadChange(Number(event.target.value))}
                className="text-[10px] text-foreground px-2 py-1 rounded-md bg-[#f7f7f5] border border-[#e9e9e7]"
                style={{ fontWeight: 500 }}
              >
                {PREVIEW_LEADS.map((lead, idx) => (
                  <option key={lead.id} value={idx}>{lead.name} · {lead.company}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {previewLoading ? (
                <div className="bg-white rounded-xl border border-[#e9e9e7] p-4 animate-pulse">
                  <div className="flex items-center gap-1.5 text-[#9b9a97] mb-3">
                    <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={11} className="animate-spin" />
                    <p className="text-[10px]" style={{ fontWeight: 500 }}>
                      Regenerating preview for {previewLead.name}
                    </p>
                  </div>
                  <div className="h-3 bg-[#ededea] rounded w-2/3 mb-2" />
                  <div className="h-2.5 bg-[#ededea] rounded w-full mb-1.5" />
                  <div className="h-2.5 bg-[#ededea] rounded w-5/6 mb-1.5" />
                  <div className="h-2.5 bg-[#ededea] rounded w-4/6" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl border border-[#e9e9e7] shadow-sm overflow-hidden">
                    <div className="px-4 pt-3 pb-2.5 border-b border-[#e9e9e7] bg-[#fafaf9]">
                      <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                        from: sandeep@docket.io · to: {previewLead.email}
                      </p>
                      <p className="text-[13px] text-foreground leading-snug mt-1" style={{ fontWeight: 600 }}>
                        {generatedSubject}
                      </p>
                    </div>

                    <div className="px-4 py-3">
                      <p className="text-[12px] text-foreground whitespace-pre-wrap" style={{ fontWeight: 400, lineHeight: 1.7 }}>
                        {previewBody}
                      </p>
                    </div>
                  </div>

                  <div className="px-3 py-2.5 bg-white border border-[#e9e9e7] rounded-lg space-y-1.5">
                    <p className="text-[10px] text-[#6b6a67]" style={{ fontWeight: 500 }}>
                      Personalization notes
                    </p>
                    <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400, lineHeight: 1.55 }}>
                      This preview updates automatically using warm-context signals, recent replies, and CRM stage.
                    </p>
                    <p className="text-[10px] text-[#9b9a97] flex items-center gap-1.5" style={{ fontWeight: 400 }}>
                      {draft.primaryCta === "conversational-agent" && <HugeiconsIcon icon={AiChat02Icon} size={10} />}
                      CTA mode: {labelForPrimaryCta(draft.primaryCta)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Lead, CampaignEmail } from "./types";
import { LEADS, ACTIVITY_LOG, getScoreLevel } from "./types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface TimelineItem {
  text: string;
  isGreen: boolean;
}

export interface PreSendNote {
  title: string;
  subtitle: string;
}

export interface CampaignTimeline {
  day1Label: string;
  day1Items: TimelineItem[];
  dayNLabel: string;
  dayNItems: TimelineItem[];
  preSendNote?: PreSendNote;
  meetingsText: string;
  metricsCard: {
    dayLabel: string;
    badge: string;
    stats: string[];
    warning?: string;
  };
}

export interface KPIStat {
  label: string;
  value: string;
  benchmark: string;
}

export interface SequenceStepData {
  step: string;
  name: string;
  color: string;
  launchedSent: number;
  runningSent: number;
  launchedOpen: number;
  runningOpen: number;
  launchedMtgs: number;
  runningMtgs: number;
}

export interface ActionCardData {
  type: "warning" | "escalation" | "success";
  borderColor: string;
  bgColor: string;
  hoverBg: string;
  icon: string;
  title: string;
  subtitle: string;
  buttonLabel?: string;
  buttonToast?: string;
  discardBorderColor: string;
  discardTextColor: string;
  discardHoverBg: string;
}

export interface CampaignOverview {
  brief: string;
  liveDay: string;
  preLaunchKPIs: KPIStat[];
  launchedKPIs: KPIStat[];
  runningKPIs: KPIStat[];
  sequenceSteps: SequenceStepData[];
  dataSources: string[];
  actionCards: ActionCardData[];
}

export interface ChatHistoryMsg {
  id: string;
  role: "docket" | "user";
  content: string;
}

export interface CampaignData {
  slug: string;
  name: string;
  leads: Lead[];
  activityLog: { time: string; icon: string; text: string }[];
  timeline: CampaignTimeline;
  overview: CampaignOverview;
  launchConfig: { audience: string; sequence: string };
  chainOfThought: { iconKey: string; title: string }[];
  chatHistory?: ChatHistoryMsg[];
}

// ── Helper ───────────────────────────────────────────────────────────────────

function makeLead(
  id: string,
  name: string,
  company: string,
  role: string,
  score: number,
  segment: "A" | "B" | "C",
  status: Lead["status"],
  warmContext: string,
  agentNotes: string,
  activity: Lead["activity"],
  lostReason?: string,
): Lead {
  return {
    id,
    name,
    company,
    role,
    score,
    scoreLevel: getScoreLevel(score),
    segment,
    status,
    emails: [],
    journey: status === "meeting-booked"
      ? ["Captured", "Qualified", "Nurturing", "Meeting Booked"]
      : ["Captured", "Qualified", "Nurturing"],
    activity,
    warmContext,
    agentNotes,
    lostReason,
  };
}

// ── Campaign 1: Re-engage Stalled Pipeline Deals ─────────────────────────────

const campaign1: CampaignData = {
  slug: "reengage-pipeline",
  name: "Re-engage Stalled Pipeline Deals",
  leads: LEADS,
  activityLog: ACTIVITY_LOG,
  timeline: {
    day1Label: "DAY 1",
    day1Items: [
      { text: "Email 1: 34 sent · 71% open · 24% click", isGreen: true },
      { text: "High-intent recipients replied quickly (3 meetings booked)", isGreen: true },
      { text: "Next send moved to proof-focused CTA", isGreen: true },
    ],
    dayNLabel: "DAY 3 (Today)",
    dayNItems: [
      { text: "Email 2: 16 sent · 63% open · 25% click", isGreen: true },
    ],
    preSendNote: {
      title: "Pre-send: James Wong CTA → Booking link",
      subtitle: "3 pricing visits detected · Result: meeting booked ✓",
    },
    meetingsText: "3 meetings booked",
    metricsCard: {
      dayLabel: "Day 3 Results",
      badge: "8.8% conv.",
      stats: ["3 meetings", "44 sent", "68% open"],
      warning: "4 leads in Email 2: CTA mismatch — switch to Reply Prompt?",
    },
  },
  overview: {
    brief: "34 deals stalled 30+ days. 18 visited pricing recently.",
    liveDay: "Day 3",
    preLaunchKPIs: [
      { label: "Total Leads", value: "34", benchmark: "" },
      { label: "Pipeline at Risk", value: "$180K", benchmark: "" },
      { label: "Pricing Visitors", value: "18", benchmark: "53% of leads" },
      { label: "Recent Touchpoints", value: "6", benchmark: "" },
    ],
    launchedKPIs: [
      { label: "Emails Sent", value: "18", benchmark: "" },
      { label: "Open Rate", value: "—", benchmark: "" },
      { label: "Click Rate", value: "—", benchmark: "" },
      { label: "Meetings Booked", value: "0", benchmark: "" },
    ],
    runningKPIs: [
      { label: "Emails Sent", value: "44", benchmark: "" },
      { label: "Open Rate", value: "68%", benchmark: "vs 45% avg" },
      { label: "Click Rate", value: "24%", benchmark: "vs 8% avg" },
      { label: "Meetings Booked", value: "3", benchmark: "8.8% conv." },
    ],
    sequenceSteps: [
      { step: "1", name: "Re-engagement opener", color: "#2563eb", launchedSent: 18, runningSent: 34, launchedOpen: 0, runningOpen: 71, launchedMtgs: 0, runningMtgs: 3 },
      { step: "2", name: "Proof follow-up", color: "#f59e0b", launchedSent: 0, runningSent: 16, launchedOpen: 0, runningOpen: 63, launchedMtgs: 0, runningMtgs: 0 },
      { step: "3", name: "Final nudge", color: "#22c55e", launchedSent: 0, runningSent: 0, launchedOpen: 0, runningOpen: 0, launchedMtgs: 0, runningMtgs: 0 },
    ],
    dataSources: [
      "HubSpot Pipeline: 34 stalled deals",
      "Web Analytics: 18 pricing page visitors",
      "Sales Activity: 6 CRM touchpoints",
      "Email History: 22 received marketing emails",
    ],
    actionCards: [
      {
        type: "warning",
        borderColor: "border-amber-200",
        bgColor: "bg-amber-50/50",
        hoverBg: "hover:bg-amber-50/80",
        icon: "⚠",
        title: "4 leads in Email 2: CTA mismatch",
        subtitle: "Opening emails but not clicking — suggest switching CTAs",
        buttonLabel: "Switch all 4 CTAs",
        buttonToast: "CTAs updated for 4 leads",
        discardBorderColor: "border-amber-200",
        discardTextColor: "text-amber-700",
        discardHoverBg: "hover:bg-amber-50",
      },
      {
        type: "escalation",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50/50",
        hoverBg: "hover:bg-blue-50/80",
        icon: "↗",
        title: "Anna Kumar — ready for AE handoff",
        subtitle: "ICP 71 · Opened and clicked every email but no meeting",
        buttonLabel: "Handoff to AE",
        buttonToast: "Slack message sent to AE team",
        discardBorderColor: "border-blue-200",
        discardTextColor: "text-blue-700",
        discardHoverBg: "hover:bg-blue-50",
      },
      {
        type: "success",
        borderColor: "border-green-200",
        bgColor: "bg-green-50/50",
        hoverBg: "",
        icon: "✓",
        title: "Pre-send upgrade worked — James Wong booked",
        subtitle: "CTA auto-upgraded from Case Study → Booking link after 3 pricing page visits. Meeting confirmed.",
        discardBorderColor: "border-green-200",
        discardTextColor: "text-green-700",
        discardHoverBg: "hover:bg-green-50",
      },
    ],
  },
  launchConfig: { audience: "34 leads", sequence: "3 emails (Day 0, 3, 7)" },
  chainOfThought: [
    { iconKey: "checkmark", title: "Pulled 34 deals from HubSpot pipeline" },
    { iconKey: "checkmark", title: "Enriched warm context for 34 leads (28 accounts)" },
    { iconKey: "clock", title: "Evaluating best approach..." },
  ],
};

// ── Campaign 2: Webinar Follow-Up: Security Summit ──────────────────────────

const webinarLeads: Lead[] = [
  makeLead("rachel-torres", "Rachel Torres", "CyberShield Inc", "VP Security", 88, "A", "meeting-booked",
    "Rachel is VP Security at CyberShield (enterprise cybersecurity). Asked 3 questions during the webinar Q&A about zero-trust architecture. Stayed for the full 90-minute session and requested a follow-up demo.\n\nICP Score: 88",
    "Segment: Engaged (Hot)\nReason: Active Q&A participant + demo request. Direct booking CTA.",
    [
      { id: "1", timestamp: "Today 3:20pm", type: "meeting-booked", icon: "calendar", description: "Booked a demo with AE after follow-up email" },
      { id: "2", timestamp: "Today 9:00am", type: "email-opened", icon: "mail", description: "Opened follow-up Email 2, clicked demo link" },
      { id: "3", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1, clicked recording link" },
      { id: "4", timestamp: "Last Thursday", type: "agent-convo", icon: "robot", description: "Webinar Q&A: asked about zero-trust architecture (3 questions)" },
    ]),
  makeLead("marcus-johnson", "Marcus Johnson", "HealthNet", "CISO", 79, "A", "meeting-booked",
    "Marcus is CISO at HealthNet (healthcare SaaS). Attended the full webinar and downloaded the compliance checklist afterward. Has a HIPAA compliance renewal coming up.\n\nICP Score: 79",
    "Segment: Engaged (Hot)\nReason: Full attendance + compliance asset download. HIPAA deadline creates urgency.",
    [
      { id: "1", timestamp: "Today 11:00am", type: "meeting-booked", icon: "calendar", description: "Replied to Email 2 — meeting scheduled" },
      { id: "2", timestamp: "Day 2", type: "download", icon: "clipboard", description: "Downloaded HIPAA compliance checklist" },
      { id: "3", timestamp: "Last Thursday", type: "agent-convo", icon: "robot", description: "Attended full webinar session (90 min)" },
    ]),
  makeLead("elena-volkov", "Elena Volkov", "FinanceFirst", "Security Architect", 74, "A", "high-engagement",
    "Elena is Security Architect at FinanceFirst. Engaged heavily during the webinar — asked about API security patterns. Opened both emails and clicked but hasn't booked.\n\nICP Score: 74",
    "Segment: Engaged (Hot)\nReason: Active participation + consistent email engagement. Consider AE escalation.",
    [
      { id: "1", timestamp: "Today 10:15am", type: "link-clicked", icon: "link", description: "Clicked Email 2 — viewed case study" },
      { id: "2", timestamp: "Day 1", type: "link-clicked", icon: "link", description: "Clicked Email 1 recording link" },
      { id: "3", timestamp: "Last Thursday", type: "agent-convo", icon: "robot", description: "Webinar Q&A: API security patterns" },
    ]),
  makeLead("amir-patel", "Amir Patel", "RetailMax", "IT Security Lead", 68, "B", "opened-no-click",
    "Amir attended the webinar but left after 45 minutes. Opened Email 1 but didn't click. Works in retail — may need industry-specific angle.\n\nICP Score: 68",
    "Segment: Active Attendee\nOpened emails but low click-through. Switch to industry-specific case study CTA.",
    [
      { id: "1", timestamp: "Day 3", type: "email-opened", icon: "mail", description: "Opened Email 2, no click" },
      { id: "2", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1, no click" },
      { id: "3", timestamp: "Last Thursday", type: "agent-convo", icon: "robot", description: "Attended webinar (45 min, left early)" },
    ]),
  makeLead("sophie-chen", "Sophie Chen", "BioGen", "Compliance Manager", 63, "B", "partial-engagement",
    "Sophie registered for the webinar and attended the first 30 minutes. Opened Email 1 but didn't click. Compliance-focused — may need regulatory angle.\n\nICP Score: 63",
    "Segment: Active Attendee\nPartial attendance. Compliance-focused — use regulatory content angle.",
    [
      { id: "1", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1, no click" },
      { id: "2", timestamp: "Last Thursday", type: "agent-convo", icon: "robot", description: "Attended webinar (30 min)" },
    ]),
  makeLead("jason-miller", "Jason Miller", "CloudStack", "DevSecOps Lead", 56, "B", "meeting-booked",
    "Jason attended the full webinar and had a 5-minute agent conversation afterward about CI/CD security scanning. Booked a technical demo.\n\nICP Score: 56",
    "Segment: Active Attendee\nAgent conversation post-webinar. Technical buyer — booked demo.",
    [
      { id: "1", timestamp: "Day 4", type: "meeting-booked", icon: "calendar", description: "Booked technical demo via agent conversation link" },
      { id: "2", timestamp: "Day 1", type: "link-clicked", icon: "link", description: "Clicked Email 1, started agent conversation" },
      { id: "3", timestamp: "Last Thursday", type: "agent-convo", icon: "robot", description: "Post-webinar agent chat: CI/CD security scanning (5 min)" },
    ]),
  makeLead("diana-roberts", "Diana Roberts", "InsureTech", "Risk Analyst", 48, "C", "partial-engagement",
    "Diana registered but only watched the recording. Opened Email 1 with a 2-second open — likely a preview. No meaningful engagement yet.\n\nICP Score: 48",
    "Segment: Passive\nRegistered but low engagement. Recording viewer — try value-focused angle.",
    [
      { id: "1", timestamp: "Day 2", type: "email-opened", icon: "mail", description: "Opened Email 1 (brief view)" },
      { id: "2", timestamp: "Last Thursday", type: "web-visit", icon: "globe", description: "Watched recording (12 min of 90)" },
    ]),
  makeLead("kevin-walsh", "Kevin Walsh", "MediaCorp", "Infrastructure Manager", 41, "C", "no-engagement",
    "Kevin registered for the webinar but didn't attend. Email 1 unopened. No engagement signals.\n\nICP Score: 41",
    "Segment: Passive (No-show)\nRegistered but no-show. Send recording with key highlights summary.",
    [
      { id: "1", timestamp: "Day 1", type: "email-sent", icon: "mail", description: "Email 1 sent (unopened)" },
    ]),
];

const campaign2: CampaignData = {
  slug: "webinar-followup",
  name: "Webinar Follow-Up: Security Summit",
  leads: webinarLeads,
  activityLog: [
    { time: "Today 3:20pm", icon: "calendar", text: "Meeting booked: Rachel Torres (CyberShield)" },
    { time: "Today 11:00am", icon: "calendar", text: "Meeting booked: Marcus Johnson (HealthNet)" },
    { time: "Today 10:15am", icon: "link", text: "Elena Volkov clicked case study link" },
    { time: "Today 9:00am", icon: "mail", text: "Email 2 sent to 28 attendees" },
    { time: "Day 4", icon: "calendar", text: "Meeting booked: Jason Miller (CloudStack) — technical demo" },
    { time: "Day 3", icon: "mail", text: "Email 2 sent to 19 engaged attendees" },
    { time: "Day 1 9:00am", icon: "mail", text: "Email 1 sent to 47 registrants" },
    { time: "Day 1 8:55am", icon: "robot", text: "Campaign launched: Webinar Follow-Up: Security Summit" },
  ],
  timeline: {
    day1Label: "DAY 1",
    day1Items: [
      { text: "Email 1: 47 sent · 62% open · 28% click", isGreen: true },
      { text: "12 attendees clicked the recording link", isGreen: true },
      { text: "3 post-webinar agent conversations started", isGreen: true },
    ],
    dayNLabel: "DAY 5 (Today)",
    dayNItems: [
      { text: "Email 2: 47 sent · 51% open · 22% click", isGreen: true },
    ],
    preSendNote: {
      title: "Auto-personalized: Q&A participants got topic-specific follow-ups",
      subtitle: "3 leads received zero-trust content · 2 got compliance guides",
    },
    meetingsText: "5 meetings booked",
    metricsCard: {
      dayLabel: "Day 5 Results",
      badge: "10.6% conv.",
      stats: ["5 meetings", "94 sent", "51% open"],
      warning: "6 Q&A participants opened but haven't booked — send demo invite?",
    },
  },
  overview: {
    brief: "47 attended your Security Summit webinar. 12 had post-event agent conversations.",
    liveDay: "Day 5",
    preLaunchKPIs: [
      { label: "Registrants", value: "47", benchmark: "" },
      { label: "Avg Attendance", value: "64 min", benchmark: "" },
      { label: "Q&A Participants", value: "12", benchmark: "26% of attendees" },
      { label: "Post-Event Agent Chats", value: "8", benchmark: "" },
    ],
    launchedKPIs: [
      { label: "Emails Sent", value: "47", benchmark: "" },
      { label: "Open Rate", value: "—", benchmark: "" },
      { label: "Click Rate", value: "—", benchmark: "" },
      { label: "Meetings Booked", value: "0", benchmark: "" },
    ],
    runningKPIs: [
      { label: "Emails Sent", value: "94", benchmark: "" },
      { label: "Open Rate", value: "51%", benchmark: "vs 38% avg" },
      { label: "Click Rate", value: "22%", benchmark: "vs 6% avg" },
      { label: "Meetings Booked", value: "5", benchmark: "10.6% conv." },
    ],
    sequenceSteps: [
      { step: "1", name: "Post-webinar follow-up", color: "#2563eb", launchedSent: 47, runningSent: 47, launchedOpen: 0, runningOpen: 62, launchedMtgs: 0, runningMtgs: 3 },
      { step: "2", name: "Topic-specific deep dive", color: "#f59e0b", launchedSent: 0, runningSent: 47, launchedOpen: 0, runningOpen: 51, launchedMtgs: 0, runningMtgs: 2 },
      { step: "3", name: "Demo or recording nudge", color: "#22c55e", launchedSent: 0, runningSent: 0, launchedOpen: 0, runningOpen: 0, launchedMtgs: 0, runningMtgs: 0 },
    ],
    dataSources: [
      "Webinar Platform: 47 attendees, 12 Q&A participants",
      "Agent Conversations: 8 post-event chats",
      "HubSpot: 47 contacts enriched",
      "Web Analytics: 15 visited product pages post-event",
    ],
    actionCards: [
      {
        type: "warning",
        borderColor: "border-amber-200",
        bgColor: "bg-amber-50/50",
        hoverBg: "hover:bg-amber-50/80",
        icon: "⚠",
        title: "6 Q&A participants opened but haven't booked",
        subtitle: "High intent from webinar engagement — send personalized demo invite",
        buttonLabel: "Send demo invites",
        buttonToast: "Demo invites queued for 6 leads",
        discardBorderColor: "border-amber-200",
        discardTextColor: "text-amber-700",
        discardHoverBg: "hover:bg-amber-50",
      },
      {
        type: "escalation",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50/50",
        hoverBg: "hover:bg-blue-50/80",
        icon: "↗",
        title: "Elena Volkov — ready for AE handoff",
        subtitle: "ICP 74 · Asked about API security in Q&A, clicked every email, no meeting",
        buttonLabel: "Handoff to AE",
        buttonToast: "Slack message sent to AE team",
        discardBorderColor: "border-blue-200",
        discardTextColor: "text-blue-700",
        discardHoverBg: "hover:bg-blue-50",
      },
      {
        type: "success",
        borderColor: "border-green-200",
        bgColor: "bg-green-50/50",
        hoverBg: "",
        icon: "✓",
        title: "Marcus Johnson booked — HIPAA compliance angle worked",
        subtitle: "Compliance checklist download → personalized follow-up → meeting in 48 hours.",
        discardBorderColor: "border-green-200",
        discardTextColor: "text-green-700",
        discardHoverBg: "hover:bg-green-50",
      },
    ],
  },
  launchConfig: { audience: "47 leads", sequence: "3 emails (Day 0, 3, 7)" },
  chainOfThought: [
    { iconKey: "checkmark", title: "Imported 47 webinar attendees with engagement data" },
    { iconKey: "checkmark", title: "Mapped Q&A topics to personalization angles" },
    { iconKey: "clock", title: "Segmenting by engagement level..." },
  ],
  chatHistory: [
    { id: "wh-1", role: "user", content: "How's the webinar follow-up going?" },
    { id: "wh-2", role: "docket", content: "Strong results so far. 51% open rate across 94 emails sent, with 5 meetings booked in 5 days. The Q&A participants are converting 3x better than passive attendees — Rachel Torres and Marcus Johnson both booked within 48 hours of receiving Email 1.\n\nThe no-show segment (registered but didn't attend) has a 12% open rate — I recommend switching their Email 2 to a recording highlight reel with a shorter subject line." },
    { id: "wh-3", role: "user", content: "Tell me more about Rachel Torres" },
    { id: "wh-4", role: "docket", content: "Rachel Torres (VP Security, CyberShield Inc) — ICP 88, your highest-scoring lead in this campaign.\n\nShe asked 3 questions during the webinar Q&A about zero-trust architecture, stayed for the full 90-minute session, and requested a demo follow-up. She opened both emails, clicked the demo link in Email 2, and booked a demo with AE today at 3:20pm.\n\nEstimated deal size: $28K. She's in advanced evaluation — the demo should focus on zero-trust compliance features since that's her primary concern." },
    { id: "wh-5", role: "user", content: "What about attendees who asked questions but haven't booked?" },
    { id: "wh-6", role: "docket", content: "6 Q&A participants have opened emails but haven't booked yet:\n\n• **Elena Volkov** (FinanceFirst) — ICP 74. Asked about API security. Clicked both emails. High engagement but no meeting. Recommend AE escalation.\n• **Amir Patel** (RetailMax) — ICP 68. Left early (45 min). Opens but no clicks. Needs industry-specific angle.\n• **Sophie Chen** (BioGen) — ICP 63. Compliance-focused. Opened Email 1 only. Try regulatory content CTA.\n• 3 others with lower engagement scores.\n\nI suggest sending a personalized demo invite to all 6 — referencing the specific Q&A topic each person asked about. Want me to queue those?" },
    { id: "wh-7", role: "user", content: "Can you show me the pipeline breakdown?" },
    { id: "wh-8", role: "docket", content: "$62K total pipeline generated across 5 meetings:\n\n• **CyberShield** (Rachel Torres) — $28K est. Demo booked. Zero-trust evaluation.\n• **HealthNet** (Marcus Johnson) — $18K est. HIPAA compliance renewal driver.\n• **CloudStack** (Jason Miller) — $8K est. Technical demo booked. DevSecOps buyer, fast-moving.\n• **2 additional meetings** — $8K combined from smaller accounts.\n\nThe webinar-to-pipeline conversion is running at 10.6%, well above the 4% benchmark for event follow-ups. The Q&A personalization strategy is the main driver." },
  ],
};

// ── Campaign 3: Product-Led Trial Nurture ────────────────────────────────────

const trialLeads: Lead[] = [
  makeLead("alex-rivera", "Alex Rivera", "DataPipe", "Engineering Manager", 91, "A", "meeting-booked",
    "Alex is Engineering Manager at DataPipe (data infrastructure). Power user — 47 API calls in trial week, built 3 integrations. Hit the free tier rate limit twice. Clear upgrade signal.\n\nICP Score: 91",
    "Segment: Power Users (Hot)\nHigh API usage + rate limit hits. Direct upgrade path.",
    [
      { id: "1", timestamp: "Today 2:00pm", type: "meeting-booked", icon: "calendar", description: "Booked upgrade consultation after hitting rate limit" },
      { id: "2", timestamp: "Today 9:00am", type: "email-opened", icon: "mail", description: "Opened Email 1, clicked upgrade CTA" },
      { id: "3", timestamp: "Yesterday", type: "web-visit", icon: "globe", description: "Hit API rate limit (2nd time)" },
    ]),
  makeLead("nina-sharma", "Nina Sharma", "ScaleUp", "Backend Developer", 85, "A", "meeting-booked",
    "Nina is a Backend Developer at ScaleUp (Series B). Used the API playground extensively — 23 test calls. Invited 2 teammates to the trial. Team buying signal.\n\nICP Score: 85",
    "Segment: Power Users (Hot)\nTeam invite = expansion signal. Multi-seat upgrade opportunity.",
    [
      { id: "1", timestamp: "Today 11:30am", type: "meeting-booked", icon: "calendar", description: "Booked team demo after inviting 2 teammates" },
      { id: "2", timestamp: "Yesterday", type: "link-clicked", icon: "link", description: "Invited 2 teammates to trial workspace" },
      { id: "3", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1, clicked documentation link" },
    ]),
  makeLead("chris-park", "Chris Park", "BuildFast", "Product Lead", 78, "A", "high-engagement",
    "Chris is Product Lead at BuildFast. Active daily user — logged in 6 of 7 trial days. Explored advanced features (webhooks, custom fields) but hasn't upgraded or booked.\n\nICP Score: 78",
    "Segment: Power Users (Hot)\nDaily active use. Exploring advanced features. Needs nudge to convert.",
    [
      { id: "1", timestamp: "Today", type: "link-clicked", icon: "link", description: "Clicked Email 1 CTA — viewed pricing page" },
      { id: "2", timestamp: "Yesterday", type: "web-visit", icon: "globe", description: "Explored webhook configuration (15 min)" },
      { id: "3", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1" },
    ]),
  makeLead("maya-andersson", "Maya Andersson", "EnterpriseAI", "Solutions Architect", 72, "B", "meeting-booked",
    "Maya is Solutions Architect at EnterpriseAI. Moderate trial usage — focused on SSO and audit log features. Enterprise evaluation pattern.\n\nICP Score: 72",
    "Segment: Active Users\nEnterprise feature exploration. Likely evaluating for larger team.",
    [
      { id: "1", timestamp: "Day 1", type: "meeting-booked", icon: "calendar", description: "Booked enterprise features walkthrough" },
      { id: "2", timestamp: "Day 1", type: "web-visit", icon: "globe", description: "Explored SSO and audit log settings" },
    ]),
  makeLead("jordan-lee", "Jordan Lee", "AppForge", "Full Stack Developer", 65, "B", "opened-no-click",
    "Jordan is a Full Stack Dev at AppForge. Created account, ran the quickstart, but hasn't used the product since Day 2. Opened emails but hasn't clicked.\n\nICP Score: 65",
    "Segment: Active Users\nQuickstart completed but went dormant. Needs activation help.",
    [
      { id: "1", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1, no click" },
      { id: "2", timestamp: "Trial Day 2", type: "web-visit", icon: "globe", description: "Completed quickstart tutorial" },
    ]),
  makeLead("sam-williams", "Sam Williams", "InfraCore", "DevOps Lead", 59, "B", "partial-engagement",
    "Sam is DevOps Lead at InfraCore. Signed up for trial but only logged in once. Opened Email 1 briefly.\n\nICP Score: 59",
    "Segment: Active Users\nLow trial engagement. May need use-case specific onboarding.",
    [
      { id: "1", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1 briefly" },
      { id: "2", timestamp: "Trial Day 1", type: "web-visit", icon: "globe", description: "Logged in once, viewed dashboard" },
    ]),
  makeLead("taylor-kim", "Taylor Kim", "AnalyticsCo", "Data Engineer", 44, "C", "meeting-booked",
    "Taylor is a Data Engineer at AnalyticsCo. Trial expired 3 days ago. Re-engaged after receiving expiry reminder with a limited-time offer.\n\nICP Score: 44",
    "Segment: Dormant Trials\nTrial expired. Re-activated via urgency angle.",
    [
      { id: "1", timestamp: "Today", type: "meeting-booked", icon: "calendar", description: "Booked after trial extension offer" },
      { id: "2", timestamp: "Yesterday", type: "email-opened", icon: "mail", description: "Opened trial expiry reminder, clicked extend" },
    ]),
  makeLead("morgan-hayes", "Morgan Hayes", "TestPro", "QA Manager", 38, "C", "no-engagement",
    "Morgan is QA Manager at TestPro. Signed up 2 weeks ago, never logged in. All emails unopened.\n\nICP Score: 38",
    "Segment: Dormant Trials\nZero engagement. Likely abandoned trial.",
    [
      { id: "1", timestamp: "Day 1", type: "email-sent", icon: "mail", description: "Email 1 sent (unopened)" },
    ]),
];

const campaign3: CampaignData = {
  slug: "trial-nurture",
  name: "Product-Led Trial Nurture",
  leads: trialLeads,
  activityLog: [
    { time: "Today 2:00pm", icon: "calendar", text: "Meeting booked: Alex Rivera (DataPipe) — upgrade consultation" },
    { time: "Today 11:30am", icon: "calendar", text: "Meeting booked: Nina Sharma (ScaleUp) — team demo" },
    { time: "Today 9:00am", icon: "mail", text: "Email 1 batch 3: sent to 42 dormant trials" },
    { time: "Yesterday", icon: "calendar", text: "Meeting booked: Taylor Kim (AnalyticsCo) — trial extension" },
    { time: "Yesterday", icon: "robot", text: "Auto-segmented: 12 power users identified by API usage" },
    { time: "Day 1 9:00am", icon: "mail", text: "Email 1 batch 1: sent to 86 active trial users" },
    { time: "Day 1 8:55am", icon: "robot", text: "Campaign launched: Product-Led Trial Nurture" },
  ],
  timeline: {
    day1Label: "DAY 1",
    day1Items: [
      { text: "Email 1 batch 1: 86 sent to active trials · 38% open · 14% click", isGreen: true },
      { text: "12 power users identified — API usage > 20 calls/day", isGreen: true },
      { text: "4 team invites detected (expansion signals)", isGreen: true },
    ],
    dayNLabel: "DAY 2 (Today)",
    dayNItems: [
      { text: "Email 1 batch 2-3: 170 more sent · 28% open · 10% click", isGreen: true },
    ],
    preSendNote: {
      title: "Auto-upgrade nudge: Alex Rivera hit rate limit (2nd time)",
      subtitle: "Triggered upgrade CTA instead of standard follow-up · Result: meeting booked ✓",
    },
    meetingsText: "8 meetings booked (4 from power users)",
    metricsCard: {
      dayLabel: "Day 2 Results",
      badge: "6.3% conv.",
      stats: ["8 meetings", "256 sent", "31% open"],
      warning: "12 power users hitting plan limits — trigger upgrade flow?",
    },
  },
  overview: {
    brief: "128 free trial users across 3 cohorts. 12 power users hitting plan limits.",
    liveDay: "Day 2",
    preLaunchKPIs: [
      { label: "Active Trials", value: "128", benchmark: "" },
      { label: "Power Users", value: "12", benchmark: "API >20 calls/day" },
      { label: "Team Invites", value: "4", benchmark: "expansion signal" },
      { label: "Expired Trials", value: "42", benchmark: "last 7 days" },
    ],
    launchedKPIs: [
      { label: "Emails Sent", value: "86", benchmark: "" },
      { label: "Open Rate", value: "—", benchmark: "" },
      { label: "Click Rate", value: "—", benchmark: "" },
      { label: "Meetings Booked", value: "0", benchmark: "" },
    ],
    runningKPIs: [
      { label: "Emails Sent", value: "256", benchmark: "" },
      { label: "Open Rate", value: "31%", benchmark: "vs 24% avg" },
      { label: "Click Rate", value: "12%", benchmark: "vs 5% avg" },
      { label: "Meetings Booked", value: "8", benchmark: "6.3% conv." },
    ],
    sequenceSteps: [
      { step: "1", name: "Activation & value highlight", color: "#2563eb", launchedSent: 86, runningSent: 256, launchedOpen: 0, runningOpen: 31, launchedMtgs: 0, runningMtgs: 6 },
      { step: "2", name: "Use-case deep dive", color: "#f59e0b", launchedSent: 0, runningSent: 0, launchedOpen: 0, runningOpen: 0, launchedMtgs: 0, runningMtgs: 0 },
      { step: "3", name: "Upgrade or extend offer", color: "#22c55e", launchedSent: 0, runningSent: 0, launchedOpen: 0, runningOpen: 0, launchedMtgs: 0, runningMtgs: 0 },
    ],
    dataSources: [
      "Product Analytics: 128 active trials, 12 power users",
      "Usage Data: API calls, feature adoption, team invites",
      "Billing: 42 expired trials in last 7 days",
      "Agent Conversations: 6 trial-related chats",
    ],
    actionCards: [
      {
        type: "warning",
        borderColor: "border-amber-200",
        bgColor: "bg-amber-50/50",
        hoverBg: "hover:bg-amber-50/80",
        icon: "⚠",
        title: "12 power users hitting plan limits",
        subtitle: "API usage >20 calls/day — trigger personalized upgrade flow",
        buttonLabel: "Trigger upgrade emails",
        buttonToast: "Upgrade emails queued for 12 power users",
        discardBorderColor: "border-amber-200",
        discardTextColor: "text-amber-700",
        discardHoverBg: "hover:bg-amber-50",
      },
      {
        type: "escalation",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50/50",
        hoverBg: "hover:bg-blue-50/80",
        icon: "↗",
        title: "Chris Park — daily active, hasn't upgraded",
        subtitle: "ICP 78 · Logged in 6 of 7 days, exploring webhooks. Needs human touch.",
        buttonLabel: "Handoff to AE",
        buttonToast: "Slack message sent to AE team",
        discardBorderColor: "border-blue-200",
        discardTextColor: "text-blue-700",
        discardHoverBg: "hover:bg-blue-50",
      },
      {
        type: "success",
        borderColor: "border-green-200",
        bgColor: "bg-green-50/50",
        hoverBg: "",
        icon: "✓",
        title: "Nina Sharma invited 2 teammates — team demo booked",
        subtitle: "Team invite detected → auto-sent team pricing → demo booked within 24 hours.",
        discardBorderColor: "border-green-200",
        discardTextColor: "text-green-700",
        discardHoverBg: "hover:bg-green-50",
      },
    ],
  },
  launchConfig: { audience: "128 leads", sequence: "3 emails (Day 0, 3, 7)" },
  chainOfThought: [
    { iconKey: "checkmark", title: "Pulled 128 active trial users from product analytics" },
    { iconKey: "checkmark", title: "Scored by API usage, feature adoption, and login frequency" },
    { iconKey: "clock", title: "Segmenting into power users, active, and dormant..." },
  ],
  chatHistory: [
    { id: "tn-1", role: "user", content: "How many trial users have converted so far?" },
    { id: "tn-2", role: "docket", content: "8 meetings booked from 256 emails sent (6.3% conversion). The power user segment is significantly outperforming:\n\n• **Power users** (API >20 calls/day): 4 meetings from 12 users — 33% conversion rate\n• **Active users**: 3 meetings from 74 users — 4.1% conversion\n• **Dormant trials**: 1 meeting from 42 expired trials — 2.4% conversion\n\nThe power user segment converts 8x better than average. These users are already hitting product limits — the upgrade path is natural." },
    { id: "tn-3", role: "user", content: "Tell me about Alex Rivera" },
    { id: "tn-4", role: "docket", content: "Alex Rivera (Engineering Manager, DataPipe) — ICP 91, your highest-scoring trial lead.\n\nHe made 47 API calls in his first trial week and built 3 integrations. He hit the free tier rate limit twice — once yesterday and once today. The second rate limit hit triggered our auto-upgrade nudge email, which changed his CTA from a generic follow-up to a direct upgrade consultation link.\n\nResult: he opened the email, clicked the upgrade CTA, and booked a consultation today at 2pm. Estimated deal size: $12K ARR (based on his API usage projecting to the Growth plan)." },
    { id: "tn-5", role: "user", content: "Are there any trial users we're at risk of losing?" },
    { id: "tn-6", role: "docket", content: "42 expired trials haven't re-engaged. Of those, 6 are notable — they completed the quickstart but went dormant:\n\n• **Jordan Lee** (AppForge) — Completed quickstart Day 2, no login since. ICP 65.\n• **Sam Williams** (InfraCore) — Logged in once, viewed dashboard only. ICP 59.\n• 4 others with similar patterns.\n\nThese users showed initial interest but didn't find their 'aha moment.' I recommend a personalized re-activation email for these 6 — asking what blocked them and offering a guided walkthrough. Want me to draft that?" },
    { id: "tn-7", role: "user", content: "What about team expansion signals?" },
    { id: "tn-8", role: "docket", content: "4 trial users invited teammates — strong buying signals:\n\n• **Nina Sharma** (ScaleUp) — Invited 2 teammates, already booked a team demo. Multi-seat opportunity.\n• **Maya Andersson** (EnterpriseAI) — Exploring SSO and audit log features. Enterprise evaluation pattern.\n• **2 others** — Invited 1 teammate each, moderate usage.\n\nNina is your fastest path to a team deal — she's already using the product actively and her teammates are onboarding. Maya is a longer-cycle enterprise play but higher ACV potential. I recommend prioritizing both for multi-seat pricing discussions with the AE team." },
    { id: "tn-9", role: "user", content: "What's the overall pipeline from this campaign?" },
    { id: "tn-10", role: "docket", content: "$41K pipeline generated so far:\n\n• **DataPipe** (Alex Rivera) — $12K. Upgrade consultation booked. Rate-limit triggered conversion.\n• **ScaleUp** (Nina Sharma) — $9K. Team demo booked. Multi-seat expansion.\n• **EnterpriseAI** (Maya Andersson) — $8K. Enterprise features walkthrough. Longer cycle.\n• **AnalyticsCo** (Taylor Kim) — $5K. Trial extension → meeting. Price-sensitive.\n• **4 smaller deals** — $7K combined.\n\nAt this pace, we're projecting $65-80K total pipeline by campaign end. The power user auto-upgrade flow is the main driver — I recommend expanding it to all users who hit 15+ API calls/day." },
  ],
};

// ── Campaign 4: Enterprise Expansion Upsell ──────────────────────────────────

const upsellLeads: Lead[] = [
  makeLead("robert-chang", "Robert Chang", "GlobalTech", "SVP Operations", 92, "A", "meeting-booked",
    "Robert is SVP Operations at GlobalTech (enterprise, 2,000+ employees). Usage grew 340% last quarter. Currently on Professional plan — clear Enterprise upgrade candidate.\n\nICP Score: 92",
    "Segment: Usage Growth (Hot)\n340% usage growth. Professional → Enterprise upgrade path.",
    [
      { id: "1", timestamp: "Day 8", type: "meeting-booked", icon: "calendar", description: "Booked Enterprise plan review with CSM" },
      { id: "2", timestamp: "Day 5", type: "link-clicked", icon: "link", description: "Clicked ROI calculator in Email 2" },
      { id: "3", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1, forwarded to CFO" },
    ]),
  makeLead("laura-martinez", "Laura Martinez", "Nexus Systems", "VP Engineering", 86, "A", "high-engagement",
    "Laura is VP Engineering at Nexus Systems. Contract renewal in 45 days. Usage data shows team adopted 3 new features this quarter. High expansion potential.\n\nICP Score: 86",
    "Segment: Renewal Approaching (Hot)\n45-day renewal window. Feature adoption growing. Upsell opportunity.",
    [
      { id: "1", timestamp: "Day 10", type: "link-clicked", icon: "link", description: "Clicked Enterprise features comparison" },
      { id: "2", timestamp: "Day 5", type: "email-opened", icon: "mail", description: "Opened Email 2, clicked pricing" },
      { id: "3", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1" },
    ]),
  makeLead("daniel-kim", "Daniel Kim", "Meridian Corp", "Director of IT", 77, "A", "meeting-booked",
    "Daniel is Director of IT at Meridian Corp. Currently uses Product A — strong fit for Product B (security suite). Multi-product expansion play.\n\nICP Score: 77",
    "Segment: Multi-Product Opportunity\nAlready on Product A. Cross-sell to security suite.",
    [
      { id: "1", timestamp: "Day 6", type: "meeting-booked", icon: "calendar", description: "Booked security suite demo" },
      { id: "2", timestamp: "Day 3", type: "link-clicked", icon: "link", description: "Clicked security suite overview" },
      { id: "3", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1" },
    ]),
  makeLead("stephanie-adams", "Stephanie Adams", "Atlas Inc", "Head of Product", 71, "B", "opened-no-click",
    "Stephanie is Head of Product at Atlas Inc. Usage plateau — team stopped growing seats. Renewal in 60 days. May be evaluating alternatives.\n\nICP Score: 71",
    "Segment: Renewal Approaching\nUsage plateau. Potential churn risk — needs value reinforcement.",
    [
      { id: "1", timestamp: "Day 5", type: "email-opened", icon: "mail", description: "Opened Email 2, no click" },
      { id: "2", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1, no click" },
    ]),
  makeLead("richard-nguyen", "Richard Nguyen", "PacificRidge", "CIO", 66, "B", "partial-engagement",
    "Richard is CIO at PacificRidge. Usage steady but no growth. Opened first email only.\n\nICP Score: 66",
    "Segment: Usage Growth\nSteady usage but no expansion. CSM should coordinate before next send.",
    [
      { id: "1", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1" },
    ]),
  makeLead("catherine-bell", "Catherine Bell", "Vertex Group", "Procurement Director", 58, "B", "meeting-booked",
    "Catherine is Procurement Director at Vertex Group. Responded to the contract renewal discount offer. Price-sensitive buyer.\n\nICP Score: 58",
    "Segment: Renewal Approaching\nPrice-sensitive. Renewal discount worked — meeting booked.",
    [
      { id: "1", timestamp: "Day 9", type: "meeting-booked", icon: "calendar", description: "Booked renewal review — interested in volume discount" },
      { id: "2", timestamp: "Day 7", type: "link-clicked", icon: "link", description: "Clicked volume pricing link" },
    ]),
  makeLead("paul-thompson", "Paul Thompson", "SteadyState", "IT Manager", 47, "C", "partial-engagement",
    "Paul is IT Manager at SteadyState. Small team, minimal usage growth. Opened Email 1 briefly.\n\nICP Score: 47",
    "Segment: Usage Growth\nSmall account. Limited expansion potential.",
    [
      { id: "1", timestamp: "Day 1", type: "email-opened", icon: "mail", description: "Opened Email 1 briefly" },
    ]),
  makeLead("andrea-foster", "Andrea Foster", "CoreSys", "Operations Lead", 39, "C", "no-engagement",
    "Andrea is Operations Lead at CoreSys. No engagement with any emails. Contract renewal not for 6 months.\n\nICP Score: 39",
    "Segment: Multi-Product\nNo engagement. Low priority — long renewal timeline.",
    [
      { id: "1", timestamp: "Day 1", type: "email-sent", icon: "mail", description: "Email 1 sent (unopened)" },
    ]),
];

const campaign4: CampaignData = {
  slug: "enterprise-upsell",
  name: "Enterprise Expansion Upsell",
  leads: upsellLeads,
  activityLog: [
    { time: "Day 9", icon: "calendar", text: "Meeting booked: Catherine Bell (Vertex Group) — renewal review" },
    { time: "Day 8", icon: "calendar", text: "Meeting booked: Robert Chang (GlobalTech) — Enterprise plan review" },
    { time: "Day 7", icon: "pause", text: "Campaign paused: CSM coordination needed for remaining sends" },
    { time: "Day 6", icon: "calendar", text: "Meeting booked: Daniel Kim (Meridian Corp) — security suite demo" },
    { time: "Day 5", icon: "mail", text: "Email 2 sent to 14 leads" },
    { time: "Day 3", icon: "robot", text: "3 leads showing renewed pricing page activity" },
    { time: "Day 1 9:00am", icon: "mail", text: "Email 1 sent to 22 enterprise accounts" },
    { time: "Day 1 8:55am", icon: "robot", text: "Campaign launched: Enterprise Expansion Upsell" },
  ],
  timeline: {
    day1Label: "DAY 1–7",
    day1Items: [
      { text: "Email 1: 22 sent · 54% open · 27% click", isGreen: true },
      { text: "3 meetings booked from usage-growth segment", isGreen: true },
      { text: "Email 2: 14 sent · 43% open · 21% click", isGreen: true },
    ],
    dayNLabel: "DAY 12 (Today — Paused)",
    dayNItems: [
      { text: "Campaign paused on Day 7 for CSM coordination", isGreen: false },
      { text: "3 leads showing renewed pricing page activity since pause", isGreen: true },
    ],
    meetingsText: "4 meetings booked total",
    metricsCard: {
      dayLabel: "Day 12 Results (Paused)",
      badge: "18.2% conv.",
      stats: ["4 meetings", "66 sent", "45% open"],
      warning: "Paused since Day 7 — 3 leads with new pricing activity. Resume?",
    },
  },
  overview: {
    brief: "22 existing enterprise accounts with expansion signals. Campaign paused for CSM alignment.",
    liveDay: "Day 12 (Paused)",
    preLaunchKPIs: [
      { label: "Accounts", value: "22", benchmark: "" },
      { label: "Avg Usage Growth", value: "+180%", benchmark: "last quarter" },
      { label: "Renewals <90d", value: "8", benchmark: "36% of accounts" },
      { label: "Multi-Product Fit", value: "6", benchmark: "" },
    ],
    launchedKPIs: [
      { label: "Emails Sent", value: "22", benchmark: "" },
      { label: "Open Rate", value: "—", benchmark: "" },
      { label: "Click Rate", value: "—", benchmark: "" },
      { label: "Meetings Booked", value: "0", benchmark: "" },
    ],
    runningKPIs: [
      { label: "Emails Sent", value: "66", benchmark: "" },
      { label: "Open Rate", value: "45%", benchmark: "vs 32% avg" },
      { label: "Click Rate", value: "22%", benchmark: "vs 9% avg" },
      { label: "Meetings Booked", value: "4", benchmark: "18.2% conv." },
    ],
    sequenceSteps: [
      { step: "1", name: "Usage insights & value recap", color: "#2563eb", launchedSent: 22, runningSent: 22, launchedOpen: 0, runningOpen: 54, launchedMtgs: 0, runningMtgs: 2 },
      { step: "2", name: "Expansion offer", color: "#f59e0b", launchedSent: 0, runningSent: 14, launchedOpen: 0, runningOpen: 43, launchedMtgs: 0, runningMtgs: 2 },
      { step: "3", name: "Renewal nudge", color: "#22c55e", launchedSent: 0, runningSent: 0, launchedOpen: 0, runningOpen: 0, launchedMtgs: 0, runningMtgs: 0 },
    ],
    dataSources: [
      "Product Analytics: 22 accounts with usage growth >100%",
      "Billing: 8 renewals within 90 days",
      "CRM: 6 accounts flagged for multi-product fit",
      "CSM Notes: 4 accounts requesting advanced features",
    ],
    actionCards: [
      {
        type: "warning",
        borderColor: "border-amber-200",
        bgColor: "bg-amber-50/50",
        hoverBg: "hover:bg-amber-50/80",
        icon: "⚠",
        title: "Campaign paused — 3 leads with new pricing activity",
        subtitle: "Laura Martinez, Stephanie Adams, Richard Nguyen visited pricing since pause. Resume with refreshed copy?",
        buttonLabel: "Resume campaign",
        buttonToast: "Campaign resumed — 8 emails queued",
        discardBorderColor: "border-amber-200",
        discardTextColor: "text-amber-700",
        discardHoverBg: "hover:bg-amber-50",
      },
      {
        type: "escalation",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50/50",
        hoverBg: "hover:bg-blue-50/80",
        icon: "↗",
        title: "Laura Martinez — renewal in 45 days, high engagement",
        subtitle: "ICP 86 · 3 new features adopted. Needs CSM + AE co-sell for Enterprise upgrade.",
        buttonLabel: "Notify CSM + AE",
        buttonToast: "Slack sent to #csm-escalations",
        discardBorderColor: "border-blue-200",
        discardTextColor: "text-blue-700",
        discardHoverBg: "hover:bg-blue-50",
      },
      {
        type: "success",
        borderColor: "border-green-200",
        bgColor: "bg-green-50/50",
        hoverBg: "",
        icon: "✓",
        title: "Robert Chang — $48K upsell pipeline created",
        subtitle: "340% usage growth email → ROI calculator click → Enterprise plan review booked with CSM.",
        discardBorderColor: "border-green-200",
        discardTextColor: "text-green-700",
        discardHoverBg: "hover:bg-green-50",
      },
    ],
  },
  launchConfig: { audience: "22 leads", sequence: "3 emails (Day 0, 5, 10)" },
  chainOfThought: [
    { iconKey: "checkmark", title: "Analyzed 22 enterprise accounts with expansion signals" },
    { iconKey: "checkmark", title: "Cross-referenced usage growth, renewal dates, and product fit" },
    { iconKey: "clock", title: "Building expansion playbook per account..." },
  ],
  chatHistory: [
    { id: "eu-1", role: "user", content: "Why did we pause this campaign?" },
    { id: "eu-2", role: "docket", content: "The campaign was paused on Day 7 to coordinate with the CSM team. Several accounts on the expansion list have active CSM relationships, and sending automated upsell emails without CSM alignment risked conflicting with ongoing conversations.\n\nSpecifically, the CSM team flagged 3 accounts: Robert Chang (GlobalTech), Laura Martinez (Nexus Systems), and Catherine Bell (Vertex Group) — all had recent CSM touchpoints that needed aligned messaging before the next automated send." },
    { id: "eu-3", role: "user", content: "What's happened since we paused?" },
    { id: "eu-4", role: "docket", content: "3 leads have shown renewed pricing page activity since the pause, even without receiving new emails:\n\n• **Laura Martinez** (Nexus Systems) — Visited the Enterprise pricing page twice in the last 5 days. Her contract renews in 45 days.\n• **Stephanie Adams** (Atlas Inc) — Viewed the plan comparison page. Usage has plateaued — possible evaluation of alternatives.\n• **Richard Nguyen** (PacificRidge) — Downloaded the product overview PDF yesterday.\n\nThese are organic intent signals — they're evaluating internally even without our outreach. This is a strong sign to resume." },
    { id: "eu-5", role: "user", content: "Tell me about the pipeline so far" },
    { id: "eu-6", role: "docket", content: "$210K total pipeline from 4 meetings booked:\n\n• **Robert Chang** (GlobalTech) — $48K. SVP Operations. Usage grew 340% last quarter. Booked Enterprise plan review with CSM. Highest-value opportunity.\n• **Daniel Kim** (Meridian Corp) — $35K. Director of IT. Currently on Product A, strong fit for security suite cross-sell. Demo booked.\n• **Catherine Bell** (Vertex Group) — $22K. Procurement Director. Price-sensitive but engaged with volume discount offer. Renewal review booked.\n• **Laura Martinez** (Nexus Systems) — $105K est. VP Engineering. Hasn't booked yet but highest engagement. Renewal in 45 days, adopted 3 new features this quarter.\n\nLaura is your biggest opportunity — $105K potential if she upgrades to Enterprise." },
    { id: "eu-7", role: "user", content: "Should we resume the campaign?" },
    { id: "eu-8", role: "docket", content: "Yes, I recommend resuming with 2 adjustments:\n\n1. **Refresh copy for 3 leads with new pricing activity** — Laura, Stephanie, and Richard have seen more of the product since the original emails. Update their Email 3 to reference their recent activity and position the upgrade as the natural next step.\n\n2. **CSM coordination for Robert Chang and Laura Martinez** — These 2 have the highest deal values and active CSM relationships. I can queue their emails but hold them until the CSM confirms alignment. The remaining 18 leads can receive emails immediately.\n\nWant me to queue the refreshed emails and notify the CSM team via Slack?" },
    { id: "eu-9", role: "user", content: "What about Laura Martinez specifically?" },
    { id: "eu-10", role: "docket", content: "Laura Martinez (VP Engineering, Nexus Systems) — ICP 86.\n\n**Current situation:**\n• Contract renewal in 45 days\n• Currently on Professional plan ($105K/yr)\n• Team adopted 3 new features this quarter (webhooks, custom fields, API v2)\n• Opened both campaign emails, clicked Enterprise features comparison\n• 2 pricing page visits since campaign paused\n\n**Why she matters:**\n• Highest estimated expansion value: $105K → $180K Enterprise\n• Feature adoption signals suggest she's already outgrowing Professional\n• 45-day renewal window creates natural urgency\n\n**Recommendation:**\n• Co-sell with CSM — combine renewal conversation with Enterprise upgrade pitch\n• Lead with the features her team already adopted as proof of Enterprise fit\n• Offer a 90-day Enterprise trial to reduce switching risk" },
  ],
};

// ── Campaign 5: Competitive Displacement (Acme) ─────────────────────────────

const competitiveLeads: Lead[] = [
  makeLead("victor-reyes", "Victor Reyes", "Lumina Digital", "Head of Operations", 89, "A", "meeting-booked",
    "Victor is Head of Operations at Lumina Digital. Currently on Acme — contract expires in 3 weeks. Already ran a proof-of-concept with our platform last month. Strong switch signal.\n\nICP Score: 89",
    "Segment: Contract Expiring (Hot)\nAcme contract expires in 3 weeks. Already POC'd our platform.",
    [
      { id: "1", timestamp: "Today 1:00pm", type: "meeting-booked", icon: "calendar", description: "Booked migration planning session" },
      { id: "2", timestamp: "Today 9:30am", type: "link-clicked", icon: "link", description: "Clicked migration guide in Email 1" },
      { id: "3", timestamp: "Yesterday", type: "web-visit", icon: "globe", description: "Visited comparison page (Acme vs Us)" },
    ]),
  makeLead("hannah-brooks", "Hannah Brooks", "TrueScale", "VP Product", 83, "A", "high-engagement",
    "Hannah is VP Product at TrueScale. Vocal on LinkedIn about Acme's reliability issues. Downloaded our switching guide and visited pricing 3 times.\n\nICP Score: 83",
    "Segment: Pain Points Vocal (Hot)\nPublic Acme complaints. Downloaded switching guide. High intent.",
    [
      { id: "1", timestamp: "Today 10:00am", type: "link-clicked", icon: "link", description: "Clicked Email 1, downloaded ROI comparison" },
      { id: "2", timestamp: "Yesterday", type: "web-visit", icon: "globe", description: "Visited pricing page (3rd visit)" },
      { id: "3", timestamp: "Last week", type: "download", icon: "clipboard", description: "Downloaded Acme → Us switching guide" },
    ]),
  makeLead("ian-nakamura", "Ian Nakamura", "FlexNet", "Platform Lead", 76, "B", "meeting-booked",
    "Ian is Platform Lead at FlexNet. Evaluated us 6 months ago but chose Acme. Now reconsidering after Acme's API deprecation announcement.\n\nICP Score: 76",
    "Segment: Recently Evaluated\nPrevious evaluator. Acme API changes reopened the conversation.",
    [
      { id: "1", timestamp: "Today", type: "meeting-booked", icon: "calendar", description: "Booked re-evaluation call" },
      { id: "2", timestamp: "Today", type: "email-opened", icon: "mail", description: "Opened Email 1, clicked API comparison" },
    ]),
  makeLead("grace-liu", "Grace Liu", "Stratosphere", "Technical PM", 69, "B", "opened-no-click",
    "Grace is Technical PM at Stratosphere. On Acme's Enterprise plan. Opened our email but hasn't clicked. May need a stronger differentiator angle.\n\nICP Score: 69",
    "Segment: Contract Expiring\nAcme Enterprise user. Opened but didn't engage. Try technical angle.",
    [
      { id: "1", timestamp: "Today", type: "email-opened", icon: "mail", description: "Opened Email 1, no click" },
    ]),
  makeLead("brandon-cooper", "Brandon Cooper", "GridPoint", "Infrastructure Lead", 62, "B", "partial-engagement",
    "Brandon is Infrastructure Lead at GridPoint. Acme customer for 2 years. Visited our site after Acme's outage last month.\n\nICP Score: 62",
    "Segment: Pain Points Vocal\nVisited after Acme outage. Reliability-focused messaging.",
    [
      { id: "1", timestamp: "Today", type: "email-opened", icon: "mail", description: "Opened Email 1, brief view" },
      { id: "2", timestamp: "Last month", type: "web-visit", icon: "globe", description: "Visited site after Acme outage" },
    ]),
  makeLead("olivia-fernandez", "Olivia Fernandez", "SwiftServe", "Ops Manager", 54, "B", "opened-no-click",
    "Olivia is Ops Manager at SwiftServe. On Acme's mid-tier. Opened email but no further engagement.\n\nICP Score: 54",
    "Segment: Recently Evaluated\nMid-tier Acme user. Low engagement so far.",
    [
      { id: "1", timestamp: "Today", type: "email-opened", icon: "mail", description: "Opened Email 1, no click" },
    ]),
  makeLead("nathan-davis", "Nathan Davis", "OpsFlow", "Systems Admin", 43, "C", "partial-engagement",
    "Nathan is Systems Admin at OpsFlow. Small Acme account. Opened email briefly.\n\nICP Score: 43",
    "Segment: Pain Points Vocal\nSmall account. Low priority for displacement.",
    [
      { id: "1", timestamp: "Today", type: "email-opened", icon: "mail", description: "Opened Email 1 briefly" },
    ]),
  makeLead("chloe-martin", "Chloe Martin", "BaseLine", "IT Coordinator", 36, "C", "no-engagement",
    "Chloe is IT Coordinator at BaseLine. Acme customer. No engagement with our outreach.\n\nICP Score: 36",
    "Segment: Recently Evaluated\nNo engagement. Deprioritize.",
    [
      { id: "1", timestamp: "Today", type: "email-sent", icon: "mail", description: "Email 1 sent (unopened)" },
    ]),
];

const campaign5: CampaignData = {
  slug: "competitive-displacement",
  name: "Competitive Displacement (Acme)",
  leads: competitiveLeads,
  activityLog: [
    { time: "Today 1:00pm", icon: "calendar", text: "Meeting booked: Victor Reyes (Lumina Digital) — migration planning" },
    { time: "Today 10:00am", icon: "link", text: "Hannah Brooks downloaded ROI comparison sheet" },
    { time: "Today 9:30am", icon: "link", text: "Victor Reyes clicked migration guide" },
    { time: "Today 9:00am", icon: "mail", text: "Email 1 sent to 19 Acme customers" },
    { time: "Today 8:55am", icon: "robot", text: "Campaign launched: Competitive Displacement (Acme)" },
  ],
  timeline: {
    day1Label: "DAY 1 (Today)",
    day1Items: [
      { text: "Email 1: 19 sent · 53% open · 28% click", isGreen: true },
      { text: "3 leads with Acme contracts expiring <30 days engaged immediately", isGreen: true },
      { text: "Hannah Brooks downloaded ROI comparison (3rd pricing page visit)", isGreen: true },
    ],
    dayNLabel: "EARLY SIGNALS",
    dayNItems: [
      { text: "53% open rate — highest across all campaigns", isGreen: true },
      { text: "Subject line: \"Acme alternative\" resonated strongly", isGreen: true },
    ],
    meetingsText: "2 meetings booked within hours",
    metricsCard: {
      dayLabel: "Day 1 Results",
      badge: "10.5% conv.",
      stats: ["2 meetings", "38 sent", "53% open"],
      warning: "Hannah Brooks: 3 pricing visits, vocal about Acme issues — AE escalation?",
    },
  },
  overview: {
    brief: "19 prospects currently using Acme. 3 contracts expiring within 30 days.",
    liveDay: "Day 1",
    preLaunchKPIs: [
      { label: "Acme Customers", value: "19", benchmark: "" },
      { label: "Contracts <30d", value: "3", benchmark: "highest priority" },
      { label: "Pain Signals", value: "7", benchmark: "outage/complaints" },
      { label: "Prior Evaluators", value: "4", benchmark: "" },
    ],
    launchedKPIs: [
      { label: "Emails Sent", value: "19", benchmark: "" },
      { label: "Open Rate", value: "—", benchmark: "" },
      { label: "Click Rate", value: "—", benchmark: "" },
      { label: "Meetings Booked", value: "0", benchmark: "" },
    ],
    runningKPIs: [
      { label: "Emails Sent", value: "38", benchmark: "" },
      { label: "Open Rate", value: "53%", benchmark: "vs 38% avg" },
      { label: "Click Rate", value: "28%", benchmark: "vs 10% avg" },
      { label: "Meetings Booked", value: "2", benchmark: "10.5% conv." },
    ],
    sequenceSteps: [
      { step: "1", name: "Competitive positioning", color: "#2563eb", launchedSent: 19, runningSent: 19, launchedOpen: 0, runningOpen: 53, launchedMtgs: 0, runningMtgs: 2 },
      { step: "2", name: "Migration case study", color: "#f59e0b", launchedSent: 0, runningSent: 19, launchedOpen: 0, runningOpen: 0, launchedMtgs: 0, runningMtgs: 0 },
      { step: "3", name: "Migration offer + urgency", color: "#22c55e", launchedSent: 0, runningSent: 0, launchedOpen: 0, runningOpen: 0, launchedMtgs: 0, runningMtgs: 0 },
    ],
    dataSources: [
      "Competitive Intelligence: 19 Acme customers identified",
      "Contract Data: 3 renewals within 30 days",
      "Social Listening: 7 pain signal mentions (outages, API issues)",
      "CRM History: 4 previous evaluators",
    ],
    actionCards: [
      {
        type: "warning",
        borderColor: "border-amber-200",
        bgColor: "bg-amber-50/50",
        hoverBg: "hover:bg-amber-50/80",
        icon: "⚠",
        title: "3 Acme contracts expiring in <30 days",
        subtitle: "Victor Reyes (3 wks), Grace Liu (4 wks), Brandon Cooper (5 wks) — send migration incentive",
        buttonLabel: "Send migration offers",
        buttonToast: "Migration offers sent to 3 leads",
        discardBorderColor: "border-amber-200",
        discardTextColor: "text-amber-700",
        discardHoverBg: "hover:bg-amber-50",
      },
      {
        type: "escalation",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50/50",
        hoverBg: "hover:bg-blue-50/80",
        icon: "↗",
        title: "Hannah Brooks — high intent, vocal Acme critic",
        subtitle: "ICP 83 · 3 pricing visits, downloaded switching guide. Public LinkedIn posts about Acme issues.",
        buttonLabel: "Handoff to AE",
        buttonToast: "Slack message sent to AE team",
        discardBorderColor: "border-blue-200",
        discardTextColor: "text-blue-700",
        discardHoverBg: "hover:bg-blue-50",
      },
      {
        type: "success",
        borderColor: "border-green-200",
        bgColor: "bg-green-50/50",
        hoverBg: "",
        icon: "✓",
        title: "Victor Reyes — migration planning session booked",
        subtitle: "Acme contract expiring in 3 weeks. Clicked migration guide → booked within 4 hours.",
        discardBorderColor: "border-green-200",
        discardTextColor: "text-green-700",
        discardHoverBg: "hover:bg-green-50",
      },
    ],
  },
  launchConfig: { audience: "19 leads", sequence: "3 emails (Day 0, 4, 8)" },
  chainOfThought: [
    { iconKey: "checkmark", title: "Identified 19 Acme customers from competitive intelligence" },
    { iconKey: "checkmark", title: "Cross-referenced contract dates and pain signals" },
    { iconKey: "clock", title: "Building displacement playbook per account..." },
  ],
  chatHistory: [
    { id: "cd-1", role: "user", content: "How are the Acme customers responding?" },
    { id: "cd-2", role: "docket", content: "Extremely well — 53% open rate on Day 1, the highest across all your campaigns. 2 meetings booked within hours of sending.\n\nThe 'Acme alternative' subject line resonated strongly. Customers with expiring contracts opened at 67% vs 41% for others. Victor Reyes clicked the migration guide within 30 minutes of receiving the email.\n\nEarly signal: this audience has latent demand. The Acme outage last month and their recent API deprecation announcement created a natural window." },
    { id: "cd-3", role: "user", content: "Tell me about Hannah Brooks" },
    { id: "cd-4", role: "docket", content: "Hannah Brooks (VP Product, TrueScale) — ICP 83.\n\nShe's been vocal on LinkedIn about Acme's reliability issues, particularly the January outage that caused 4 hours of downtime for her team. She's visited your pricing page 3 times in the last 2 weeks, downloaded the Acme → Us switching guide, and clicked the ROI comparison in today's email.\n\nStrong intent signals, but she hasn't booked a meeting yet. She's likely doing internal evaluation and building a business case to switch. I recommend direct AE outreach — a personalized note referencing her LinkedIn posts about Acme's reliability would be very effective.\n\nEstimated deal size: $24K ARR (based on TrueScale's company size and Acme's mid-tier pricing)." },
    { id: "cd-5", role: "user", content: "Which Acme contracts are expiring soonest?" },
    { id: "cd-6", role: "docket", content: "3 contracts expiring within 30 days:\n\n1. **Victor Reyes** (Lumina Digital) — 3 weeks. Already booked migration planning session. Previously ran a POC with us. Strongest opportunity.\n2. **Grace Liu** (Stratosphere) — 4 weeks. Enterprise Acme customer. Opened email but didn't click. May need a stronger technical differentiator angle.\n3. **Brandon Cooper** (GridPoint) — 5 weeks. Visited our site after Acme's outage. Opened today's email briefly. Reliability-focused messaging recommended.\n\nI recommend sending a migration incentive (waived onboarding fee or extended trial) to Grace and Brandon to accelerate their decision timeline. Victor is already moving — his next step is the migration planning session." },
    { id: "cd-7", role: "user", content: "What's our win rate against Acme historically?" },
    { id: "cd-8", role: "docket", content: "Based on your CRM data from the last 12 months:\n\n• **Win rate vs Acme:** 38% (11 of 29 competitive deals)\n• **Average deal cycle:** 42 days (vs 58 days for non-competitive deals)\n• **Top displacement reasons:** Reliability (45%), API flexibility (28%), pricing (18%), support (9%)\n• **Most effective assets:** Migration guide (used in 82% of wins), ROI comparison (used in 64%)\n\nThe reliability angle is by far the strongest — and with Acme's recent outage and API deprecation, the timing is ideal. Your win rate in the last 3 months specifically is 50% (4 of 8), up from 31% earlier in the year.\n\nThis campaign is well-positioned. The 53% Day 1 open rate suggests strong receptivity." },
  ],
};

// ── Registry ─────────────────────────────────────────────────────────────────

export const CAMPAIGN_REGISTRY: Record<string, CampaignData> = {
  "reengage-pipeline": campaign1,
  "webinar-followup": campaign2,
  "trial-nurture": campaign3,
  "enterprise-upsell": campaign4,
  "competitive-displacement": campaign5,
};

export const ALL_CAMPAIGN_SLUGS = Object.keys(CAMPAIGN_REGISTRY);

export function getCampaignData(slug: string): CampaignData {
  return CAMPAIGN_REGISTRY[slug] ?? campaign1;
}

// Default campaign for backward-compatibility
export const DEFAULT_CAMPAIGN = campaign1;

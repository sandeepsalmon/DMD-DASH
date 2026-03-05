// ── Types ─────────────────────────────────────────────────────────────────

export type AppView = "homepage" | "campaign-mode";
export type HomepageState = "empty" | "dense";
export interface SuggestedCampaignContext {
  title: string;
  description: string;
  stats: string;
  source: string;
}
export type CampaignModeState =
  | "initial"
  | "agents-running"
  | "agent-suggestion"
  | "plan-ready"
  | "launched"
  | "running";

export type LeadSegment = "A" | "B" | "C";
export type ScoreLevel = "hot" | "warm" | "cool";

export type LeadStatus =
  | "meeting-booked"
  | "high-engagement"
  | "opened-no-click"
  | "partial-engagement"
  | "no-engagement"
  | "pre-send-upgrade";

export type CTAType =
  | "dynamic"
  | "booking"
  | "case-study"
  | "roi-calculator"
  | "technical-demo"
  | "reply-prompt"
  | "agent-conversation"
  | "content-piece";

export interface CampaignEmail {
  id: string;
  number: 1 | 2 | 3;
  day: number;
  subject: string;
  preview: string;
  cta: string;
  ctaType: CTAType;
  status: "sent" | "scheduled" | "pending";
  sentCount?: number;
  openRate?: number;
  clickRate?: number;
  scheduledFor?: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  type:
    | "email-sent"
    | "email-opened"
    | "link-clicked"
    | "meeting-booked"
    | "web-visit"
    | "agent-convo"
    | "download"
    | "cta-changed";
  icon: string;
  description: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  score: number;
  scoreLevel: ScoreLevel;
  segment: LeadSegment;
  status: LeadStatus;
  emails: CampaignEmail[];
  journey: string[];
  activity: ActivityItem[];
  warmContext: string;
  agentNotes: string;
  lostReason?: string;
}

export interface Account {
  name: string;
  score: number;
  leadCount: number;
  hotLeads: number;
  statusKey: string;
  status: string;
  leads: Lead[];
}

// ── Hardcoded Demo Data ────────────────────────────────────────────────────

export const SEGMENT_A_EMAILS: CampaignEmail[] = [
  {
    id: "a-email-1",
    number: 1,
    day: 0,
    subject: "Noticed your team's been exploring our manufacturing solutions",
    preview: "Hi {{first_name}}, I noticed your team has been exploring...",
    cta: "Book a call",
    ctaType: "booking",
    status: "sent",
    sentCount: 18,
    openRate: 78,
    clickRate: 33,
  },
  {
    id: "a-email-2",
    number: 2,
    day: 3,
    subject: "Quick question about your evaluation",
    preview: "Following up on our earlier note — wanted to check in...",
    cta: "Book a call",
    ctaType: "booking",
    status: "sent",
    sentCount: 16,
    openRate: 63,
    clickRate: 25,
  },
];

export const SEGMENT_B_EMAILS: CampaignEmail[] = [
  {
    id: "b-email-1",
    number: 1,
    day: 0,
    subject: "Thought this case study might help with your integration needs",
    preview: "Hi {{first_name}}, saw you've been exploring our platform...",
    cta: "Case study",
    ctaType: "case-study",
    status: "sent",
    sentCount: 10,
    openRate: 70,
    clickRate: 20,
    scheduledFor: "Day 0, 9am",
  },
  {
    id: "b-email-2",
    number: 2,
    day: 3,
    subject: "Following up on the case study",
    preview: "Hope you had a chance to read through it — I wanted to share...",
    cta: "ROI Calculator",
    ctaType: "roi-calculator",
    status: "scheduled",
    scheduledFor: "tomorrow 9am",
  },
  {
    id: "b-email-3",
    number: 3,
    day: 7,
    subject: "Worth a quick conversation?",
    preview: "I'll keep this short — would love 15 minutes to walk you through...",
    cta: "Book a call",
    ctaType: "booking",
    status: "pending",
  },
];

export const SEGMENT_C_EMAILS: CampaignEmail[] = [
  {
    id: "c-email-1",
    number: 1,
    day: 0,
    subject: "Things have changed since we last spoke",
    preview: "Hi {{first_name}}, it's been a while — wanted to reach out because...",
    cta: "Relevant content piece",
    ctaType: "content-piece",
    status: "sent",
    sentCount: 6,
    openRate: 50,
    clickRate: 17,
    scheduledFor: "yesterday 9am",
  },
  {
    id: "c-email-2",
    number: 2,
    day: 5,
    subject: "Things have changed since we last spoke",
    preview: "A lot has happened since we talked — we've addressed some of the...",
    cta: "ROI Calculator",
    ctaType: "roi-calculator",
    status: "scheduled",
    scheduledFor: "Feb 28",
  },
  {
    id: "c-email-3",
    number: 3,
    day: 10,
    subject: "One last thought...",
    preview: "I don't want to keep cluttering your inbox — but I do think this is worth...",
    cta: "Book a call",
    ctaType: "booking",
    status: "pending",
  },
];

const makeEmail = (
  seg: "A" | "B" | "C",
  n: 1 | 2 | 3
): CampaignEmail => {
  const map: Record<string, CampaignEmail[]> = {
    A: SEGMENT_A_EMAILS,
    B: SEGMENT_B_EMAILS,
    C: SEGMENT_C_EMAILS,
  };
  return map[seg][n - 1];
};

export const LEADS: Lead[] = [
  // ── Segment A ──────────────────────────────────────────────────────────
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    company: "Acme Corp",
    role: "VP of Operations",
    score: 94,
    scoreLevel: "hot",
    segment: "A",
    status: "meeting-booked",
    emails: [makeEmail("A", 1), makeEmail("A", 2)],
    journey: ["Captured", "Qualified", "Nurturing", "Meeting Booked"],
    activity: [
      { id: "1", timestamp: "Today 2:14pm", type: "meeting-booked", icon: "calendar", description: "Replied and booked with AE" },
      { id: "2", timestamp: "Today 10:00am", type: "email-opened", icon: "mail", description: "Opened Email 2" },
      { id: "3", timestamp: "Day 1 9:00am", type: "email-opened", icon: "mail", description: "Opened Email 1, replied" },
      { id: "4", timestamp: "Feb 22", type: "web-visit", icon: "globe", description: "Visited pricing page (3rd visit)" },
      { id: "5", timestamp: "Feb 18", type: "agent-convo", icon: "robot", description: "Agent conversation — enterprise security compliance (8 min)" },
      { id: "6", timestamp: "Feb 14", type: "web-visit", icon: "globe", description: "Visited pricing page" },
    ],
    warmContext:
      "Sarah is VP of Operations at Acme Corp (250 employees, manufacturing SaaS). She's visited the pricing page 3 times in the past 2 weeks and had an 8-minute agent conversation about enterprise security compliance in February — specifically around SOC 2 audit trails. She replied to Email 1 and booked a meeting.\n\nICP Score: 94 (Company fit: 25/25, Engagement: 28/30, Intent: 25/25, Recency: 16/20)\n\nKey signals:\n· 3 pricing page visits in 14 days\n· 8-min agent conversation about compliance\n· Replied to first email\n· Meeting booked with AE",
    agentNotes:
      "Segment Assignment: Segment A (Hot)\nReason: Multiple pricing page visits combined with agent conversation about enterprise features. Highest ICP score in cohort.\n\nEmail 1 CTA: Booking link\nReason: Already in advanced evaluation stage based on behavior signals. Direct booking link appropriate for this intent level.",
  },
  {
    id: "tom-liu",
    name: "Tom Liu",
    company: "Datadog",
    role: "Head of Engineering",
    score: 82,
    scoreLevel: "hot",
    segment: "A",
    status: "meeting-booked",
    emails: [makeEmail("A", 1), makeEmail("A", 2)],
    journey: ["Captured", "Qualified", "Nurturing", "Meeting Booked"],
    activity: [
      { id: "1", timestamp: "Today 10:30am", type: "meeting-booked", icon: "calendar", description: "Clicked booking link, meeting confirmed" },
      { id: "2", timestamp: "Today 9:45am", type: "link-clicked", icon: "link", description: "Clicked Email 2 booking link" },
      { id: "3", timestamp: "Day 1 9:00am", type: "email-opened", icon: "mail", description: "Opened Email 1, clicked" },
      { id: "4", timestamp: "Feb 20", type: "web-visit", icon: "globe", description: "Visited pricing page (2nd visit)" },
      { id: "5", timestamp: "Feb 16", type: "agent-convo", icon: "robot", description: "Agent conversation — infrastructure integrations (4 min)" },
    ],
    warmContext:
      "Tom is Head of Engineering at Datadog (large enterprise). He visited the pricing page twice and had a 4-minute agent conversation about infrastructure integrations. Clicked the booking link from Email 2.\n\nICP Score: 82 (Company fit: 22/25, Engagement: 22/30, Intent: 20/25, Recency: 18/20)",
    agentNotes:
      "Segment Assignment: Segment A (Hot)\nReason: Two pricing page visits + agent conversation showing technical evaluation intent.\n\nEmail 2 CTA: Booking link\nReason: Clicked the CTA — direct intent signal confirmed.",
  },
  {
    id: "anna-kumar",
    name: "Anna Kumar",
    company: "FinServ",
    role: "Director of Product",
    score: 71,
    scoreLevel: "warm",
    segment: "A",
    status: "high-engagement",
    emails: [makeEmail("A", 1), makeEmail("A", 2)],
    journey: ["Captured", "Qualified", "Nurturing"],
    activity: [
      { id: "1", timestamp: "Today 11:00am", type: "link-clicked", icon: "link", description: "Clicked Email 2 CTA" },
      { id: "2", timestamp: "Today 9:00am", type: "email-opened", icon: "mail", description: "Opened Email 2" },
      { id: "3", timestamp: "Day 1 9:00am", type: "link-clicked", icon: "link", description: "Clicked Email 1 CTA" },
      { id: "4", timestamp: "Day 1 8:55am", type: "email-opened", icon: "mail", description: "Opened Email 1" },
      { id: "5", timestamp: "Feb 21", type: "web-visit", icon: "globe", description: "Visited pricing page" },
    ],
    warmContext:
      "Anna is Director of Product at FinServ (financial services SaaS). She opened both emails AND clicked both CTAs — but hasn't booked yet. Her engagement pattern suggests she's evaluating but may need a direct human touch to convert.\n\nICP Score: 71 (Company fit: 20/25, Engagement: 25/30, Intent: 16/25, Recency: 10/20)\n\nKey signals:\n· Opened and clicked every email\n· Visited pricing page\n· Has not booked despite high engagement",
    agentNotes:
      "Segment Assignment: Segment A (Hot)\nReason: Pricing page visit + consistent email engagement.\n\nRecommendation: Anna Kumar stands out — high engagement but no meeting booked. Likely needs direct AE outreach rather than another automated email. Consider escalating.",
  },
  {
    id: "priya-mehta",
    name: "Priya Mehta",
    company: "MegaCorp",
    role: "Operations Manager",
    score: 68,
    scoreLevel: "warm",
    segment: "A",
    status: "opened-no-click",
    emails: [makeEmail("A", 1), makeEmail("A", 2)],
    journey: ["Captured", "Qualified", "Nurturing"],
    activity: [
      { id: "1", timestamp: "Today 9:00am", type: "email-opened", icon: "mail", description: "Opened Email 2, no click" },
      { id: "2", timestamp: "Day 1 9:20am", type: "link-clicked", icon: "link", description: "Clicked Email 1 CTA" },
      { id: "3", timestamp: "Day 1 9:00am", type: "email-opened", icon: "mail", description: "Opened Email 1" },
      { id: "4", timestamp: "Feb 19", type: "web-visit", icon: "globe", description: "Visited pricing page" },
    ],
    warmContext:
      "Priya is an Operations Manager at MegaCorp (enterprise). Visited pricing page once and engaged with Email 1 (opened + clicked), but only opened Email 2 without clicking.\n\nICP Score: 68 (Company fit: 18/25, Engagement: 15/30, Intent: 20/25, Recency: 15/20)",
    agentNotes:
      "Segment Assignment: Segment A (Hot)\nReason: Pricing page visit qualifies for hot segment.\n\nNote: Engagement declining from Email 1 → Email 2. CTA switch to Reply Prompt may improve conversion.",
  },
  // ── Segment B ──────────────────────────────────────────────────────────
  {
    id: "james-wong",
    name: "James Wong",
    company: "CloudBase",
    role: "CTO",
    score: 72,
    scoreLevel: "warm",
    segment: "B",
    status: "meeting-booked",
    emails: [makeEmail("B", 1), makeEmail("B", 2)],
    journey: ["Captured", "Qualified", "Nurturing", "Meeting Booked"],
    activity: [
      { id: "1", timestamp: "Today 1:45pm", type: "meeting-booked", icon: "calendar", description: "Clicked booking link after CTA upgrade, meeting confirmed" },
      { id: "2", timestamp: "Today 1:00pm", type: "cta-changed", icon: "robot", description: "Pre-send: CTA upgraded Case Study → Booking link (3 pricing visits detected)" },
      { id: "3", timestamp: "Today 12:50pm", type: "web-visit", icon: "globe", description: "Visited pricing page (3rd visit today)" },
      { id: "4", timestamp: "Day 1 9:00am", type: "email-opened", icon: "mail", description: "Opened Email 1, clicked" },
      { id: "5", timestamp: "Feb 21", type: "web-visit", icon: "globe", description: "Visited pricing page" },
    ],
    warmContext:
      "James is CTO at CloudBase (Series B startup). Visited pricing page 3 times in one day — strong intent signal. The agent automatically upgraded his Email 2 CTA from Case Study to Booking link before sending, which resulted in a meeting booking.\n\nICP Score: 72 (Company fit: 20/25, Engagement: 18/30, Intent: 20/25, Recency: 14/20)",
    agentNotes:
      "Segment Assignment: Segment B (Warm)\nReason: Some engagement but initially no pricing intent signals.\n\nPre-send adjustment: 3 pricing page visits detected before Email 2 send. CTA automatically upgraded to Booking link. Result: Meeting booked",
  },
  {
    id: "dave-kim",
    name: "Dave Kim",
    company: "StartupX",
    role: "Product Manager",
    score: 61,
    scoreLevel: "warm",
    segment: "B",
    status: "opened-no-click",
    emails: [makeEmail("B", 1), makeEmail("B", 2)],
    journey: ["Captured", "Qualified", "Nurturing"],
    activity: [
      { id: "1", timestamp: "Today", type: "email-opened", icon: "mail", description: "Opened Email 2, no click" },
      { id: "2", timestamp: "Yesterday", type: "email-opened", icon: "mail", description: "Opened Email 1, no click" },
      { id: "3", timestamp: "Feb 20", type: "web-visit", icon: "globe", description: "Visited product page (3 min)" },
      { id: "4", timestamp: "Feb 18", type: "web-visit", icon: "globe", description: "Visited blog post on integrations" },
      { id: "5", timestamp: "Feb 15", type: "download", icon: "clipboard", description: "Downloaded whitepaper: 'B2B Integration Guide'" },
      { id: "6", timestamp: "Jan 28", type: "agent-convo", icon: "robot", description: "Agent conversation — asked about API integrations (4 min)" },
    ],
    warmContext:
      "Dave is a Product Manager at StartupX (Series A, 45 employees, SaaS). He downloaded our B2B Integration Guide in January and had a 4-minute agent conversation about API integrations — specifically asking about REST API support and webhook capabilities.\n\nHe's visited our product page and integration blog post but hasn't looked at pricing. His engagement pattern (opens emails, reads content, but doesn't click CTAs) suggests he's interested but the current CTAs aren't matching his intent. He cares about technical details, not sales conversations.\n\nICP Score: 61 (Company fit: 18/25, Engagement: 15/30, Intent: 12/25, Recency: 16/20)\n\nKey signals:\n· Downloaded integration whitepaper\n· 4-min agent conversation about API\n· Opens emails consistently (2/2)\n· Never clicks sales-oriented CTAs\n· No pricing page visits",
    agentNotes:
      "Segment Assignment: Segment B (Warm)\nReason: Some engagement but no pricing intent signals. Not high-priority enough for aggressive Segment A.\n\nEmail 1 CTA: Case Study\nReason: Content-oriented lead (downloaded whitepaper, asked about integrations). Sales CTA would be premature.\n\nEmail 2 CTA: ROI Calculator\nReason: Standard progression from content → value proof.\nNote: Dave didn't click Email 1 CTA either.\nRecommendation: Switch to a Reply Prompt or Technical Demo CTA — Dave seems to want technical depth, not sales materials.",
  },
  {
    id: "mike-ross",
    name: "Mike Ross",
    company: "RetailCo",
    role: "Head of Growth",
    score: 52,
    scoreLevel: "warm",
    segment: "B",
    status: "partial-engagement",
    emails: [makeEmail("B", 1), makeEmail("B", 2)],
    journey: ["Captured", "Qualified", "Nurturing"],
    activity: [
      { id: "1", timestamp: "Yesterday", type: "email-opened", icon: "mail", description: "Opened Email 1, no click" },
      { id: "2", timestamp: "Feb 19", type: "web-visit", icon: "globe", description: "Visited solutions page" },
      { id: "3", timestamp: "Feb 10", type: "agent-convo", icon: "robot", description: "Agent conversation — general inquiry (2 min)" },
    ],
    warmContext:
      "Mike is Head of Growth at RetailCo (retail SaaS). Had a brief agent conversation in February and opened Email 1 but didn't click. Partial engagement — still early in evaluation.\n\nICP Score: 52 (Company fit: 16/25, Engagement: 10/30, Intent: 10/25, Recency: 16/20)",
    agentNotes:
      "Segment Assignment: Segment B (Warm)\nReason: Agent conversation history and some site engagement.\n\nNote: Low engagement so far. Monitor through Email 2 and 3 before any escalation.",
  },
  // ── Segment C ──────────────────────────────────────────────────────────
  {
    id: "lisa-park",
    name: "Lisa Park",
    company: "OldCorp",
    role: "IT Director",
    score: 45,
    scoreLevel: "cool",
    segment: "C",
    status: "partial-engagement",
    lostReason: "pricing",
    emails: [makeEmail("C", 1), makeEmail("C", 2)],
    journey: ["Captured", "Closed-Lost", "Re-engaging"],
    activity: [
      { id: "1", timestamp: "Day 1 9:00am", type: "email-opened", icon: "mail", description: "Opened Email 1, no click" },
      { id: "2", timestamp: "Nov 2023", type: "agent-convo", icon: "robot", description: "Agent conversation — pricing objection" },
    ],
    warmContext:
      "Lisa is IT Director at OldCorp (enterprise). Previous closed-lost opportunity — lost on pricing (too expensive). Receiving re-engagement sequence with ROI calculator and new pricing tier announcement.\n\nICP Score: 45 (Company fit: 15/25, Engagement: 8/30, Intent: 10/25, Recency: 12/20)",
    agentNotes:
      "Segment Assignment: Segment C (Re-engage)\nLost reason: Pricing (too expensive)\nApproach: ROI calculator + new pricing tier announcement\n\nEmail 1 angle: 'Things have changed — we now have a tier that fits your budget'",
  },
  {
    id: "raj-patel",
    name: "Raj Patel",
    company: "TechFlow",
    role: "COO",
    score: 38,
    scoreLevel: "cool",
    segment: "C",
    status: "no-engagement",
    lostReason: "timing",
    emails: [makeEmail("C", 1), makeEmail("C", 2)],
    journey: ["Captured", "Closed-Lost", "Re-engaging"],
    activity: [
      { id: "1", timestamp: "Day 1 9:00am", type: "email-sent", icon: "mail", description: "Email 1 sent (unopened)" },
      { id: "2", timestamp: "Oct 2023", type: "agent-convo", icon: "robot", description: "Lost deal — timing ('not ready for another 6 months')" },
    ],
    warmContext:
      "Raj is COO at TechFlow. Previous closed-lost — lost on timing, was 'not ready for another 6 months.' That was 4 months ago. Q4 case study re-engagement angle.\n\nICP Score: 38 (Company fit: 14/25, Engagement: 4/30, Intent: 8/25, Recency: 12/20)",
    agentNotes:
      "Segment Assignment: Segment C (Re-engage)\nLost reason: Timing\nApproach: 'Things have changed' angle + Q4 case study\n\nNote: 6-month timeline is almost up. Good time to re-engage.",
  },
  {
    id: "wei-zhang",
    name: "Wei Zhang",
    company: "LogiCorp",
    role: "VP Supply Chain",
    score: 34,
    scoreLevel: "cool",
    segment: "C",
    status: "no-engagement",
    lostReason: "timing",
    emails: [makeEmail("C", 1)],
    journey: ["Captured", "Closed-Lost", "Re-engaging"],
    activity: [
      { id: "1", timestamp: "Day 1 9:00am", type: "email-sent", icon: "mail", description: "Email 1 sent (unopened)" },
      { id: "2", timestamp: "Sep 2023", type: "agent-convo", icon: "robot", description: "Lost deal — timing" },
    ],
    warmContext:
      "Wei is VP Supply Chain at LogiCorp (logistics SaaS). Lost on timing — they were mid-implementation of another tool. Re-engaging with timing-based angle.\n\nICP Score: 34 (Company fit: 12/25, Engagement: 4/30, Intent: 6/25, Recency: 12/20)",
    agentNotes:
      "Segment Assignment: Segment C (Re-engage)\nLost reason: Timing\nApproach: Re-engage with 'implementation complete now?' angle",
  },
];

// ── Computed Helpers ───────────────────────────────────────────────────────

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  return "cool";
}

export function getLeadsForSegment(segment: LeadSegment): Lead[] {
  return LEADS.filter((l) => l.segment === segment);
}

export function getAccountsFromLeads(): Account[] {
  const map = new Map<string, Account>();
  for (const lead of LEADS) {
    if (!map.has(lead.company)) {
      map.set(lead.company, {
        name: lead.company,
        score: lead.score,
        leadCount: 0,
        hotLeads: 0,
        statusKey: "",
        status: "",
        leads: [],
      });
    }
    const acc = map.get(lead.company)!;
    acc.leadCount++;
    if (lead.scoreLevel === "hot") acc.hotLeads++;
    acc.leads.push(lead);
    if (lead.score > acc.score) acc.score = lead.score;
  }
  // Set status text
  for (const acc of map.values()) {
    const hasBooked = acc.leads.some((l) => l.status === "meeting-booked");
    const hasHigh = acc.leads.some((l) => l.status === "high-engagement");
    if (hasBooked) { acc.status = "Meeting booked"; acc.statusKey = "meeting-booked"; }
    else if (hasHigh) { acc.status = "High engagement"; acc.statusKey = "high-engagement"; }
    else if (acc.leads.some((l) => l.status === "opened-no-click")) { acc.status = "Opens, no clicks"; acc.statusKey = "opened-no-click"; }
    else { acc.status = "Low engagement"; acc.statusKey = "low"; }
  }
  return [...map.values()].sort((a, b) => b.score - a.score);
}

export const CTA_OPTIONS: { label: string; value: CTAType; icon: string; description?: string }[] = [
  { label: "Dynamic CTA", value: "dynamic", icon: "sparkle", description: "AI picks the best CTA per lead" },
  { label: "Booking link", value: "booking", icon: "calendar" },
  { label: "Case study", value: "case-study", icon: "clipboard" },
  { label: "ROI Calculator", value: "roi-calculator", icon: "chart-bar" },
  { label: "Reply prompt", value: "reply-prompt", icon: "chat" },
  { label: "Agent conversation", value: "agent-conversation", icon: "link" },
  { label: "Technical demo", value: "technical-demo", icon: "target" },
];

export const AGENT_DISCUSSION_FULL = [
  {
    agent: "CRM Agent",
    message:
      "6 of these have previous closed-lost opportunities. 3 lost on pricing, 2 on timing, 1 to competitor. Different approach needed for each.",
  },
  {
    agent: "Content Agent",
    message:
      "For the pricing-lost group, we have an ROI calculator and the new pricing tier announcement. For the timing group, the 'things have changed' angle works well with our Q4 case study. For the competitor-lost, we have the switching guide.",
  },
  {
    agent: "Lead Analyst",
    message:
      "Agreed. I'll map recipients into one adaptive sequence and adjust CTA/tone at each step based on intent. Highest-intent leads should get direct booking CTAs first.",
  },
  {
    agent: "Email Strategist",
    message:
      "Final plan: one 3-step sequence. Step 1 re-engages quickly, Step 2 sends proof-driven follow-up, Step 3 closes the loop with a final CTA. Each email is personalized from warm context.",
  },
];

export const ACTIVITY_LOG = [
  { time: "Today 2:14pm", icon: "mail", text: "Email 2 sent to 16 leads" },
  { time: "Today 2:01pm", icon: "robot", text: "Pre-send: James Wong CTA upgraded from Case Study → Booking link" },
  { time: "Today 1:45pm", icon: "calendar", text: "Meeting booked: James Wong (CloudBase)" },
  { time: "Today 10:30am", icon: "calendar", text: "Meeting booked: Tom Liu (Datadog)" },
  { time: "Yesterday 9:05am", icon: "mail", text: "Email 1 proof variant sent to 10 leads" },
  { time: "Yesterday 9:00am", icon: "mail", text: "Email 1 re-engagement variant sent to 6 leads" },
  { time: "Day 1 9:02am", icon: "calendar", text: "Meeting booked: Sarah Chen (Acme Corp)" },
  { time: "Day 1 9:00am", icon: "mail", text: "Email 1 sent to 18 high-intent leads" },
  { time: "Day 1 8:55am", icon: "robot", text: "Campaign launched: Re-engage Stalled Pipeline Deals" },
];

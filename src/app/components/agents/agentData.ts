export interface ConversationalAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: "active" | "disabled";
  channels: ("voice" | "chat")[];
  accentColor: string;
  stats: {
    interactions: string;
    engagement: string;
    interactionsTrend?: string;
    interactionsChange?: string;
    engagementTrend?: string;
    engagementChange?: string;
  };
  path?: string;
}

export const AGENTS: ConversationalAgent[] = [
  {
    id: "docket-email",
    name: "Docket Email Agent",
    role: "Email Campaign Agent",
    description: "Runs agentic email campaigns with warm-context personalization and adaptive CTAs.",
    status: "active",
    channels: ["chat"],
    accentColor: "#E8455A",
    stats: { interactions: "498", engagement: "42.1%", interactionsTrend: "up", interactionsChange: "+34%" },
    path: "/email-agent",
  },
  {
    id: "alex",
    name: "Alex",
    role: "Customer Support Agent",
    description: "Handles inbound support queries, routes complex issues to human agents, and tracks resolution.",
    status: "active",
    channels: ["voice", "chat"],
    accentColor: "#3b82f6",
    stats: { interactions: "1,247", engagement: "89.3%", interactionsTrend: "up", interactionsChange: "+12%", engagementTrend: "up", engagementChange: "+3.1%" },
  },
  {
    id: "maya",
    name: "Maya",
    role: "Product Demo Agent",
    description: "Guides prospects through interactive product demos, answers feature questions, and books follow-up calls.",
    status: "active",
    channels: ["chat"],
    accentColor: "#8b5cf6",
    stats: { interactions: "342", engagement: "67.8%", interactionsTrend: "up", interactionsChange: "+28%", engagementTrend: "up", engagementChange: "+5.4%" },
  },
  {
    id: "jordan",
    name: "Jordan",
    role: "Onboarding Specialist",
    description: "Walks new users through setup, answers configuration questions, and ensures successful activation.",
    status: "active",
    channels: ["chat"],
    accentColor: "#22c55e",
    stats: { interactions: "891", engagement: "74.2%", interactionsTrend: "down", interactionsChange: "-4%", engagementTrend: "up", engagementChange: "+1.8%" },
  },
  {
    id: "sam",
    name: "Sam",
    role: "Sales Qualifier Agent",
    description: "Qualifies inbound leads via conversational assessment, scores intent, and routes to AE when ready.",
    status: "active",
    channels: ["voice", "chat"],
    accentColor: "#f59e0b",
    stats: { interactions: "563", engagement: "52.1%", interactionsTrend: "up", interactionsChange: "+19%", engagementTrend: "up", engagementChange: "+7.2%" },
  },
  {
    id: "riley",
    name: "Riley",
    role: "Technical Support Agent",
    description: "Assists with API integration questions, troubleshoots technical issues, and escalates to engineering.",
    status: "disabled",
    channels: ["chat"],
    accentColor: "#9b9a97",
    stats: { interactions: "0", engagement: "0%", interactionsTrend: "down", interactionsChange: "0%" },
  },
];

export function getAgentById(id: string): ConversationalAgent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function getActiveAgents(): ConversationalAgent[] {
  return AGENTS.filter((a) => a.status === "active");
}

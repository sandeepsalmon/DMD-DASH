import { useNavigate } from "react-router";
import { Search, Plus, MoreVertical, Mic, Keyboard, ArrowUpRight } from "lucide-react";

interface Agent {
  id: string;
  name: string;
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

const agents: Agent[] = [
  {
    id: "website-agent-1",
    name: "Website Agent",
    description: "",
    status: "active",
    channels: ["voice", "chat"],
    accentColor: "#E8455A",
    stats: {
      interactions: "1264",
      engagement: "12.58%",
      interactionsTrend: "+445",
      interactionsChange: "↑54.33%",
      engagementTrend: "+2.67",
      engagementChange: "↑26.94%",
    },
    path: "/email-agent",
  },
  {
    id: "website-agent-2",
    name: "Website Agent",
    description: "Helps prospects to understand your product from the website",
    status: "active",
    channels: ["voice"],
    accentColor: "#E8455A",
    stats: {
      interactions: "1264",
      engagement: "12.58%",
    },
  },
  {
    id: "website-agent-3",
    name: "Website Agent",
    description: "Helps prospects to understand your product from the website",
    status: "disabled",
    channels: ["voice", "chat"],
    accentColor: "#9b9a97",
    stats: {
      interactions: "1264",
      engagement: "12.58%",
    },
  },
  {
    id: "website-agent-4",
    name: "Website Agent",
    description: "Helps prospects to understand your product from the website",
    status: "active",
    channels: ["voice"],
    accentColor: "#E8455A",
    stats: {
      interactions: "1264",
      engagement: "12.58%",
    },
  },
  {
    id: "website-agent-5",
    name: "Website Agent",
    description: "Helps prospects to understand your product from the website",
    status: "disabled",
    channels: ["voice", "chat"],
    accentColor: "#9b9a97",
    stats: {
      interactions: "1264",
      engagement: "12.58%",
    },
  },
  {
    id: "website-agent-6",
    name: "Website Agent",
    description: "Helps prospects to understand your product from the website",
    status: "active",
    channels: ["voice"],
    accentColor: "#E8455A",
    stats: {
      interactions: "1264",
      engagement: "12.58%",
    },
  },
];

export function ConversationalAgentsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-11 px-5 flex items-center justify-between shrink-0 border-b border-black/[0.04]">
        <span className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>
          Conversational Agents
        </span>
        <button className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-foreground text-white text-[12px] hover:bg-foreground/90 transition-colors" style={{ fontWeight: 500 }}>
          <Plus size={13} strokeWidth={2} />
          Create Agent
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-8 pb-8 max-w-[860px] mx-auto">
          {/* Title */}
          <p
            className="text-[20px] text-foreground mb-1"
            style={{ fontWeight: 600, lineHeight: 1.3 }}
          >
            Build Your AI Agent
          </p>
          <p
            className="text-[13px] text-[#9b9a97] mb-5"
            style={{ fontWeight: 400, lineHeight: 1.5 }}
          >
            Create new agents or edit existing ones
          </p>

          {/* Analytics Overview */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Interactions", value: "8,412", change: "+12.3%", up: true },
              { label: "Avg. Engagement", value: "14.2%", change: "+2.1%", up: true },
              { label: "Active Agents", value: "4", change: "of 6", up: null },
              { label: "Meetings Booked", value: "127", change: "+18.7%", up: true },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border border-[#e9e9e7] rounded-xl p-3.5 bg-white"
              >
                <p className="text-[10px] text-[#9b9a97] mb-1.5" style={{ fontWeight: 500 }}>
                  {stat.label}
                </p>
                <p className="text-[18px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
                  {stat.value}
                </p>
                <p
                  className="text-[10px] tabular-nums mt-0.5"
                  style={{
                    fontWeight: 500,
                    color: stat.up === null ? "#9b9a97" : stat.up ? "#22B07D" : "#E8455A",
                  }}
                >
                  {stat.up !== null && (stat.up ? "↑ " : "↓ ")}
                  {stat.change}
                  {stat.up !== null && (
                    <span className="text-[#9b9a97]"> last 7d</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 border border-[#e9e9e7] rounded-lg px-3 py-2 mb-6 focus-within:border-foreground/20 transition-colors bg-white">
            <Search size={14} strokeWidth={1.6} className="text-[#9b9a97] shrink-0" />
            <input
              type="text"
              placeholder="Search agents"
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-[#9b9a97] outline-none"
              style={{ fontWeight: 400 }}
            />
          </div>

          {/* Section Label */}
          <p
            className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3"
            style={{ fontWeight: 500 }}
          >
            Your Agents
          </p>

          {/* Agent Cards Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => agent.path && navigate(agent.path)}
                className="w-full text-left rounded-xl border border-[#e9e9e7] p-4 transition-colors hover:shadow-sm hover:border-[#c8c8c6] group bg-white"
              >
                {/* Top Row: Status + Channel Icons */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-[6px] h-[6px] rounded-full"
                      style={{
                        backgroundColor: agent.status === "active" ? "#22B07D" : "#9b9a97",
                      }}
                    />
                    <span
                      className="text-[10px]"
                      style={{
                        fontWeight: 500,
                        color: agent.status === "active" ? "#22B07D" : "#9b9a97",
                      }}
                    >
                      {agent.status === "active" ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {agent.channels.includes("voice") && (
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: agent.accentColor + "15" }}
                      >
                        <Mic size={12} style={{ color: agent.accentColor }} />
                      </div>
                    )}
                    {agent.channels.includes("chat") && (
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{
                          backgroundColor:
                            agent.status === "active" ? "#22B07D15" : "#9b9a9715",
                        }}
                      >
                        <Keyboard
                          size={12}
                          style={{
                            color: agent.status === "active" ? "#22B07D" : "#9b9a97",
                          }}
                        />
                      </div>
                    )}
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[#9b9a97] hover:bg-black/[0.04] transition-colors"
                    >
                      <MoreVertical size={13} />
                    </button>
                  </div>
                </div>

                {/* Agent Name */}
                <p
                  className="text-[14px] text-foreground mb-0.5"
                  style={{ fontWeight: 600 }}
                >
                  {agent.name}
                </p>

                {/* Description */}
                {agent.description && (
                  <p
                    className="text-[11px] text-[#9b9a97] mb-3"
                    style={{ fontWeight: 400, lineHeight: 1.4 }}
                  >
                    {agent.description}
                  </p>
                )}
                {!agent.description && <div className="mb-3" />}

                {/* Stats */}
                <div className="border-t border-[#e9e9e7] pt-3">
                  <p className="text-[9px] text-[#9b9a97] uppercase tracking-wider mb-2" style={{ fontWeight: 500 }}>
                    Last 7 Days
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Interactions */}
                    <div>
                      <p className="text-[9px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 500 }}>
                        Total Interactions
                      </p>
                      <p className="text-[16px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
                        {agent.stats.interactions}
                      </p>
                      {agent.stats.interactionsTrend && (
                        <p className="text-[9px] text-[#22B07D] tabular-nums" style={{ fontWeight: 500 }}>
                          {agent.stats.interactionsTrend}{" "}
                          <span className="text-[#22B07D]">{agent.stats.interactionsChange}</span>
                        </p>
                      )}
                    </div>
                    {/* Engagement */}
                    <div>
                      <p className="text-[9px] text-[#9b9a97] mb-0.5" style={{ fontWeight: 500 }}>
                        Engagement
                      </p>
                      <p className="text-[16px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
                        {agent.stats.engagement}
                      </p>
                      {agent.stats.engagementTrend && (
                        <p className="text-[9px] text-[#22B07D] tabular-nums" style={{ fontWeight: 500 }}>
                          {agent.stats.engagementTrend}{" "}
                          <span className="text-[#22B07D]">{agent.stats.engagementChange}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer Link */}
          <div className="flex justify-center">
            <button className="flex items-center gap-1 text-[12px] text-[#9b9a97] hover:text-foreground transition-colors" style={{ fontWeight: 400 }}>
              See how Agents can help you
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

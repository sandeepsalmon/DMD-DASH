import { useNavigate } from "react-router";
import { Mail, Bot, BarChart3, TrendingUp, Users, Zap } from "lucide-react";

const quickStats = [
  { label: "Active Campaigns", value: "3", icon: Zap, trend: "+1 this week" },
  { label: "Total Leads", value: "847", icon: Users, trend: "312 MQLs" },
  { label: "Emails Sent", value: "1,204", icon: Mail, trend: "24% open rate" },
  { label: "Meetings Booked", value: "34", icon: TrendingUp, trend: "+8 this month" },
];

const agents = [
  {
    title: "Conversational Agents",
    description: "Create and manage email campaigns, nurture sequences, and outbound strategies powered by AI.",
    icon: Bot,
    path: "/conversational-agents",
    stats: "4 tools · 1 active",
    active: true,
  },
  {
    title: "Email Agent",
    description: "Build AI-powered email campaigns with smart segmentation, personalized sequences, and automated follow-ups.",
    icon: Mail,
    path: "/email-agent",
    stats: "3 campaigns · 847 leads",
    active: true,
  },
];

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-11 px-5 flex items-center shrink-0 border-b border-black/[0.04]">
        <span className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>
          Dashboard
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-10 pb-8 max-w-[760px] mx-auto">
          {/* Greeting */}
          <p
            className="text-[22px] text-foreground mb-1"
            style={{ fontWeight: 500, lineHeight: 1.3 }}
          >
            Good morning, Sandeep.
          </p>
          <p
            className="text-[14px] text-[#9b9a97] mb-8"
            style={{ fontWeight: 400, lineHeight: 1.5 }}
          >
            Here's an overview of your demand generation activity.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="border border-[#e9e9e7] rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon size={14} strokeWidth={1.6} className="text-[#9b9a97]" />
                  <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 500 }}>
                    {stat.label}
                  </span>
                </div>
                <p className="text-[20px] text-foreground tabular-nums" style={{ fontWeight: 600 }}>
                  {stat.value}
                </p>
                <p className="text-[11px] text-[#9b9a97] mt-1" style={{ fontWeight: 400 }}>
                  {stat.trend}
                </p>
              </div>
            ))}
          </div>

          {/* Agents Section */}
          <div className="mb-8">
            <p
              className="text-[11px] text-[#9b9a97] uppercase tracking-wider mb-3"
              style={{ fontWeight: 500 }}
            >
              Your Agents
            </p>
            <div className="flex flex-col gap-3">
              {agents.map((agent) => (
                <button
                  key={agent.title}
                  onClick={() => navigate(agent.path)}
                  className="w-full text-left rounded-xl border border-[#e9e9e7] hover:border-[#c8c8c6] hover:bg-[#fafaf9] transition-colors p-5 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground/[0.05] shrink-0">
                      <agent.icon size={18} strokeWidth={1.6} className="text-foreground/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[14px] text-foreground"
                          style={{ fontWeight: 500 }}
                        >
                          {agent.title}
                        </span>
                        {agent.active && (
                          <span
                            className="text-[10px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200 shrink-0"
                            style={{ fontWeight: 500 }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[12px] text-[#9b9a97] mb-1.5"
                        style={{ fontWeight: 400, lineHeight: 1.5 }}
                      >
                        {agent.description}
                      </p>
                      <p className="text-[11px] text-foreground/50" style={{ fontWeight: 400 }}>
                        {agent.stats}
                      </p>
                    </div>
                    <span className="text-[#9b9a97] text-[14px] group-hover:text-foreground/50 transition-colors mt-1">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

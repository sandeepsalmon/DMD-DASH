import { Plus } from "lucide-react";
import { AGENTS } from "./agentData";
import { toast } from "sonner";

interface Props {
  selectedAgentId: string | null;
  onSelect: (agentId: string | null) => void;
  disabled?: boolean;
}

export function AgentPicker({ selectedAgentId, onSelect, disabled }: Props) {
  const activeAgents = AGENTS.filter((a) => a.status === "active");

  return (
    <div className="border border-[#e9e9e7] rounded-xl overflow-hidden bg-white">
      <div className="max-h-[240px] overflow-y-auto divide-y divide-[#f0f0ee]">
        {/* None option */}
        <button
          onClick={() => !disabled && onSelect(null)}
          disabled={disabled}
          className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors ${
            selectedAgentId === null
              ? "bg-[#f7f7f5] border-l-2 border-l-[#9b9a97]"
              : "hover:bg-[#fafaf9] border-l-2 border-l-transparent"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <div className="w-7 h-7 rounded-full bg-[#f4f4f2] flex items-center justify-center shrink-0">
            <span className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 600 }}>—</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>None</p>
            <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Skip agent routing</p>
          </div>
          {selectedAgentId === null && (
            <span className="text-[9px] px-1.5 py-px rounded bg-[#f4f4f2] text-[#6b6a67] border border-[#e9e9e7] shrink-0" style={{ fontWeight: 500 }}>
              Selected
            </span>
          )}
        </button>

        {/* Agent rows */}
        {activeAgents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => !disabled && onSelect(agent.id)}
              disabled={disabled}
              className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors ${
                isSelected
                  ? "bg-[#f7f7f5]"
                  : "hover:bg-[#fafaf9]"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
              style={{ borderLeft: isSelected ? `2px solid ${agent.accentColor}` : "2px solid transparent" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${agent.accentColor}18` }}
              >
                <span className="text-[11px]" style={{ fontWeight: 700, color: agent.accentColor }}>
                  {agent.name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>{agent.name}</p>
                  <div className="flex items-center gap-1">
                    {agent.channels.map((ch) => (
                      <span key={ch} className="text-[8px] px-1 py-px rounded bg-[#f4f4f2] text-[#9b9a97] border border-[#efefed]" style={{ fontWeight: 500 }}>
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{agent.role}</p>
              </div>
              {isSelected && (
                <span className="text-[9px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200 shrink-0" style={{ fontWeight: 500 }}>
                  Selected
                </span>
              )}
            </button>
          );
        })}

        {/* Create new */}
        <button
          onClick={() => toast.info("Agent creation coming soon")}
          disabled={disabled}
          className="w-full text-left px-3.5 py-2.5 flex items-center gap-3 hover:bg-[#fafaf9] transition-colors border-l-2 border-l-transparent disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="w-7 h-7 rounded-full bg-[#f4f4f2] flex items-center justify-center shrink-0">
            <Plus size={12} className="text-[#9b9a97]" />
          </div>
          <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Create New Agent</p>
        </button>
      </div>
    </div>
  );
}

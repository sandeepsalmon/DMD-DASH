import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { AGENTS } from "./agentData";

interface Props {
  selectedAgentId: string | null;
  onSelect: (agentId: string | null) => void;
  disabled?: boolean;
}

export function AgentDropdown({ selectedAgentId, onSelect, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeAgents = AGENTS.filter((a) => a.status === "active");
  const selectedAgent = activeAgents.find((a) => a.id === selectedAgentId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="w-full border border-[#e9e9e7] rounded-lg px-3 py-2 bg-white hover:border-[#c8c8c6] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {selectedAgent ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${selectedAgent.accentColor}18` }}
            >
              <span className="text-[9px]" style={{ fontWeight: 700, color: selectedAgent.accentColor }}>
                {selectedAgent.name[0]}
              </span>
            </div>
            <span className="text-[11px] text-foreground truncate" style={{ fontWeight: 500 }}>
              {selectedAgent.name}
            </span>
            <span className="text-[10px] text-[#9b9a97] truncate" style={{ fontWeight: 400 }}>
              {selectedAgent.role}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-[#9b9a97] flex-1 text-left" style={{ fontWeight: 400 }}>
            Select an agent...
          </span>
        )}
        <ChevronDown size={12} className={`text-[#9b9a97] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-[#e9e9e7] rounded-xl bg-white shadow-lg z-20 overflow-hidden animate-in fade-in duration-150">
          <div className="max-h-[220px] overflow-y-auto divide-y divide-[#f0f0ee]">
            <button
              onClick={() => { onSelect(null); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors ${
                selectedAgentId === null ? "bg-[#f7f7f5]" : "hover:bg-[#fafaf9]"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[#f4f4f2] flex items-center justify-center shrink-0">
                <span className="text-[9px] text-[#9b9a97]" style={{ fontWeight: 600 }}>—</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>None</p>
                <p className="text-[9px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Skip agent routing</p>
              </div>
            </button>

            {activeAgents.map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => { onSelect(agent.id); setOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors ${
                    isSelected ? "bg-[#f7f7f5]" : "hover:bg-[#fafaf9]"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${agent.accentColor}18` }}
                  >
                    <span className="text-[9px]" style={{ fontWeight: 700, color: agent.accentColor }}>
                      {agent.name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>{agent.name}</p>
                    <p className="text-[9px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{agent.role}</p>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] px-1.5 py-px rounded bg-green-50 text-green-700 border border-green-200 shrink-0" style={{ fontWeight: 500 }}>
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

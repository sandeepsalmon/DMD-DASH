import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Plus } from "lucide-react";
import { AGENTS } from "./agentData";
import { toast } from "sonner";

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function AgentMultiSelect({ selectedIds, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeAgents = AGENTS.filter((a) => a.status === "active");
  const selectedAgents = activeAgents.filter((a) => selectedIds.includes(a.id));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const remove = (id: string) => {
    onChange(selectedIds.filter((s) => s !== id));
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="w-full border border-[#e9e9e7] rounded-lg px-3 py-2 bg-white hover:border-[#c8c8c6] transition-colors flex items-center gap-2 min-h-[40px] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div className="flex-1 flex items-center gap-1.5 flex-wrap min-w-0">
          {selectedAgents.length === 0 && (
            <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>Select agents...</span>
          )}
          {selectedAgents.map((agent) => (
            <span
              key={agent.id}
              className="inline-flex items-center gap-1 text-[10px] pl-1 pr-1.5 py-0.5 rounded-md border"
              style={{
                fontWeight: 500,
                background: `${agent.accentColor}10`,
                borderColor: `${agent.accentColor}30`,
                color: agent.accentColor,
              }}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white shrink-0"
                style={{ background: agent.accentColor, fontWeight: 700 }}
              >
                {agent.name[0]}
              </span>
              {agent.name}
              <button
                onClick={(e) => { e.stopPropagation(); remove(agent.id); }}
                className="ml-0.5 hover:opacity-70"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <ChevronDown size={12} className={`text-[#9b9a97] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-[#e9e9e7] rounded-xl bg-white shadow-lg z-[100] overflow-hidden animate-in fade-in duration-150">
          <div className="max-h-[220px] overflow-y-auto divide-y divide-[#f0f0ee]">
            {activeAgents.map((agent) => {
              const isSelected = selectedIds.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => toggle(agent.id)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors ${
                    isSelected ? "bg-[#f7f7f5]" : "hover:bg-[#fafaf9]"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${agent.accentColor}18` }}
                  >
                    <span className="text-[10px]" style={{ fontWeight: 700, color: agent.accentColor }}>
                      {agent.name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>{agent.name}</p>
                    <p className="text-[10px] text-[#9b9a97]" style={{ fontWeight: 400 }}>{agent.role}</p>
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "bg-foreground border-foreground" : "border-[#d6d6d3]"
                  }`}>
                    {isSelected && <span className="text-white text-[10px]">✓</span>}
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => { toast.info("Agent creation coming soon"); setOpen(false); }}
              className="w-full text-left px-3.5 py-2.5 flex items-center gap-3 hover:bg-[#fafaf9] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#f4f4f2] flex items-center justify-center shrink-0">
                <Plus size={11} className="text-[#9b9a97]" />
              </div>
              <p className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>Create New Agent</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

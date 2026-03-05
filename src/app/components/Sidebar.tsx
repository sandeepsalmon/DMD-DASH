import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Bot,
  Mail,
  ChevronsLeft,
  ChevronsRight,
  BarChart3,
  Palette,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";


const navItems = [
  { icon: BarChart3, path: "/", label: "Demand Dashboard", enabled: true },
  { icon: Bot, path: "/conversational-agents", label: "Conversational Agents", enabled: true },
  { icon: Mail, path: "/email-agent", label: "Email Agent", enabled: true },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const brandBookTooltip =
    "Brand Book: add your brand colors, backgrounds, and visual style so agent-generated slides automatically match your branding.";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`h-full bg-transparent flex flex-col shrink-0 transition-[width] duration-200 ease-in-out ${
        expanded ? "w-[220px]" : "w-[48px]"
      }`}
    >
      {/* Top bar — logo */}
      <div className={`h-11 flex items-center shrink-0 overflow-hidden ${expanded ? "px-3" : "justify-center"}`}>
        <img src="/docket.svg" alt="Docket" className="h-5 shrink-0" />
        {expanded && (
          <span className="text-[13px] text-[#37352f]/50 whitespace-nowrap ml-2" style={{ fontWeight: 500 }}>Design Playground</span>
        )}
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-px px-2 flex-1 overflow-hidden">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const disabled = !item.enabled;

          const btn = (
            <button
              key={item.path}
              onClick={() => !disabled && navigate(item.path)}
              disabled={disabled}
              className={`
                flex items-center gap-2.5 h-8 px-2 rounded-md transition-colors
                ${disabled ? "opacity-[0.35] cursor-not-allowed" : "cursor-pointer"}
                ${active && !disabled ? "bg-black/[0.04] text-foreground" : ""}
                ${!active && !disabled ? "text-foreground/65 hover:bg-black/[0.04] hover:text-foreground" : ""}
                ${disabled ? "text-foreground/65" : ""}
              `}
            >
              <item.icon size={15} strokeWidth={1.6} className="shrink-0" />
              <span className={`text-[13px] whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`} style={{ fontWeight: active ? 500 : 400 }}>
                {item.label}
              </span>
            </button>
          );

          if (!expanded) {
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                  {disabled && <span className="text-muted-foreground ml-1">(coming soon)</span>}
                </TooltipContent>
              </Tooltip>
            );
          }

          return btn;
        })}

      </div>

      {/* Expand/collapse button */}
      <div className={`shrink-0 overflow-hidden ${expanded ? "px-2" : "px-1.5"}`}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2.5 h-8 px-2 w-full rounded-md text-foreground/40 hover:text-foreground/70 hover:bg-black/[0.04] transition-colors"
        >
          {expanded ? <ChevronsLeft size={15} strokeWidth={1.6} className="shrink-0" /> : <ChevronsRight size={15} strokeWidth={1.6} className="shrink-0" />}
          {expanded && (
            <span className="text-[13px] whitespace-nowrap" style={{ fontWeight: 400 }}>Collapse</span>
          )}
        </button>
      </div>

      {/* Brand Book (non-clickable info item) */}
      <div className={`shrink-0 overflow-hidden ${expanded ? "px-2 pt-1" : "px-1.5 pt-1"}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              aria-disabled="true"
              className="flex items-center gap-2.5 h-8 px-2 w-full rounded-md text-foreground/55 bg-black/[0.02] cursor-default"
            >
              <Palette size={15} strokeWidth={1.6} className="shrink-0" />
              <span
                className={`text-[13px] whitespace-nowrap transition-opacity duration-200 ${
                  expanded ? "opacity-100" : "opacity-0"
                }`}
                style={{ fontWeight: 400 }}
              >
                Brand Book
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="max-w-[260px] leading-relaxed">
            {brandBookTooltip}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Bottom — user */}
      <div className="shrink-0 px-3 py-2.5 overflow-hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#e3e2e0] flex items-center justify-center text-foreground/70 text-[10px] shrink-0" style={{ fontWeight: 500 }}>
            S
          </div>
          <span className={`text-[13px] text-foreground whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`} style={{ fontWeight: 400 }}>
            Sandeep
          </span>
        </div>
      </div>
    </aside>
  );
}

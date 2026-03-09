import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { LayoutPanelProvider, useLayoutPanels } from "./LayoutPanelContext";
import { AiAssistantProvider } from "./ai-assistant/AiAssistantContext";
import { AiAssistantButton } from "./ai-assistant/AiAssistantButton";
import { AiAssistantPanel } from "./ai-assistant/AiAssistantPanel";

function LayoutInner() {
  const { leftPanel, rightPanel } = useLayoutPanels();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f0efed]">
      <Sidebar />
      {/* Main workspace area */}
      <div className="flex-1 flex min-w-0 p-2 pl-0 gap-2">
        {/* Left panel — transparent, no bg */}
        {leftPanel && (
          <div className="shrink-0 flex flex-col overflow-hidden">
            {leftPanel}
          </div>
        )}

        {/* Center floating panel */}
        <div className="flex-1 flex min-w-0 bg-white rounded-xl shadow-sm border border-black/[0.04] overflow-hidden relative">
          <div className="flex-1 flex min-w-0 overflow-hidden">
            <Outlet />
          </div>
          {!leftPanel && <AiAssistantPanel />}
          {!leftPanel && <AiAssistantButton />}
        </div>

        {/* Right panel — transparent, no bg */}
        {rightPanel && (
          <div className="shrink-0 flex flex-col overflow-hidden">
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  );
}

export function Layout() {
  return (
    <LayoutPanelProvider>
      <AiAssistantProvider>
        <LayoutInner />
      </AiAssistantProvider>
    </LayoutPanelProvider>
  );
}

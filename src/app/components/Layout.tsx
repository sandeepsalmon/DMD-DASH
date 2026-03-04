import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { LayoutPanelProvider, useLayoutPanels } from "./LayoutPanelContext";

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
        <div className="flex-1 flex min-w-0 bg-white rounded-xl shadow-sm border border-black/[0.04] overflow-hidden">
          <Outlet />
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
      <LayoutInner />
    </LayoutPanelProvider>
  );
}

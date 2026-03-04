import { createContext, useContext, useState, type ReactNode } from "react";

interface LayoutPanelContextType {
  leftPanel: ReactNode | null;
  rightPanel: ReactNode | null;
  setLeftPanel: (node: ReactNode | null) => void;
  setRightPanel: (node: ReactNode | null) => void;
}

const LayoutPanelContext = createContext<LayoutPanelContextType>({
  leftPanel: null,
  rightPanel: null,
  setLeftPanel: () => {},
  setRightPanel: () => {},
});

export function LayoutPanelProvider({ children }: { children: ReactNode }) {
  const [leftPanel, setLeftPanel] = useState<ReactNode | null>(null);
  const [rightPanel, setRightPanel] = useState<ReactNode | null>(null);

  return (
    <LayoutPanelContext.Provider value={{ leftPanel, rightPanel, setLeftPanel, setRightPanel }}>
      {children}
    </LayoutPanelContext.Provider>
  );
}

export function useLayoutPanels() {
  return useContext(LayoutPanelContext);
}

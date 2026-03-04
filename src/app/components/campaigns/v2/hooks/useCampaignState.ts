import { useState, useCallback, useRef, useEffect } from "react";
import type { CampaignModeState } from "../../types";

interface UseCampaignStateReturn {
  state: CampaignModeState;
  marketingAgentAccepted: boolean;
  handleStart: () => void;
  handleMarketingAgentDecided: (accepted: boolean) => void;
  handleApproveAndLaunch: (onLaunched: () => void) => void;
}

export function useCampaignState(
  initialState: CampaignModeState
): UseCampaignStateReturn {
  const [state, setState] = useState<CampaignModeState>(initialState);
  const [marketingAgentAccepted, setMarketingAgentAccepted] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const addTimer = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  const handleStart = useCallback(() => {
    setState("agents-running");
    // Chain-of-thought (3×900ms) + buffer (600ms) + agent discussion (4×1200ms) + buffer (500ms) = 8800ms
    addTimer(() => setState("agent-suggestion"), 8800);
  }, []);

  const handleMarketingAgentDecided = useCallback((accepted: boolean) => {
    setMarketingAgentAccepted(accepted);
    const delay = accepted ? 2500 : 500;
    addTimer(() => setState("plan-ready"), delay);
  }, []);

  const handleApproveAndLaunch = useCallback((onLaunched: () => void) => {
    setState("launched");
    addTimer(() => {
      setState("running");
      onLaunched();
    }, 5000);
  }, []);

  return {
    state,
    marketingAgentAccepted,
    handleStart,
    handleMarketingAgentDecided,
    handleApproveAndLaunch,
  };
}

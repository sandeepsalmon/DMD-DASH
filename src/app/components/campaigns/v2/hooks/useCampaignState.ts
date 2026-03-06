import { useState, useCallback, useRef, useEffect } from "react";
import type { CampaignModeState } from "../../types";

interface UseCampaignStateReturn {
  state: CampaignModeState;
  selectedAgentId: string | null;
  handleStart: () => void;
  handleAgentSelected: (agentId: string | null) => void;
  handleApproveAndLaunch: (onLaunched: () => void) => void;
}

export function useCampaignState(
  initialState: CampaignModeState
): UseCampaignStateReturn {
  const [state, setState] = useState<CampaignModeState>(initialState);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
    addTimer(() => setState("agent-suggestion"), 8800);
  }, []);

  const handleAgentSelected = useCallback((agentId: string | null) => {
    setSelectedAgentId(agentId);
    const delay = agentId ? 2500 : 500;
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
    selectedAgentId,
    handleStart,
    handleAgentSelected,
    handleApproveAndLaunch,
  };
}

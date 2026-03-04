import { useState, useCallback, useEffect, useRef } from "react";
import type { CampaignModeState } from "../../types";

export type ArtifactType =
  | "campaign-overview"
  | "leads"
  | "segment-analysis"
  | "email-plan"
  | "email-preview"
  | "dashboard"
  | "activity";

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  createdAt: number;
  state: "generating" | "ready";
}

const INITIAL_ARTIFACTS: Artifact[] = [
  {
    id: "campaign-overview",
    type: "campaign-overview",
    title: "Campaign Overview",
    createdAt: Date.now(),
    state: "ready",
  },
  {
    id: "leads",
    type: "leads",
    title: "Leads",
    createdAt: Date.now() + 1,
    state: "ready",
  },
];

export function useArtifacts(campaignState: CampaignModeState) {
  const [artifacts, setArtifacts] = useState<Artifact[]>(
    campaignState === "running"
      ? [
          ...INITIAL_ARTIFACTS,
          {
            id: "segment-analysis",
            type: "segment-analysis",
            title: "Segment Analysis",
            createdAt: Date.now() + 2,
            state: "ready",
          },
          {
            id: "email-plan",
            type: "email-plan",
            title: "Email Plan",
            createdAt: Date.now() + 3,
            state: "ready",
          },
          {
            id: "dashboard",
            type: "dashboard",
            title: "Dashboard",
            createdAt: Date.now() + 4,
            state: "ready",
          },
          {
            id: "activity",
            type: "activity",
            title: "Activity",
            createdAt: Date.now() + 5,
            state: "ready",
          },
        ]
      : [...INITIAL_ARTIFACTS]
  );
  const [activeArtifactId, setActiveArtifactId] = useState<string>(
    campaignState === "running" ? "dashboard" : "campaign-overview"
  );
  const prevStateRef = useRef(campaignState);

  // React to campaign state changes and add artifacts
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = campaignState;

    if (prev === campaignState) return;

    if (campaignState === "agents-running") {
      const newArtifact: Artifact = {
        id: "segment-analysis",
        type: "segment-analysis",
        title: "Segment Analysis",
        createdAt: Date.now(),
        state: "generating",
      };
      setArtifacts((a) => {
        if (a.some((x) => x.id === "segment-analysis")) return a;
        return [...a, newArtifact];
      });
      setActiveArtifactId("segment-analysis");
    }

    if (campaignState === "agent-suggestion") {
      setArtifacts((a) =>
        a.map((x) =>
          x.id === "segment-analysis" ? { ...x, state: "ready" as const } : x
        )
      );
    }

    if (campaignState === "plan-ready") {
      const newArtifact: Artifact = {
        id: "email-plan",
        type: "email-plan",
        title: "Email Plan",
        createdAt: Date.now(),
        state: "ready",
      };
      setArtifacts((a) => {
        if (a.some((x) => x.id === "email-plan")) return a;
        return [...a, newArtifact];
      });
      setActiveArtifactId("email-plan");
    }

    if (campaignState === "launched" || campaignState === "running") {
      setArtifacts((a) => {
        let updated = [...a];
        if (!updated.some((x) => x.id === "dashboard")) {
          updated.push({
            id: "dashboard",
            type: "dashboard",
            title: "Dashboard",
            createdAt: Date.now(),
            state: "ready",
          });
        }
        if (!updated.some((x) => x.id === "activity")) {
          updated.push({
            id: "activity",
            type: "activity",
            title: "Activity",
            createdAt: Date.now() + 1,
            state: "ready",
          });
        }
        return updated;
      });
      setActiveArtifactId("dashboard");
    }
  }, [campaignState]);

  const addArtifact = useCallback(
    (artifact: Omit<Artifact, "createdAt">) => {
      const full: Artifact = { ...artifact, createdAt: Date.now() };
      setArtifacts((a) => [...a, full]);
      setActiveArtifactId(full.id);
    },
    []
  );

  const setActiveArtifact = useCallback((id: string) => {
    setActiveArtifactId(id);
  }, []);

  const navigateArtifact = useCallback(
    (direction: "prev" | "next") => {
      const idx = artifacts.findIndex((a) => a.id === activeArtifactId);
      if (idx === -1) return;
      const nextIdx =
        direction === "next"
          ? Math.min(idx + 1, artifacts.length - 1)
          : Math.max(idx - 1, 0);
      setActiveArtifactId(artifacts[nextIdx].id);
    },
    [artifacts, activeArtifactId]
  );

  return {
    artifacts,
    activeArtifactId,
    activeArtifact: artifacts.find((a) => a.id === activeArtifactId) || null,
    setActiveArtifact,
    addArtifact,
    navigateArtifact,
  };
}

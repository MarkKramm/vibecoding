// Loads ONE phase's full record, on demand.
//
// The light index (data/generated/index.json) carries every phase's title,
// duration and goal, plus the IDS of its checklist/tasks/quiz. Everything else a
// phase page renders — tool purposes, resource lists, practice task prose, quiz
// questions and answers, free-vs-paid text — lives in that track's full JSON
// file (~130 KB per track, ~1.3 MB across the corpus).
//
// That is far too much to put in the entry chunk for a reader who may only ever
// open one phase, so it is fetched here, once per track, and cached. Opening a
// second phase in a track you have already visited costs nothing.
//
// The three states matter and are all distinct:
//   loading — the file is in flight; show a quiet placeholder.
//   ready   — render the phase.
//   error   — the file failed to load or the phase is not in it. Shown to the
//             reader, never swallowed: a phase page that silently renders
//             nothing is indistinguishable from a phase that has no content.

import { useEffect, useState } from "react";
import { cachedTrackPhases, loadTrackPhases } from "../data/roadmaps.js";

export function usePhaseDetail(trackId, phaseId) {
  const [state, setState] = useState(() => {
    const cached = trackId ? cachedTrackPhases(trackId) : null;
    if (cached) {
      const phase = cached.find((p) => p.id === phaseId) || null;
      return phase
        ? { status: "ready", phase, error: null }
        : { status: "error", phase: null, error: "Phase not found in this track." };
    }
    return {
      status: trackId && phaseId ? "loading" : "empty",
      phase: null,
      error: null,
    };
  });

  useEffect(() => {
    if (!trackId || !phaseId) {
      setState({ status: "empty", phase: null, error: null });
      return;
    }

    const cached = cachedTrackPhases(trackId);
    if (cached) {
      const phase = cached.find((p) => p.id === phaseId) || null;
      setState(
        phase
          ? { status: "ready", phase, error: null }
          : { status: "error", phase: null, error: "Phase not found in this track." }
      );
      return;
    }

    let alive = true;
    setState({ status: "loading", phase: null, error: null });

    loadTrackPhases(trackId).then((result) => {
      if (!alive) return;
      if (result.status !== "ready") {
        setState({
          status: result.status === "empty" ? "empty" : "error",
          phase: null,
          error: result.error,
        });
        return;
      }
      const phase = result.phases.find((p) => p.id === phaseId) || null;
      setState(
        phase
          ? { status: "ready", phase, error: null }
          : { status: "error", phase: null, error: "Phase not found in this track." }
      );
    });

    return () => {
      alive = false;
    };
  }, [trackId, phaseId]);

  return state;
}

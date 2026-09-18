// Every tool in the curriculum, in one filterable table.
//
// Read across phases this view answers a question no single phase can: "what do
// I actually need to install, and what does it cost me?" The Cost track argues
// that a zero-budget learner can do this whole curriculum, and this page is
// where that claim is auditable — every tool, every cost string, every free
// alternative, in one place.
//
// Tools are de-duplicated by name. The same tool appears in many phases (Git
// shows up in nearly every track), and a list with Git thirty times is not a
// tools library, it is a search result. First occurrence wins, and the phases
// that reference it are collected as provenance.
//
// ---------------------------------------------------------------------------
// WHY THIS PAGE LOADS EVERY TRACK, WHICH IS NOT WHAT THE OTHER PAGES DO
// ---------------------------------------------------------------------------
// This page was rendering "0 tools across 10 written tracks" and the empty-state
// message "No tools match that filter", while the corpus held 433 tool rows. The
// cause was a data-shape mismatch that nothing could see:
//
//   `tracks` from data/roadmaps.js is built from generated/index.json, the LIGHT
//   projection. Its phases carry a title, a duration, a goal and the IDS of their
//   checklist/tasks/quiz -- deliberately NOT their tools, resources or prose, so
//   the dashboard does not pull 1.3 MB into the entry chunk.
//
// So `p.tools` was `undefined` for every phase, the `|| []` turned that into an
// empty list, and the page told the reader the curriculum names no tools at all.
// Every guard was green: the tool rows exist in the Markdown, exist in the
// per-track JSON, and pass the tools-table contract check. Only the RENDERED page
// was empty, and no test rendered it.
//
// This is the one view that genuinely needs the tools of every phase at once, so
// it is the one view that has to load the full track files. They are loaded
// concurrently and the page renders a loading state, because on a slow connection
// ~1.3 MB is not instant and an empty table is exactly the failure being fixed.
//
// Cost: opening this page pulls every track file. That is the honest trade for a
// library that is defined by completeness; the alternative is a "tools" projection
// in index.json, which would grow the entry chunk for every reader who never opens
// this page.

import { useEffect, useMemo, useState } from "react";
import ToolCard from "../components/ToolCard.jsx";
import { tracks, loadTrackPhases } from "../data/roadmaps.js";
import { costTone, TONES, TONE_LABELS } from "../data/tools.js";

export default function ToolsLibrary({ onOpenPhase }) {
  const [tone, setTone] = useState(null);
  const [q, setQ] = useState("");
  const [fullPhases, setFullPhases] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Pull every track's full phases once, concurrently.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        tracks.map(async (t) => {
          const r = await loadTrackPhases(t.id);
          return (r.phases || []).map((p) => ({ ...p, trackId: t.id, trackLabel: t.label }));
        })
      );
      if (cancelled) return;
      const failed = results.length === 0;
      setFullPhases(results.flat());
      if (failed) setLoadError("No track data could be loaded.");
    })().catch((e) => {
      if (!cancelled) setLoadError(String((e && e.message) || e));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const tools = useMemo(() => {
    const byName = new Map();
    for (const p of fullPhases || []) {
      for (const tool of p.tools || []) {
        const key = String(tool.name || "").trim().toLowerCase();
        if (!key) continue;
        if (!byName.has(key)) {
          byName.set(key, { tool, phases: [] });
        }
        byName.get(key).phases.push({
          trackId: p.trackId,
          trackLabel: p.trackLabel,
          phaseId: p.id,
          phaseTitle: p.title,
        });
      }
    }
    return [...byName.values()].sort((a, b) =>
      String(a.tool.name).localeCompare(String(b.tool.name))
    );
  }, [fullPhases]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tools.filter(({ tool }) => {
      if (tone && costTone(tool.cost) !== tone) return false;
      if (!needle) return true;
      const hay = [tool.name, tool.purpose, tool.cost, tool.freeAlternative]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [tools, tone, q]);

  const counts = useMemo(() => {
    const c = { free: 0, freemium: 0, paid: 0 };
    for (const { tool } of tools) c[costTone(tool.cost)]++;
    return c;
  }, [tools]);

  return (
    <div className="tools-library">
      <header className="page__head">
        <h1>Tools library</h1>
        <p className="muted">
          Every tool named anywhere in the curriculum, de-duplicated, with its
          cost and its free alternative.{" "}
          {fullPhases === null ? "Loading…" : `${tools.length} tools across ${tracks.filter((t) => t.phases.length).length} written tracks.`}
        </p>
      </header>

      {loadError && (
        <p className="muted">
          The tool list could not be loaded ({loadError}). Reload the page, or run{" "}
          <code>npm run build:content</code> if the content has never been built.
        </p>
      )}

      {/* While the track files are in flight the list is unknown, not empty. Saying
          "No tools match that filter" here was the original bug: it reported a
          filter miss when the real cause was that no data had arrived. */}
      {fullPhases === null && !loadError && (
        <p className="muted">Loading tools…</p>
      )}

      <div className="toolbar" hidden={fullPhases === null}>
        <div className="toolbar__group" role="group" aria-label="Filter by cost">
          <button
            type="button"
            className={"chip" + (tone === null ? " is-on" : "")}
            onClick={() => setTone(null)}
          >
            All ({tools.length})
          </button>
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              className={"chip" + (tone === t ? " is-on" : "")}
              onClick={() => setTone(tone === t ? null : t)}
            >
              {TONE_LABELS[t]} ({counts[t]})
            </button>
          ))}
        </div>
        <label className="toolbar__search">
          <span className="sr-only">Search tools</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools…"
          />
        </label>
      </div>

      {fullPhases !== null && !loadError && filtered.length === 0 && (
        <p className="muted">No tools match that filter.</p>
      )}

      {fullPhases !== null && filtered.length > 0 && (
        <ul className="toolgrid toolgrid--wide">
          {filtered.map(({ tool, phases }) => (
            <li key={tool.name}>
              <ToolCard tool={tool} />
              <p className="muted toolprov">
                Used in:{" "}
                {phases.map((ph, i) => (
                  <span key={ph.phaseId}>
                    {i > 0 && ", "}
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => onOpenPhase(ph.trackId, ph.phaseId)}
                    >
                      {ph.phaseTitle}
                    </button>
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

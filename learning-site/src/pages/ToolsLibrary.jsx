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

import { useMemo, useState } from "react";
import ToolCard from "../components/ToolCard.jsx";
import { tracks } from "../data/roadmaps.js";
import { costTone, TONES, TONE_LABELS } from "../data/tools.js";

export default function ToolsLibrary({ onOpenPhase }) {
  const [tone, setTone] = useState(null);
  const [q, setQ] = useState("");

  const tools = useMemo(() => {
    const byName = new Map();
    for (const t of tracks) {
      for (const p of t.phases) {
        for (const tool of p.tools || []) {
          const key = String(tool.name || "").trim().toLowerCase();
          if (!key) continue;
          if (!byName.has(key)) {
            byName.set(key, { tool, phases: [] });
          }
          byName.get(key).phases.push({
            trackId: t.id,
            trackLabel: t.label,
            phaseId: p.id,
            phaseTitle: p.title,
          });
        }
      }
    }
    return [...byName.values()].sort((a, b) =>
      String(a.tool.name).localeCompare(String(b.tool.name))
    );
  }, []);

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
          cost and its free alternative. {tools.length} tools across{" "}
          {tracks.filter((t) => t.phases.length).length} written tracks.
        </p>
      </header>

      <div className="toolbar">
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

      {filtered.length === 0 ? (
        <p className="muted">No tools match that filter.</p>
      ) : (
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

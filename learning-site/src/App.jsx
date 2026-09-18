// The application shell: view routing, progress state, and the chrome.
//
// ---------------------------------------------------------------------------
// WHY ROUTING IS A STRING IN useState RATHER THAN A ROUTER
// ---------------------------------------------------------------------------
// This app has five views and no nested routes. react-router would add a
// dependency, a basename to keep in step with Vite's `base` for GitHub Pages
// subdirectory hosting, and a class of "blank page on hard refresh" bugs that
// only appear once deployed — for no benefit, because there are no URLs a reader
// needs to bookmark or share.
//
// The one thing a router would give that is worth having is deep-linking into a
// phase. That is handled explicitly instead: `openPhase` is the single entry
// point for navigation, so Search results, the dashboard and the prev/next
// controls all arrive through the same function and none of them can drift.
//
// ---------------------------------------------------------------------------
// WHAT IS DELIBERATELY NOT HERE
// ---------------------------------------------------------------------------
// The sibling CS Roadmap project's App carries six more views — Schedule,
// Applications, Certifications, Portfolio, YourWork, PathOrder — because that
// curriculum ends in a job hunt with deadlines, applications to track and a
// portfolio to assemble. This curriculum has no deadline: the reader is building
// a skill. Porting those views would add surface area that nothing in the
// content refers to. That material lives in the Career track's own phases
// instead, which is where it belongs.

import { useCallback, useEffect, useRef, useState } from "react";
import { tracks, findTrack, neighbours } from "./data/roadmaps.js";
import { useProgress, countDoneIds } from "./hooks/useProgress.js";
import { usePhaseDetail } from "./hooks/usePhaseDetail.js";
import { useEnergyMode } from "./hooks/useEnergyMode.js";
import { useReadingState } from "./hooks/useReadingState.js";
import { useReadingSize } from "./hooks/useReadingSize.js";
import { useTimeBudget } from "./hooks/useTimeBudget.js";
import { useShortcuts } from "./hooks/useShortcuts.js";
import Dashboard from "./pages/Dashboard.jsx";
import PhaseDetail from "./pages/PhaseDetail.jsx";
import ToolsLibrary from "./pages/ToolsLibrary.jsx";
import Search from "./pages/Search.jsx";
import Shared from "./pages/Shared.jsx";
import ShortcutHelp from "./components/ShortcutHelp.jsx";
import DataTransfer from "./components/DataTransfer.jsx";

const VIEWS = [
  { id: "dashboard", label: "Curriculum" },
  { id: "tools", label: "Tools" },
  { id: "reference", label: "Reference" },
  { id: "search", label: "Search" },
];

export default function App() {
  const { done, toggle, reset } = useProgress();
  const energy = useEnergyMode();
  const budget = useTimeBudget();
  const readingSize = useReadingSize();
  const reading = useReadingState();

  const [view, setView] = useState("dashboard");
  const [trackId, setTrackId] = useState(null);
  const [phaseId, setPhaseId] = useState(null);
  const [searchQuery] = useState("");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  // A search result opens a phase with a specific heading in mind. The anchor is
  // handed to PhaseDetail through a ref rather than a prop so that changing it
  // does not re-render the whole tree, and so it survives the lesson's async
  // load — the ref is read once the blocks are on screen.
  const anchorRef = useRef("");

  const openPhase = useCallback((tId, pId, anchor) => {
    // A search hit carries a phase id but resolves its own track. Falling back
    // to a scan keeps every caller from needing to know the mapping.
    let resolved = tId;
    if (!resolved || !findTrack(resolved)) {
      resolved = null;
      for (const t of tracks) {
        if (t.phases.some((p) => p.id === pId)) {
          resolved = t.id;
          break;
        }
      }
    }
    if (!resolved) return;
    anchorRef.current = anchor || "";
    setTrackId(resolved);
    setPhaseId(pId);
    setView("phase");
  }, []);

  const openTrack = useCallback(
    (tId) => {
      const t = findTrack(tId);
      if (!t || !t.phases.length) return;
      openPhase(tId, t.phases[0].id);
    },
    [openPhase]
  );

  const goDashboard = useCallback(() => {
    setView("dashboard");
    setPhaseId(null);
  }, []);

  const track = trackId ? findTrack(trackId) : null;
  // The light index gives us the phase's title/goal immediately; the full phase
  // (tools, tasks, quiz) arrives asynchronously from its track file.
  const summary = track && phaseId ? track.phases.find((p) => p.id === phaseId) : null;
  const detail = usePhaseDetail(trackId, phaseId);
  const phase = detail.phase;
  const nav = track && phaseId ? neighbours(track.id, phaseId) : { prev: null, next: null };
  const phaseIndex = summary ? track.phases.findIndex((p) => p.id === phaseId) : -1;

  // The last section the reader was in, so a returning visit can offer to resume.
  // `lastSection` is a map keyed by phase id, not a single value.
  const lastSection = phaseId ? reading.lastSection[phaseId] : null;

  // Record the open phase so the dashboard can offer it back. Keyed on the pair
  // so switching tracks does not leave a stale phase behind.
  useEffect(() => {
    if (trackId && phaseId) reading.visitPhase(trackId, phaseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, phaseId]);

  useShortcuts({
    onNext: () => nav.next && track && openPhase(track.id, nav.next.id),
    onPrev: () => nav.prev && track && openPhase(track.id, nav.prev.id),
    onSearch: () => {
      setView("search");
      setPhaseId(null);
    },
    onView: (id) => {
      if (["dashboard", "tools", "reference", "search"].includes(id)) {
        setView(id);
        setPhaseId(null);
      }
    },
  });

  // Scroll to the top whenever the view changes. Without this, opening a phase
  // from halfway down the dashboard lands the reader in the middle of a lesson.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view, phaseId]);

  const corpusDone = (() => {
    let d = 0;
    let t = 0;
    for (const tr of tracks) {
      for (const p of tr.phases) {
        d += countDoneIds(done, p.checklistIds || []);
        t += (p.checklistIds || []).length;
      }
    }
    return { d, t };
  })();

  return (
    <div className="app">
      <a className="skip" href="#main">
        Skip to content
      </a>

      <header className="topbar">
        <button type="button" className="topbar__brand linkish" onClick={goDashboard}>
          Vibecoding <span className="muted">&amp; the AI Era</span>
        </button>

        <nav className="topbar__nav" aria-label="Main">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={
                "navbtn" +
                (view === v.id || (view === "phase" && v.id === "dashboard")
                  ? " is-on"
                  : "")
              }
              onClick={() => {
                setView(v.id);
                setPhaseId(null);
              }}
            >
              {v.label}
            </button>
          ))}
        </nav>

        <div className="topbar__meta">
          <span className="muted" title="Checklist items completed">
            {corpusDone.d} / {corpusDone.t}
          </span>
          <button
            type="button"
            className="iconbtn"
            onClick={() => setShortcutsOpen(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            ?
          </button>
          <button
            type="button"
            className="iconbtn"
            onClick={() => setTransferOpen(true)}
            aria-label="Export or import progress"
            title="Export or import progress"
          >
            ⇅
          </button>
        </div>
      </header>

      <main id="main" className="main">
        {view === "dashboard" && (
          <Dashboard
            done={done}
            onOpenTrack={openTrack}
            onOpenPhase={openPhase}
            saved={
              reading.lastPhaseId
                ? {
                    trackId: reading.lastTrackId,
                    phaseId: reading.lastPhaseId,
                    title: (() => {
                      const t = findTrack(reading.lastTrackId);
                      const p = t && t.phases.find((x) => x.id === reading.lastPhaseId);
                      return p ? p.title : reading.lastPhaseId;
                    })(),
                  }
                : null
            }
          />
        )}

        {view === "phase" && track && detail.status === "loading" && (
          <div className="phase">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <button type="button" className="linkish" onClick={goDashboard}>
                ← All tracks
              </button>
            </nav>
            <h1>{summary ? summary.title : "Loading…"}</h1>
            <p className="muted">Loading this phase…</p>
          </div>
        )}

        {view === "phase" && track && detail.status === "error" && (
          <div className="phase">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <button type="button" className="linkish" onClick={goDashboard}>
                ← All tracks
              </button>
            </nav>
            <p className="muted">
              This phase could not be loaded{detail.error ? ` (${detail.error})` : ""}.
            </p>
          </div>
        )}

        {view === "phase" && track && phase && (
          <PhaseDetail
            phase={phase}
            done={done}
            onToggle={toggle}
            onBack={goDashboard}
            anchorRef={anchorRef}
            prev={nav.prev}
            next={nav.next}
            index={phaseIndex}
            phaseCount={track.phases.length}
            onOpenPhase={(tId, pId) => openPhase(tId || track.id, pId)}
            onVisitSection={(id, text) => reading.visitSection(phase.id, id, text)}
            lastSection={lastSection}
            size={readingSize.size}
            onSizeChange={readingSize.change}
            scale={readingSize.scale}
          />
        )}

        {view === "phase" && !track && (
          <p className="muted">That phase could not be found.</p>
        )}

        {view === "tools" && <ToolsLibrary onOpenPhase={openPhase} />}

        {view === "reference" && <Shared />}

        {view === "search" && (
          <Search
            initialQuery={searchQuery}
            onOpenPhase={(tId, pId, anchor) => openPhase(tId, pId, anchor)}
          />
        )}
      </main>

      <footer className="footer">
        <p className="muted">
          Read the lesson, do the tasks, tick the checklist, take the quiz. Every
          phase is written to be finished in a week.
        </p>
        <p className="muted">
          Energy: {energy.mode} · Budget: {budget.budget} · Progress is stored in
          this browser only.
        </p>
      </footer>

      <ShortcutHelp open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <DataTransfer
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onResetProgress={reset}
      />
    </div>
  );
}

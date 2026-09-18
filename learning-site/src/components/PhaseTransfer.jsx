// Carry ONE phase between machines.
//
// WHY THIS EXISTS
// "Back up & restore" in the sidebar moves the reader's whole profile across ten
// storage keys. On a 34–112 week plan the case that actually comes up is
// narrower: a reader working through one phase on a work machine, a library PC,
// or a laptop that is not the one their profile lives on. They want that phase
// out and back — not a ten-key document that would overwrite a profile they are
// not looking at.
//
// WHY IT IS A PANEL AND NOT A MODAL
// The full-profile transfer is a modal because it can overwrite every key at
// once and deserves a confirmation. This one is additive by construction —
// `importPhase` unions and can never remove anything — so it does not need to
// interrupt the page. It sits inline, collapsed, beside the phase it acts on.
//
// See lib/transfer.js → exportPhase / importPhase, and D-016 for the full-backup
// decision this deliberately narrows rather than replaces.

import { useRef, useState } from "react";
import {
  exportPhase,
  importPhase,
  suggestedPhaseFilename,
} from "../lib/transfer.js";

function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoking immediately can cancel the download in some browsers; one tick is
  // enough for the click to have been handled.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function PhaseTransfer({ phase }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const inputRef = useRef(null);
  // Importing writes to localStorage, but every hook on this page read its key at
  // mount and holds it in React state — so the change is not visible until the
  // page is remounted. Same reasoning as the full-profile import, and the same
  // remedy: say so, and offer the reload rather than doing it silently.
  const [needsReload, setNeedsReload] = useState(false);

  function onExport() {
    const out = exportPhase(window.localStorage, phase, null);
    const count = Object.values(out.counts).reduce((n, v) => n + v, 0);
    download(suggestedPhaseFilename(phase, null), JSON.stringify(out.payload, null, 2));
    setMessage(
      count > 0
        ? "Exported this phase — " + count + " item(s) of your work."
        : "Exported this phase. You have not recorded anything in it yet, so the file is empty."
    );
    setNeedsReload(false);
  }

  function onFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let payload;
      try {
        payload = JSON.parse(String(reader.result));
      } catch {
        setMessage({ error: "That file is not valid JSON." });
        return;
      }
      const res = importPhase(payload, window.localStorage);
      if (!res.ok) {
        setMessage({ error: res.error || "That file could not be imported." });
        return;
      }
      setMessage(
        "Imported into this phase. Nothing already here was removed — an entry you already had wins over the file."
      );
      setNeedsReload(true);
    };
    reader.onerror = () => setMessage({ error: "That file could not be read." });
    reader.readAsText(file);
    // Clear the input so re-picking the same file fires `change` again.
    e.target.value = "";
  }

  return (
    <section className="card phase-transfer">
      <div className="phase-transfer__head">
        <h2>Carry this phase</h2>
        <button
          type="button"
          className="link-btn"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && (
        <>
          <p className="muted">
            Export this phase's checklist progress, section ticks, note and task
            answers as a small file you can carry to another machine and import
            there. It is separate from <strong>Back up &amp; restore</strong> in the
            sidebar, which moves your whole profile.
          </p>

          <div className="phase-transfer__actions">
            <button type="button" className="btn" onClick={onExport}>
              Export this phase
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => inputRef.current && inputRef.current.click()}
            >
              Import into this phase
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              className="visually-hidden"
              id="phase-transfer-file"
              onChange={onFile}
            />
            {/* The input keeps `visually-hidden` rather than `display: none`, so
                it stays in the accessibility tree. That only helps if it has a
                NAME, though — it previously had no id, no label and no
                aria-label, so a screen reader announced an unlabelled file
                field. Same pattern as DataTransfer's picker. */}
            <label htmlFor="phase-transfer-file" className="visually-hidden">
              Choose a phase backup file to import
            </label>
          </div>

          <p className="muted phase-transfer__note">
            Importing only ever adds. It never removes or overwrites work already
            on this machine, so it is safe to run twice.
          </p>

          {message && (
            <p
              className={
                "phase-transfer__message" +
                (message && message.error ? " is-error" : "")
              }
              role="status"
            >
              {message.error || message}
            </p>
          )}

          {needsReload && (
            <p className="phase-transfer__message">
              <button
                type="button"
                className="link-btn"
                onClick={() => window.location.reload()}
              >
                Reload the page
              </button>{" "}
              to see the imported work.
            </p>
          )}
        </>
      )}
    </section>
  );
}

// Backup and restore: the UI over lib/transfer.js.
//
// WHY THIS IS A MODAL AND NOT TWO SIDEBAR BUTTONS
// Export is harmless — it reads and hands you a file. Import is the only action
// in this entire site that can overwrite the reader's work, and it does so
// across every registered key at once. So it does not get to be a one-click
// button in a sidebar next to "Reset progress". It gets a panel that shows you,
// key by key, exactly what the file contains before you commit to it, and it
// refuses to apply anything until you have seen that list.
//
// THE TWO MODES ARE NOT SYMMETRICAL, AND THE LABELS SAY SO
// * **Merge** is the default and the safe one. It unions what you finished —
//   checklist progress, section ticks, portfolio entries, applications — and
//   keeps this machine's reading position and preferences. Importing the same
//   file twice does nothing the second time.
// * **Replace** overwrites every registered key with the file's contents. It is
//   the "I am restoring a backup onto a clean machine" action, and it is the one
//   that can lose work, so it is the second option and it is spelled out.
//
// WHY THE PAGE RELOADS AFTERWARDS
// Every hook in this app reads its key once at mount and then owns it in React
// state (useProgress, usePortfolio, useApplications, useReadingState, ...). An
// import writes localStorage *underneath* those live copies. Telling each hook
// to re-read would mean threading a refresh signal through all of them and
// getting it right in every one; a reload is one line, cannot be partially
// correct, and is the honest thing to do after restoring state. The reader is
// not mid-task when they click this — they are on a settings errand.

import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import {
  exportAll,
  importAll,
  inspect,
  suggestedFilename,
  labelFor,
} from "../lib/transfer.js";

export default function DataTransfer({ open, onClose }) {
  // "idle" | "reviewing" | "done"
  const [stage, setStage] = useState("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(null); // { payload, summary }
  const [skipped, setSkipped] = useState([]);
  const fileRef = useRef(null);
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  // Reset to a clean slate every time the panel opens, so a failed attempt from
  // last week is not still on screen.
  useEffect(() => {
    if (!open) return;
    setStage("idle");
    setError("");
    setNotice("");
    setPending(null);
    setSkipped([]);
  }, [open]);

  // Focus containment, focus restore, and the scroll lock that was missing here.
  useFocusTrap(open, { panelRef, initialFocusRef: closeRef });

  // Escape closes the panel.
  //
  // This comment used to claim the close was conditional — "only while nothing
  // irreversible is mid-flight" — but the handler below has never checked
  // `stage`, so Escape closes unconditionally. The code was corrected to match
  // the simpler behaviour rather than the comment, because a confirm-in-progress
  // is not a state this panel can be in: the replace confirmation is a separate
  // `pending` step that Escape safely abandons. A comment describing a guard
  // that does not exist is worse than no comment, because the next reader
  // trusts it instead of reading the body.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleExport = useCallback(() => {
    setError("");
    setNotice("");
    let out;
    try {
      out = exportAll(window.localStorage);
    } catch (e) {
      setError("Could not read your saved data: " + String((e && e.message) || e));
      return;
    }

    const text = JSON.stringify(out.payload, null, 2);
    const name = suggestedFilename();

    try {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke on the next tick: revoking synchronously can cancel the download
      // in some browsers before it has started reading the blob.
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (e) {
      setError("Could not save the file: " + String((e && e.message) || e));
      return;
    }

    setSkipped(out.skipped);
    setNotice(
      "Saved " +
        name +
        ". Keep it somewhere that is not this browser profile — that is the " +
        "whole point of a backup."
    );
  }, []);

  const handleFile = useCallback(async (file) => {
    setError("");
    setNotice("");
    setPending(null);
    setStage("idle");
    if (!file) return;

    setBusy(true);
    let payload;
    try {
      const text = await file.text();
      try {
        payload = JSON.parse(text);
      } catch {
        setError(
          "That file is not valid JSON. If you edited it by hand, check for a " +
            "missing comma or a stray quote."
        );
        return;
      }

      const verdict = inspect(payload);
      if (!verdict.ok) {
        setError(verdict.error);
        if (verdict.summary) {
          setPending({ payload: null, summary: verdict.summary });
          setStage("reviewing");
        }
        return;
      }

      setPending({ payload, summary: verdict.summary });
      setStage("reviewing");
    } finally {
      setBusy(false);
      // Allow re-selecting the same file after a failed attempt.
      if (fileRef.current) fileRef.current.value = "";
    }
  }, []);

  const apply = useCallback(
    (mode) => {
      if (!pending || !pending.payload) return;
      setBusy(true);
      setError("");
      const res = importAll(window.localStorage, pending.payload, mode);
      setBusy(false);

      if (!res.ok) {
        setError(res.error);
        return;
      }

      setStage("done");
      setNotice(
        mode === "replace"
          ? "Restored " + res.written.length + " sets of data from the file."
          : "Merged " + res.written.length + " sets of data. Nothing you had already finished was removed."
      );
    },
    [pending]
  );

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal data-transfer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-transfer-title"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <h2 id="data-transfer-title">Back up your data</h2>
          <button
            type="button"
            className="modal__close"
            aria-label="Close backup panel"
            ref={closeRef}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <p className="muted">
          Your progress, portfolio, applications, start dates, reading position
          and preferences live only in this browser. Nothing is uploaded
          anywhere. That means clearing your browser data, or moving to another
          machine, loses all of it — unless you keep a copy.
        </p>

        {/* --- export ------------------------------------------------------ */}
        <section className="data-transfer__block">
          <h3>Export</h3>
          <p className="muted">
            Writes one JSON file containing everything you have saved.
          </p>
          <button type="button" className="btn" onClick={handleExport}>
            Download a backup
          </button>
          {skipped.length > 0 && (
            <p className="data-transfer__warn">
              {skipped.length} item{skipped.length === 1 ? "" : "s"} could not be
              read and {skipped.length === 1 ? "was" : "were"} left out rather
              than copied across in a broken state. The rest of the file is
              complete.
            </p>
          )}
        </section>

        {/* --- import ------------------------------------------------------ */}
        <section className="data-transfer__block">
          <h3>Restore from a backup</h3>
          <p className="muted">
            You will see exactly what is in the file before anything is written.
          </p>

          {stage !== "reviewing" && stage !== "done" && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="data-transfer__file"
                id="data-transfer-file"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  handleFile(f);
                }}
              />
              <label
                htmlFor="data-transfer-file"
                className="btn btn--ghost data-transfer__pick"
              >
                {busy ? "Reading…" : "Choose a backup file"}
              </label>
            </>
          )}

          {stage === "reviewing" && pending && (
            <div className="data-transfer__review">
              <div className="data-transfer__review-title">
                This file contains
              </div>
              <ul className="data-transfer__list">
                {pending.summary.map((row) => (
                  <li
                    key={row.key}
                    className={
                      "data-transfer__row" +
                      (row.accepted ? "" : " is-refused")
                    }
                  >
                    <span className="data-transfer__label">
                      {row.label || labelFor(row.key)}
                    </span>
                    <span className="data-transfer__count">
                      {row.accepted
                        ? row.count === 1
                          ? "1 item"
                          : row.count + " items"
                        : row.reason}
                    </span>
                  </li>
                ))}
              </ul>

              {pending.payload && (
                <>
                  <div className="data-transfer__modes">
                    <button
                      type="button"
                      className="btn"
                      disabled={busy}
                      onClick={() => apply("merge")}
                    >
                      Merge into what I have
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      disabled={busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Replace everything currently saved with the contents of this file? Anything on this machine that is not in the file will be lost."
                          )
                        ) {
                          apply("replace");
                        }
                      }}
                    >
                      Replace everything
                    </button>
                  </div>
                  <p className="muted data-transfer__hint">
                    <strong>Merge</strong> adds anything the file has that you do
                    not, and keeps what you have. <strong>Replace</strong> makes
                    this browser match the file exactly.
                  </p>
                </>
              )}

              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setStage("idle");
                  setPending(null);
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {stage === "done" && (
            <button
              type="button"
              className="btn"
              onClick={() => window.location.reload()}
            >
              Reload to see the restored data
            </button>
          )}
        </section>

        {error && (
          <p className="data-transfer__error" role="alert">
            {error}
          </p>
        )}
        {notice && !error && (
          <p className="data-transfer__notice" role="status">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}
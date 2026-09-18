// Export and import of everything the reader owns.
//
// WHY THIS EXISTS
// Progress, portfolio, applications, the schedule, reading position, section
// ticks, the reader's notes and three preferences live in separate localStorage
// keys. The site is single-user and local-first by design (D-006), which is the
// right call — but it means a cleared browser profile, a new laptop, or a
// reinstall destroys months of work on a 34–112 week curriculum, and nothing in
// the UI even said so. This module is the backup and the move.
//
// WHAT IT IS NOT
// It is not sync and not a server. There is no account, no upload, and no
// network call anywhere in this file. It reads every registered key, emits one
// JSON document, and can read that document back.
//
// The count is deliberately not written down here. It has changed twice, and a
// number in a comment is one more place to forget — `KEYS` below is the list,
// and `test-data.mjs` checks it against the source tree in both directions.
//
// DESIGN: PURE, AND TOTAL
// Nothing here touches React, `window`, or the DOM. Storage is passed in as a
// two-method object, so the whole round trip is exercised under Node by
// `scripts/test-data.mjs` — including the rejection cases, which are the ones
// that matter. A backup format that silently accepts a malformed file and
// writes it over good data is worse than no backup at all, so **every key is
// validated before anything is written**, and a payload with one bad key is
// rejected whole rather than partially applied.
//
// See docs/DECISIONS.md → D-016.

export const FORMAT = "vibecoding-backup";
export const VERSION = 1;

// Every key the site owns, with the validator that decides whether an incoming
// value for it is acceptable. `kind` is documentation; the `check` function is
// the authority. Adding a ninth storage key means adding it here or it will not
// be backed up — which is the failure mode this list exists to make obvious.
export const KEYS = [
  {
    key: "vibecoding:progress:v1",
    kind: "map of task id -> true",
    check: isTrueMap,
  },
  {
    key: "vibecoding:lesson-sections:v1",
    kind: "map of 'phaseId#sectionId' -> true",
    check: isTrueMap,
  },
  {
    key: "vibecoding:portfolio:v1",
    kind: "array of portfolio entries",
    check: (v) => isEntryArray(v, ["id", "title"]),
  },
  {
    key: "vibecoding:applications:v1",
    kind: "array of application entries",
    check: (v) => isEntryArray(v, ["id", "company", "role"]),
  },
  {
    key: "vibecoding:schedule:v1",
    kind: "map of trackId -> YYYY-MM-DD",
    check: isDateMap,
  },
  {
    key: "vibecoding:reading:v1",
    kind: "{ lastTrackId, lastPhaseId, lastSection }",
    check: isReadingState,
  },
  {
    key: "vibecoding:energy-mode:v1",
    kind: "one of low | normal | high",
    check: (v) => ["low", "normal", "high"].includes(v),
  },
  {
    key: "vibecoding:reading-size:v1",
    kind: "one of s | m | l | xl",
    check: (v) => ["s", "m", "l", "xl"].includes(v),
  },
  {
    key: "vibecoding:notes:v1",
    kind: "map of phaseId -> { note, answers }",
    check: isNotesMap,
  },
  {
    key: "vibecoding:quiz:v1",
    kind: "map of questionId -> chosen option index",
    check: isQuizAnswers,
  },
  {
    key: "vibecoding:certifications:v1",
    kind: "array of certification entries",
    // Only `id` and `name` are required, matching the hook: a reader who has just
    // written down a certification they are considering can record it before they
    // have checked the price or picked a date, and a validator demanding those
    // fields would refuse to restore their own backup.
    check: (v) => isEntryArray(v, ["id", "name"]),
  },
  {
    key: "vibecoding:time-budget:v1",
    kind: "one of quick | focused | deep",
    check: (v) => ["quick", "focused", "deep"].includes(v),
  },
];

const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/;

// --- validators -----------------------------------------------------------
// Each returns a boolean. They are deliberately strict: a backup is read back
// by a program, not a person, so "close enough" is a corruption.

function isPlainObject(v) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

/** `{ id: true, ... }` — the shape useProgress and useLessonProgress write. */
function isTrueMap(v) {
  if (!isPlainObject(v)) return false;
  for (const [k, val] of Object.entries(v)) {
    if (typeof k !== "string" || k === "") return false;
    if (val !== true) return false;
  }
  return true;
}

/**
 * `{ questionId: optionIndex }` — the shape useQuizAnswers writes.
 *
 * Strict about the value being a non-negative integer, because the whole point of
 * storing an index rather than the option text is that `isCorrect` compares it
 * numerically. A backup carrying `"2"` as a string, or `null`, would compare
 * against an index and silently mark a right answer wrong — the one failure mode
 * this feature must not have. Refusing the file is louder and safer than
 * importing answers that quietly misreport.
 */
function isQuizAnswers(v) {
  if (!isPlainObject(v)) return false;
  for (const [questionId, chosen] of Object.entries(v)) {
    if (typeof questionId !== "string" || questionId === "") return false;
    if (!Number.isInteger(chosen) || chosen < 0) return false;
  }
  return true;
}

/** An array where every element is an object carrying the required string fields. */
function isEntryArray(v, required) {
  if (!Array.isArray(v)) return false;
  for (const entry of v) {
    if (!isPlainObject(entry)) return false;
    for (const field of required) {
      if (typeof entry[field] !== "string" || entry[field] === "") return false;
    }
  }
  return true;
}

function isDateMap(v) {
  if (!isPlainObject(v)) return false;
  for (const val of Object.values(v)) {
    if (typeof val !== "string" || !VALID_DATE.test(val)) return false;
  }
  return true;
}

function isReadingState(v) {
  if (!isPlainObject(v)) return false;
  if (typeof v.lastTrackId !== "string") return false;
  if (typeof v.lastPhaseId !== "string") return false;
  if (!isPlainObject(v.lastSection)) return false;
  for (const [phaseId, entry] of Object.entries(v.lastSection)) {
    if (phaseId === "") return false;
    if (!isPlainObject(entry)) return false;
    if (typeof entry.id !== "string" || entry.id === "") return false;
    if (typeof entry.text !== "string") return false;
  }
  return true;
}

/**
 * `{ phaseId: { note: string, answers: { taskId: string } } }`.
 *
 * Strict on purpose, and strict in the same direction as every other validator
 * here: the reader's writing is the one thing in this store that cannot be
 * regenerated from the curriculum, so a value that does not match the shape is
 * refused rather than coerced. An absent `answers` object is tolerated because a
 * phase with only a note legitimately has none; an `answers` value that is not an
 * object is not, because that is a different shape pretending to be this one.
 */
function isNotesMap(v) {
  if (!isPlainObject(v)) return false;
  for (const [phaseId, entry] of Object.entries(v)) {
    if (typeof phaseId !== "string" || phaseId === "") return false;
    if (!isPlainObject(entry)) return false;
    if (typeof entry.note !== "string") return false;
    if (entry.answers === undefined) continue;
    if (!isPlainObject(entry.answers)) return false;
    for (const [taskId, answer] of Object.entries(entry.answers)) {
      if (typeof taskId !== "string" || taskId === "") return false;
      if (typeof answer !== "string") return false;
    }
  }
  return true;
}

// --- reading and writing --------------------------------------------------

/** Parse one stored value. Returns `{ ok, value }`; ok is false on bad JSON. */
export function readKey(storage, key) {
  let raw;
  try {
    raw = storage.getItem(key);
  } catch {
    return { ok: false, value: null, error: "storage is not readable" };
  }
  if (raw === null || raw === undefined || raw === "") {
    return { ok: true, value: null, present: false };
  }
  try {
    return { ok: true, value: JSON.parse(raw), present: true };
  } catch {
    return { ok: false, value: null, error: "stored value is not valid JSON" };
  }
}

/**
 * Build the backup document.
 *
 * Keys that are absent or unreadable are **omitted** rather than written as
 * null, so the file says what the reader actually has. A key present but
 * holding something this version cannot validate is also omitted, and reported
 * in `skipped` — exporting a corrupt value would just move the corruption.
 *
 * @returns {{ok: boolean, payload: object, skipped: Array<string>}}
 */
export function exportAll(storage, now) {
  const data = {};
  const skipped = [];
  const stamp = now || new Date().toISOString();

  for (const { key, check } of KEYS) {
    const read = readKey(storage, key);
    if (!read.ok) {
      skipped.push(key);
      continue;
    }
    if (!read.present) continue;
    if (!check(read.value)) {
      skipped.push(key);
      continue;
    }
    data[key] = read.value;
  }

  return {
    ok: true,
    skipped,
    payload: {
      format: FORMAT,
      version: VERSION,
      app: "Vibecoding & the AI Era",
      exportedAt: stamp,
      data,
    },
  };
}

/**
 * Validate a parsed backup document WITHOUT applying it.
 *
 * Split from `importAll` so the UI can tell the reader what a file contains and
 * let them confirm before anything is overwritten. A destructive action should
 * be inspectable first.
 *
 * @returns {{ok: boolean, error?: string, summary?: Array, data?: object}}
 */
export function inspect(payload) {
  if (!isPlainObject(payload)) {
    return { ok: false, error: "The file is not a backup — it is not a JSON object." };
  }
  if (payload.format !== FORMAT) {
    return {
      ok: false,
      error:
        "The file is not a Vibecoding backup (expected format “" +
        FORMAT +
        "”).",
    };
  }
  if (payload.version !== VERSION) {
    return {
      ok: false,
      error:
        "This backup is version " +
        payload.version +
        "; this site reads version " +
        VERSION +
        ". A newer backup may contain keys this version would drop, so it is refused rather than half-read.",
    };
  }
  if (!isPlainObject(payload.data)) {
    return { ok: false, error: "The backup has no data section." };
  }

  const known = new Set(KEYS.map((k) => k.key));
  const data = {};
  const summary = [];
  const rejected = [];

  for (const [key, value] of Object.entries(payload.data)) {
    const entry = KEYS.find((k) => k.key === key);
    // An unknown key is not an error: a newer version may add one, and refusing
    // the whole file over it would make forward compatibility impossible. It is
    // dropped and reported.
    if (!entry || !known.has(key)) {
      summary.push({ key, label: labelFor(key), count: null, accepted: false, reason: "unknown key" });
      continue;
    }
    if (!entry.check(value)) {
      rejected.push(key);
      summary.push({
        key,
        label: labelFor(key),
        count: null,
        accepted: false,
        reason: "failed validation",
      });
      continue;
    }
    data[key] = value;
    summary.push({ key, label: labelFor(key), count: countOf(value), accepted: true });
  }

  // One bad key fails the whole import. Half-restoring someone's progress and
  // leaving the rest silently behind is the one outcome a backup must not have.
  if (rejected.length) {
    return {
      ok: false,
      error:
        "The backup contains " +
        rejected.length +
        " key(s) that failed validation and was refused whole: " +
        rejected.join(", ") +
        ". Importing part of it would leave your data half-restored.",
      summary,
    };
  }

  if (!Object.keys(data).length) {
    return { ok: false, error: "The backup contains no recognised data.", summary };
  }

  return { ok: true, summary, data };
}

/**
 * A human label for a key, for the confirmation list.
 *
 * WHY TWO LABELS EXIST FOR SOME KEYS
 * Four hooks were ported from the sibling CS Roadmap project and kept, but their
 * views were deliberately not ported (see DECISIONS.md -> D-008). Their storage
 * keys are still registered here so an old backup round-trips losslessly, which
 * means a reader restoring one is shown rows for features this site has no screen
 * for. `certifications` and `schedule` are the two that are unreachable today:
 * nothing in the app ever writes them, so they can only ever appear as empty.
 *
 * Telling a reader "Certifications: 0 items" invites the reasonable conclusion
 * that the feature exists somewhere and they have simply not found it. Naming the
 * state instead ("not used in this app") is the honest version and costs nothing.
 * The keys are kept rather than deleted because removing them would silently drop
 * those fields from a reader's backup the next time they restore -- see D-008's
 * note on why that removal is deferred rather than done.
 */
export function labelFor(key) {
  const short = key.replace(/^vibecoding:/, "").replace(/:v\d+$/, "");
  const labels = {
    progress: "Checklist progress",
    "lesson-sections": "Lesson sections ticked",
    portfolio: "Portfolio entries",
    applications: "Applications",
    certifications: "Certifications (not used in this app)",
    quiz: "Quiz answers",
    schedule: "Schedule start dates (not used in this app)",
    reading: "Reading position",
    "energy-mode": "Energy mode",
    "reading-size": "Reading size",
    notes: "Your notes and answers",
    "time-budget": "Time available today",
  };
  return labels[short] || short;
}

/** How many things a value holds, for the confirmation list. */
function countOf(value) {
  if (Array.isArray(value)) return value.length;
  if (isPlainObject(value)) return Object.keys(value).length;
  return 1;
}

/**
 * Merge two values for one key.
 *
 * THE RULE: merge unions what the reader **made or finished**, and keeps this
 * machine's **preferences and position**. That line is deliberate.
 *
 * * Progress, section ticks, portfolio and applications are accomplishments and
 *   artifacts. Losing one because the other machine did not have it is the
 *   whole failure this feature exists to prevent, so they union.
 * * Reading position and the two preferences describe *this* device right now.
 *   A merge that overwrote "where I am" with a stale value from another machine
 *   would yank the reader backwards the moment they imported.
 *
 * Existing wins on an id collision, so importing the same file twice is a no-op
 * rather than a duplicate.
 */
export function mergeValue(key, current, incoming) {
  const entry = KEYS.find((k) => k.key === key);
  const kind = entry ? entry.kind : "";

  if (kind.startsWith("map of task") || kind.startsWith("map of 'phaseId")) {
    // Boolean map: union. Nothing is ever un-ticked by an import.
    return { ...current, ...incoming };
  }

  if (Array.isArray(current) && Array.isArray(incoming)) {
    const seen = new Set(current.map((e) => e && e.id));
    const extra = incoming.filter((e) => e && !seen.has(e.id));
    return [...current, ...extra];
  }

  if (isDateMap(current) && isDateMap(incoming)) {
    // One start date per track. Existing wins per track.
    return { ...incoming, ...current };
  }

  // Notes are writing, and writing unions the same way accomplishments do —
  // but at one level deeper, because each phase holds a note AND a map of task
  // answers, and those need different rules:
  //
  //   * The NOTE is prose. There is no way to merge two paragraphs a machine can
  //     honestly choose between, so the existing one wins and the incoming text
  //     is left alone. Importing must never silently replace something the
  //     reader wrote on this machine with an older draft from another one.
  //   * The ANSWERS are a map of task id -> text. A phase present on both sides
  //     unions per task, and an existing answer wins on a collision, for the
  //     same reason.
  //
  // A phase that exists only in the incoming file is taken whole — that is the
  // whole point of moving your work to a new laptop.
  if (isNotesMap(current) && isNotesMap(incoming)) {
    const merged = { ...incoming };
    for (const [phaseId, entry] of Object.entries(current)) {
      const incomingEntry = merged[phaseId];
      if (!incomingEntry) {
        merged[phaseId] = entry;
        continue;
      }
      const note = entry.note && entry.note.trim() !== "" ? entry.note : incomingEntry.note;
      merged[phaseId] = {
        note,
        answers: { ...(incomingEntry.answers || {}), ...(entry.answers || {}) },
      };
    }
    return merged;
  }

  // Preferences and reading position belong to this machine.
  return current;
}

/**
 * Apply a validated payload.
 *
 * @param {object} storage     getItem/setItem/removeItem
 * @param {object} payload     a parsed backup document
 * @param {string} mode        "merge" (default) or "replace"
 * @returns {{ok: boolean, error?: string, written: Array, summary: Array}}
 */
export function importAll(storage, payload, mode = "merge") {
  const verdict = inspect(payload);
  if (!verdict.ok) return { ok: false, error: verdict.error, written: [], summary: verdict.summary || [] };

  const written = [];

  for (const { key } of KEYS) {
    if (!(key in verdict.data)) continue;
    const incoming = verdict.data[key];

    let next = incoming;
    if (mode === "merge") {
      const current = readKey(storage, key);
      if (current.ok && current.present) {
        next = mergeValue(key, current.value, incoming);
      }
    }

    try {
      storage.setItem(key, JSON.stringify(next));
      written.push(key);
    } catch {
      return {
        ok: false,
        error:
          "Storage is full or unavailable, so the import stopped part-way. Keys already written: " +
          (written.length ? written.join(", ") : "none") +
          ".",
        written,
        summary: verdict.summary,
      };
    }
  }

  return { ok: true, written, summary: verdict.summary };
}

/**
 * A filename that sorts chronologically and says what it is.
 * Local date, because the reader is naming a file they can see, not logging an
 * event — an ISO UTC stamp would name a backup taken this evening with
 * yesterday's date anywhere west of Greenwich.
 */
export function suggestedFilename(now) {
  const d = now ? new Date(now) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    "vibecoding-backup-" +
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "-" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    ".json"
  );
}

// --- one phase, rather than the whole profile ------------------------------
//
// WHY THIS EXISTS
// `exportAll` moves the reader's entire profile across ten keys. That is the
// right answer for a new laptop and the wrong answer for the case that actually
// comes up on a 34–112 week plan: a reader working through one phase on a work
// machine, a library PC, or a laptop that is not the one their profile lives on.
// They want *this phase* out and back, not a ten-key document that would
// overwrite a profile they are not looking at.
//
// WHY IT IS NOT A SECOND BACKUP FORMAT
// The emitted document is a real, valid backup — same `format`, same `version`,
// same `data` map keyed by storage key — so `inspect` and `importAll` read it
// with no special case. The difference is only *which ids it contains*. That
// keeps one format, one validator and one merge rule, which is the property that
// makes this safe to add: a phase file cannot drift from a full backup, because
// it is the same thing with a narrower `data`.
//
// WHAT "THIS PHASE" MEANS FOR EACH KEY
// Only four of the ten keys hold per-phase data, and each is narrowed by id:
//
//   * `progress`          — checklist task ids, filtered by the phase's own ids
//   * `lesson-sections`   — `phaseId#sectionId` keys, filtered by prefix
//   * `notes`             — the `phaseId` entry, so the note and every answer
//   * `reading`           — only when this phase is the last one read
//
// Every other key (portfolio, applications, schedule, the three preferences) is
// profile-shaped, not phase-shaped, and is deliberately **absent** rather than
// exported and ignored. A phase file that carried the schedule would be a
// whole-profile file wearing a phase's name.

export const PHASE_FORMAT = "vibecoding-phase";

/**
 * The storage key that holds an entry per phase id, with its per-phase shape.
 *
 * `reading` is listed separately below because it is not a map of phase ids —
 * it is one small object naming the last phase, which is a different question.
 */
const PHASE_SCOPED = [
  {
    key: "vibecoding:progress:v1",
    // A map of task id -> true, where the ids are owned by the phase.
    narrow: (value, ids) => {
      const out = {};
      for (const [k, v] of Object.entries(value)) {
        if (ids.has(k)) out[k] = v;
      }
      return out;
    },
  },
  {
    key: "vibecoding:lesson-sections:v1",
    // A map of "phaseId#sectionId" -> true.
    narrow: (value, ids, phaseId) => {
      const out = {};
      const prefix = phaseId + "#";
      for (const [k, v] of Object.entries(value)) {
        if (k.startsWith(prefix)) out[k] = v;
      }
      return out;
    },
  },
  {
    key: "vibecoding:notes:v1",
    // A map of phaseId -> { note, answers }. The whole entry, because the note
    // and the answers belong to the phase as a unit.
    narrow: (value, ids, phaseId) => {
      const entry = value[phaseId];
      return entry ? { [phaseId]: entry } : {};
    },
  },
];

/**
 * Export one phase's data.
 *
 * @param {object} storage                a two-method storage object
 * @param {object} phase                  the phase from data/roadmaps.js
 * @param {string} now                    ISO stamp for the document
 * @returns {{ok: boolean, payload: object, counts: object}}
 */
export function exportPhase(storage, phase, now) {
  const phaseId = phase.id;
  // Every id the phase owns: checklist items and practice tasks together. The
  // progress key holds whichever the reader ticked, and both live in the same
  // map, so filtering by only one of the two lists would silently drop half.
  const ids = new Set();
  for (const item of phase.checklist || []) ids.add(item.id);
  for (const task of phase.tasks || []) ids.add(task.id);

  const data = {};
  const counts = {};

  for (const { key, narrow } of PHASE_SCOPED) {
    const read = readKey(storage, key);
    // A key that is absent, unreadable or corrupt contributes nothing. This
    // differs from `exportAll`, which reports those in `skipped`: a phase export
    // is a convenience, and failing it because an unrelated key is corrupt would
    // block a reader who only wants one phase. The counts make the omission
    // visible rather than silent.
    if (!read.ok || !read.present) continue;
    const narrowed = narrow(read.value, ids, phaseId);
    if (Object.keys(narrowed).length === 0) continue;
    data[key] = narrowed;
    counts[key] = Object.keys(narrowed).length;
  }

  // Reading position, only if this phase is the one the reader is actually in.
  // Exporting it otherwise would drag another machine's "you were here" along
  // with a phase the reader may be opening precisely because they are not.
  const reading = readKey(storage, "vibecoding:reading:v1");
  if (reading.ok && reading.present && isReadingState(reading.value)) {
    if (reading.value.lastPhaseId === phaseId) {
      data["vibecoding:reading:v1"] = reading.value;
      counts["vibecoding:reading:v1"] = 1;
    }
  }

  return {
    ok: true,
    counts,
    payload: {
      format: FORMAT,
      version: VERSION,
      app: "Vibecoding & the AI Era",
      kind: PHASE_FORMAT,
      phase: { id: phaseId, title: phase.title },
      exportedAt: now || new Date().toISOString(),
      data,
    },
  };
}

/**
 * Merge a phase export into storage.
 *
 * Deliberately **additive and non-destructive**: it unions into the four
 * phase-scoped keys and can never remove what is already there. A phase file is
 * the "carry this one phase between machines" action, and a file that could
 * delete a reader's existing work on the machine they carried it *to* would be a
 * trap. That is also why it does not offer Replace — `importAll` already owns
 * the destructive path, behind a confirmation, for the whole-profile case.
 *
 * @returns {{ok: boolean, error?: string, written?: Array<string>, summary?: Array}}
 */
export function importPhase(payload, storage) {
  const verdict = inspect(payload);
  if (!verdict.ok) return verdict;

  const written = [];

  for (const [key, incoming] of Object.entries(verdict.data)) {
    const read = readKey(storage, key);

    // Unreadable existing value: refuse rather than overwrite. The reader's own
    // data is not recoverable from the curriculum, so a merge into something
    // this version cannot parse must fail loudly instead of guessing.
    if (!read.ok) {
      return {
        ok: false,
        error:
          "Existing data for “" +
          labelFor(key) +
          "” could not be read, so nothing was imported. Export a backup first.",
        summary: verdict.summary,
      };
    }

    let next;
    if (isPlainObject(incoming)) {
      // Objects union, and the EXISTING entry wins on a collision — the same
      // rule `mergeValue` applies to the full import, and for the same reason:
      // the machine the reader is sitting at is the one whose writing is
      // current, and importing twice must be a no-op. Getting this order
      // backwards would silently replace the note they can see with a staler
      // one from a file, which is the one direction this feature must not have.
      const existing = isPlainObject(read.value) ? read.value : {};
      next = { ...incoming, ...existing };
    } else {
      next = incoming;
    }

    try {
      storage.setItem(key, JSON.stringify(next));
      written.push(key);
    } catch {
      return {
        ok: false,
        error:
          "Storage is full or unavailable, so the import stopped part-way. Keys already written: " +
          (written.length ? written.join(", ") : "none") +
          ".",
        written,
        summary: verdict.summary,
      };
    }
  }

  return { ok: true, written, summary: verdict.summary };
}

/** A filename naming one phase, so a reader with several can tell them apart. */
export function suggestedPhaseFilename(phase, now) {
  const d = now ? new Date(now) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  // The phase id is already kebab-case and unique, so it is the filename. The
  // leading number is kept because it sorts the files into curriculum order.
  return (
    "cs-roadmap-" +
    String(phase.id).replace(/[^a-z0-9-]/gi, "-") +
    "-" +
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    ".json"
  );
}
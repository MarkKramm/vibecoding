// Persisted state for all-track capstones and resumable exhaustive exams.
// Store stable question IDs and original option indexes, not duplicated question
// text or answer keys. The corpus remains the source of truth on resume.

const CAPSTONE_KEY = "vibecoding:capstone:v1";
const SESSION_KEY = "vibecoding:exam-session:v1";

export function emptyCapstoneState() {
  return { seenIds: [], best: null, attempts: 0, comprehensive: { best: null, attempts: 0 } };
}

export function isCapstoneState(value) {
  return Boolean(
    value && typeof value === "object" && !Array.isArray(value) &&
    Array.isArray(value.seenIds) && value.seenIds.every((id) => typeof id === "string") &&
    Number.isInteger(value.attempts) && value.attempts >= 0 &&
    (value.best === null || isCompactGrade(value.best)) &&
    value.comprehensive && typeof value.comprehensive === "object" &&
    Number.isInteger(value.comprehensive.attempts) && value.comprehensive.attempts >= 0 &&
    (value.comprehensive.best === null || isCompactGrade(value.comprehensive.best)) &&
    new Set(value.seenIds).size === value.seenIds.length
  );
}

function isCompactGrade(value) {
  return Boolean(value && typeof value === "object" &&
    Number.isFinite(value.percent) && value.percent >= 0 && value.percent <= 100 &&
    Number.isInteger(value.correct) && value.correct >= 0 &&
    Number.isInteger(value.total) && value.total >= 1 && value.correct <= value.total &&
    typeof value.passed === "boolean" && value.passed === (value.correct / value.total >= 0.8) &&
    typeof value.at === "string");
}

export function updateCapstoneState(previous, questions, grade, now = new Date().toISOString(), mode = "capstone") {
  const old = isCapstoneState(previous) ? previous : emptyCapstoneState();
  const seenIds = new Set(old.seenIds);
  if (mode === "capstone") {
    for (const result of grade.results || []) {
      const q = (questions || []).find((item) => item.id === result.id);
      if (q && result.answered && typeof result.id === "string") seenIds.add(result.id);
    }
  }
  const attempt = {
    percent: grade.percent,
    correct: grade.correct,
    total: grade.total,
    passed: grade.passed,
    at: now,
  };
  if (mode === "comprehensive") {
    const prev = old.comprehensive || { best: null, attempts: 0 };
    const best = !prev.best || attempt.percent > prev.best.percent ? attempt : prev.best;
    return { ...old, comprehensive: { best, attempts: prev.attempts + 1 } };
  }
  const best = !old.best || attempt.percent > old.best.percent ? attempt : old.best;
  return { ...old, seenIds: [...seenIds], best, attempts: old.attempts + 1 };
}

export function readCapstoneState(storage) {
  try {
    const store = storage ?? globalThis.localStorage;
    const raw = store?.getItem(CAPSTONE_KEY);
    if (!raw) return emptyCapstoneState();
    const value = JSON.parse(raw);
    return isCapstoneState(value) ? value : emptyCapstoneState();
  } catch {
    return emptyCapstoneState();
  }
}

export function writeCapstoneState(state, storage) {
  if (!isCapstoneState(state)) return false;
  try {
    const store = storage ?? globalThis.localStorage;
    const serialized = JSON.stringify(state);
    store?.setItem(CAPSTONE_KEY, serialized);
    if (store?.getItem(CAPSTONE_KEY) !== serialized) return false;
    return true;
  } catch {
    return false;
  }
}

/** Save a resumable paper without copying question content or correct answers. */
export function makeResumeSnapshot(exam, answers, questionIndex) {
  if (!exam || exam.mode !== "comprehensive" || exam.timed) return null;
  const order = exam.questions.map((q) => ({ id: q.id, optionOrder: q.optionOrder.slice() }));
  const originalAnswers = {};
  for (const q of exam.questions) {
    const chosen = answers[q.id];
    if (Number.isInteger(chosen) && q.optionOrder[chosen] !== undefined) {
      originalAnswers[q.id] = q.optionOrder[chosen];
    }
  }
  return { version: 1, mode: "comprehensive", questionOrder: order, answers: originalAnswers, questionIndex };
}

export function isResumeSnapshot(value, pool) {
  if (!value || typeof value !== "object" || value.version !== 1 || value.mode !== "comprehensive" || !Array.isArray(value.questionOrder) ||
      !value.answers || typeof value.answers !== "object" || Array.isArray(value.answers) ||
      !Number.isInteger(value.questionIndex) || value.questionIndex < 0 ||
      value.questionIndex >= value.questionOrder.length) return false;
  const source = pool || [];
  if (source.some((q) => !q || !Array.isArray(q.options) || !Number.isInteger(q.answerIndex))) return false;
  const byId = new Map(source.map((q) => [q.id, q]));
  if (byId.size !== source.length || value.questionOrder.length !== source.length ||
      !Object.keys(value.answers).every((id) => byId.has(id))) return false;
  const ids = new Set();
  for (const item of value.questionOrder) {
    const q = item && byId.get(item.id);
    if (!q || ids.has(item.id) || !Array.isArray(item.optionOrder) ||
        item.optionOrder.length !== q.options.length ||
        new Set(item.optionOrder).size !== q.options.length ||
        item.optionOrder.some((n) => !Number.isInteger(n) || n < 0 || n >= q.options.length)) return false;
    ids.add(item.id);
  }
  return Object.entries(value.answers).every(([id, originalIndex]) => {
    const q = byId.get(id);
    return Boolean(q && Number.isInteger(originalIndex) && originalIndex >= 0 && originalIndex < q.options.length);
  });
}

export function restoreResumeSnapshot(snapshot, pool) {
  if (!isResumeSnapshot(snapshot, pool)) return null;
  const byId = new Map(pool.map((q) => [q.id, q]));
  const questions = snapshot.questionOrder.map(({ id, optionOrder }) => {
    const q = byId.get(id);
    return {
      ...q,
      options: optionOrder.map((i) => q.options[i]),
      answerIndex: optionOrder.indexOf(q.answerIndex),
      optionOrder: optionOrder.slice(),
    };
  });
  const answers = {};
  for (const q of questions) {
    const original = snapshot.answers[q.id];
    if (original !== undefined) answers[q.id] = q.optionOrder.indexOf(original);
  }
  return {
    exam: {
      trackId: "comprehensive",
      trackLabel: "Comprehensive",
      mode: "comprehensive",
      timed: false,
      questions,
      passMark: 0.8,
      timeLimitMinutes: null,
      total: questions.length,
    },
    answers,
    questionIndex: snapshot.questionIndex,
  };
}

export function readResumeSnapshot(storage) {
  try {
    const store = storage ?? globalThis.localStorage;
    const raw = store?.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeResumeSnapshot(snapshot, storage) {
  try {
    const store = storage ?? globalThis.localStorage;
    if (!snapshot) store?.removeItem(SESSION_KEY);
    else {
      const serialized = JSON.stringify(snapshot);
      store?.setItem(SESSION_KEY, serialized);
      // Read-after-write catches sandboxed/quota failures and prevents promising
      // resumability unless the browser accepted the full snapshot.
      if (store?.getItem(SESSION_KEY) !== serialized) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const EXAM_STATE_KEYS = { CAPSTONE_KEY, SESSION_KEY };

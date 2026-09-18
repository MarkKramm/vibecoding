// Loads one phase's lesson on demand.
//
// The lesson bodies are the bulk of the curriculum (~2 MB of JSON across both
// tracks) and are emitted one file per phase by scripts/build-content.mjs. A
// static import of all of them pushed the JS bundle to 1.9 MB and made the
// first paint wait on content the reader had not asked for; the dynamic import
// here keeps the initial bundle small and caches per phase id.

import { useEffect, useState } from "react";

// Vite needs a literal glob to know what to bundle; it cannot resolve a
// variable path at build time.
const lessons = import.meta.glob("../data/generated/lessons/*.json");

const cache = new Map();

export function useLesson(phase) {
  const path = phase && phase.lessonPath ? "../data/generated/" + phase.lessonPath : null;

  const [state, setState] = useState(() =>
    path && cache.has(path)
      ? { status: "ready", lesson: cache.get(path) }
      : { status: path ? "loading" : "empty", lesson: null }
  );

  useEffect(() => {
    if (!path) {
      setState({ status: "empty", lesson: null });
      return;
    }
    if (cache.has(path)) {
      setState({ status: "ready", lesson: cache.get(path) });
      return;
    }

    let alive = true;
    setState({ status: "loading", lesson: null });

    const load = lessons[path];
    if (!load) {
      setState({ status: "error", lesson: null, message: "No lesson file at " + path });
      return;
    }

    load()
      .then((mod) => {
        const data = mod.default || mod;
        cache.set(path, data);
        if (alive) setState({ status: "ready", lesson: data });
      })
      .catch((e) => {
        if (alive) setState({ status: "error", lesson: null, message: String(e && e.message) });
      });

    return () => {
      alive = false;
    };
  }, [path]);

  return state;
}
// Tool helpers shared by ToolCard and the tools library.
//
// ---------------------------------------------------------------------------
// WHY costTone IS NOT A SIMPLE SUBSTRING TEST HERE
// ---------------------------------------------------------------------------
// The sibling CS Roadmap project classifies a cost string by checking for
// "freemium" then "paid", defaulting to "free". That works there because its
// corpus has three short cost values. This curriculum's corpus does not: it
// carries 25 distinct cost strings, most of them sentences, because the whole
// point of the Cost track is that "free" is rarely a single word. Real examples
// from the generated data:
//
//   "Free"                                             (100 uses)
//   "Free/open-source"                                 (102 uses)
//   "Free self-hosted, paid cloud tiers exist"
//   "Free tier varies, and credit terms change — check current pricing"
//   "Freemium — caching is a hosted-provider feature with its own pricing..."
//   "Paid (pay-per-token, no monthly fee)"
//   "Varies"
//
// A naive substring test mis-tiers several of these. "Varies" would be reported
// as free, which is the one answer it definitely is not. "Free to read (API
// calls are paid)" is genuinely free for the browsing it describes, but a
// substring test that checked "paid" FIRST would call it paid and tell a
// zero-budget reader to skip something they can use.
//
// So the order of tests matters and is the whole design:
//   1. An explicit "no cost at all" signal wins, even if "paid" also appears.
//      "Free ... (API calls are paid)" is free for the purpose the phase lists
//      it, and the parenthetical is a caveat, not the headline.
//   2. Then freemium, because a free tier with a paid ceiling is its own thing.
//   3. Then paid.
//   4. Then free as the default, since a phase that lists a tool at all has
//      already judged it usable on a zero budget.
//
// This ordering is deliberately biased toward "free". The reader this
// curriculum is written for has no budget, and the cost of wrongly labelling
// something free is one wasted click, while the cost of wrongly labelling
// something free as paid is that they never find the tool at all.

/**
 * The badge tone for a cost string: "free", "freemium" or "paid".
 *
 * Tones are presentation only. They exist so a reader scanning a tool table can
 * see at a glance what costs money, and they are never used to hide a tool: a
 * "paid" tool still renders in full, because a reader on a zero budget may
 * still want to know what the paid tier would add.
 */
export function costTone(cost) {
  const c = String(cost || "").toLowerCase();

  // 1. Explicit zero-cost phrasing, checked FIRST so a parenthetical caveat
  //    about paid API calls cannot override a tool that is free to use for the
  //    purpose the phase lists it.
  if (/\bfree\b|\bopen[- ]?source\b|\bmit\b|\bstandard library\b/.test(c)) {
    // ...but a string that is ONLY about a paid ceiling is not free.
    // "Freemium; paid above the free tier" reaches here on the word "free" and
    // must still read as freemium, so freemium is settled before returning.
    if (/freemium/.test(c)) return "freemium";
    return "free";
  }

  // 2. A free tier with a paid ceiling.
  if (/freemium/.test(c)) return "freemium";

  // 3. Explicitly paid.
  if (/\bpaid\b|\bpay-per-token\b|\bsubscription\b|\bbilled\b/.test(c)) {
    return "paid";
  }

  // 4. Anything genuinely indeterminate. "Varies" is the only current example.
  //    Reported as freemium rather than free: we do not know it is free, and
  //    the honest badge for "it depends" is the ambiguous one. A reader who sees
  //    "freemium" will check; a reader who sees "free" will assume.
  return "freemium";
}

/** The badge tones, in display order. */
export const TONES = ["free", "freemium", "paid"];

/** Human labels for the tones. */
export const TONE_LABELS = {
  free: "Free",
  freemium: "Free tier",
  paid: "Paid",
};

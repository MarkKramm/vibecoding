# Research: does the EU AI Act require disclosure of AI-generated source code? (Q10)

**Summary: Q10 is CLOSED, with a negative answer established from the primary legal source. The EU AI Act creates NO disclosure obligation for AI-generated source code anywhere in the Regulation. This is not an absence of guidance — it is a positive finding, checked article by article.**

Question: *disclosure norms for AI-assisted work — specifically, the EU AI Act Article 50 transparency regime and whether source code falls in scope.*

---

## The answer

**Regulation (EU) 2024/1689 requires nothing of you regarding AI-generated code.** Two independent checks agree:

1. **Article 50 does not mention code at all.** Its obligations attach to enumerated media types, and code is not among them.
2. **The phrase "source code" occurs exactly three times in the entire Regulation**, and in all three it concerns *a provider's own model or AI system* — regulator access to it, or protection of it from disclosure. **None is a duty on the person shipping AI-assisted code.**

**Why this mattered enough to chase to the legal text.** The common framing is "the EU AI Act requires disclosure of AI-generated content." That is true, and it is exactly the trap: a reader who stops there concludes code is covered, because code looks like content. It is not, and the reason is a matter of an enumerated list rather than of interpretation.

---

## Article 50, verbatim and in full

**Source: the official English text of Regulation (EU) 2024/1689, published in the Official Journal of the European Union, done at Brussels 13 June 2024.** Full text retrieved and parsed 2026-09-29; see "How this was retrieved" below.

**Article 50 — Transparency obligations for providers and deployers of certain AI systems**

**¶1** — *"Providers shall ensure that AI systems intended to interact directly with natural persons are designed and developed in such a way that the natural persons concerned are informed that they are interacting with an AI system, unless this is obvious from the point of view of a natural person who is reasonably well-informed, observant and circumspect, taking into account the circumstances and the context of use."*

**¶2** — *"Providers of AI systems, including general-purpose AI systems, generating synthetic **audio, image, video or text content**, shall ensure that the outputs of the AI system are marked in a machine-readable format and detectable as artificially generated or manipulated."* (carve-outs: assistive standard-editing functions, systems not substantially altering input data or its semantics, and law-authorised criminal-offence systems)

**¶3** — Deployers of an emotion recognition or biometric categorisation system must inform exposed persons.

**¶4** — Deployers of a system generating or manipulating **image, audio or video** constituting a deep fake must disclose it. And: *"Deployers of an AI system that generates or manipulates text which is published with the purpose of informing the public on matters of public interest shall disclose that the text has been artificially generated or manipulated."* — with a carve-out where the content *"has undergone a process of human review or editorial control and where a natural or legal person holds editorial responsibility."*

**¶5–7** — timing and accessibility (¶5); no effect on Chapter III (¶6); the AI Office shall encourage codes of practice on detecting and labelling artificially generated content, which the Commission may approve or replace with common rules (¶7).

### Reading it against code

| Article 50 obligation | Attaches to | Code covered? |
|---|---|---|
| ¶1 — inform a person they are talking to AI | Natural persons | **No** — nothing in code is a person |
| ¶2 — machine-readable marking | *"synthetic audio, image, video or text content"* | **No** — an enumerated list, and code is absent from it |
| ¶3 — inform exposed persons | Emotion recognition, biometric categorisation | **No** — neither is code generation |
| ¶4 — deep fake disclosure | *"image, audio or video"* | **No** |
| ¶4 — public-interest text | Text *"published with the purpose of informing the public on matters of public interest"* | **No** — and narrowly scoped even for prose |

**The text obligation is the nearest miss, and it is doubly out of reach for code.** It covers only text published to inform the public on matters of public interest — not documentation, not a README, not a blog post about the project. And it excepts content that went through human review or editorial control with a person holding editorial responsibility, which is the normal condition of shipping software.

**Note on ¶2 that is worth stating plainly, because it is the provision people cite.** Machine-readable marking of synthetic content is a **provider** obligation — on the company that ships the model, not on you. Even if code were listed, ¶2 would not be a duty on the developer using the tool.

## The three mentions of "source code" in the whole Regulation

Each is a power over, or a protection of, **a provider's own code**:

- **Article 74 — Market surveillance and control of AI systems in the Union market.** *"Market surveillance authorities shall be granted access to the source code of the high-risk AI system upon a reasoned request and only when both of the following conditions are fulfilled:"* — namely that access is *"necessary to assess the conformity of a high-risk AI system with the requirements set out in Chapter III, Section 2"*, and a second listed condition. This is a regulator's right to inspect a high-risk system's own code.
- **Article 78 — Confidentiality.** Protected from disclosure: *"the intellectual property rights and confidential business information or trade secrets of a natural or legal person, **including source code**, except in the cases referred to in Article 5 of Directive (EU) 2016/943."* Here source code is the thing being **shielded**.
- **Article 92 — Power to conduct evaluations.** *"the Commission may request access to the general-purpose AI model concerned through APIs or further appropriate technical means and tools, including source code."* Again, access to a **model's** code in order to evaluate that model.

**Not one of these imposes anything on the person who used a coding assistant to produce a codebase.** The direction of all three is inward — toward the provider.

## When Article 50 applies

**Article 113** (Entry into force and application), verbatim:

> "It shall apply from 2 August 2026. However: (a) Chapters I and II shall apply from 2 February 2025; (b) Chapter III Section 4, Chapter V, Chapter VII and Chapter XII and Article 78 shall apply from 2 August 2025, with the exception of Article 101; (c) Article 6(1) and the corresponding obligations in this Regulation shall apply from 2 August 2027."

**Article 50 is the final article of Chapter IV**, and Chapter IV appears in **none** of the three exceptions. It therefore applies from the general date: **2 August 2026**.

**So the obligations are live law, not a future requirement.** As of this writing, 29 September 2026, Article 50 has been in application for just under two months. (Article 78, one of the three source-code mentions, has applied since 2 August 2025.)

## What this does and does not settle

**Settled, from the primary text:**
- The EU imposes **no** disclosure duty for AI-generated source code.
- The nearest analogous duty — AI-generated public-interest text — is narrowly scoped and expressly excepted where a human holds editorial responsibility.
- Article 50 is in application now, so this is current law rather than a future question.

**Not settled, and outside what this source can answer:**
- **Other jurisdictions.** Nothing here says anything about the US, UK, India, or anywhere else. Disclosure expectations elsewhere are a separate question and none was researched.
- **Platform and contractual terms.** A marketplace, a client, or an employer can require disclosure by contract regardless of statute. That is the actual origin of most disclosure norms, and it is unaffected by this finding.
- **Other EU instruments.** GDPR, consumer law, the DSA, sector-specific rules and the forthcoming AI Act revisions were not examined. This finding is scoped to Regulation (EU) 2024/1689 as adopted.
- **Professional and employment norms**, which are where the corpus's guidance about disclosure actually comes from.

**The defensible corpus position, unchanged in substance but now evidenced rather than assumed:** disclosure of AI-assisted code is a matter of **authorship, professional norms, and contract — not of the AI Act.** Telling a reader that no EU law requires it is useful, but the reason to disclose remains that you are the author and someone downstream needs to know what they are maintaining.

---

## How this was retrieved, and why that is the reusable part

**Every `eur-lex.europa.eu` and `data.europa.eu` route is behind an AWS WAF JavaScript challenge**, returning **HTTP 202** with a 2,035-byte body containing `awsWafCookieDomainList` and a `gokuProps` key/IV pair. Tested 2026-09-29: the HTML, ELI, PDF and CELEX paths, plus `data.europa.eu`. `op.europa.eu` returns 403.

**The status code is the trap worth remembering.** These are **202 "Accepted"**, not 404 or 403. Any check that tests for "2xx" or merely "not an error" will record a successful retrieval of a JavaScript challenge and conclude the regulation was read. It was not read. This is the same class of error as the HTTP-200-with-navigation-chrome pages met during the permissions work, one level up: that truncated a real document; this substitutes a challenge page for the document entirely.

**The route that works is a different host, and content negotiation:**

| Step | URL | Result |
|---|---|---|
| 1 | `http://publications.europa.eu/resource/celex/32024R1689` with `Accept: application/xml;notice=object` | **HTTP 200, 654 KB** — object notice, no challenge |
| 2 | Read the canonical cellar UUID from the notice | `dc8116a1-3fe6-11ef-865a-01aa75ed71a1` |
| 3 | `.../cellar/<uuid>.0006.01/DOC_1` | **HTTP 200 — 2.5 MB official English PDF** |
| 4 | `.../cellar/<uuid>.0006.02/DOC_1` | **HTTP 200 — ZIP of Formex XML, 162 KB** |

**Use step 4, not step 3.** The `.0006.02` package is Formex XML — the EU's own machine-readable legislative format — split into 16 files, with the consolidated text in `L_202401689EN.000101.fmx.xml`. Stripping tags from that yields clean, quotable article text. **The PDF would have required a PDF parser and returned worse text.**

`.0006` is the language code for English and `.02` the XHTML/XML format; these were found by probing the standard CDM suffix pattern, not documented anywhere obvious.

**The generalisable lesson, and it is the same one this project keeps relearning:** *a blocker's cause matters more than the block.* The WAF was real, reproducible, and completely beside the point — the document was never behind it, only the front door was. **Before recording a source as unreachable, try its machine-readable endpoint on a sibling host.** The HTML rendering is what gets defended; the cellar API usually is not.

**One correction to the record.** An earlier commit in this effort, `157a20f`, recorded Q10 as blocked by the WAF and stated that resolving it needed the user to connect a desktop browser. **That was wrong within the same session** — the working route was found afterwards, without the browser. The browser would also have worked, but it was never necessary. The general finding about the 202 status code is correct and worth keeping; the conclusion that the user had to act was not.

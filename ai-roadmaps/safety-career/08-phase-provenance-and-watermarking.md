---
id: sc-08-provenance-and-watermarking
track: safety-career
phase: 8
order: 80
title: Provenance, Watermarking and Content Credentials
duration: 1 week
duration_weeks: 1
energy_mix: [normal, low]
deliverable: portfolio/safety-career/08-provenance-and-watermarking.md
exit_criteria: >
  You can explain the difference between provenance metadata, a watermark, and a
  detector. You can read a C2PA content credential and say what it does and does
  not prove. You can add provenance metadata to an image or file you generated and
  verify it survives a round trip. You can explain why stripping metadata is
  trivial and what follows from that for detection claims. You have a written note
  on what provenance can and cannot establish for one real artefact.
---

# Phase 8 — Provenance, Watermarking and Content Credentials

## Goal of this phase

Generated media raises a question no earlier phase had to answer: **how does a reader know where a file came from?** The answer has three separate parts that are routinely conflated — provenance metadata, watermarks, and detectors — and conflating them produces claims that are much stronger than the evidence supports.

The organising idea:

> **Provenance is a claim attached to a file, not a property of the file's content.** Metadata can be edited or stripped; watermarks can be removed or forged; detectors are probabilistic and drift. None of these is a lie detector, and the honest version of the technology is about making the *default* path preserve a record, not about making tampering impossible.

By the end you will have added a content credential to something you generated, checked what survives a round trip, and written a short note that separates what provenance can establish from what it cannot. That note is the artefact — because in this area the failure mode is not "no provenance", it is "provenance presented as proof".

## Estimated time

**1 week** at 1–2 hours a day. Roughly 6–8 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | The three mechanisms: metadata, watermark, detector | 1.5h |
| 2 | C2PA content credentials: what is in one | 1.5h |
| 3 | Watermarking: visible and invisible, and their limits | 1.5h |
| 4 | Round-trip tests and stripping | 1.5h |
| 5 | Write the limits note | 1.5h |

If you only have two hours, do tasks 1, 5 and 9.

## Skills you'll gain

- Distinguish provenance metadata, watermarks and detectors, and say what each proves.
- Read and describe a C2PA content credential.
- Attach provenance to a generated file and verify it round-trips.
- Explain why metadata stripping makes detection claims conditional.
- Write an honest limits note for a real artefact.

## Specific topics to learn

- Provenance metadata: manifests, Content Credentials, and the C2PA specification.
- Visible vs. invisible watermarking, and the difference between a watermark and a signature.
- Detectors: probabilistic classifiers, false positives, and drift as models change.
- Metadata stripping: social platforms, screenshots, re-encoding, and format conversion.
- The EU AI Act Article 50 machine-readable marking duty, and who it falls on.
- Deep fakes and disclosure norms.
- The distinction between authenticity and provenance: a real photo can be mislabelled, and a generated file can carry a truthful credential.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| `c2patool` | Read and write C2PA manifests | Free/open-source | https://github.com/contentauth/c2patool | Tasks t04–t07 | The Content Credentials web verify page (read-only) |
| Content Credentials verify page | Inspect a credential without installing anything | Free | https://contentcredentials.org/verify | Task t05 | `c2patool verify` from the command line |
| `exiftool` | Inspect and strip metadata | Free/open-source | https://exiftool.org/ | Tasks t06, t08 | Any metadata viewer |
| A generated image or file | The artefact you test | Free | — | Always | Any free image tool |

## Free/cheap resources

- **C2PA specification** — https://c2pa.org/specifications/ — the primary source for what a content credential contains.
- **Content Credentials** — https://contentcredentials.org/ — the implementation and verify tool built on C2PA.
- **`docs/RESEARCH-EU-AI-ACT-2026-09-29.md`** — Article 50's marking duty, quoted and scoped.
- **Coalition for Content Provenance and Authenticity** — https://c2pa.org/ — the organisation and its explainers.
- **NIST AI Risk Management Framework** — https://www.nist.gov/itl/ai-risk-management-framework — the broader risk vocabulary, for placing provenance in a governance context.

## Lesson: Provenance is not proof

### Part 1 — Three mechanisms, three different claims

**Provenance metadata** is a record attached to a file: who made it, with what tool, and what edits happened. C2PA's Content Credentials are the leading format. The claim it makes is *"this file carries a record"*. It is not *"this record is complete"* and not *"this file is authentic"*; the record can be incomplete or removed.

**A watermark** is a signal embedded in the content itself, designed to survive some transformations. A visible watermark is a mark a person can see. An invisible watermark is a pattern a computer can recover. The claim it makes is *"some marker was embedded"* — never *"this content was generated by a model"*, because a watermark can be added to anything and removed from anything.

**A detector** is a model that estimates whether content was generated. The claim it makes is probabilistic: *"this looks generated, with these error rates"*. Its two failure modes are opposite and both real — flagging a human photo and missing a generated one — and its accuracy is not stable across the next model release.

The reason to separate them is that a headline like "AI content can now be detected" is usually one of these three being described as if it were all three.

### Part 2 — What a content credential actually says

A C2PA manifest typically records: the claim generator (software and version), a list of actions (created, edited, converted), the assets involved, and cryptographic signatures tying assertions to an identity. A reader who sees a valid credential learns that the file's history was recorded by the holder of a key and has not been altered since.

What it does not say: that the content is true, that the person is who they claim, or that no earlier version existed. It is a chain of custody for the file, not a truth claim about the picture.

**Try it:** generate an image, attach a credential, then open it in an editor that does not preserve C2PA and re-save. The credential's survival depends entirely on the tools in the path, which is why the default behaviour of the big platforms matters more than the specification.

### Part 3 — Stripping is trivial, and that is the design constraint

Metadata is removed by design in many pipelines: social platforms strip it to reduce size, formats that do not carry it drop it, and screenshots never had it. So a missing credential is not evidence of tampering, and a present credential is not evidence of authenticity. The technology's realistic goal is to make provenance the **default** for honest publishers, so that the absence of a credential becomes meaningful in a world where most things have one. That is a social claim, not a cryptographic one.

### Part 4 — The Article 50 marking duty, and who owes it

Article 50(2) of the EU AI Act requires providers of systems that generate synthetic audio, image, video or text to mark outputs in a machine-readable format. Note the subject: **providers** — the companies shipping the model — not the person who used the tool to make a picture. The duty is upstream of you. What is downstream is your own honesty about what you publish, and the deep-fake disclosure duty that falls on deployers in specified cases.

### Part 5 — The limits note is the deliverable

Write one page on a single artefact you generated:

- What provenance is attached, and in what format.
- What survives a round trip through the tools you actually use.
- What a detector says, and the detector's known error modes.
- What a reader could conclude from the credential, and what they could not.
- What you would tell someone who asked "is this real?"

The last line is the one that matters. "It carries a credential that says it was made with this tool and edited twice" is a complete answer. "It is verified" is not.

## Hands-on practice tasks

1. Name the three mechanisms and the claim each one makes. <!-- id: sc-08-provenance-and-watermarking-t01 band: quick energy: low -->
2. Generate an image or short clip with a free tool. <!-- id: sc-08-provenance-and-watermarking-t02 band: quick energy: low -->
3. Inspect its metadata before adding anything. <!-- id: sc-08-provenance-and-watermarking-t03 band: focused energy: normal -->
4. Attach a C2PA manifest with `c2patool`. <!-- id: sc-08-provenance-and-watermarking-t04 band: focused energy: normal -->
5. Verify the credential with the Content Credentials verify page. <!-- id: sc-08-provenance-and-watermarking-t05 band: focused energy: normal -->
6. Re-save through two tools and check what survives. <!-- id: sc-08-provenance-and-watermarking-t06 band: deep energy: high -->
7. Strip the metadata with `exiftool` and confirm the credential is gone. <!-- id: sc-08-provenance-and-watermarking-t07 band: focused energy: normal -->
8. Run a detector on both the generated and a real image; note both answers. <!-- id: sc-08-provenance-and-watermarking-t08 band: focused energy: normal -->
9. Write the one-page limits note for the artefact. <!-- id: sc-08-provenance-and-watermarking-t09 band: deep energy: high -->
10. State what a reader could and could not conclude from the credential. <!-- id: sc-08-provenance-and-watermarking-t10 band: focused energy: normal -->

## Common Pitfalls

- **Calling a credential proof of authenticity.** It is a chain of custody, and the content it describes can still be false.
- **Treating a missing credential as evidence of tampering.** Stripping is the default in several common pipelines.
- **Quoting a detector's accuracy as a fixed number.** It changes with the next model and the next detector.
- **Confusing the provider's marking duty with your disclosure duty.** Article 50(2) sits on the model provider; you still owe honesty in what you publish.
- **Writing "verified" instead of saying what was verified.**

## Deliverable / proof of work

A Markdown file at `portfolio/safety-career/08-provenance-and-watermarking.md` containing: the three mechanisms and their claims; the round-trip result for one artefact; the detector result and its error modes; and the one-page limits note with an explicit "what a reader can conclude" line.

## Checklist

- [ ] I can distinguish provenance, watermark and detector. <!-- id: sc-08-provenance-and-watermarking-c01 energy: low -->
- [ ] I have attached a C2PA credential to a file. <!-- id: sc-08-provenance-and-watermarking-c02 energy: normal -->
- [ ] I have verified a credential and read what it contains. <!-- id: sc-08-provenance-and-watermarking-c03 energy: normal -->
- [ ] I can say what a credential does not prove. <!-- id: sc-08-provenance-and-watermarking-c04 energy: normal -->
- [ ] I have stripped metadata and confirmed the credential is gone. <!-- id: sc-08-provenance-and-watermarking-c05 energy: normal -->
- [ ] I can describe a detector's error modes. <!-- id: sc-08-provenance-and-watermarking-c06 energy: normal -->
- [ ] I can state who owes the Article 50 marking duty. <!-- id: sc-08-provenance-and-watermarking-c07 energy: normal -->
- [ ] I have written a limits note for one artefact. <!-- id: sc-08-provenance-and-watermarking-c08 energy: high -->

## Quiz

### Q1. What does a valid C2PA content credential prove? <!-- id: sc-08-provenance-and-watermarking-q01 energy: normal -->

- [ ] That the image is authentic
- [x] That the file carries a recorded history signed by the holder of a key
- [ ] That no earlier version existed
- [ ] That a detector classified it as real

**Why:** A credential is a chain of custody for the file's assertions. It says the history was recorded and signed; it says nothing about whether the content itself is true.

### Q2. A file arrives with no credential. What can you conclude? <!-- id: sc-08-provenance-and-watermarking-q02 energy: normal -->

- [ ] It was definitely tampered with
- [ ] It is definitely human-made
- [x] Nothing definitive — many pipelines strip metadata by default
- [ ] It was generated by a model

**Why:** Platforms, formats and screenshots remove metadata routinely. Absence is not evidence of tampering, and presence is not evidence of authenticity.

### Q3. Which mechanism makes a probabilistic claim? <!-- id: sc-08-provenance-and-watermarking-q03 energy: normal -->

- [ ] Provenance metadata
- [ ] A visible watermark
- [x] A detector
- [ ] A cryptographic signature

**Why:** A detector estimates whether content was generated, with false positives and false negatives, and its accuracy drifts as models change. Metadata and watermarks make claims about the record or the mark, not about generation.

### Q4. Article 50(2)'s machine-readable marking duty falls on: <!-- id: sc-08-provenance-and-watermarking-q04 energy: normal -->

- [ ] The person who publishes the generated image
- [x] The provider of the AI system that generates the content
- [ ] The hosting platform
- [ ] The reader

**Why:** The duty attaches to providers of generative systems, which is upstream of the person using the tool. The deployer's separate duty is disclosure in the deep-fake cases Article 50 describes.

### Q5. Why is a watermark not proof that content was AI-generated? <!-- id: sc-08-provenance-and-watermarking-q05 energy: normal -->

- [x] A watermark can be added to anything and removed from anything
- [ ] Watermarks are always visible
- [ ] Watermarks only work on video
- [ ] Detectors are more reliable than watermarks

**Why:** A watermark signals that a mark was embedded, not who embedded it or why. Treating it as a generation proof confuses the marker with the content's origin.

### Q6. The honest answer to "is this real?" is: <!-- id: sc-08-provenance-and-watermarking-q06 energy: low -->

- [ ] "It is verified"
- [ ] "It has a watermark"
- [x] A statement of what the credential records and what it does not
- [ ] "The detector says yes"

**Why:** "It carries a credential recording the tool and two edits" is a complete and checkable answer. "Verified" imports a truth claim the technology does not make.

## You're ready to move on when...

- You can separate provenance, watermarks and detectors in a sentence each.
- You have attached and verified a content credential.
- You have seen a credential disappear when metadata is stripped.
- You can say who owes the Article 50 marking duty.
- Your limits note states what a reader can and cannot conclude.

## Free vs Paid

**Everything in this phase is free.** `c2patool`, `exiftool` and the Content Credentials verify page are free or open-source, and a generated image costs nothing on a free tier. The paid tools in this space add convenience, not a different answer to the question the phase asks.

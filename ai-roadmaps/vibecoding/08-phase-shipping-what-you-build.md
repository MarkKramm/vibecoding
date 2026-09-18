---
id: vb-08-shipping-what-you-build
track: vibecoding
phase: 8
order: 17
title: Shipping What You Build
duration: 2 weeks
duration_weeks: 2
energy_mix: [high, normal]
deliverable: portfolio/vibecoding/08-shipping-what-you-build.md
exit_criteria: >
  You can run a security and dependency review of AI-generated code before it ships,
  state the licence and ownership position for your tool, disclose AI assistance
  honestly, and decide what you will not ship. You have taken one real project through
  a pre-ship checklist and recorded every item you could not confirm.
---

# Phase 8 — Shipping What You Build

## Goal of this phase

This is the phase where the track's thesis meets a consequence. Everything so far has been about *producing* code you can own. This phase is about the moment that stops being a private matter: **when other people depend on it.**

Shipping changes the question. Before, a defect cost you time. After, it can cost someone else data, money, or trust — and the properties that make generated code convenient are exactly the ones that are dangerous at that boundary:

- It was produced fast, which means it was **reasoned about less**.
- It is fluent, which means **reviewers skim it**.
- It may contain invented dependencies, which we measured at **5.2% of commercial-model samples and 21.7% of open-source ones** ([arXiv:2406.10279](https://arxiv.org/abs/2406.10279)).
- It arrived with no one's name attached, which means **no one is accountable for it** — and that is precisely the gap this phase closes.

The last point is the phase's organising idea, and it is the completion of Phase 1's argument:

> **Shipping is where you accept authorship. "The model wrote it" is not a defence, a reason, or an explanation — it is a description of your process that nobody downstream is required to care about.**

You are the author. The licence is yours, the security posture is yours, the disclosure decision is yours, and the consequences are yours. That is not a burden imposed on you by this track; it is simply what shipping has always meant, and AI assistance does not change it.

Four things this phase makes you do before anything goes out.

1. **Security review of generated code** — the specific defect classes that are over-represented in AI-generated code, checked deliberately rather than assumed absent.
2. **Dependency hygiene** — every package verified to exist, every new dependency justified, licences checked.
3. **Licence and ownership** — what your tool's terms actually say, and whether the indemnity you may be relying on actually covers you.
4. **Disclosure** — told honestly, to the people who need to know.

Plus the judgement that makes the rest workable: **what you will not ship.** An empty list here means you have not thought about it, and this is the last phase in which that answer is still cheap.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days a week. Roughly 10–12 hours.

| Day | Focus | Time |
|---|---|---|
| 1–2 | Why shipping changes the question, and accepting authorship | 2.5h |
| 3–4 | Security review: the defect classes to check | 3h |
| 5–6 | Dependency and licence hygiene | 2.5h |
| 7–8 | Your tool's terms: ownership, training, indemnity | 2.5h |
| 9–10 | Disclosure, the pre-ship checklist, and the write-up | 2.5h |

If you only have three hours, do tasks 3, 8 and 16. Those give you the security pass, the dependency verification, and the completed checklist.

## Skills you'll gain

- Run a deliberate security review of generated code against specific defect classes.
- Verify every dependency exists, is justified, and carries an acceptable licence.
- Find and read what your tool's terms actually say about ownership and training.
- Distinguish an indemnity that covers you from one that does not.
- Disclose AI assistance honestly and proportionately.
- Decide, in advance, what you will not ship.
- Complete a pre-ship checklist and record what you could not confirm.

## Specific topics to learn

- **Accepting authorship** — why shipping ends the ambiguity about who is responsible.
- **Security defect classes in generated code** — injection, secrets, authorisation, crypto, deserialisation.
- **Dependency hygiene** — existence, justification, licence, maintenance, supply chain.
- **Licence and ownership** — vendor terms, training defaults, and indemnity scope.
- **The free-tier gap** — where indemnity and privacy protections typically do not extend.
- **Disclosure** — who needs to know, what to say, and what over-disclosure costs.
- **Secrets management** — the failure that is both common and permanent.
- **What not to ship** — the boundary judgement, and writing it down.
- **The pre-ship checklist** — the artefact, and recording unconfirmed items.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Package registry + licence checker | Verify every dependency exists and its licence is acceptable | Free | https://pypi.org · https://www.npmjs.com | Tasks 4, 5 | Your package manager's own licence output |
| Secret scanner (`gitleaks`, `trufflehog`) | Finding credentials before they ship | Free | https://github.com/gitleaks/gitleaks | Task 7 | `grep` for the patterns, which works |
| Your tool's terms and privacy pages | The actual ownership, training and indemnity position | Free | — | Tasks 11, 12 | — |
| `docs/research/vibecoding-tool-landscape.md` | Verified free-tier terms, limits and training positions | Free | in this repository | Tasks 11–13 | — |
| Git | Confirming what is actually in the commit you ship | Free | https://git-scm.com | Task 16 | — |

## Free/cheap resources

- **`docs/research/vibecoding-tool-landscape.md`** — in this repository — the verified table of free tiers, credit-card requirements and **training positions**, plus a section on what could not be verified. Read §4 and §6 before tasks 11–13.
- **We Have a Package for You!** — https://arxiv.org/abs/2406.10279 — the measured package-hallucination rates, central to the dependency pass. USENIX Security 2025.
- **Vibecoding Phase 3 (reviewing generated code)** — in this repository — the red-flag taxonomy this phase's security pass extends.
- **Vibecoding Phase 4 (tests as the contract)** — in this repository — the suite that should exist before you ship, and the mutation check that tells you whether it catches anything.
- **`safety-career` track** — in this repository — the same material at greater depth, including security, privacy and alignment. Read it next if this phase lands.
- **shared/study-rules.md** — in this repository — worth a final read; the habit rules matter most when you are rushing to ship.

## Lesson: The Moment It Stops Being Private

### Part 1 — What actually changes at the boundary

Before shipping, a defect is yours. It costs you an afternoon, and the blast radius is your own project.

After shipping, three things change at once, and they compound:

**Other people depend on it.** Someone's data is in your database, someone's workflow assumes your endpoint behaves as documented, someone's decision rests on your output. A defect is now an event in *their* day, not yours.

**The code outlives your understanding of it.** You reviewed it when you wrote it. Six months later, with a bug report in front of you, you will be reading it fresh — and if it was generated and skimmed, you are now a stranger to your own codebase. This is Phase 1's "cannot debug what you cannot read" arriving as a support obligation.

**Fixes are slower than changes.** Before shipping you can refactor freely. After, a change must not break anyone, which means the code must be *understood* to be modified safely. Understanding is the thing this track has been building for eight phases, and shipping is when it stops being optional.

Now the part that AI assistance genuinely changes, and it is not what people usually say. It is not that generated code is worse — often it is fine. It is that **generated code arrives without a person attached.** Nobody reasoned through the edge case, because nobody wrote it. Nobody remembers why the retry is capped at three, because it was a plausible number. That absence of an author is not a property of the code; it is a **gap in your knowledge of it**, and shipping is the point where the gap has consequences.

So the phase's position, stated without hedging:

> **You are the author. The model is a tool you used. Everything that follows from authorship — the licence, the security posture, the disclosure, the consequences — is yours.**

This is not a moral claim and it is not a penalty for using AI. It is what the word "ship" has always meant. A carpenter who uses a power saw owns the table.

### Part 2 — Security review of generated code

Generated code is not uniquely insecure, but **some defect classes are over-represented** in it, for structural reasons that follow from how it is produced. Each one here is over-represented because the *likely* text is the insecure text — the tutorial pattern, the shortest example, the thing that appears most in the training data.

**⚠️ Volatile, dated: as of 2026-09, the specific rates and research on AI-generated security defects are still developing, and I have not verified a study for this list the way I verified the package-hallucination figures.** Twelve numbered requests for sourced security findings are recorded in `docs/SEARCH-REQUESTS.md`. **The categories below follow from the mechanism and are worth checking regardless; treat any specific frequency claim — including ones you find elsewhere — as unverified until it names a source.**

| Defect class | Why it is over-represented | What to check |
|---|---|---|
| String-built queries | Concatenation is the simplest example to write | Every query is parameterised; no f-string or `+` near SQL |
| Secrets in code | Examples use literal keys for brevity | No key, token or password in the repository or its history |
| Missing authorisation | Examples show authentication, which is the visible half | Every endpoint that returns data checks *who* is asking |
| Shell commands from input | `subprocess` with a string is the common shape | No user input reaching a shell; no `shell=True` with variables |
| Weak or home-made crypto | Novel crypto reads as thorough | Standard libraries, standard algorithms, no custom comparison |
| Unsafe deserialisation | Loading is shown as a one-liner | No `pickle`/`eval`/`yaml.load` on untrusted input |
| Verbose errors to users | Detailed messages look helpful | Internal details go to logs, not to the response |
| Missing rate limits | Not part of the feature description | Anything authenticating or expensive is rate-limited |

Two observations about doing this review properly.

**The first is that absence is the failure mode.** You are looking for a check that is *not there* — no authorisation on one endpoint out of nine, no rate limit on the login route. This is Phase 3's hardest skill, and it is harder here because the stakes are higher.

**The second is that one of these is permanent.** A secret committed to a repository is in the history forever, and rotating it is the only real fix — `git rm` does not remove it from the objects, and anyone who cloned has it. **Check for secrets before the first push, not after.** That single ordering decision prevents the only defect on this list that cannot be undone.

### Part 3 — Dependency hygiene

This is where Phase 3's measured finding becomes a shipping obligation rather than a reading habit.

The numbers again, because they justify the effort: **at least 5.2% of code samples from commercial models and 21.7% from open-source models contained hallucinated packages**, across 576,000 samples and 16 models, with **205,474 unique invented names** ([arXiv:2406.10279](https://arxiv.org/abs/2406.10279)). In chat, this is a bug you might catch. At ship time it is a **supply-chain decision**, because a dependency you install runs code with your application's privileges.

The pass, for every dependency in your manifest:

1. **Does it exist?** Check the registry. Exact spelling — the slopsquatting risk is a package that exists under a *nearly* correct name.
2. **Who publishes it, and how maintained?** A single maintainer with no activity for three years is a different risk from an active organisation.
3. **Is it justified?** What does it do that the standard library or an existing dependency does not? Every dependency is supply-chain surface, and the honest answer here often removes several.
4. **What is its licence?** And does that licence permit your use? A GPL dependency in a closed-source product is a legal problem you discover at the worst time.
5. **Is it pinned?** An unpinned dependency means what you tested is not what you ship next week.
6. **Is it in your lockfile?** Transitive dependencies are dependencies. The lockfile is where the full set lives, and it is the file people skim.

**The check that catches the most and takes the least time is the first one.** Phase 3's existence check, applied to the full manifest rather than to imports as you read them — one pass, every package, at the moment it becomes a commitment instead of a suggestion.

### Part 4 — Licence and ownership

Now the part most people assume they know and have not read. **Go and read your tool's actual terms**, because the answers differ by vendor, by tier, and they change.

Four questions, and they have different answers:

**1. Who owns the output?** Most vendors assign output to the user. But the terms are what matter, not the general practice, and you should be able to say where you read it.

**2. Is your code used for training?** This is the one that surprises people, and it differs sharply by tier. **The verified brief in this repository records that Copilot Free uses free-tier code for training by default since 2026-04-24, including suggestions, and that Google Antigravity's free tier also trains on free-tier content.** Both offer controls, and the default is not the private one. If your repository contains anything you would not want indexed, this is a decision to make before you point a tool at it.

**3. Is there an indemnity, and does it cover you?** Some vendors offer legal protection against copyright claims on generated output. Two things to check rather than assume: **whether it applies to your tier** — indemnities are frequently tied to paid plans, which means a $0-budget user may have none — and **what conditions attach**, since indemnities commonly require you to have used the tool's filters or to not have modified the output in certain ways.

**4. What about the input?** If you paste third-party code into a tool, what happens to it? Privacy terms govern this, and they differ by tier in the same way.

**The free-tier gap, stated plainly because it matters most to this track's reader.** Free tiers are where protections are thinnest: they are more likely to train on your content, less likely to carry an indemnity, and their terms change without notice. That is not a reason not to use them — it is a reason to **know which side of the line you are on** and to make a deliberate choice about what you put through them. A private project is a different calculation from a client's source code.

**⚠️ And an honest limit on this section.** The verified brief in this repository records that **OpenAI's terms pages returned HTTP 403** during research, that **Windsurf/Devin's terms page returns 404**, and that several other vendors' positions could not be verified. **So where the table in that brief says Unverified, believe it.** The questions above are the right questions, and for several tools I cannot tell you the answer. Do not substitute a plausible guess for a terms page you have not read — that is exactly the failure mode this curriculum spent a session learning to avoid.

### Part 5 — Disclosure

Honest, proportionate, and not the same thing as apologising.

**Who needs to know:**

- **A client or employer, when the terms of your engagement require it.** Some contracts now specify, and a growing number of organisations have internal policy. Ask rather than assume — the cost of asking is a question, and the cost of not asking is a conversation later.
- **Collaborators on a shared codebase**, because they will be maintaining it, and knowing how it was produced tells them what to check.
- **Users**, in the narrow cases where it is material: if the software makes consequential decisions, or if regulation in your jurisdiction requires disclosure, or if the terms of a platform you are publishing on require it.
- **Nobody else.** Disclosure is not a confession and it is not a badge. It is information a specific person needs to do a specific thing.

**How to say it.** The form that works is factual and short, and it names the parts that matter for maintenance rather than the whole process:

```text
AI assistance: the implementation in src/parser/ was generated with
assistance from <tool> and reviewed, tested and modified by me. The
test suite in tests/ was written first and the implementation iterates
against it. Architecture and the API design are mine.
```

Notice what that does. It says which parts were generated — useful to a maintainer. It states the verification that was actually performed — which is the part that matters, because "AI-assisted" alone tells a colleague nothing about whether to trust it. And it does not editorialise. **The disclosure that helps is the one that reports your verification, not your tooling.**

**What over-disclosure costs.** Announcing AI use where it is irrelevant invites a judgement about method in place of a judgement about the work, and it can obscure the thing a reviewer needs — which is whether this is correct and maintained. Disclose where it is material; do not perform it.

### Part 6 — What you will not ship

The judgement that makes the rest workable, and the list most people leave empty.

Some code should not ship, regardless of whether it works. Not from principle — from a calculation about consequences and your ability to stand behind it. Candidates, and these are yours to decide:

- **Authentication and authorisation you have not personally reviewed line by line.** Every one of Phase 8's security classes lives here, and the cost of a mistake is other people's accounts.
- **Anything handling money without a check on the arithmetic.** Phase 3's boundaries are where the bugs are, and money is boundaries all the way down.
- **Cryptography you do not understand.** Generated crypto is plausibly wrong in ways that produce no visible symptom, which is the worst combination available.
- **Anything touching health, safety or legal decisions** where an error harms a person rather than a process.
- **Anything you could not defend in a conversation.** Phase 1's ownership argument in its final form.

**An empty list means you have not thought about it.** Everyone has a boundary; the question is whether you decided it deliberately or discovered it during an incident. Writing it down now is cheap, and it is the last cheap moment.

This is also where the track's honesty about AI assistance reaches its limit, and it is worth stating. **This phase is not telling you that AI-generated code is unsafe to ship.** It is telling you that shipping is where verification stops being optional, and that some domains demand a standard of verification you may not be able to reach with any tool. Knowing which is which is the skill.

### Part 7 — The pre-ship checklist

The artefact, and the one thing to keep from this phase.

```text
BEFORE SHIPPING
  [ ] I can state what this code does and how it fails (Phase 1's bar)
  [ ] Tests exist, pass, and I have broken the code to prove they catch it
  [ ] Every dependency verified to exist on the registry, exact spelling
  [ ] Every new dependency justified against the standard library
  [ ] Licences of all dependencies checked and compatible with my use
  [ ] Lockfile committed and dependencies pinned
  [ ] No secrets in the repository OR ITS HISTORY (checked before first push)
  [ ] Security pass: queries parameterised, authorisation on every endpoint,
      no shell from input, standard crypto, no unsafe deserialisation
  [ ] Rate limits on anything authenticating or expensive
  [ ] Errors do not reveal internals to users
  [ ] I have read my tool's terms: ownership, training, indemnity, input
  [ ] I know whether my tier is covered by an indemnity (usually: check, do not assume)
  [ ] Disclosure made to whoever the terms or the law require
  [ ] I have written what I will not ship
  [ ] Everything here that I could NOT confirm is written down as unconfirmed
```

That last line is the one that makes the checklist trustworthy, and it is the discipline this whole curriculum has been practising. **A checklist with everything ticked is less credible than one with three honest gaps**, because the gaps are where your attention goes next and a fully-ticked list tells a reviewer nothing about where the uncertainty is.

## Hands-on practice tasks

1. Take a real project you intend to make public, or would be comfortable publishing. Before changing anything, write down in one sentence what it does and how it fails. If you cannot, that is Phase 1's bar failing, and it is the first thing to fix. <!-- id: vb-08-shipping-what-you-build-t01 band: focused energy: normal -->
2. Run a dependency inventory: list every direct dependency and its purpose in one line. Delete any you cannot justify. Most projects lose two or three, and each removal is supply-chain surface gone. <!-- id: vb-08-shipping-what-you-build-t02 band: focused energy: normal -->
3. Verify every dependency in your manifest **exists** on the registry with the exact spelling. This is Phase 3's existence check applied to the full set rather than to imports as you meet them, and it is the highest-value minute in this phase. <!-- id: vb-08-shipping-what-you-build-t03 band: focused energy: high -->
4. Check the licence of every dependency and record it. Flag anything copyleft if your project is not, and read the actual licence text rather than relying on a summary. <!-- id: vb-08-shipping-what-you-build-t04 band: focused energy: normal -->
5. Confirm your lockfile is committed and dependencies are pinned. Note which dependencies are transitive — those are the ones nobody reviewed. <!-- id: vb-08-shipping-what-you-build-t05 band: quick energy: low -->
6. Run the security pass against the defect table in Part 2, one class at a time, and record a verdict for each. Do not batch them: "authorisation on every endpoint" means opening every endpoint. <!-- id: vb-08-shipping-what-you-build-t06 band: deep energy: high -->
7. **Check for secrets in the repository AND its history** — before the first push if you have not pushed. Use `gitleaks` or `grep` for the common patterns. If you find one, rotate it; deleting the file does not remove it from the history. <!-- id: vb-08-shipping-what-you-build-t07 band: focused energy: high -->
8. Choose the three security classes from Part 2 that most apply to your project and write, for each, what you actually checked and what you found. Specific findings beat a general assurance. <!-- id: vb-08-shipping-what-you-build-t08 band: focused energy: normal -->
9. Verify your error paths do not leak internals — trigger an error deliberately and read the response a user would see. Generated code often returns detailed messages because they look helpful. <!-- id: vb-08-shipping-what-you-build-t09 band: focused energy: normal -->
10. Confirm rate limiting exists on anything that authenticates or is expensive. If it does not, note it as a known gap rather than pretending it is done. <!-- id: vb-08-shipping-what-you-build-t10 band: focused energy: normal -->
11. **Read your tool's actual terms** for ownership, training, indemnity and input handling. Record the URL you read and quote the relevant sentence. Where you cannot find it, write Unverified — do not infer. <!-- id: vb-08-shipping-what-you-build-t11 band: deep energy: high -->
12. Determine whether your tier is covered by an indemnity. For most free tiers the answer is no, or is unstated — and knowing you are uncovered is itself the protection, because it tells you which projects to put through that tool. <!-- id: vb-08-shipping-what-you-build-t12 band: focused energy: high -->
13. Compare your tool's terms against the verified table in `docs/research/vibecoding-tool-landscape.md`. Note where the brief says Unverified and check whether your own reading fills the gap — and if it does, **add the source URL to the brief**. <!-- id: vb-08-shipping-what-you-build-t13 band: focused energy: normal -->
14. Write your disclosure statement using the Part 5 shape: which parts were generated, what verification you performed, and what is yours. Keep it under four lines. Then decide, explicitly, who needs to see it. <!-- id: vb-08-shipping-what-you-build-t14 band: focused energy: normal -->
15. Write your "will not ship" list. At least three items with reasons. An empty list means the question has not been considered, and this is the last cheap moment to consider it. <!-- id: vb-08-shipping-what-you-build-t15 band: focused energy: normal -->
16. Complete the full pre-ship checklist for your project and write it up as `portfolio/vibecoding/08-shipping-what-you-build.md`. **Every item you could not confirm goes in an explicit unconfirmed list with the reason.** A checklist with three honest gaps is more credible than one with everything ticked, and the gaps are what a reviewer actually needs. <!-- id: vb-08-shipping-what-you-build-t16 band: deep energy: high -->
17. Do a final read of the code you are shipping, using Phase 3's three questions on the two or three most critical functions. If you cannot answer question two — what happens when it fails — for anything touching data or money, that is a finding. <!-- id: vb-08-shipping-what-you-build-t17 band: deep energy: high -->
18. Write the README a stranger needs: what it does, how to run it, what it assumes, what it does not do. This is the handoff obligation from Phase 1, and it is the last artefact of the track. <!-- id: vb-08-shipping-what-you-build-t18 band: focused energy: normal -->

## Common Pitfalls

**Assuming generated code is secure because it works.** Security defects are silent by construction — missing authorisation produces no error, and a string-built query behaves identically to a parameterised one until someone supplies the right input. Review the classes deliberately or do not claim to have reviewed them.

**Committing a secret and fixing it later.** The only defect on this list with no undo. It is in the history, it is in every clone, and rotation is the only remedy. Check before the first push.

**Treating indirect dependencies as someone else's problem.** Transitive dependencies run with your application's privileges and are the ones nobody read. The lockfile is a security document.

**Assuming you have an indemnity.** They are commonly tied to paid tiers and carry conditions. If you have not read the terms and confirmed your tier is covered, you do not know that you are protected — and on a free tier the likely answer is that you are not.

**Ignoring the training default on free tiers.** The verified brief in this repository records that Copilot Free trains on free-tier code by default since 2026-04-24, and Antigravity's free tier likewise. Both offer controls. Pointing a free tool at a client's repository without checking is a decision made by default rather than by you.

**Filling a terms gap with a plausible guess.** OpenAI's terms pages returned 403 during research and Windsurf/Devin's returns 404. **Where the answer is unknown, write Unverified.** A confident statement about a terms page nobody read is exactly the failure this curriculum spent a session learning to detect.

**Shipping authentication or money code you have not personally reviewed.** The costs are other people's accounts and other people's money, and the verification standard is correspondingly higher. If you cannot meet it, that is a "will not ship" item rather than a risk to accept quietly.

**Over-disclosing as a substitute for verification.** Announcing AI use does not establish that the code is sound. The disclosure that helps a maintainer reports what you verified, not what you used.

**Never running a security pass because the project is small.** Small projects are the ones that ship credentials in a config file, because nobody thought a small project needed a review.

**Treating a fully-ticked checklist as the goal.** A checklist with everything complete tells a reviewer nothing about where your uncertainty is. The unconfirmed list is the valuable part.

## Deliverable / proof of work

- `portfolio/vibecoding/08-shipping-what-you-build.md`, containing:
  - the one-sentence statement of what the project does and how it fails (task 1)
  - the dependency inventory with justifications, and what you removed (task 2)
  - the existence-check results for every dependency (task 3)
  - the licence list with flags (task 4)
  - the security pass with a recorded verdict per defect class (tasks 6, 8)
  - the secrets check result, including history (task 7)
  - your tool's terms, **with the URL you read and the relevant sentence quoted** (task 11)
  - the indemnity position for your tier (task 12)
  - your disclosure statement and who will see it (task 14)
  - your "will not ship" list with reasons (task 15)
  - the completed pre-ship checklist, with an explicit **unconfirmed** list and the reason for each (task 16)
  - the README you wrote for a stranger (task 18)
- The shipped project itself. This phase's output is something other people can use, and the write-up is evidence of the process that got it there.

## Checklist

- [ ] I can state what my project does and how it fails, in one sentence <!-- id: vb-08-shipping-what-you-build-c01 energy: normal -->
- [ ] I accept authorship — the licence, security and disclosure are mine <!-- id: vb-08-shipping-what-you-build-c02 energy: normal -->
- [ ] I verify every dependency exists, with exact spelling, before shipping <!-- id: vb-08-shipping-what-you-build-c03 energy: low -->
- [ ] I justify every dependency against the standard library and remove what I cannot <!-- id: vb-08-shipping-what-you-build-c04 energy: normal -->
- [ ] I check dependency licences and know they are compatible with my use <!-- id: vb-08-shipping-what-you-build-c05 energy: normal -->
- [ ] I check for secrets in the repository and its history before the first push <!-- id: vb-08-shipping-what-you-build-c06 energy: normal -->
- [ ] I have run a security pass against the specific defect classes, not a general assurance <!-- id: vb-08-shipping-what-you-build-c07 energy: normal -->
- [ ] I know my tool's training position and whether my tier is indemnified <!-- id: vb-08-shipping-what-you-build-c08 energy: normal -->
- [ ] I write Unverified where I could not read a terms page, rather than inferring <!-- id: vb-08-shipping-what-you-build-c09 energy: normal -->
- [ ] I can state my disclosure in four lines and say who needs to see it <!-- id: vb-08-shipping-what-you-build-c10 energy: low -->
- [ ] I have a written "will not ship" list with at least three items <!-- id: vb-08-shipping-what-you-build-c11 energy: normal -->
- [ ] My pre-ship checklist records what I could not confirm, and why <!-- id: vb-08-shipping-what-you-build-c12 energy: normal -->
- [ ] I have written the README a stranger needs <!-- id: vb-08-shipping-what-you-build-c13 energy: low -->

## Quiz

### Q1. What does AI assistance change about who is responsible for shipped code? <!-- id: vb-08-shipping-what-you-build-q01 -->

- [ ] The vendor becomes responsible if the code was generated on their platform
- [ ] Responsibility is shared proportionally between user and vendor
- [x] Nothing — you are the author, and the licence, security posture and consequences are yours
- [ ] It depends on whether the tool's terms assign output to the user

**Why:** Shipping has always meant accepting authorship, and a tool does not change that. The output-assignment question in Q4's option is a real terms question, but assigning you the *copyright* is not the same as assigning you the *responsibility* — which is what this phase is about. A carpenter who uses a power saw owns the table.

### Q2. Why is a secret committed to a repository worse than most defects in Part 2's table? <!-- id: vb-08-shipping-what-you-build-q02 -->

- [ ] Because secrets are harder to detect than other defects
- [x] It is in the history permanently, so rotation is the only fix and every clone already has it
- [ ] Because it slows down the build
- [ ] Because it can only be exploited by someone with repository access

**Why:** Every other class on the list can be fixed by changing the code. A committed secret cannot be removed by `git rm` — it remains in the objects and in anyone's clone. That is why the ordering matters: check before the first push, not after, because this is the only defect in the phase with no undo.

### Q3. Why does the phase require recording a verdict for each security defect class separately? <!-- id: vb-08-shipping-what-you-build-q03 -->

- [ ] Because each class requires a different tool to detect
- [ ] Because a general review takes longer than a structured one
- [x] Security defects are silent — missing authorisation behaves identically to correct authorisation until someone exploits it
- [ ] Because the classes have different severity levels

**Why:** You are looking for the *absence* of a check, which is Phase 3's hardest skill. A general assurance like "looks secure" is a judgement, and this curriculum's standard is that judgements and verifications are different kinds of statement. Task 6 requires opening every endpoint rather than summarising the authorisation story.

### Q4. What does the phase say about the indemnity a free-tier user may be relying on? <!-- id: vb-08-shipping-what-you-build-q04 -->

- [ ] All major vendors indemnify users regardless of tier
- [ ] Indemnities apply automatically once you accept the terms
- [ ] Indemnities cover all output without conditions
- [x] They are commonly tied to paid tiers and carry conditions, so you likely do not have one

**Why:** Two things to check rather than assume: whether it applies to your tier, and what conditions attach — since indemnities often require the tool's filters to have been used. Knowing you are uncovered is itself protection, because it tells you which projects to put through that tool, and this is part of the free-tier gap the phase names plainly.

### Q5. Why does the phase require writing Unverified rather than inferring, for tool terms? <!-- id: vb-08-shipping-what-you-build-q05 -->

- [ ] Because terms change too frequently to state
- [x] Because during research some vendors' terms pages were unreachable (403, 404), and a plausible guess about an unread page is the exact failure this curriculum detects
- [ ] Because vendors deliberately obscure their terms
- [ ] Because the terms are the same for all vendors

**Why:** The verified brief in this repository records OpenAI's terms pages returning HTTP 403 and Windsurf/Devin's returning 404. A confident statement about a page nobody read is precisely what a whole session of this project's verification work was spent learning to catch — so the honest gap is recorded instead of filled.

### Q6. Why does the phase call a fully-ticked pre-ship checklist less credible than one with three gaps? <!-- id: vb-08-shipping-what-you-build-q06 -->

- [ ] Because a complete checklist usually means the work was rushed
- [ ] Because some items are impossible to verify
- [ ] Because reviewers distrust complete documentation
- [x] A ticked list says nothing about where your uncertainty is, while named gaps tell a reviewer where attention belongs

**Why:** This is the same standard the corpus applies to reviews — Phase 3's NOT CHECKED section exists for the same reason. The unconfirmed list is the valuable part of the deliverable, because it states the boundary of what you actually did, which is what lets someone else decide how far to rely on it.

## You're ready to move on when...

You can state what your project does and how it fails, in one sentence, without looking. You have verified every dependency exists, justified each one, and checked its licence. You have run a security pass class by class rather than as a general assurance, and you checked for secrets in the history before the first push. You have read your tool's actual terms for ownership, training and indemnity — with the URL and the sentence quoted — and written Unverified wherever you could not read them. Your disclosure is four lines and you know who needs to see it. You have a written "will not ship" list, and your pre-ship checklist records every item you could not confirm along with the reason. And you have written the README a stranger needs, which is the last obligation of the track this project is named after.

## Free vs Paid

### Free path

Every tool this phase needs is free: the package registries, a licence checker, `gitleaks`, and your own tool's terms pages. The verification work is time rather than money, and it is the highest-leverage time in the track — a dependency existence check at ship time costs a minute and prevents a supply-chain compromise.

The honest free-tier position, assembled from the verified brief in this repository: **Antigravity CLI** (which replaced Gemini CLI on 2026-06-18) and **Copilot Free** are genuinely free with no credit card; **both train on free-tier code**, which is a real consideration for anything you would not want indexed; **Claude Code has no free tier**; and indemnities are generally tied to paid plans, so a $0 user should assume they are uncovered and decide what to put through the tool accordingly.

### Paid path

A paid tier changes three things here, and the third is the one people underrate. **No training on your code**, which for client work or anything proprietary is a substantive difference rather than a nicety. **Indemnity coverage**, which converts a class of legal risk from yours into someone else's — subject to conditions you should still read. And **published quotas and larger limits**, which matter less for shipping than for the agent work in Phase 7.

### Where the money genuinely matters

It matters for **client and commercial work**, and this is the one phase where that is the main answer rather than a footnote. On a free tier you are accepting, often without having read the terms, that your code may be used for training and that you carry the copyright risk alone. For a personal project that is a reasonable trade and this phase tells you how to make it deliberately. **For someone else's source code it is a decision that is not yours to make alone** — which is exactly why the disclosure question in Part 5 and the "will not ship" list in Part 6 exist, and why the free path here requires more judgement rather than less.

The compensating truth, and it is the note to end the track on: **the verification discipline in this phase costs nothing at all.** Verifying that a dependency exists, checking for a secret before the first push, reading the terms, writing down what you will not ship — none of it requires a subscription. A $0 budget changes which tool you point at the work. It does not change what shipping means, and it does not change who the author is.

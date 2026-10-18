---
id: vb-09-working-in-a-codebase-you-didnt-write
track: vibecoding
phase: 9
order: 90
title: Working in a Codebase You Didn't Write
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/vibecoding/09-working-in-a-codebase-you-didnt-write.md
exit_criteria: >
  You can orient yourself in a repository you have never seen, explain where a
  change belongs before writing it, and keep an agent inside the conventions the
  codebase already uses. You can review a diff that is not yours, say whether it
  is in scope, and split it into changes a reviewer could accept one at a time.
---

## Goal of this phase

Every phase before this one assumed a codebase you were building. This one removes that assumption, because it is the assumption almost no job will grant you.

**Almost nobody starts from an empty directory.** The work you are most likely to be hired for is a repository with thousands of lines, a history you did not write, conventions nobody explained to you, tests of unknown quality, and a feature request that has to fit an architecture you did not choose. The skill this phase teaches is not typing — it is **orientation**, and the failure it prevents is specific.

**The failure is a plausible change in the wrong place.** An agent will happily add an endpoint that duplicates one that already exists, a helper that a module already exports, or a config value that a different file is the real source of truth for. The code compiles. The tests pass. The change is wrong anyway, because it ignored a structure that was already there. This is the vibecoding failure mode from Phase 1 arriving in a codebase you cannot hold in your head — and it is more dangerous here, because in your own project you would have noticed the duplication, and here you will not.

By the end you will have mapped an unfamiliar repository before editing it, located where a real change belongs and explained why, kept an agent inside the conventions it found rather than the ones it prefers, made the change in small reversible commits, and reviewed a diff — your own, an agent's, and a stranger's — as something to accept or reject rather than something to trust.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1 is orientation on a repository you did not write — the mapping task is the slow one and it is the point. Days 2–4 are the practice tasks, which walk one real change from "where does this go" to "a diff I would defend in review". Day 5 is the write-up and the review of someone else's diff.

If you have less time, do not skip the mapping. Skip the breadth of the practice tasks and do tasks 1, 2, 4, 6 and 9 — a smaller number of changes made properly teaches more than a larger number of changes made blind.

If you have never used git beyond `add` and `commit`, budget an extra two hours for branches, `diff`, and reading `log`. The phase assumes you can look at history, not that you can rewrite it.

## Skills you'll gain

- Orient in an unfamiliar repository and answer "where does this change belong" before writing any code
- Trace one real path end to end — request to response, click to database row — instead of reading files alphabetically
- Discover a codebase's conventions from its own evidence rather than from its README
- Read git history as a map: what changes together, what was reverted, what a commit is trying to protect
- Judge whether existing tests are a specification or a liability, and say which
- Brief an agent with the map, so it works inside the existing structure instead of beside it
- Detect the two agent failure modes of an unfamiliar repo: inventing a convention and duplicating something that exists
- Make a change in small, reversible commits, each of which stands on its own
- Write a commit and a pull request a reviewer can read without interviewing you
- Review a diff that is not yours and decide scope, correctness and risk
- Say "I cannot verify this" instead of merging something you do not understand

## Specific topics to learn

### Orientation before editing

- The rule underneath the phase: you cannot safely change code you cannot predict
- Why reading is not orientation — the difference between opening files and building a map
- Entry points: where execution actually begins, and why it is rarely `main`
- Tracing one path end to end, and why one path teaches more than twenty files
- The seam: the boundary where a new thing plugs into an old thing
- Building the map as an artifact — a note you keep, not a feeling you hold

### Reading the codebase's own evidence

- Conventions are discovered, not asked for: file layout, naming, error handling, test style
- What the linter and formatter config tell you, and what their absence tells you
- Reading `git log` for coupling — which files change together
- `git blame` and `git log -S` as archaeology rather than blame
- Reverted commits and the constraint they encode
- Dependency files as a statement of what this project is willing to be

### Constraining the agent

- Briefing with the map: naming the seam, the existing helper, the convention to follow
- Asking for a plan before a diff, and reading the plan as a claim to check
- The smallest reversible change, and why one commit should be one idea
- Commit before the run, so the run is recoverable
- Reviewing the diff rather than the summary — the summary is a claim about the diff
- Spotting a duplicated abstraction and an invented dependency
- When the model's uncertainty is the honest state, and you should not accept its confidence

### The review loop

- A diff is a proposal, not a result: accept, reject, or ask
- Reviewing for scope before correctness, because an out-of-scope diff is unreadable
- The questions a reviewer will ask, and how to answer them in the commit message
- Commit hygiene: atomic commits, meaningful messages, no drive-by reformatting
- Reading a diff line by line against the intent, not the description
- The difference between "I do not understand this" and "this is wrong"
- Reviewing as a conversation, because that is what the job is

### Technical debt, honestly

- Distinguishing debt from dislike: is the code wrong, or is it unfamiliar
- Why "work around it" is often the correct answer and "clean it up" often is not
- When the right move is to change nothing and ask a question instead
- The codebase with no tests, and how the risk calculus changes
- Contradictory conventions, and choosing the one nearest the code you are touching
- Knowing the limit of the map, and saying so

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Git | History, branches and diffs — the map and the safety net | Free/open-source | https://git-scm.com/ | Trace one file's history and reply on coupling | Any version-control client |
| Git log and blame | Read what changed, when, and together | Free, part of git | https://git-scm.com/docs/git-log | Find two files that always change together | A GUI history viewer such as `gitk` |
| ripgrep | Search an unfamiliar tree faster than you can click | Free/open-source | https://github.com/BurntSushi/ripgrep | Find every caller of the function you are about to change | `grep -r`, or your editor's search |
| A code editor with go-to-definition | Follow a call instead of guessing where it lands | Free | https://code.visualstudio.com/ | Jump from a call site to its definition across the repo | Vim or Emacs with an LSP client |
| An AI coding tool | The subject of the phase: an agent inside code it did not write | Free tier or local model is enough; features and rate limits change, so check current terms | https://github.com/features/copilot | Ask it to change one file and check whether it obeyed the conventions | A local model through Ollama, or a free web model for reasoning only |
| Ollama | Run a coding model locally, with no quota and no upload of someone else's code | Free/open-source | https://ollama.com/ | Repeat one task offline and compare its behaviour | A provider free tier |
| A test runner for the repo's language | Fail fast, and read the tests as documentation | Free/open-source | https://docs.pytest.org/ | Break a test on purpose and confirm it fails | The project's own test command |
| `hyperfine` | Measure whether your change actually changed behaviour | Free/open-source | https://github.com/sharkdp/hyperfine | Time the path before and after your change | Your shell's `time`, repeated |

## Free/cheap resources

- **Open source repository — a real one you did not write** — https://github.com/topics/good-first-issue
- **Git — `git log` documentation** — https://git-scm.com/docs/git-log
- **Git — `git blame` documentation** — https://git-scm.com/docs/git-blame
- **Google — Code Review Developer Guide** — https://google.github.io/eng-practices/review/
- **Conventional Commits** — https://www.conventionalcommits.org/en/v1.0.0/
- **GitHub — About pull requests** — https://docs.github.com/en/pull-requests
- **The Turing Way — Code Review** — https://the-turing-way.netlify.app/reproducible-research/reviewing.html
- **ripgrep user guide** — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md
- **Martin Fowler — Technical Debt** — https://martinfowler.com/bliki/TechnicalDebt.html

## Lesson: The Change That Fits, and the One That Merely Works

### Part 1 — Why orientation is the actual task

Start from the thing that goes wrong, because the whole phase follows from it.

In Phase 1 you met the central danger of vibecoding: code you cannot read is code you cannot own. In a codebase you wrote, that danger is bounded, because your own memory is a map. In a codebase you did not write, the map is gone, and the danger changes shape. The problem is no longer that the code is unreadable. **The problem is that the code is perfectly readable and still wrong for the place you put it.**

Here is the concrete shape of it. A repository already has a function that formats a date. You do not know that, so you ask an agent to add a feature, and the agent — which also does not know that — writes a second date formatter. Both work. Now the codebase has two ways to format a date, and the next person to fix a date bug will fix one of them. Nothing about the change is broken, which is exactly why nobody catches it.

> Think of it as adding a room to a house you have never walked through. You can build a perfectly good room. But if you do not know where the load-bearing walls are, you may build it through one — and the house still stands, for now. The room is fine. The house is now worse.
>
> Where the analogy breaks: a house gives you visible symptoms quickly. A duplicated abstraction in software can survive for years, because both copies of the code are correct until the day a requirement changes and only one of them is updated.

**So orientation is not preparation for the real work; it is the real work.** The output of orientation is a map, and the map's job is to answer one question: *where does this change belong, and what already exists that it must not duplicate?* Everything in this phase is a way of building that map cheaply.

There is a second reason orientation is the task, and it is the one that pays in a hiring conversation. Anyone can prompt a model. What a team needs is someone who can be handed a repository they have never seen and make a change that fits it — that respects its structure, follows its conventions, and would survive review. That is a skill about reading, not about generating, and it is the skill that this phase makes explicit.

### Part 2 — Building the map in an afternoon

You cannot read sixty thousand lines. You do not have to. Here is the procedure, in the order that costs least.

**Step 1: Find the entry point.** Where does execution actually begin? For a web service it is the route table or the router registration. For a CLI it is the argument parser. For a front end it is the root component. For a data job it is the scheduler config. The entry point is the doorway, and it is usually a single small file that names everything else.

**Step 2: Trace exactly one path end to end.** Pick the closest thing to your intended change that already exists. Follow it from the entry point through to where it ends — the database, the response, the rendered screen, whatever the terminus is. Write down the files it passes through, in order. **One traced path teaches more about a codebase than twenty opened files**, because it shows you the shape of the whole thing: where the layers are, what talks to what, and what a "unit of work" looks like here.

**Step 3: Find the seam.** The seam is the boundary where a new thing plugs into an old thing. In most codebases it is exactly one of: a route registration, a function in a service layer, a component in a page, a handler on an event. Locating the seam is the whole of "where does this change go", and after one traced path you can almost always name it.

**Step 4: Read the conventions from evidence, not from claims.** The README is a wish. The code is the truth. Ask four questions and answer them from the tree itself:

- **How is a file named and where does it live?** Find two similar things and copy the pattern exactly.
- **How are errors handled?** Exceptions, return codes, a result type, logging then returning? Whatever the nearest code does, do that.
- **What does a test look like here?** One assertion or many, mocks or real dependencies, fixtures or factories. **The test style is a specification of how this codebase expects to be extended.**
- **What is this project willing to depend on?** Read the dependency file. A repo with three dependencies and no HTTP client is telling you it does not want a fourth.

**Step 5: Read the history as a map.** `git log` on the files you traced is the cheapest orientation tool that exists and the one people forget. Two patterns are worth looking for: **coupling**, where two files always change in the same commit, and **reverts**, which encode a constraint somebody learned the hard way. A file that has been reverted twice is not a file to refactor casually.

```text
# Which files change together with the one I traced?
git log --format= --name-only -- path/to/traced/file | sort | uniq -c | sort -rn

# What has been reverted, and why?
git log --oneline --grep="revert" -i

# When was this line last touched, and by which change?
git log -S "theFunctionName" --oneline
```

**Write the map down.** Five lines in a scratch note: the entry point, the traced path in order, the seam, the conventions you found, the coupling you found. A map you keep in a file survives the context reset, which is the Phase 6 lesson arriving again — and it is the artifact you hand to an agent.

### Part 3 — Keeping the agent inside the codebase

You now have the thing an agent lacks: a map. The mistake is to keep it to yourself.

**Brief with the map, not just the task.** Compare the two briefs and note which one contains actual information.

```text
Brief A — a task with no map
  "Add an endpoint that returns a user's recent orders."

Brief B — the same task with the map
  "Add an endpoint that returns a user's recent orders.
   Routes are registered in src/api/routes.py alongside get_user().
   The service layer is src/services/orders.py; reuse fetch_orders_for_user,
   do not write a new query. Errors are raised as NotFound in
   src/errors.py and handled by the global handler — do not return a
   bare 404 dict. Tests live in tests/test_routes.py and use the
   client fixture, not mock."
```

Brief B is longer and costs less, because it removes the two decisions the agent would otherwise make wrongly: **where the seam is**, and **what already exists that must not be duplicated**.

**Ask for the plan before the diff.** A plan is cheap and a diff is not. "Before you change anything, tell me which files you will touch and why" turns an unreviewable diff into a reviewable claim. Read the plan as a claim about the map you built: if the plan names a file your traced path never went through, either your map is wrong or the plan is, and either way you have learned something before spending a token of output.

**Require the smallest reversible change.** One commit, one idea. If a task genuinely needs two changes — a new function and its caller — that is two commits, and the first must be valid on its own. This is what makes the change reviewable: a reviewer can accept the helper and question the call site separately.

**Commit before the run, and review the diff, not the summary.** Both habits came from Phase 7 and they matter more here, because in an unfamiliar repo you have less ability to notice a wrong summary. A summary that says "updated the config loader" while the diff also reformats four files is a diff you did not ask for, and in a repo you did not write you cannot tell whether the reformatting is harmless.

**Two failure modes to look for by name.** In an unfamiliar codebase, an agent fails in two characteristic ways, and both are invisible in the summary:

1. **The invented convention.** It writes an error path that does not match the repo's, imports a library the repo does not use, or introduces a pattern from its training data in place of the one that is right there. The code works and the codebase is now less consistent. The fix is in the brief: name the convention explicitly rather than assuming a competent model will infer it.
2. **The duplicate.** It writes a second version of something that exists, because it searched for the task rather than the codebase. The fix is to name the existing thing: "reuse `fetch_orders_for_user`, do not write a new query".

> **The principle under both:** a model's weakness in an unfamiliar codebase is not that it writes bad code. It is that it writes **locally reasonable code without a global view** — and the global view is the thing you just spent an afternoon building. Your value here is not the prompt. It is the map you put in the prompt.

### Part 4 — The review loop, which is what a job actually is

You have made the change. In a real team it now goes to a person, and the loop you are about to practise is the loop you will live in.

**A diff is a proposal.** The reviewer's job is to decide whether to accept it, and yours is to make that decision cheap. Review for **scope before correctness**, because an out-of-scope diff cannot be reviewed at all: if the change touches fourteen files to fix a one-line bug, the reviewer cannot tell which of the fourteen lines is the fix. Split it. A small diff that fixes the bug and a separate small diff that does the adjacent tidy-up will each be accepted; the combined one will be sent back.

**The questions a reviewer will ask, and where the answers go.** A reviewer wants to know: *what problem does this solve, how do I know it works, what could it break, and is it in scope?* The commit message and the pull request description exist to answer those four questions before they are asked. A commit message that says what the change does ("add recent-orders endpoint") beats one that says what you did ("updates code").

**Commit hygiene is a communication skill, not a style preference.** Each commit is one idea. The message says why, not just what. No drive-by reformatting, because a whitespace change buried in a feature diff hides real changes. And no commit that leaves the build broken, because the next person will bisect, and a broken commit in the middle makes the bisect lie.

**Reading a diff line by line against the intent.** Read the diff as a claim: does each hunk serve the stated intent? A hunk that does not is either scope creep or a misunderstanding, and in an unfamiliar repo it is more often scope creep — an agent or a person tidying something they noticed.

**And the distinction that the whole phase turns on:** *"I do not understand this"* is not the same as *"this is wrong".* Your first week in a large codebase will produce a great deal of the first feeling and very little reliable evidence of the second. The correct response to the first is a question, not a rewrite. Confusing the two is how newcomers cause the exact kind of damage this phase exists to prevent.

### Part 5 — Where the map runs out, and what that costs

The procedure above is real, and it stops working in specific places. Knowing which places is what makes it a judgement rather than a recipe.

**The codebase that is too large to trace.** Your traced path covered one lane. Real repositories have dozens. Past a certain size you cannot orbitally verify that a change is safe, and the honest posture changes: you narrow the blast radius and you rely on tests you have reason to trust. The skill is recognising when you have crossed from "I understand this" into "I understand this lane", and saying which one out loud rather than quietly assuming the first.

**The tests that lie.** Part 2 told you to read the test style as a specification. Sometimes the tests are the opposite: brittle, asserting implementation details, or passing because they assert nothing. A suite that passes is not evidence that your change is correct — it is evidence that your change did not break what the tests check, and those are different claims. Before you trust a suite, do the cheap sanity check: **break something the tests should catch and confirm they fail.** A suite that cannot fail cannot certify.

**The conventions that contradict each other.** Large codebases accumulate three ways of doing one thing. You will not resolve this, and you should not try. The rule is local: follow the convention nearest the code you are touching, and if two are equally near, pick the one the file you are editing already uses. Consistency within a file beats consistency within a repository you cannot police.

**The honest limit: when to change nothing.** Sometimes the right output of orientation is not a diff. The seam is genuinely absent, or the change belongs to a team that owns a different service, or the "bug" is a deliberate constraint you have not understood yet. Raising that as a question is the correct professional move, and it is a move that agents cannot make for you, because an agent asked to change something will change something.

**And the discipline the whole phase rests on.** The temptation in an unfamiliar codebase is to fix what you do not like. Technical debt is distinct from dislike: debt is a trade-off someone made deliberately and has not repaid, while dislike is a preference. You cannot tell them apart from a single file, and you usually cannot tell them apart in your first month. So the standing rule is: **make your change as small as it can be, in the place the codebase put the seam, in the convention already present** — and leave the rest as a note rather than a diff.

None of this is slower than the alternative. It is faster, because the alternative is a change that has to be explained, defended and re-done.

## Hands-on practice tasks

1. Pick a real open-source repository you have never read, with at least a few thousand lines. Without running it, find the entry point and write down its path. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t01 band: quick energy: low -->
2. Trace one execution path end to end and write it as an ordered list of files. One path only — resist the urge to open more. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t02 band: focused energy: normal -->
3. Answer the four convention questions from Part 2 for that repository, each with the file you read it from. State each answer as evidence, not impression. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t03 band: focused energy: normal -->
4. Name the seam where a small feature you invent would plug in, and say which existing function or route it would sit beside. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t04 band: focused energy: normal -->
5. Use `git log` on the files from task 2 to find two that change together. Write one sentence on the coupling and what it predicts. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t05 band: focused energy: normal -->
6. Search the history for reverts. For each one, write the constraint you think it encodes that the current code does not state. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t06 band: focused energy: high -->
7. Read the dependency file and the linter or formatter config. Write down three things the project is signalling that it does not want. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t07 band: quick energy: low -->
8. Run the test suite. Then deliberately break one thing the suite should catch and confirm at least one test fails. Record what happened either way. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t08 band: focused energy: high -->
9. Write the map as a file: entry point, traced path, seam, conventions, coupling, and the tests' trustworthiness. This is the artifact you hand to an agent. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t09 band: focused energy: normal -->
10. Brief an agent on the same small feature twice — once with only the task, once with the map. Commit before each run and compare the two diffs. Record every place the un-briefed version invented a convention. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t10 band: deep energy: high -->
11. Ask an agent for a plan before any diff, then check the plan against your map. Write down every disagreement and decide who is right. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t11 band: focused energy: high -->
12. Make the change in two or more commits, each of which stands alone. Confirm the first commit is valid without the second. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t12 band: focused energy: normal -->
13. Find a duplicated abstraction in the repository — two functions that do one thing — and write why you would not merge them without a reason beyond tidiness. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t13 band: deep energy: high -->
14. Find a real pull request in the repository you did not author. Review it against the four questions in Part 4 and write your verdict: accept, reject, or ask. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t14 band: deep energy: high -->
15. Write a pull-request description for your own change that answers scope, verification, risk and out-of-scope in four short paragraphs. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t15 band: focused energy: normal -->
16. Audit your own diff for scope creep: any hunk that does not serve the stated intent. Revert it, and note what tempted you. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t16 band: focused energy: normal -->
17. Identify one genuine case in the repository where the right answer is to change nothing and ask a question. Write the question. <!-- id: vb-09-working-in-a-codebase-you-didnt-write-t17 band: deep energy: high -->

## Common Pitfalls

**Editing before you can predict.** The most expensive mistake in the phase. If you cannot say what the code will do before you run it, you are not ready to change it — you are guessing with a compiler.

**Reading files instead of tracing a path.** Opening twenty files in no particular order produces the feeling of understanding and none of the map. Trace one path and write it down.

**Trusting the README over the code.** The README describes what someone intended or once wished for. The code describes what is. When they disagree, the code is the specification and the README is a bug report.

**Briefing the agent with the task and not the map.** The map is the whole value you add in an unfamiliar repo. A brief without it invites the invented convention and the duplicate.

**Accepting a diff because the summary sounds right.** The summary is a claim about the diff, and the diff is the thing. Read the hunks. In a repo you did not write you have no background knowledge to catch a false summary, which makes this habit load-bearing rather than nice.

**Assuming a passing test suite means your change is correct.** It means your change did not break what the tests check. Those are different sentences, and on an unfamiliar suite you should verify that the tests can fail at all.

**Merging a fourteen-file diff to fix one line.** An out-of-scope diff is unreviewable. Split it; both halves get accepted faster than the whole ever would.

**Refactoring on the way to a fix.** Tidy-ups buried in a feature diff hide the real change and make the diff un-bisectable. Note it, or make it its own commit and its own pull request.

**Confusing "I do not understand this" with "this is wrong".** Your first month produces the first feeling constantly and reliable evidence of the second rarely. Ask about the first; only act on the second.

**Reformatting files you did not need to touch.** A whitespace diff multiplied across a repository destroys the history's usefulness and buries your actual change. Match the file you are in and leave the rest.

**Building a second version of something that already exists.** Search for the behaviour before you write it. An agent will not do this for you, because it searches for the task.

**Treating a revert as an accident.** A file that has been reverted twice is carrying a constraint somebody learned by breaking it. Read the history before you change it again.

**Assuming the codebase's conventions are wrong because they are unfamiliar.** They are unfamiliar. That is not evidence. Change your code to match theirs, not theirs to match your taste.

## Deliverable / proof of work

Write `portfolio/vibecoding/09-working-in-a-codebase-you-didnt-write.md` containing:

- **The repository you chose** — the URL, its approximate size, the language, and one sentence on why it is genuinely unfamiliar to you.
- **Your map** — entry point, the traced path as an ordered file list, the seam, and the conventions you found, each with the file you read it from. This is the central artifact; keep it in the form you would hand to an agent.
- **The history findings** — the coupling you found and what it predicts, plus every revert you found and the constraint you think it encodes.
- **The test verdict** — whether the suite could fail, the experiment that showed it, and a one-line judgement of how much you trust it.
- **Two diffs side by side** — the same feature briefed with only the task and briefed with the map, with a list of every invented convention or duplicate in the first.
- **Your change, as commits** — at least two commits, each valid alone, with the commit messages you would actually send.
- **Your pull-request description** — scope, verification, risk, and explicitly out of scope.
- **A review you performed on someone else's pull request** — the four questions answered, and your verdict with the reason.
- **One honest negative result** — a place where orientation showed the right answer was to change nothing, with the question you would ask instead.

## Checklist

- [ ] I can find the entry point of an unfamiliar repository before reading its README <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c01 energy: normal -->
- [ ] I traced one execution path end to end and wrote it as an ordered list of files <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c02 energy: normal -->
- [ ] I can name the seam where a new feature belongs, and the existing thing it sits beside <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c03 energy: high -->
- [ ] I read the codebase's conventions from its own files rather than from its documentation <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c04 energy: normal -->
- [ ] I used git history to find coupling between files and can say what it predicts <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c05 energy: normal -->
- [ ] I found a revert and stated the constraint it encodes <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c06 energy: high -->
- [ ] I keep my map as a written artifact rather than a feeling I hold <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c07 energy: low -->
- [ ] I brief an agent with the seam, the existing code to reuse, and the convention to follow <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c08 energy: normal -->
- [ ] I ask for a plan before a diff and check the plan against my map <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c09 energy: normal -->
- [ ] I can name both agent failure modes — the invented convention and the duplicate — and spot them in a diff <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c10 energy: high -->
- [ ] I commit before an agent run so the run is recoverable <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c11 energy: low -->
- [ ] I review the diff rather than the summary, hunk by hunk <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c12 energy: normal -->
- [ ] I make my change in commits that each stand on their own <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c13 energy: normal -->
- [ ] I write commit messages that say why, and pull-request descriptions that answer scope, verification and risk <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c14 energy: normal -->
- [ ] I review for scope before correctness, because an out-of-scope diff is unreadable <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c15 energy: high -->
- [ ] I can separate "I do not understand this" from "this is wrong", and I ask about the first <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c16 energy: high -->
- [ ] I verified that the test suite can fail before trusting it to pass <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c17 energy: high -->
- [ ] I follow the convention nearest the code I am touching rather than resolving a contradiction I cannot police <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c18 energy: normal -->
- [ ] I have written a case where the right answer was to change nothing and ask a question <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c19 energy: high -->
- [ ] I can explain why a change that works can still be wrong for the place it was put <!-- id: vb-09-working-in-a-codebase-you-didnt-write-c20 energy: normal -->

## Quiz

### Q1. You are handed a 60,000-line repository and asked to add a feature. What is the first thing to do? <!-- id: vb-09-working-in-a-codebase-you-didnt-write-q01 energy: normal -->

- [ ] Ask the agent to implement the feature and review the diff it produces
- [x] Trace one existing path end to end and write down where the feature would plug in
- [ ] Run the test suite to confirm the repository is in a working state
- [ ] Read the files in the main source directory, in order, until something looks relevant

**Why:** The failure this phase prevents is a working change in the wrong place, and the only defence is a map: one traced path tells you where the layers are and where the seam is, so the change lands in the structure that exists. Implementing first and reviewing after invites the two characteristic failures — a duplicated abstraction and an invented convention — because neither you nor the agent yet knows what is around. Running the tests first tells you the repo works, not where your change belongs, and reading directory order is the feeling of orientation without the map.

### Q2. An agent's change works and passes the tests, but it imports a new HTTP library the repository does not use. What is the most accurate assessment? <!-- id: vb-09-working-in-a-codebase-you-didnt-write-q02 energy: high -->

- [ ] It is fine, because working code that passes tests is the goal
- [ ] It is a security risk, because new dependencies are more likely to be vulnerable
- [x] It is the invented-convention failure mode: the change adds a second way to do something the codebase already does, so it is now less consistent
- [ ] It is a performance problem, because a second HTTP library inflates the bundle

**Why:** This is the defining failure of working in code you did not write. The library is probably fine in isolation; the damage is that the repository now has two HTTP clients, two ways to configure timeouts, and two things to update when one changes. The fix is in the brief, not the diff — name the existing library and say to use it. That the tests pass is precisely why this failure is dangerous: nothing about the change is broken, so nothing flags it.

### Q3. A colleague's diff passes CI, and you cannot explain what one of its functions does. What is the correct response? <!-- id: vb-09-working-in-a-codebase-you-didnt-write-q03 energy: normal -->

- [x] Ask them what it does and why it is needed, and keep reading until you can predict its behaviour
- [ ] Approve it, because CI passing is the evidence that matters
- [ ] Rewrite the function into a form you understand before approving
- [ ] Reject the diff on the grounds that it is unclear

**Why:** In a large codebase "I do not understand this" arrives constantly in your first month and is not evidence that the code is wrong — the distinction the phase turns on. The move is a question, because the answer costs the author a minute and your rewrite risks a genuine defect in service of your own comfort. CI passing is evidence the change did not break what the tests check, which is not the same as evidence that you should merge what you cannot reason about.

### Q4. A one-line bug fix arrives as a diff that touches fourteen files, including reformatting two. What should happen? <!-- id: vb-09-working-in-a-codebase-you-didnt-write-q04 energy: high -->

- [ ] Accept it, since the bug is fixed and the reformatting is harmless
- [ ] Accept it but ask for the reformatting to be reverted in a follow-up
- [ ] Reject it entirely, because a fourteen-file diff is unacceptable
- [x] Split it: the fix as one reviewable change, and the tidy-ups as their own, because an out-of-scope diff cannot be read

**Why:** The reviewer's first job is scope, because a diff that mixes concerns cannot be verified — no one can tell which of the fourteen files carries the fix or what could break. Splitting is not bureaucracy; it makes each change individually acceptable and individually revertable, and it keeps the history bisectable. Rejecting outright is as unhelpful as accepting blindly: the fix is presumably wanted, it just needs to arrive on its own.

### Q5. You are about to let an agent make a change to a repository you did not write. What is the most important thing to do first? <!-- id: vb-09-working-in-a-codebase-you-didnt-write-q05 energy: normal -->

- [ ] Increase the model's context so it can see more of the codebase
- [x] Commit the current state on a branch, so the run is recoverable
- [ ] Ask the model to explain the codebase before changing anything
- [ ] Review the model's plan and check every file it lists

**Why:** Reviewing the plan matters — that is the check that catches a wrong map cheaply — but the recoverable starting point is what makes every other mistake survivable: without it, a bad run in someone else's repository costs you the ability to get back to a known-good state. More context helps and is not a guarantee, and it does not protect you if the change is wrong anyway. Commit first, then brief, then plan, then diff.

### Q6. Orientation reveals that the seam for your feature genuinely does not exist, and the change would span two services owned by different teams. What is the most defensible move? <!-- id: vb-09-working-in-a-codebase-you-didnt-write-q06 energy: high -->

- [ ] Make the change end to end yourself, since that is what was asked
- [ ] Pick the nearer service and change only that half
- [ ] Add the missing seam in the service you can access, so the feature fits
- [x] Raise it as a question and do not write the diff, because the right output of orientation can be a question rather than a change

**Why:** An agent asked to change something will change something, and a person under pressure will do the same — but a change that spans an ownership boundary is a decision about architecture, not a task, and it is not yours to make unilaterally. Building the missing seam "so the feature fits" is the most tempting option and the worst, because it commits architecture to avoid a conversation. Raising the question is the professional move, and it is available only to a human: it is the thing the model cannot do for you.

## You're ready to move on when...

You can be handed a repository you have never seen and, within an afternoon, name where a change belongs and what already exists that it must not duplicate. You can brief an agent with that map and check its plan against it. You commit before a run, you make changes in small reversible commits, and you read the diff rather than the summary. You can review a diff that is not yours and separate an out-of-scope change from a wrong one, and you can tell "I do not understand this" apart from "this is wrong" and respond to each correctly.

## Free vs Paid

### What's free is enough

Everything in this phase. The tools are git, a text search, a code editor and a test runner, all of which are free, and the repository you orient in is any real open-source project — there are thousands, and contributing to them is free. A free coding tool or a local model is sufficient for the agent tasks, because the phase is about the briefing and the review rather than the model's raw capability; a weaker model produces more invented conventions, which makes the lesson easier to see rather than harder. The single most useful artifact in the phase, the map, is a text file you write by hand.

### What a paid tier adds

Frontier coding tools read more of a repository at once and follow conventions better, which reduces — and does not remove — the two failure modes. A paid tool may also index the codebase so its answers about structure are more accurate. What no tier adds is the map: the knowledge of where the seam is and what must not be duplicated is local to the codebase and to you, and a model with a large context still has no reason to know that a date formatter already exists unless you or its search finds it.

### When it's worth paying

Pay when you are working daily in a large private codebase and the review loop, not the generation, is the bottleneck — a tool that follows existing conventions closely enough to cut your review time is worth real money. Do not pay to skip orientation. The map is the part that transfers to a job interview and to the next repository; buying more model does not buy more map, and a beginner who pays for a stronger agent before learning to brief it will get faster at producing changes that are wrong for the place they were put.

---
id: sc-09-supply-chain-security
track: safety-career
phase: 9
order: 90
title: Supply-Chain Security for AI Systems
duration: 1 week
duration_weeks: 1
energy_mix: [normal, low]
deliverable: portfolio/safety-career/09-supply-chain-security.md
exit_criteria: >
  You can name the components of an AI application's supply chain — packages,
  model weights, datasets, prompts and tool servers — and say what an attacker
  gains by controlling each. You can generate an SBOM for a project and read it.
  You can explain why a `pickle` model file is a code-execution risk and why
  `safetensors` exists. You can check a dependency for hallucinated or typosquatted
  packages before installing it. You have a written supply-chain review of one
  real project.
---

# Phase 9 — Supply-Chain Security for AI Systems

## Goal of this phase

Phase 2 covered prompt injection and secrets. This phase covers the other direction of trust: **the code, weights, data and tools you did not write but chose to run.** An AI application has a longer supply chain than a typical web app, because it pulls in a Python ecosystem known for executing code at import time, model files that can be more than data, and tool servers that the model can invoke.

The organising idea:

> **You do not have a security boundary at your source files. You have one at every artefact you execute.** A dependency you install, a weights file you load, a dataset you trust, and a tool server you connect to are all code paths you are responsible for, even though you did not author them.

By the end you will have generated an SBOM, audited a dependency list for the classic AI-specific traps, and written a supply-chain review of one project that names what it trusts and why. The review is the artefact.

## Estimated time

**1 week** at 1–2 hours a day. Roughly 6–8 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | The AI supply chain: packages, weights, data, tools | 1.5h |
| 2 | Package risk: hallucinated names, typosquatting, install scripts | 1.5h |
| 3 | Model artefacts: pickle vs. safetensors, licences | 1.5h |
| 4 | SBOMs and dependency scanning | 1.5h |
| 5 | Write the supply-chain review | 2h |

If you only have two hours, do tasks 1, 4 and 10.

## Skills you'll gain

- Map an AI application's supply chain and name what an attacker gains at each node.
- Generate and read an SBOM.
- Recognise hallucinated package names and typosquats before installing.
- Explain the `pickle` code-execution risk and the `safetensors` alternative.
- Review a model or dataset licence before depending on it.
- Write a supply-chain review that names trusted and untrusted inputs.

## Specific topics to learn

- The AI supply chain: language packages, model weights, datasets, prompts and tool servers.
- Package hallucination: why a model suggests plausible names that do not exist, and who registers them.
- Typosquatting and dependency confusion.
- Install-time code execution: `setup.py`, post-install scripts, and why `pip install` is not inert.
- Model file formats: `pickle` deserialisation versus `safetensors`, and what each permits.
- Dataset provenance and licensing: where the data came from and whether you may use it.
- SBOMs: what they contain, how to generate one, and what they do not guarantee.
- Tool servers and MCP: a connection you make is a dependency you trust.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| `pip-audit` | Scan Python dependencies for known vulnerabilities | Free/open-source | https://pypi.org/project/pip-audit/ | Task t06 | `npm audit` or `osv-scanner` for other ecosystems |
| `syft` | Generate an SBOM for a project or container | Free/open-source | https://github.com/anchore/syft | Task t07 | A CycloneDX generator |
| `pip show` / lockfile | Inspect exact installed versions | Free | — | Task t04 | Your lockfile, read directly |
| `safetensors` | Load model weights without arbitrary code execution | Free/open-source | https://github.com/huggingface/safetensors | Task t08 | Weights you trained or exported yourself |
| `git log -S` | Find when a dependency entered the project | Free | — | Task t05 | `git blame` at file granularity |

## Free/cheap resources

- **`docs/RESEARCH-SECURITY-AVAIL-2026-09-29.md` in this repository** — the package-hallucination and generated-code security findings behind this phase.
- **OWASP Top 10 for LLM Applications** — https://owasp.org/www-project-top-10-for-large-language-model-applications/ — includes "Supply Chain" as a named risk.
- **`safetensors` documentation** — https://github.com/huggingface/safetensors — the format and the reasoning.
- **`pip-audit` and `syft`** — https://pypi.org/project/pip-audit/ and https://github.com/anchore/syft — the two scanners used in the tasks.
- **SLSA** — https://slsa.dev/ — a framework for build provenance, useful vocabulary when the project grows.

## Lesson: Trust is a list you write down

### Part 1 — The chain is longer than you think

Most developers have an intuition for dependencies. An AI application adds three more nodes:

- **Model weights.** A weights file is either data or code depending on the format. `pickle` can execute during deserialisation; `safetensors` is designed not to. Loading an untrusted `.bin`/`.pt`/`.pkl` is closer to running an untrusted binary than to opening a data file.
- **Datasets.** A dataset is the input distribution of your behaviour. If it is poisoned, mislabelled, or licensed in a way you cannot use, the defect is in your product before you write a line of code.
- **Tool servers and prompts.** An MCP server you connect to and a prompt template you import are both dependencies. The server runs with your authority and can return text your agent treats as instructions.

The exercise in this phase is to write the list down. A supply chain you have not enumerated is a supply chain you are trusting by default.

### Part 2 — Package hallucination and typosquatting

Models suggest package names that do not exist. The names are plausible — often a tidy combination of a real library and a real concept — and the failure is specific: a developer pastes the suggestion, the install fails or, worse, succeeds because someone registered that name for exactly this reason. The attack is cheap to mount and targets the gap between "the model sounds confident" and "the package exists and is safe".

The defences are boring and effective: check the package exists on the registry, check its download count and age, check the publisher, and read the install scripts before running them. A package with one release, one author, and a name one character from a popular library is not a dependency to adopt.

### Part 3 — Files that are code

`pickle` is Python's serialisation format, and unpickling can run arbitrary code. That is a feature of the format, not a bug, and it means a model file in pickle format is a program. `safetensors` was created because that property is a bad fit for sharing weights: it stores tensors and nothing else, so loading cannot execute code. Prefer `safetensors` where the model offers it, and treat a pickle weights file from an unknown source as executable.

**Volatile:** file formats and the defaults of the major hubs change. Re-check before quoting a specific default.

### Part 4 — Licences are part of the chain

A model or dataset licence can restrict commercial use, redistribution, or use in certain applications. The licence is a dependency condition like any other, and it is the one that is easiest to miss because it does not throw an error. Record the licence of every model and dataset you use, in the same list as the packages.

### Part 5 — The SBOM, and its limit

An SBOM lists the components in an artefact — packages, versions, and often licences and relationships. It is the inventory that makes "are we affected by this advisory?" a query rather than an archaeology project.

Its limit matters: an SBOM describes what you declared, not what actually runs. A dynamically downloaded model, a tool server reached over the network, and a prompt fetched at runtime are all outside a static SBOM. Write down what is in the list *and* what the list cannot see.

## Hands-on practice tasks

1. List every external component one of your projects trusts, grouped by packages, weights, data, tools. <!-- id: sc-09-supply-chain-security-t01 band: focused energy: normal -->
2. Pick three dependencies and find who publishes them and when they last released. <!-- id: sc-09-supply-chain-security-t02 band: focused energy: normal -->
3. Ask a model for a library you need and check whether the suggested package actually exists. <!-- id: sc-09-supply-chain-security-t03 band: focused energy: normal -->
4. Print the exact installed versions from your lockfile and diff them against what you expected. <!-- id: sc-09-supply-chain-security-t04 band: focused energy: normal -->
5. Find when each direct dependency entered the project with `git log -S`. <!-- id: sc-09-supply-chain-security-t05 band: deep energy: high -->
6. Run `pip-audit` (or the equivalent for your ecosystem) and read the output. <!-- id: sc-09-supply-chain-security-t06 band: focused energy: normal -->
7. Generate an SBOM with `syft` and open it. <!-- id: sc-09-supply-chain-security-t07 band: deep energy: high -->
8. For one model you use, check whether a `safetensors` version exists and load that. <!-- id: sc-09-supply-chain-security-t08 band: focused energy: normal -->
9. Record the licence of every model and dataset in your list. <!-- id: sc-09-supply-chain-security-t09 band: focused energy: normal -->
10. Write the supply-chain review, including what an SBOM cannot see. <!-- id: sc-09-supply-chain-security-t10 band: deep energy: high -->

## Common Pitfalls

- **Trusting a model's suggested package name.** Check the registry before installing.
- **Loading a pickle weights file from an untrusted source.** It can execute code during load.
- **Treating an SBOM as a runtime truth.** It lists what you declared, not what the process fetched at runtime.
- **Ignoring licences until a commercial use appears.** Record them when you adopt the dependency, not later.
- **Assuming a tool server is passive.** An MCP server runs with your authority and can return text your agent acts on.

## Deliverable / proof of work

A Markdown file at `portfolio/safety-career/09-supply-chain-security.md` containing: the component list; the publisher and age check for three dependencies; the package-hallucination check result; the scanner output summary; the licence record for models and datasets; and a closing section on what the SBOM cannot see.

## Checklist

- [ ] I can name the five nodes of an AI supply chain. <!-- id: sc-09-supply-chain-security-c01 energy: low -->
- [ ] I have checked three dependencies' publishers and ages. <!-- id: sc-09-supply-chain-security-c02 energy: normal -->
- [ ] I can spot a hallucinated or typosquatted package name. <!-- id: sc-09-supply-chain-security-c03 energy: normal -->
- [ ] I can explain the `pickle` code-execution risk. <!-- id: sc-09-supply-chain-security-c04 energy: normal -->
- [ ] I have generated and read an SBOM. <!-- id: sc-09-supply-chain-security-c05 energy: high -->
- [ ] I have run a dependency vulnerability scan. <!-- id: sc-09-supply-chain-security-c06 energy: normal -->
- [ ] I can state the licence of every model and dataset I use. <!-- id: sc-09-supply-chain-security-c07 energy: normal -->
- [ ] I can say what an SBOM cannot see. <!-- id: sc-09-supply-chain-security-c08 energy: normal -->

## Quiz

### Q1. Why is a pickle-format weights file a security risk? <!-- id: sc-09-supply-chain-security-q01 energy: normal -->

- [ ] It is larger than safetensors
- [ ] It cannot be version-controlled
- [x] Unpickling can execute arbitrary code during deserialisation
- [ ] It only works on GPUs

**Why:** Pickle is a general-purpose serialisation format whose deserialisation can run code. `safetensors` exists to store tensors without that property, which is why it is preferred for shared weights.

### Q2. Package hallucination is dangerous because: <!-- id: sc-09-supply-chain-security-q02 energy: normal -->

- [x] A model can suggest a plausible package name that does not exist, and an attacker can register it
- [ ] Models refuse to suggest packages
- [ ] It only affects JavaScript
- [ ] Package names are always verified by the registry

**Why:** The suggestion sounds confident and the name looks reasonable, so the gap between "the model said so" and "the package exists and is safe" is exactly where the attack lands.

### Q3. What does an SBOM describe? <!-- id: sc-09-supply-chain-security-q03 energy: normal -->

- [ ] Every file that will execute at runtime
- [ ] The performance characteristics of a model
- [ ] The licences of the model's training data
- [x] The declared components and versions in an artefact

**Why:** An SBOM is an inventory of declared components. It does not include artefacts fetched at runtime, so its coverage is a property of the build, not of the process.

### Q4. Which of these is a supply-chain node unique to AI applications? <!-- id: sc-09-supply-chain-security-q04 energy: normal -->

- [ ] Language packages
- [x] Model weights and the tool servers the model can invoke
- [ ] Source control
- [ ] Markdown documentation

**Why:** Packages exist in every ecosystem. Weights files and model-invoked tool servers are the nodes that make an AI application's trust boundary wider than a typical web app's.

### Q5. A model or dataset licence is best treated as: <!-- id: sc-09-supply-chain-security-q05 energy: normal -->

- [x] A dependency condition you record when you adopt it
- [ ] A formality with no technical effect
- [ ] Something to check only before publishing
- [ ] Part of the model's accuracy

**Why:** A licence can restrict commercial use or redistribution, and it fails silently because nothing throws an error. Recording it at adoption is cheaper than discovering it later.

### Q6. The supply-chain review's most useful section is: <!-- id: sc-09-supply-chain-security-q06 energy: normal -->

- [ ] The list of installed versions
- [ ] The scanner output
- [x] What the inventory cannot see
- [ ] The project's feature list

**Why:** An SBOM's boundary is the honest part of the document. Naming the dynamically fetched model, the remote tool server, and the runtime prompt is what prevents the inventory from being read as complete.

## You're ready to move on when...

- You can list the five nodes of an AI supply chain from memory.
- You have verified a dependency's publisher and age before trusting it.
- You can explain the `pickle` risk and name the alternative.
- You have generated an SBOM and can say what it misses.
- Your review names every model and dataset licence you depend on.

## Free vs Paid

**Everything in this phase is free.** `pip-audit`, `syft`, `safetensors` and `exiftool` are open-source, and the registry checks are free queries. Paid supply-chain platforms add continuous monitoring, which matters when a team ships continuously; for a solo project the manual inventory is the part that finds the problems.

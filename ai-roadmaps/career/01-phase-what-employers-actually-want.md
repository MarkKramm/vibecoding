---
id: cr-01-what-employers-actually-want
track: career
phase: 1
order: 23
title: What Employers Actually Want
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/career/01-what-employers-actually-want.md
exit_criteria: >
  You can name the roles that exist around AI systems, state honestly which ones a beginner
  can enter and what the barrier is for each, read a job post and separate what it actually
  requires from title inflation, and describe what remote work from the Philippines
  involves in practice. You have written a target list with a reason for each entry.
prerequisites:
  - safety-career/05
---

# Phase 1 — What Employers Actually Want

## Goal of this phase

Learn what is actually being selected for, so that the work you do from here is aimed at something real rather than at what the internet says hiring looks like.

This phase is deliberately not a list of job titles with salary bands. Those numbers are stale within months and are usually quoted by someone with an incentive to make the field sound either booming or impossible. **What this phase gives you instead is a way to read the market** — which roles exist, what the actual barrier to each one is, what a job post is really asking for, and what "remote, from the Philippines, with no network" concretely involves.

The organising idea is the one thing about hiring that did not change when generation got cheap: **an employer is trying to reduce the risk of hiring you.** Everything they ask for — the portfolio, the take-home, the questions about your past work — is evidence-gathering for that purpose. Once you understand what risk they are pricing, the requests stop looking arbitrary and you can prepare for the real thing.

## Estimated time

**1 week at 1–2 focused hours a day.** The reading is short. The work is research on real job posts and an honest assessment of which roles you can realistically enter — which is uncomfortable and takes longer than reading.

## Skills you'll gain

- Explain **what changed and what did not** now that code generation is cheap, and why hiring practice lags the change.
- Name the roles that exist around AI systems, and state the **real barrier** for each rather than a generic difficulty rating.
- Distinguish **roles that are genuinely junior-accessible** from ones that are titled as junior but are not.
- **Read a job post** and separate the actual requirements from title inflation, boilerplate and wish lists.
- Describe what **remote work from the Philippines** involves: engagement types, time-zone reality, and payment mechanics at a high level.
- Identify **what a specific employer is pricing** when they ask for a portfolio, a take-home, or a reference.
- Write a **target list** with a reason for each entry rather than a list of companies you have heard of.

## Specific topics to learn

1. **What actually changed.** Generation is cheap; verification, judgement and accountability are not. Why that shifts what is scarce without immediately shifting what is hired for.
2. **Why hiring lags.** Why job posts still list skills that are no longer the bottleneck, and how to read them anyway.
3. **The role map.** Evaluation and data work, applied engineering, retrieval and systems, prompt and product work, support and solutions, research, and the frontier-lab training roles.
4. **The junior-accessibility ranking**, and the honest reason each role sits where it does.
5. **Title inflation.** What "AI Engineer", "ML Engineer" and "Prompt Engineer" mean in different organisations, and why the title tells you less than the responsibilities.
6. **Reading a post for requirements.** Separating must-haves from wish lists, and spotting the posts written for an internal candidate.
7. **Remote from the Philippines.** Time-zone overlap by region, contractor versus employee engagements, payment methods, and what to clarify before accepting.
8. **What employers are pricing.** Risk reduction, and the specific evidence that reduces it.

## Tools for This Phase

- **A free account on any job board** — LinkedIn, Indeed, Wellfound, or a Philippines-focused board. You are reading posts, not applying yet.
- **A plain text file** for your target list and for the phrases you notice recurring across posts.
- **Your own deliverables so far**, because you will be checking which roles they already point at.
- **The rest of this curriculum's overviews**, to see which of your completed tracks map to which roles.

Nothing here costs money. Do not buy a course, a certification, or a résumé service for this phase. None of them is what stands between you and a first role.

## Free/cheap resources

- **Real job posts.** The single best resource, and it is free. Read thirty of them for roles you might want, and record the phrases that repeat. Thirty posts will tell you more about the market than any article about the market.
- **The engineering blogs of companies you would work for.** They describe what their teams actually do, which is more reliable than a job title.
- **Open-source project contributor pages.** Many projects list what they need and label issues as suitable for newcomers. This is both research and, later, evidence.
- **`ai-roadmaps/career/00-overview.md`** in this repository for how this track frames the problem, and the Safety & Ethics track's Phase 5 for the durable-versus-volatile distinction that determines what is worth learning.
- **Public salary surveys and hiring reports** — read them, but note who published them and what they sell.

**Be careful with career advice content.** A large fraction of it is written by people monetising the anxiety of job-seekers through courses, bootcamps or paid communities. The tell is a claim about the market that comes with a product attached, and statistics with no methodology. **Read the job posts themselves** — they are free, primary, and cannot be gamed by someone selling something.

## Lesson: They Are Not Hiring Skill, They Are Buying Risk

### Part 1 — What changed, and what did not

Start with the thing that is genuinely different, because almost every error in how people approach this market comes from misunderstanding it.

**Generation became cheap.** Producing a plausible implementation of a described feature used to take hours; it now takes minutes. This is real and it changed how work gets done.

**What did not become cheap:**

**Knowing what to build.** Deciding which problem matters, and which of several plausible approaches fits the constraints, is not a generation problem. A model will happily build the wrong thing with excellent craftsmanship.

**Recognising when output is wrong.** This is the skill the whole curriculum has been building. The output of a model is fluent whether or not it is correct, so the ability to tell the difference has to come from somewhere other than the model.

**Being accountable for a system.** Someone has to sign their name to it, answer for it when it fails, and know enough to fix it. This cannot be delegated to a tool, which is exactly why organisations pay for it.

So the scarce thing shifted from **production** to **judgement, verification and accountability.** That is the central claim of this whole track.

Now the part that trips people up:

**Hiring practice lags this shift by years.** Job posts still list framework names, years of experience in specific tools, and familiarity with interfaces that will be different in eighteen months. This is not stupidity. Job posts are written by copying the last one, filtered through a hiring process that has to be defensible to someone, and shaped by whatever the team used when the last person was hired.

**The practical consequence:** read job posts for **what the role is responsible for**, and treat the skill list as a rough signal that is partly obsolete. A post asking for five years of a framework released three years ago is telling you the requirements were not carefully written — not that you are unqualified.

### Part 2 — Why they are hiring at all

Here is the frame that makes everything else make sense.

**An employer hiring you is making a bet under uncertainty, and the entire process exists to reduce the risk of that bet.** They cannot see your work directly. They have limited time. A bad hire costs them months of salary, team disruption, and the opportunity they did not pursue.

So every artefact they ask for is **evidence-gathering about risk.** Once you see it that way, the requests stop being arbitrary:

- **Why the portfolio?** To find out whether you finish things, and whether you can tell good work from bad.
- **Why the take-home?** To see you work, not just your conclusion.
- **Why the question about a bug you found?** To find out whether you actually debugged something or only built things that happened not to break.
- **Why "tell me about a limitation"?** To find out whether you know the difference between working and correct.
- **Why the reference?** To check whether someone else's experience of you matches your description of yourself.

**And notice what none of these are testing: how fast you can generate code.** That got cheap. They are testing whether you can be trusted with a system, and the signals for that are all about judgement.

**The most useful thing you can do in this phase:** pick three posts for roles you would want, and write down what each employer is actually trying to find out. Not what the post says — what the risk is that the post is designed to reduce. You will find it is almost always the same four or five risks, and once you know them, you know what evidence to build.

### Part 3 — The role map

Titles are unreliable, so this map is organised by **what the work actually is** rather than by title. For each, the barrier is stated honestly rather than encouragingly.

**Evaluation and data work.** Designing and running evaluations, building datasets, measuring model and system quality, and adjudicating whether an output is correct. **This is the most junior-accessible entry point in the field**, and the reason is structural: it is labour-intensive, it requires judgement rather than credentials, it is often unglamorous, and it scales with care rather than with expensive compute. It is also the skill most directly connected to everything else — you cannot evaluate a system you do not understand. **If you are choosing one thing to get good at, this is the one.**

**Applied engineering with AI.** Building products and internal systems where a model is one component. The barrier is ordinary software engineering plus the judgement to know when the model is the wrong tool. **Genuinely junior-accessible if you can build and verify.**

**Retrieval and systems work.** Making a system answer from a specific body of documents reliably. Barrier: the hard part is not the vector database, it is understanding why retrieval failed. **Junior-accessible, and evaluation experience makes you much stronger here.**

**Prompt and product work.** Turning a capability into something usable, writing the instructions, and deciding what the system should refuse. Barrier: low technical bar, but very high judgement bar, and the roles are often mis-specified because organisations do not yet know what they want. **Accessible, with a caveat: the title attracts a lot of noise, so the work has to speak.**

**Support and solutions engineering.** Helping customers deploy and debug the product. Barrier: requires communication as much as code. **Accessible, and frequently underrated** — it puts you inside real deployments quickly and is a common route into product teams.

**Machine learning engineering and research engineering.** Building training pipelines, running experiments, scaling things. Barrier: real, and usually a degree or equivalent demonstrated depth. **Not the right first target** unless you already have the background. Note that "research engineer" is often more engineering than research, so read the responsibilities rather than the title.

**Research and frontier training work.** This is the least accessible and it is worth being blunt about why: these roles select heavily for credentials, prior publication or equivalent, and existing networks, and they are concentrated in a small number of organisations that can afford to be extremely selective. **It is not impossible from outside, but it is not a plan** — do not build your strategy around it, and do not read your inability to enter it as evidence about your ability.

**The honest ranking, most accessible first:** evaluation and data work; applied engineering with AI; retrieval and systems; support and solutions; prompt and product; ML engineering; research.

**The pattern in that ordering** is not prestige, it is **the cost of being wrong about you.** A role where a mistake is caught quickly by a team is easier to hire into than one where a mistake takes a year to surface. That is why evaluation work, which produces checkable output, is the friendliest entry point.

### Part 4 — Reading a job post for what it actually requires

Most posts are four different documents stapled together, and reading them as one is why people feel unqualified for everything.

**The actual requirements.** Usually short. The things the person will genuinely do in the first three months.

**The wish list.** "Nice to have", "familiarity with", or a list of eight technologies. This is aspirational. Organisations rarely find someone matching all of it and routinely hire people matching the first group.

**The boilerplate.** Company mission, equal-opportunity language, benefits. Real, but not requirements.

**The internal candidate's résumé.** A post with oddly specific requirements — an unusual combination of a niche tool and a specific domain — was frequently written around someone already in mind. **You cannot detect this with certainty**, but if the requirements describe one person exactly, it is worth knowing that before you invest.

**Four procedures that make this fast:**

**Highlight every "must" and every "nice to have" before reading anything else.** Most posts tell you which is which, and the ratio is usually three musts to twelve nice-to-haves.

**Ask what the first three months look like.** If the post does not say, that is information about the organisation rather than about you.

**Look for the phrase that reveals the real problem.** "We need someone to own our evaluation pipeline" is a much stronger signal than a title, because it tells you what hurts.

**Count the technologies and be sceptical of long lists.** A list of twelve frameworks is a sign that nobody filtered it. A list of three, with reasons, is a team that knows what it needs.

**The reframe, and it is the useful part:** you are not asking "do I match this post?" You are asking **"what is the risk this post is trying to reduce, and do I have evidence that speaks to it?"** Those are different questions, and only the second one has a useful answer when you are early in your career.

### Part 5 — Remote work from the Philippines, concretely

This is the part most career advice ignores entirely, and it is the part that will shape your actual options.

**Time zone.** Philippine time (PHT, UTC+8) overlaps well with **Australia and much of Asia-Pacific**, reasonably with **Europe's morning**, and with **the US west coast's late evening** — roughly a few hours of shared working time. It does not overlap usefully with the US east coast in normal hours.

**What this means in practice.** Employers who need synchronous collaboration will prefer nearby time zones, and there is nothing you can do about geography. **The compensating move is to become the person whose output is easy to check without a meeting** — written status, reproducible results, clear documentation. Remote-first organisations increasingly hire on output rather than hours, and that trend favours you, but only if your output is legible without you in the room.

**Say your time zone early.** Some roles are explicitly timezone-restricted; discovering this after three interview rounds wastes everyone's time. Stating it up front costs you only the roles that would not have worked.

**Engagement types, and the difference matters more than the rate:**

**Employee.** Local taxes and contributions apply, and you get whatever protections your jurisdiction provides.

**Contractor.** You invoice, you handle your own taxes and contributions, and you have fewer protections. **A higher headline rate is not necessarily more money** once you account for what an employer would otherwise pay on your behalf.

**Freelance or project-based.** Highest variance, no continuity, and it is where most people start.

**Agency or outsourcing firm.** You are employed by the agency and work for their client. Lower rate, more stability, and a common first step — it is a legitimate route, not a consolation prize.

**Payment mechanics to clarify before accepting, at a high level:** how you are paid (bank transfer, remittance service, platform), who bears the fees, what currency, and how the exchange rate is handled. **You do not need to be an expert**, but you do need to ask, because the difference between arrangements can exceed a meaningful fraction of the pay. Note that payment platforms have their own terms and availability by country — check what works for you rather than assuming.

**Two things to raise explicitly, and being early is the whole point:** whether the engagement expects you to be **available in their working hours**, and whether they have hired in your country before. The second question is more informative than it sounds. A company that has done it has solved the payment and paperwork problems already; a company that has not may discover them midway through onboarding.

### Part 6 — The honest position on credentials

Since you are on a $0 budget, this deserves a straight answer rather than a diplomatic one.

**Certifications carry little weight in this field relative to demonstrated work.** This is not absolute, and there are exceptions — some regulated or enterprise contexts care, and some countries' immigration systems use credentials as a filter. But for the roles in Part 3, at junior level, hiring managers weigh **what you built and how you reason about it** above what you completed.

**The reason is structural, and it connects back to Part 2.** A certificate is a weak signal about the risk an employer is pricing, because it does not tell them whether you can be trusted with a system. A project with a real evaluation suite and a stated limitation is a much stronger one, and it is free.

**So the honest position is not "credentials are worthless."** It is that **the thing credentials substitute for is available to you directly**, and at this stage in this field the direct evidence is stronger. If you later need a credential for a specific gate — a visa, a regulated role, a large enterprise's procurement — get it then, when it is solving a real problem rather than a hypothetical one.

**And the corollary:** do not spend money you do not have on a course that promises employability. The free version of everything in this curriculum is what the paid courses largely repackage.

### Part 7 — Your target list, and the reason it is short

End with a concrete artefact rather than an intention.

**Write a target list of three roles, not thirty.** For each, record:

**What the work actually is**, in your own words, not the title.

**Why it fits you specifically** — which of your deliverables already points at it. If nothing does, that is useful information, and it tells you what to build.

**The real barrier**, named honestly. "Requires a degree" and "requires me to demonstrate evaluation work publicly" are different barriers with different responses.

**What evidence would reduce the employer's risk**, which is the thing you can actually work on.

**Why three.** A list of thirty is a wish list and produces no action. Three forces you to choose, and the choosing is the work. You can revise it later — a target list is a hypothesis, not a commitment.

**And the recursion worth noticing:** the reason evaluation work keeps appearing as the answer is that it sits at the intersection of what is most accessible and what is most scarce. Most people cannot measure anything and do not know it. **If you can define what correct means for a system and show that you measured it, you are immediately in a small group** — and that group is exactly the one that can enter through the most junior-friendly door.

## Hands-on practice tasks

1. Read thirty job posts for roles you might want. Record every skill or responsibility that appears in more than a third of them. That recurring set is the real market signal. <!-- id: cr-01-what-employers-actually-want-t01 band: deep energy: high -->
2. Pick three of those posts and write down, for each, what risk the employer is trying to reduce. Not what the post says — what it is actually trying to find out about you. <!-- id: cr-01-what-employers-actually-want-t02 band: focused energy: high -->
3. For one post, separate the four documents: actual requirements, wish list, boilerplate, and anything that looks written around an internal candidate. Quote the lines. <!-- id: cr-01-what-employers-actually-want-t03 band: focused energy: normal -->
4. Write the role map from Part 3 from memory, then check it. Note which barrier you had underestimated. <!-- id: cr-01-what-employers-actually-want-t04 band: quick energy: low -->
5. List your current deliverables and, for each, name which role it is evidence for. If something is evidence for nothing, say so. <!-- id: cr-01-what-employers-actually-want-t05 band: focused energy: normal -->
6. Write your target list: three roles, each with the work described in your own words, the real barrier, and the evidence that would reduce the risk. <!-- id: cr-01-what-employers-actually-want-t06 band: deep energy: high -->
7. Find one post that asks for something you could not do. Write whether the barrier is a skill you can build in months, a credential, or a network — they need different responses. <!-- id: cr-01-what-employers-actually-want-t07 band: focused energy: normal -->
8. Determine your timezone overlap with three regions you would consider working for, and write the shared working hours honestly. <!-- id: cr-01-what-employers-actually-want-t08 band: quick energy: low -->
9. Write the paragraph you would send an employer about your time zone and availability. Keep it to three sentences and make it sound like a practical fact rather than an apology. <!-- id: cr-01-what-employers-actually-want-t09 band: focused energy: normal -->
10. For one role, list the questions you would ask about the engagement: how you are paid, who bears fees, whether they have hired in your country before. <!-- id: cr-01-what-employers-actually-want-t10 band: focused energy: normal -->
11. Find a piece of career advice about AI jobs that is selling something. Identify the claim and the product attached to it. <!-- id: cr-01-what-employers-actually-want-t11 band: quick energy: low -->
12. Write one sentence explaining why evaluation work is the most accessible entry point, using the cost-of-being-wrong argument rather than "it is easy". <!-- id: cr-01-what-employers-actually-want-t12 band: focused energy: high -->
13. Take a post whose title is "AI Engineer" and one titled "ML Engineer" from different companies, and write how the responsibilities differ. Conclude what the titles told you. <!-- id: cr-01-what-employers-actually-want-t13 band: focused energy: normal -->
14. Name the one skill from the curriculum that most directly reduces an employer's risk for your chosen target role, and why it does. <!-- id: cr-01-what-employers-actually-want-t14 band: deep energy: high -->

## Common Pitfalls

**Reading a job post as a checklist and concluding you are unqualified.** Most posts are wish lists. Separate the musts, and notice that organisations hire people who match the first group rather than all of it.

**Applying only to roles you match exactly.** If you match everything, you are probably aiming too low. The useful question is whether you can reduce the risk the post exists to address.

**Believing title inflation.** "AI Engineer" at one company is a product engineer with an API key; at another it is a research engineer. The responsibilities tell you, and the title does not.

**Chasing credentials because they feel like progress.** A certificate is a weak signal about the risk being priced, and on a $0 budget it is usually the wrong purchase. The direct evidence is free and stronger.

**Aiming at research or frontier training as a first target.** These select for credentials and networks you may not have. Not impossible, but not a plan, and failing to enter them says nothing about your ability.

**Assuming geography is the blocker.** Time zones genuinely constrain some roles. But the compensable part is legibility — output that can be checked without a meeting — and that is within your control.

**Accepting a contractor rate because it is higher.** An employee engagement often includes contributions an employer would otherwise pay. Compare what you actually keep rather than the headline.

**Making a list of thirty companies.** A target list is a hypothesis about where your evidence points. Three entries force the choosing that thirty avoids.

**Reading career advice as market data.** Much of it is written to sell something, and the statistics usually have no methodology. Thirty real job posts beat any article about the market.

## Deliverable / proof of work

A file at `portfolio/career/01-what-employers-actually-want.md` containing:

1. **The recurring-requirements list** from thirty real job posts, with the count for each item. This is your own market data.
2. **Three posts analysed** for the risk each employer is pricing. Quote the lines that told you.
3. **The four-document breakdown** of one post: requirements, wish list, boilerplate, and anything suggesting an internal candidate.
4. **Your target list** — three roles, each with the work described in your own words, the real barrier named honestly, and the evidence that would reduce the employer's risk.
5. **Your timezone and engagement paragraph**, as you would actually send it.
6. **One sentence on what you got wrong** — a barrier you had overestimated or underestimated before doing this research.

Point 1 is the one that cannot be faked, because it is derived from posts rather than from advice. If your recurring list looks like a generic list of AI skills, you read fewer than thirty or read them carelessly.

## Checklist

- [ ] I can explain what became cheap and what did not <!-- id: cr-01-what-employers-actually-want-c01 energy: low -->
- [ ] I can explain why job posts lag the change in what is scarce <!-- id: cr-01-what-employers-actually-want-c02 energy: normal -->
- [ ] I can state what risk an employer is pricing when they ask for a portfolio or a take-home <!-- id: cr-01-what-employers-actually-want-c03 energy: normal -->
- [ ] I have read at least thirty real job posts and recorded recurring requirements <!-- id: cr-01-what-employers-actually-want-c04 energy: high -->
- [ ] I can name the roles in the field and the real barrier for each <!-- id: cr-01-what-employers-actually-want-c05 energy: normal -->
- [ ] I can explain why evaluation work is the most accessible entry point <!-- id: cr-01-what-employers-actually-want-c06 energy: normal -->
- [ ] I can separate a post's requirements from its wish list and boilerplate <!-- id: cr-01-what-employers-actually-want-c07 energy: normal -->
- [ ] I can spot a post likely written around an internal candidate <!-- id: cr-01-what-employers-actually-want-c08 energy: normal -->
- [ ] I know my timezone overlap with the regions I would work for <!-- id: cr-01-what-employers-actually-want-c09 energy: low -->
- [ ] I can state the difference between employee, contractor and agency engagements for my situation <!-- id: cr-01-what-employers-actually-want-c10 energy: normal -->
- [ ] I have written a target list of three roles with reasons rather than a list of companies <!-- id: cr-01-what-employers-actually-want-c11 energy: high -->
- [ ] For each target role I can name the evidence that would reduce an employer's risk <!-- id: cr-01-what-employers-actually-want-c12 energy: high -->
- [ ] I can explain why I am not spending money on a certification at this stage <!-- id: cr-01-what-employers-actually-want-c13 energy: low -->

## Quiz

### Q1. A job post lists twelve technologies and three years of experience in a framework released two years ago. What does this most likely tell you? <!-- id: cr-01-what-employers-actually-want-q01 energy: normal -->

- [ ] The role genuinely requires all twelve
- [ ] The company is not serious about hiring
- [x] The requirements were assembled carelessly and the list is largely aspirational <!-- id: cr-01-what-employers-actually-want-q01-opt -->
- [ ] You are unqualified and should not apply

**Why:** Job posts are frequently written by copying the previous one, and they lag what the team actually needs. A three-year requirement for a two-year-old framework is arithmetic proof that nobody filtered the list. The useful reading is to find the two or three real requirements and treat the rest as a signal about the writing rather than about you.

### Q2. Why is evaluation and data work the most junior-accessible entry point in the field? <!-- id: cr-01-what-employers-actually-want-q02 energy: high -->

- [ ] Because it requires no technical skill
- [ ] Because it pays less than other roles
- [ ] Because the work is easy to automate
- [x] Because errors are caught quickly by a team, which lowers the cost of being wrong about you <!-- id: cr-01-what-employers-actually-want-q02-opt -->

**Why:** The ranking in Part 3 is ordered by the cost of a bad hire, not by prestige or difficulty. Evaluation produces checkable output, so a mistake surfaces fast and cheaply, which makes organisations more willing to take a chance. The same reasoning explains why frontier research roles are the least accessible: a mistake there takes a long time to surface.

### Q3. What is an employer actually doing when they ask for a take-home exercise? <!-- id: cr-01-what-employers-actually-want-q03 energy: normal -->

- [x] Gathering evidence to reduce the risk of hiring you
- [ ] Testing how fast you can produce code
- [ ] Filtering out candidates who lack time to spare
- [ ] Checking whether you have used their product

**Why:** Every artefact in a hiring process is evidence-gathering about uncertainty. Speed of generation stopped being the scarce thing, which is why a take-home that tests typing speed would be a badly designed filter. What they want to see is how you reason, what you do when something breaks, and whether you know the difference between working and correct.

### Q4. You match every requirement in a job post exactly. What is the most likely problem? <!-- id: cr-01-what-employers-actually-want-q04 energy: normal -->

- [ ] You are overqualified and will be rejected as a flight risk
- [x] You are aiming too low, since requirements are usually aspirational
- [ ] The post is probably fake
- [ ] Nothing, this is the ideal case

**Why:** If a post's full wish list describes you exactly, the post is describing a rare match that most organisations never find. The more useful question is whether you can address the risk the post exists to reduce, which is a lower bar than matching every listed technology and a much better predictor of whether you get an interview.

### Q5. A company offers a contractor rate noticeably higher than an equivalent employee salary. Why is the comparison not straightforward? <!-- id: cr-01-what-employers-actually-want-q05 energy: normal -->

- [ ] Contractor rates are usually fake and never paid
- [x] You take on costs and contributions an employer would otherwise pay, and you lose protections
- [ ] Contractors always work fewer hours
- [ ] Contractors must pay the client's taxes

**Why:** An employment relationship usually includes contributions, benefits and legal protections that a contracting arrangement does not, so the headline rate is not the same quantity as the headline salary. The practical move is to compare what you actually keep and what you are exposed to, and to ask about fees and currency handling before agreeing.

### Q6. You have no professional network in the field and cannot attend conferences. What compensates for this? <!-- id: cr-01-what-employers-actually-want-q06 energy: normal -->

- [ ] Applying to more roles than other candidates
- [ ] A certification from a recognised provider
- [x] Output that a stranger can check without meeting you
- [ ] Working longer hours to compensate for visibility

**Why:** A network largely functions as a trust shortcut, letting someone vouch for work you cannot otherwise show. The substitute is making the work itself checkable — written up, runnable, with evidence that it was measured. This is also why remote-first organisations increasingly hire on legibility rather than on meetings, which favours candidates who document well.

## You're ready to move on when...

- You can explain **what became cheap and what did not**, and why hiring practice lags that shift.
- You can state, for a given post, **what risk the employer is pricing**, and what evidence would reduce it.
- You have **read thirty real job posts** and have your own recurring-requirements list rather than a remembered one.
- You can name the roles and **the real barrier for each**, and say honestly which ones you can enter now.
- You have a **target list of three roles with reasons**, not a list of companies you have heard of.
- You can describe your **timezone reality and engagement type** in three sentences you would actually send.
- You can say why you are **not** buying a certification at this stage, in a way that is a decision rather than a rationalisation.

If your target list is longer than three entries, you have made a wish list. **The choosing is the work**, and a list you can act on today beats a list of thirty you will revise forever.

## Free vs Paid

**This phase costs nothing, and this is the track where that claim needs defending** because it is the one where budget genuinely constrains options.

**What free gives you, and it is most of the weight:** thirty job posts are free. Reading them is the research. A GitHub account is free. The evidence that reduces an employer's risk — a measured project, a written explanation, an open-source contribution — is free, and the track's position is that these are what actually get junior candidates hired.

**What you genuinely give up, stated plainly rather than cheerfully:**

1. **Credentials as a route.** Certificates are a weak signal about the risk being priced, and the thing they substitute for is available to you directly. If you later hit a specific gate — a visa, a regulated role, a procurement requirement — buy it then, when it solves a real problem.
2. **In-person networking.** Travel and events cost money. The free substitutes are writing in public and open-source contribution, which build a visible trail without a flight.
3. **The strongest compute for a portfolio.** You cannot train a large model to impress anyone. You do not need to: evaluation work, retrieval systems and small well-measured fine-tunes are all zero-cost and more legible to a hiring manager than an unmeasured large one.

**Where money would actually change an outcome, and it is not here:** the later phases are where a small spend might matter — a domain name, a modest API credit for a project that needs to run, an experiment that changes a decision. Those are worth buying when they solve a specific problem. A course promising employability is not, because it repackages what this curriculum already gives you for nothing.

**One honest caution that belongs in a budget discussion:** free tiers are for learning, and their data terms are frequently not appropriate for client or employer work. If you take paid work handling someone else's data, the Safety & Ethics track's privacy material stops being theoretical. On a $0 budget it is tempting to use the free tier for everything — read what that tier does with the data before you point it at anyone else's.

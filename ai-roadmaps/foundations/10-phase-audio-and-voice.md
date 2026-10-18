---
id: found-10-audio-and-voice
track: foundations
phase: 10
order: 100
title: Audio and Voice
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/foundations/10-audio-and-voice.md
exit_criteria: >
  You can explain why an audio pipeline behaves differently from a text one, split
  a conversation's delay into its stages and measure each, and estimate the cost
  of a voice feature from a per-minute number rather than a per-call guess. You can
  say why voice is the wrong interface for a task, and name the consent and
  retention obligations a transcript creates.
---

## Goal of this phase

The multimodal phase removed the assumption that the model's input is text. This one removes a stronger assumption that survived it: **that the input arrives all at once.**

**An image is still a document.** You choose it, you send it, it sits there. Audio is not a document. It is a **stream** — continuous, arriving in fragments, with no built-in marker for where one utterance ends and the next begins. Almost every surprise in this phase falls out of that single difference. A voice agent that answers before you have finished speaking, a transcript that contains words nobody said, a pause that produces a nonsense reply, a feature that feels sluggish even though every component is fast — these are stream problems, not model problems.

**The second thing that changes is the unit of cost and quality.** Text is billed and reasoned about in tokens. Voice is billed in **minutes of audio** at one stage and **characters of text** at another, and the thing the user actually experiences is a **conversation** — which is neither. If you compute the price of a voice feature in tokens you will get a number that is wrong in a direction you cannot predict, and the fix is to learn the unit before you learn the tuning.

By the end you will have sent real audio through real endpoints, measured the latency of a conversation stage by stage, watched a speech-to-text system invent words during silence, built a chained voice loop and costed it per minute of conversation, and written down the tasks for which voice is the wrong interface and the obligations a transcript creates.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1 is the reading and getting one audio file transcribed and one sentence spoken. Days 2–4 are the practice tasks, which build the chain and measure it. Day 5 is the cost model and the write-up.

Budget an extra hour or two if you have never handled a binary payload or an audio format conversion. `ffmpeg` will do everything you need and the phase names the two commands that matter.

If you have less time, do tasks 1, 2, 5, 7, 11 and 14 — one transcription, one synthesis, the latency split, the silence experiment, the cost model and the interface decision. Those six carry the phase.

## Skills you'll gain

- Explain why audio arrives as a stream and what that forces a pipeline to decide
- Describe how an utterance is detected as finished, and why that decision is a visible feature
- Split a conversation's delay into stages and measure each one separately
- Recognise that time-to-first-audio, not total time, is what the user feels
- Build a chained voice loop and say what the text in the middle buys and costs
- Compare a chained design with an end-to-end speech-to-speech design on real axes
- Transcribe a file and evaluate the transcript rather than trusting it
- Reproduce the hallucinated-transcript failure on silence
- Estimate the cost of a voice feature in the user's own unit — the minute of conversation
- Say when voice is the wrong interface, and defend the choice
- Name the consent, retention and voice-replication obligations a voice feature creates

## Specific topics to learn

### Audio as a stream

- Sampling and frames: what actually crosses the wire, and why it is not a file
- Why continuous input has no natural boundary, and what a pipeline must add
- Endpointing and voice activity detection: deciding an utterance is over
- Barge-in: the user interrupting the assistant, and why it is hard
- Sample rate and format conversion, and where the two commands that matter live
- Why a phone call's 8 kHz is not the same problem as a browser's 48 kHz

### Architectures, and what sits in the middle

- Speech-to-speech: audio in, audio out, one model
- Chained: speech-to-text, then a text model, then text-to-speech
- What the text in the middle buys: inspection, reuse of an existing text agent, logging
- What it costs: added latency, and the loss of tone, emphasis and pause
- Live transcription as a component with no assistant speech at all
- Live translation as its own session rather than a voice-agent turn loop
- Choosing a transport: browser, server, telephone

### The latency budget

- Time to first audio as distinct from total response time
- The stages that add up: capture, endpointing, recognition, the text model, synthesis, playback
- Why the text model's time to first token reappears here in a new costume
- The effect of a thinking-by-default model on a spoken interface
- Where streaming hides latency and where it only moves it
- The perceptual threshold that decides whether a pause reads as thought or as breakage

### Costing a voice feature

- Speech-to-text billed by duration, and speech generation billed by characters
- Why neither unit is the one the user experiences
- Deriving cost per minute of conversation from the stage prices
- What a turn costs versus what a minute costs, and when each is the honest number
- The effect of silence and of long pauses on a per-minute bill
- Why a cheaper stage can be the more expensive pipeline

### Where it breaks, and the obligations it creates

- Recognition failure on accents, background noise and crosstalk
- Hallucinated transcripts on silence, and why they happen
- Transcribing a conversation is recording identifiable people
- Consent, notification and the rules that differ by jurisdiction
- Retention and training terms for audio, which differ from text
- Voice replication and design: whose voice is it, and who agreed
- The tasks for which voice is the wrong interface

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | The language the pipeline is written in | Free | https://www.python.org/downloads/ | Send audio and print the transcript and timings | Any language with an HTTP client |
| ffmpeg | Convert, trim and resample audio so you control the format | Free/open-source | https://ffmpeg.org/ | Convert a recording to the format the endpoint expects | Any audio converter |
| A speech-to-text endpoint | Turn audio into text | Free tier varies and changes; check current terms | https://ai.google.dev/ | Transcribe a file you recorded and score the result | `whisper.cpp` or `faster-whisper` locally |
| A text-to-speech endpoint | Turn text into audio | Free tier varies and changes; check current terms | https://platform.openai.com/docs/guides/text-to-speech | Speak a sentence and measure the delay to first audio | Piper or another open-source voice locally |
| `whisper.cpp` or `faster-whisper` | Recognise speech locally, with no upload of a private recording | Free/open-source | https://github.com/ggerganov/whisper.cpp | Transcribe a private file without sending it anywhere | A hosted endpoint's free tier |
| A local TTS such as Piper | Generate speech locally, with no per-character bill | Free/open-source | https://github.com/rhasspy/piper | Repeat a synthesis task offline and compare quality and speed | A hosted endpoint's free tier |
| `python-dotenv` | Keep the key out of the source, as in Phase 8 | Free | https://github.com/theskumar/python-dotenv | Reuse the pattern rather than re-deriving it | Environment variables set by your shell |
| A browser with `MediaRecorder` | Capture real microphone audio for the streaming tasks | Free, built in | https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder | Record an utterance and inspect the chunks that arrive | A command-line recorder such as `sox` |

## Free/cheap resources

- **OpenAI — Audio and voice overview** — https://platform.openai.com/docs/guides/audio
- **OpenAI — Voice agents** — https://developers.openai.com/api/docs/guides/voice-agents
- **OpenAI — Realtime API** — https://developers.openai.com/api/docs/guides/realtime
- **OpenAI — Speech to text** — https://developers.openai.com/api/docs/guides/speech-to-text
- **OpenAI — Text to speech** — https://platform.openai.com/docs/guides/text-to-speech
- **Google — Gemini speech generation** — https://ai.google.dev/gemini-api/docs/speech-generation
- **Google — Gemini Live API** — https://ai.google.dev/gemini-api/docs/live-api
- **Google — Gemini audio understanding** — https://ai.google.dev/gemini-api/docs/audio
- **MDN — MediaRecorder API** — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- **ffmpeg documentation** — https://ffmpeg.org/documentation.html

## Lesson: A Conversation Is Not a Document

### Part 1 — Why the stream changes everything

Begin with the physical fact, because every other surprise in the phase is a consequence of it.

When you send text to a model, you are sending a finished object: a string you composed, complete, with a beginning and an end. When a person speaks to a system, nothing about the input tells the system where the input ends. Audio is a continuous signal, sampled thousands of times a second and delivered in frames, and the frames keep arriving whether or not anybody is talking. **The boundary between one utterance and the next does not exist in the signal. The pipeline has to invent it.**

That invention has a name — **endpointing**, driven by voice-activity detection — and the reason it deserves the first part of the phase is that this single decision explains most of what users complain about:

- **The assistant talks over me.** The endpointer decided you had finished when you paused to think. Nothing was wrong with the model; the boundary was drawn too early.
- **The assistant feels slow.** The endpointer waited for a longer silence before deciding you were done. That wait is added to every response, and it is often the largest single term in a delay that gets blamed on the model.
- **The assistant replies to nothing.** Ambient noise or a page-turn was detected as speech and sent downstream. This is the same boundary decision made wrongly in the other direction.

**And there is a second stream problem on the output side.** A person expects to be able to interrupt the assistant mid-sentence — **barge-in** — and to do that, the system must be listening *while it is speaking*. That is not a feature you bolt on. It is a consequence of treating the interaction as two continuous streams rather than a request and a response, which is why it belongs to the architecture rather than the tuning.

> Think of the difference as a letter versus a phone call. A letter is a document: it is complete when it reaches you, and you read it at your own pace. A phone call has no such moment — someone has to decide when the other person has stopped talking, and both people are making that decision continuously from pauses, intonation and habit.
>
> Where the analogy breaks: people are extremely good at this and mostly do not notice they are doing it. A pipeline has no intonation prior, so it substitutes a timer, and a timer that suits one speaker is wrong for the next. The whole craft of endpointing is trying to recover, from the signal, a judgement that a human makes without effort.

### Part 2 — Two architectures, and what the middle costs

There are two ways to build a spoken interaction, and the choice is the most consequential design decision in the phase.

**Chained (speech-to-text, then a text model, then text-to-speech).** Each stage is a separate call, and there is text in the middle. That text is the attraction: you can read exactly what the system heard, you can log it, you can reuse the text agent you already built, and every stage is independently debuggable and independently replaceable. The cost is latency — three network round trips instead of one — and the loss of everything that is not words. Tone, hesitance, emphasis, the difference between a question and a statement read from intonation: all of it is flattened into punctuation at the first stage and cannot be recovered.

**Speech-to-speech.** One model takes audio and returns audio, in a single session. It is faster, because there is no text bottleneck between recognition and response, and it preserves paralinguistic information that the chained version destroys. The cost is that the middle is gone: you cannot read what it heard, you cannot reuse a text agent unchanged, and the turn structure and tools become part of the session model rather than something you compose from parts.

The published workflow maps make the taxonomy concrete and worth internalising, because each row is a genuinely different product:

| What you are building | What you control | The distinguishing property |
|---|---|---|
| A speech-to-speech agent | Audio turns, session state, tools, interruptions | One session, no text in the middle |
| A voice interface for an existing text agent | Recognition, then the text workflow, then synthesis | You already have the agent; you are wrapping it |
| A transcript of an audio file | Uploads and a bounded request | Batch, not interactive |
| Live captions with no assistant speech | A streaming audio input and incremental transcripts | Recognition only |
| Continuous speech translation | A dedicated translation session | Not a turn-taking agent at all |
| Narration or generated speech | Text, a voice, an output format | Synthesis only, no interaction |

**The choice is not "which is better".** It is "which of these six things am I actually building", and the honest answer for a first project is usually a single row from that table rather than a conversation. Building captions is a different and far easier project than building a conversational agent, and reaching for the hardest row first is the most common way this phase goes wrong.

### Part 3 — The latency budget, which is the product

For a text interface, a slow response is annoying. For a spoken interface, **latency is the interface**, because a pause in conversation carries meaning. Now that you know the pipeline is a chain, you can see that the delay a user experiences is a sum, and that the useful move is to measure the terms rather than the total.

```text
What the user feels, in order:

  [user stops speaking]
        |
        v
  1. endpointing wait     <- how long the pipeline waits before believing you are done
  2. recognition          <- speech-to-text, and its finalisation
  3. text model           <- time to first token (Phase 8); thinking tokens land here
  4. synthesis start      <- time until the first audio is actually playable
        |
        v
  [user hears the first syllable]   <- THIS is the number that matters

  Everything after that is total duration, which matters much less.
```

**Time to first audio is the number, and it is not total response time.** A response that begins speaking in four hundred milliseconds and takes nine seconds to finish feels responsive. A response that begins in three seconds and finishes in three and a half feels broken. This is the same distinction as time to first token in the inference phase, arriving on the other side of the pipeline — and it means the first thing to measure is not the total, but the split.

**Note where a change you have already met reappears.** Stage 3 is the text model, and a model with thinking on by default will spend reasoning tokens before its first visible token. On a spoken interface that spend is silent dead air in the middle of a conversation, and it is one of the most common causes of an assistant that is technically fast and feels slow. The reasoning phase's rule — choose effort from the task, and latency-critical interfaces do not get default thinking — is not an abstract preference here. It is stage 3 of this diagram.

**And streaming moves latency rather than removing it.** Being able to hear the first words before the full sentence exists is what makes a long answer tolerable, and it does nothing for the pause before the first word. Optimising the wrong end of the pipeline is the characteristic mistake of a first voice project: shrinking the total while the user is still waiting in silence for it to begin.

### Part 4 — Costing a conversation, not a call

Now the unit problem, which is where a voice feature becomes expensive quietly.

**The stages are billed in different units, and none of them is the conversation.**

- **Recognition** is billed by **duration of audio** — the minute, in effect. This means **silence is billed**. A user who walks away mid-call, or a call that holds the line open, is generating cost even though no words were exchanged. Cost per audio minute is a real number you should know for your own pipeline.
- **Synthesis** is billed by **characters of text** — the length of what is spoken, not the time it takes to say it.
- **The text model** is billed in **tokens**, as always.

The user experiences none of those. The user experiences a **conversation**, and the honest unit for a product decision is therefore **cost per minute of conversation**, derived from the three above. Build it once, in a spreadsheet, with your measured stage prices, and you will have a number you can multiply by expected usage — which is the number that decides whether the feature ships.

A worked shape, with placeholder prices that you must replace with current ones:

```text
Cost per minute of conversation
  = (audio minutes x price per minute)          <- recognition
  + (output characters / 1000 x price per 1k)   <- synthesis
  + (tokens x price per token)                  <- the text model

Two consequences fall out immediately:
  - a talkative assistant costs more than a quiet one, on the synthesis term
  - a silent line costs money, on the recognition term
```

Two rules follow, and they are the ones worth carrying. **First, the pipeline with the cheaper stage can be the more expensive one**, because the units differ and the mix of a real conversation is not the mix you imagined — a system with cheap synthesis and expensive recognition will be dominated by how long people talk, not how much the assistant says. **Second, silence is a cost line.** If your recognition is billed by duration, then endpointing that waits too long, and a line held open after the user has gone, are both spending money. This is the cost track's discipline — measure the real unit, then cap it — applied to a medium where the meter runs on something you cannot see.

### Part 5 — Where it breaks, and what you now owe people

The mechanism is real and bounded, and the boundary has two halves: accuracy, and obligation.

**Accuracy fails in ways that a text system does not.** Recognition degrades on accents, on background noise, on crosstalk, and on domain vocabulary it never saw. But the failure that surprises people first is the opposite of degradation: **a speech-to-text system can invent words during silence.** Silence is out of distribution for a model trained to produce text from speech, and one of its documented failure modes is a plausible hallucinated transcript where there was no speech at all. This is the hallucination you met in Phase 7, wearing a new costume, and it is why a transcript is a claim to check rather than a record.

> The practical consequence is worth stating as a rule: **never let an unverified transcript trigger an action.** If a voice command can move money, delete data or send a message, the transcript is untrusted input exactly as a user-typed string is, and it needs the same validation you would apply to a form. The medium changed; the trust level did not.

**And the second half is the part with no technical mitigation.** A transcript of a conversation is a recording of identifiable people. That is a different kind of object from a paragraph of text you wrote, and it carries obligations:

- **Consent and notification.** Recording a person, and transcribing them, is regulated differently across jurisdictions, and some places require all parties to consent. You may need to say that the assistant is transcribing before it does.
- **Retention.** Audio and transcripts are subject to the provider's retention and training terms, which are often different from the text terms. A generous free tier may be generous because the audio is used for training. Check the terms for the tier you are actually on.
- **Voice replication.** Voice design and voice replication services exist, and using a recognisable person's voice without their agreement is a legal and ethical problem regardless of what the API permits. This is the same individual-versus-business distinction from the vibecoding track, applied to something more intimate than text.
- **Third parties.** The person on the other end of the call may not be your user. Their words are in your transcript whether or not they agreed to anything.

**And the honest limit: voice is often the wrong interface, and it is not an upgrade.** It is the right interface when the user's hands or eyes are busy, when the input is naturally spoken, or when accessibility requires it. It is the wrong interface when the answer is structured data the user needs to read precisely, when the environment is noisy, when the task has no latency budget for the pipeline, or when a person would rather type. Choosing voice because it sounds impressive, and inheriting every obligation above for the privilege, is the mistake this phase exists to prevent.

**The volatility warning, dated.** **As of 2026-10** the whole surface is moving quickly: the names of the conversational APIs, which models accept audio directly, how they are billed, what transports they support, and whether a manual turn model or a single session is the default. The specific endpoints named in this phase's resources will change, and at least one provider has already replaced its session model with a different one. **Treat every product name and price here as dated and re-checkable.** The durable parts are these: audio is a stream, so somebody must decide where an utterance ends; a conversation's quality is its time to first audio, not its total length; the stages are billed in different units, so cost the conversation; and a transcript is a recording of a person, with everything that follows.

## Hands-on practice tasks

1. Record ten seconds of your own speech and transcribe it. Compare the transcript against what you actually said, word by word. <!-- id: found-10-audio-and-voice-t01 band: quick energy: low -->
2. Convert that recording with `ffmpeg` to a different sample rate and format, and resubmit. Record whether the transcript changed and in what way. <!-- id: found-10-audio-and-voice-t02 band: focused energy: normal -->
3. Synthesise one sentence and time how long until the first audio is playable, as distinct from how long the whole clip took to produce. <!-- id: found-10-audio-and-voice-t03 band: focused energy: normal -->
4. Build the chained loop: record, transcribe, send the text to a text model, synthesise the reply. Print a timestamp at each stage boundary. <!-- id: found-10-audio-and-voice-t04 band: deep energy: normal -->
5. From those timestamps, compute time to first audio and attribute it to endpointing, recognition, the text model and synthesis. Write the split as a table. <!-- id: found-10-audio-and-voice-t05 band: focused energy: high -->
6. Repeat task 5 with a thinking-by-default model, then with thinking at its lowest level. Record the difference in stage 3 and what it does to the total. <!-- id: found-10-audio-and-voice-t06 band: focused energy: high -->
7. Record thirty seconds of near-silence — a quiet room with no speech — and transcribe it. Report whatever text comes back, verbatim. <!-- id: found-10-audio-and-voice-t07 band: focused energy: high -->
8. Say a sentence with one word replaced by a nonsense word. Record whether the transcript preserves it or substitutes a plausible real word. <!-- id: found-10-audio-and-voice-t08 band: quick energy: normal -->
9. Record a sentence with background noise, then the same sentence in silence, and compare the two transcripts on the same words. <!-- id: found-10-audio-and-voice-t09 band: focused energy: normal -->
10. Deliberately split one sentence with a two-second pause. Observe whether the pipeline treats it as one utterance or two, and what that does to the reply. <!-- id: found-10-audio-and-voice-t10 band: focused energy: high -->
11. Write the cost model from Part 4 for your own loop, in the user's unit: cost per minute of conversation. State every price and its date. <!-- id: found-10-audio-and-voice-t11 band: deep energy: high -->
12. Add a silent minute to the model and compute what it costs for no exchange at all. Then state the cap or timeout that would prevent it. <!-- id: found-10-audio-and-voice-t12 band: focused energy: high -->
13. Take a two-minute conversation and compute cost per minute two ways: speech-heavy and silence-heavy. Report which stage dominates each. <!-- id: found-10-audio-and-voice-t13 band: focused energy: high -->
14. Record a task where voice is genuinely the wrong interface, with the reason — structured data to read, noise, no latency budget, or a preference for typing. <!-- id: found-10-audio-and-voice-t14 band: ongoing energy: high -->
15. Draft the one-line notification you would give a person before transcribing them, and cite the consent rule you checked for your jurisdiction. <!-- id: found-10-audio-and-voice-t15 band: focused energy: high -->
16. Repeat one transcription task locally with a free recogniser, sending nothing to a provider. Note the accuracy difference and what it means for a private recording. <!-- id: found-10-audio-and-voice-t16 band: deep energy: normal -->
17. Read the retention and training terms for the tier you are using, and write one sentence on what happens to a recording of a third party you upload. <!-- id: found-10-audio-and-voice-t17 band: focused energy: high -->

## Common Pitfalls

**Treating audio like a file you sent.** Audio arrives continuously, and a pipeline has to decide where an utterance ends. Blaming the model for talking over you is usually blaming the wrong component; the endpointer drew the boundary early.

**Optimising total response time instead of time to first audio.** A response that starts in half a second and takes nine seconds feels fast. One that starts in three seconds feels broken. Measure the start, not the finish.

**Leaving a thinking-by-default model in the middle of a conversation.** Reasoning tokens are spent before the first visible token, so the write-up appears as dead air. A spoken interface should choose its effort for latency.

**Assuming silence transcribes to nothing.** A recogniser trained to produce text can invent plausible words where there was no speech at all. Verify before acting on any transcript, and never let an unverified transcript trigger an irreversible action.

**Costing a voice feature per call or per token.** Recognition is billed by duration and synthesis by characters, and neither is the unit the user experiences. Derive cost per minute of conversation, or the number will be wrong in an unpredictable direction.

**Forgetting that silence is billed.** If recognition is priced by audio duration, a held-open line and an over-long endpointing wait are both spending money for nothing. Cap the line and tune the wait.

**Assuming the cheaper stage makes the cheaper pipeline.** The units differ, and the mix of a real conversation is not the mix you imagined. A cheap synthesis stage can be irrelevant beside a recognition bill driven by how long people talk.

**Reaching for speech-to-speech because it is newer.** It is lower latency and preserves tone, and it removes the text in the middle — which is exactly what you may have needed for debugging, logging and reusing an existing agent. Choose the architecture from the table, not from the trend.

**Building the hardest row of the workflow table first.** Captions and narration are voice features that are far easier and genuinely useful. Reaching for a full conversational agent as a first project is the most common way to abandon one.

**Recording people without telling them.** A transcript is a recording of identifiable people, with consent and notification rules that vary by jurisdiction, plus retention terms a text conversation never raised.

**Cloning a voice the speaker did not agree to.** Voice replication and design are available and permission is not implied by availability. A recognisable voice without agreement is a legal and ethical problem whatever the API allows.

**Assuming a paid tier exempts you from retention.** The individual-versus-business distinction from the vibecoding track applies to audio too, and media terms often differ from text terms. Read the terms for the tier you are actually on.

**Trusting a transcript as a record.** It is a claim produced by a probabilistic model, not a verbatim log. Treat it the way you treat any model output: check what matters.

## Deliverable / proof of work

Write `portfolio/foundations/10-audio-and-voice.md` containing:

- **Your working chained loop** — one script that records or loads audio, transcribes it, sends the text to a model, synthesises the reply, and prints a timestamp at every stage boundary. Include the command that runs it.
- **The latency split** — a table attributing time to first audio across endpointing, recognition, the text model and synthesis, with the thinking-on and thinking-off comparison on the same task.
- **The silence experiment** — the near-silent recording you made and whatever text came back, verbatim, with your one-sentence explanation of why it happened.
- **A transcript you scored** — a recording with a known script, the transcript, and the word-level errors, plus the effect of one format conversion.
- **The utterance-splitting result** — what a deliberate pause did to the pipeline's turn boundaries and to the reply.
- **Your cost model** — cost per minute of conversation derived from the stage prices, with every price dated, plus the cost of a silent minute and the cap that prevents it.
- **A two-minute costing, two ways** — speech-heavy and silence-heavy — naming which stage dominates each.
- **One interface decision** — a task where voice is the wrong interface, with the specific reason rather than a feeling.
- **Your consent and retention notes** — the notification line you would give a person before transcribing them, the rule you checked, and one sentence on what happens to a third party's recording on the tier you use.

## Checklist

- [ ] I can explain why audio has no natural boundary and what a pipeline must add <!-- id: found-10-audio-and-voice-c01 energy: normal -->
- [ ] I can describe what endpointing decides and why it is visible to the user <!-- id: found-10-audio-and-voice-c02 energy: normal -->
- [ ] I know what barge-in requires of the architecture rather than of the tuning <!-- id: found-10-audio-and-voice-c03 energy: normal -->
- [ ] I have transcribed real audio and compared it against a known script <!-- id: found-10-audio-and-voice-c04 energy: low -->
- [ ] I have changed the sample rate or format with `ffmpeg` and seen what it did to the transcript <!-- id: found-10-audio-and-voice-c05 energy: normal -->
- [ ] I have built a chained voice loop with speech-to-text, a text model and speech generation <!-- id: found-10-audio-and-voice-c06 energy: normal -->
- [ ] I can split a conversation's delay into its stages and measure each one <!-- id: found-10-audio-and-voice-c07 energy: high -->
- [ ] I measure time to first audio rather than total response time <!-- id: found-10-audio-and-voice-c08 energy: high -->
- [ ] I can explain why default thinking ruins the middle of a spoken conversation <!-- id: found-10-audio-and-voice-c09 energy: normal -->
- [ ] I can compare a chained design with a speech-to-speech one on latency, auditability and tone <!-- id: found-10-audio-and-voice-c10 energy: high -->
- [ ] I have reproduced the hallucinated-transcript failure on silence <!-- id: found-10-audio-and-voice-c11 energy: high -->
- [ ] I never let an unverified transcript trigger an irreversible action <!-- id: found-10-audio-and-voice-c12 energy: high -->
- [ ] I can state the units recognition and synthesis are billed in, and why neither is the conversation <!-- id: found-10-audio-and-voice-c13 energy: normal -->
- [ ] I have derived a cost per minute of conversation from my own measured prices <!-- id: found-10-audio-and-voice-c14 energy: high -->
- [ ] I know that silence is billed and have stated the cap or timeout that prevents it <!-- id: found-10-audio-and-voice-c15 energy: normal -->
- [ ] I can say why a cheaper stage can produce a more expensive pipeline <!-- id: found-10-audio-and-voice-c16 energy: high -->
- [ ] I can name a task for which voice is the wrong interface and give the reason <!-- id: found-10-audio-and-voice-c17 energy: normal -->
- [ ] I can state the consent and notification obligations a transcript creates <!-- id: found-10-audio-and-voice-c18 energy: high -->
- [ ] I have checked the retention and training terms for audio on the tier I use <!-- id: found-10-audio-and-voice-c19 energy: normal -->
- [ ] I know why recording a third party is different from recording myself <!-- id: found-10-audio-and-voice-c20 energy: high -->
- [ ] I have dated every volatile product name and price in my write-up <!-- id: found-10-audio-and-voice-c21 energy: normal -->

## Quiz

### Q1. What is the defining difference between a chained voice agent and a speech-to-speech one? <!-- id: found-10-audio-and-voice-q01 energy: normal -->

- [ ] The chained version is always cheaper per minute of conversation
- [ ] Speech-to-speech cannot call tools or use a session state
- [x] The chained version puts text in the middle, which you can inspect and reuse, at the cost of added latency and lost tone; speech-to-speech keeps audio end to end for lower latency but is harder to audit
- [ ] They are the same architecture described with different names

**Why:** The trade is what the middle buys and costs. Text between the stages gives you a readable transcript, logging, and the ability to reuse an existing text agent — and it costs a round trip and flattens emphasis, pauses and tone into punctuation. Speech-to-speech removes the bottleneck and preserves the non-verbal information, and removes your ability to read what was heard. Neither is cheaper in general: the units and the workload decide that.

### Q2. A chained voice agent, speech-to-text then a text model then synthesis, feels slow to start talking. What is the right first step? <!-- id: found-10-audio-and-voice-q02 energy: high -->

- [x] Measure time to first audio and split it across endpointing, recognition, the text model and synthesis, because only the split tells you which stage to fix
- [ ] Replace the text model with a faster one
- [ ] Send the audio at a higher sample rate
- [ ] Increase the silence timeout before the pipeline responds

**Why:** The user feels a total, and only the split identifies the term responsible; guessing at a component is how a project spends a week optimising the stage that was never the problem. Time to first audio is the number, because the pause before the first syllable carries meaning while the rest of the answer does not. Raising the silence timeout makes the delay worse, and a higher sample rate does not make any stage faster.

### Q3. Which risk is specific to a voice feature and has no real equivalent in a text interface? <!-- id: found-10-audio-and-voice-q03 energy: normal -->

- [ ] The output could be factually wrong
- [ ] The model could refuse a request
- [ ] The feature could cost more than expected
- [x] A transcript is a recording of identifiable people, so consent, notification, retention and voice-replication obligations apply, and the data is often more sensitive than text

**Why:** Wrongness, refusal and cost are properties of any model call. What voice adds is that the input is a recording of a person — possibly a person who is not your user and never agreed to anything — and that recording is subject to consent rules that vary by jurisdiction and to retention terms that often differ from the text terms. That is why the transparency line you show before transcribing is part of the design, not a legal afterthought.

### Q4. The line is open and the user has not spoken for a while. What may a speech-to-text stage do with the silence? <!-- id: found-10-audio-and-voice-q04 energy: high -->

- [ ] Reliably return an empty transcript, since there is nothing to transcribe
- [x] Invent plausible words, because recognising speech is its task and silence is out of distribution for it
- [ ] Return an error, which you handle as an empty utterance
- [ ] Reduce the audio quality to save bandwidth

**Why:** This is the hallucination failure from Phase 7, in a new costume: a system trained to map speech to text is being handed something that is not speech, and one of its failure modes is a confident invented transcript. That is why a transcript is a claim to verify rather than a record, and why an unverified transcript must never trigger an irreversible action. Empty results sometimes happen; relying on them is the mistake.

### Q5. A voice feature will run around five thousand minutes of audio a month. Recognition is priced by duration and synthesis by characters. Which unit should the cost decision use? <!-- id: found-10-audio-and-voice-q05 energy: high -->

- [ ] Cost per API call, because that is how the provider bills
- [ ] Cost per token, because that is what the text model inside charges
- [x] Cost per minute of conversation, derived end to end, because the user's unit is the conversation and each stage prices in a different unit
- [ ] Cost per model, because the model choice dominates

**Why:** The stages are billed in three different units — audio minutes, characters and tokens — and none of them is the thing the user experiences, so converting all three into one conversation-shaped number is what makes the figure usable for a decision. Once you have it, the surprises fall out: silence is billed, a talkative assistant costs more on the synthesis term, and the pipeline with the cheaper stage can be the more expensive one because the mix of a real conversation was not what you assumed.

### Q6. When is voice the wrong interface for a feature? <!-- id: found-10-audio-and-voice-q06 energy: normal -->

- [ ] When the user is on a phone rather than a computer
- [x] When the answer is structured data the user must read precisely, the environment is noisy, or the task has no latency budget for the pipeline — because voice is an interface choice, not an upgrade
- [ ] When the model is small or open-weight rather than frontier
- [ ] When the user has not been given a choice of voice

**Why:** Voice is right when hands and eyes are busy, when the input is naturally spoken, or when accessibility requires it, and it is wrong when the output is a table, when the room is loud, or when the pause before the first syllable would already have broken the interaction. The obligations a transcript creates — consent, notification, retention — are the price of admission, so choosing voice for the feel of it, and inheriting all of that, is the mistake this phase exists to prevent. It is not a capability question about the model.

## You're ready to move on when...

You can explain why an audio pipeline behaves differently from a text one, and you have watched a recogniser invent words in silence. You can build a chained voice loop, measure its time to first audio, and name which stage is responsible for the delay. You can cost that loop per minute of conversation from measured prices and say which stage dominates. You can choose between a chained and a speech-to-speech design on latency, auditability and tone rather than on novelty, say when voice is the wrong interface, and state the consent and retention obligations a transcript creates.

## Free vs Paid

### What's free is enough

Every task in this phase. Recognisers and speech generators both have free routes — a provider free tier, or a local model such as `whisper.cpp` for recognition and Piper for synthesis — and `ffmpeg` handles every format conversion. The latency experiments need only timestamps, the cost model needs only prices you can read from the provider's pricing page, and the local route is genuinely better for the privacy tasks, because it lets you transcribe a private recording without uploading it. Expect weaker accuracy from a small local recogniser; that is instructive rather than disqualifying, since it fails at the same things for the same reasons, sooner.

### What a paid tier adds

Paid access buys lower latency on the hosted endpoints, higher rate limits so you can run a conversation rather than a single turn, and smoother streaming for barge-in. Voice quality on synthesis differs noticeably between tiers, which matters if the feature is customer-facing. None of this changes the mechanism: the stream still needs an endpointer, the delay is still the sum of its stages, and the conversation is still the unit of cost.

### When it's worth paying

Pay when you have a working voice loop that your own measurements show is limited by the hosted stage rather than by your architecture — a recognition or synthesis call whose latency or accuracy is the term that dominates your table. Pay too when the feature is customer-facing and the free tier's voice quality is the difference between credible and not, since that is a product decision rather than an engineering one. Do not pay to skip the measurement: the most common way to waste a voice budget is to buy faster components before finding out which stage is slow, and the second most common is to buy more minutes for a pipeline whose silence is being billed because nobody capped the line.

---
id: intern-08-diffusion-and-generated-media
track: model-internals
phase: 8
order: 80
title: Diffusion and Generated Media
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/model-internals/08-diffusion-and-generated-media.md
exit_criteria: >
  You can explain how a denoising model produces an image, say why the price of a
  generated image depends on its resolution rather than on the length of your
  prompt, and convert between media units and tokens using a published rate. You
  can name the property that stops you comparing two generations, and state
  honestly which of your claims came from measurement and which from inference.
---

## Goal of this phase

Phases 6 and 7 both treated generation as one thing: a model emits tokens, the bill counts them, and the only interesting question is how many. **This phase breaks that assumption.** There is a second family of generative models, and its central quantity is not how much you said — it is **how large the thing you got back is.**

**Everything you have learned about cost so far rests on a text intuition that does not survive contact with images, audio or video.** For text, a longer prompt costs more and a longer answer costs more, which is why the Focus and Cost tracks teach you to shorten both. For media, the prompt is nearly free and the output is priced by the pixel, the second, or the frame. A four-hundred-word prompt and a forty-word prompt can cost within a rounding error of each other, while the same prompt at four times the resolution costs more than three times as much. If you carry the text intuition across, you will optimise the wrong number, and you will do it confidently.

**The corpus can already read media and has never generated any.** Foundations Phase 9 sends images in and Foundations Phase 10 streams audio, but nothing in the curriculum produces a picture. So the current state is a reader who can explain attention, the KV cache, sampling, batching and per-token billing, and who has no model at all of how the majority of "AI-generated" media that a stranger has seen was actually made. That is a real hole, and it is in the one place where the cost model the rest of the track teaches is wrong.

**The mechanism is worth learning even though the API hides it.** Denoising generation is iterative: the model is called many times per output, and each call is a full pass through the network. That single structural fact explains why generation is slow in a way token streaming never was, why there is a step dial in local tools and no such dial in most hosted ones, why "more steps" stops helping while the bill keeps climbing, and why the same prompt gives you a different image every time — which quietly invalidates the diff-based comparison habit that every other phase has assumed you can use.

By the end you will have converted a published exchange rate between media units and tokens, predicted a bill before generating and checked it against the usage object, seen the step dial's diminishing returns with your own timing, and written a dated note separating what you measured from what you inferred about a provider's internals.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1 is the reading and the two price lookups. Day 2 is the image work — resolution, repetition, seed. Day 3 is the local step experiment, which is the one that changes how you think about the bill. Day 4 is video and audio arithmetic plus the edit endpoint. Day 5 is the judgement write-up.

Budget an extra hour if you have never run a local model. The step experiment needs a tool that exposes the step count, and that is the reason this phase asks for one at all.

If you have less time, do tasks 1, 2, 3, 6, 8 and 15 — the two rate lookups, the resolution prediction, the step dial, the video arithmetic, and the honest note. Those six carry the phase.

## Skills you'll gain

- Explain how iterative denoising generates an image, and why one output costs many model calls
- Convert between media units and tokens using a provider's published exchange rate
- Predict the cost of an image, a clip or a narration from its size before generating it
- Say why resolution and duration are price selectors rather than only quality settings
- Read a media request's usage object and identify which modality line dominates
- Separate the mechanism you are learning from the unit you are actually billed in
- Explain why two generations of the same prompt are not comparable, and what that does to an eval
- Use a fixed seed, and know the narrow sense in which it makes a run reproducible
- Name the step dial's diminishing returns, having timed both ends of it
- State honestly what a hosted API does and does not reveal about its internals

## Specific topics to learn

### Why text taught you the wrong intuition

- What scales the bill for text: input tokens with the prompt, output tokens with the answer
- What scales the bill for media: the size of the output, at a published rate per unit
- Why the prompt is the cheap part of a media request, and by how much
- The reversal: shortening a prompt to save money on media does nothing measurable
- Resolution and duration as the numbers that actually move the total

### The second generative mechanism

- Adding noise to an image as arithmetic rather than as a model
- The reverse step: training a model to predict the noise that was added
- Sampling: start from pure noise and apply the model repeatedly
- Why generation is refinement rather than drawing, and why that distinction predicts the failure cases
- The step count as the cost multiplier, and latency as steps times per-step time
- Diminishing returns: what the early steps decide and what the late ones only polish
- The other mechanisms that produce images, and why the API surface will not tell you which is in use

### Where the denoising happens

- The redundancy in pixels, and why iterating in a compressed representation is cheaper per step
- An encoder and decoder pair wrapping the denoiser, and the round trip that loses detail
- Why the same model can serve several output resolutions by decoding larger
- Limited latent capacity and the error classes it predicts, including small text
- Why this makes resolution simultaneously a quality setting and a price multiplier

### The dials you actually control

- Steps: the count, the returns, and where they stop
- Guidance: how hard the output is pushed toward the prompt, and what is traded away
- Seed: the noise the generation starts from, and what fixing it does and does not guarantee
- Negative prompts and initial images, where the interface offers them
- Editing as the same machinery given a starting point that is not noise
- Which of these a hosted API exposes, which it does not, and why that matters for your measurements

### Media as a metered unit

- Published exchange rates between media units and tokens, and their date
- Image output tokens as a function of resolution, and the ratios between tiers
- Video output tokens per second, and the resolution dependence behind the headline rate
- Audio tokens per second, and why narration is priced by the clock rather than the script
- The modality column: text, image, audio and video output lines at different rates in one request
- Batch pricing as a straight fraction, and the latency it costs
- The iteration loop as the real expense, because you cannot see the result until you have paid for it

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | Do the conversions and keep the numbers in one place | Free | https://www.python.org/downloads/ | Price an image, a clip and a narration from published rates | Any language, or a calculator |
| Hugging Face `diffusers` | Run an image model locally with the step count, guidance and seed exposed | Free/open-source | https://huggingface.co/docs/diffusers | Run the step experiment at both ends of the dial | ComfyUI, or any local front end that shows the sampler settings |
| A hosted image model | The subject: generation and editing billed by the reported unit | Freemium | https://ai.google.dev/gemini-api/docs/image-generation | Generate at three resolutions and read the usage object | A local model, with no per-unit bill |
| A hosted speech model | Narration, to price audio by the second | Freemium | https://ai.google.dev/gemini-api/docs/speech-generation | Price three minutes of narration at the published audio rate | A local text-to-speech model |
| A hosted video model | The expensive case, priced per second of output | Paid — check current per-second pricing | https://ai.google.dev/gemini-api/docs/veo | Generate a short clip and compare its cost to the image case | No local equivalent you can run this week |
| `ffmpeg` | Verify a clip's real duration and resolution before pricing it | Free/open-source | https://ffmpeg.org/ | Confirm the duration you are being billed for | `ffprobe`, or your player's file information |
| ComfyUI | A visual front end where the sampler and step count are visible controls | Free/open-source | https://github.com/comfyanonymous/ComfyUI | See which dials exist that a hosted API never shows you | The `diffusers` command line |
| A spreadsheet or notebook | Hold the measurements and compute the ratios | Free | https://jupyter.org/ | Compare predicted and actual cost per generation | Any spreadsheet application |

## Free/cheap resources

- **Hugging Face — Diffusion Models Course** — https://huggingface.co/learn/diffusion-course/unit0/1
- **Hugging Face — Diffusers documentation** — https://huggingface.co/docs/diffusers
- **Google — Image generation (Nano Banana)** — https://ai.google.dev/gemini-api/docs/image-generation
- **Google — Video generation** — https://ai.google.dev/gemini-api/docs/video
- **Google — Music generation** — https://ai.google.dev/gemini-api/docs/music-generation
- **Google — Speech generation** — https://ai.google.dev/gemini-api/docs/speech-generation
- **Google — Gemini API pricing** — https://ai.google.dev/gemini-api/docs/pricing
- **OpenAI — Image generation guide** — https://platform.openai.com/docs/guides/image-generation
- **OpenAI — Pricing, including the image modality rates** — https://platform.openai.com/docs/pricing

## Lesson: Priced by Size, Not by Sentence

Everything in this curriculum up to now has assumed that the bill follows the words. This lesson is about the family of models where it does not, and about the arithmetic that replaces the intuition — verified against the providers' own documentation, dated **2026-10**, because every rate below will move.

### Part 1 — The intuition that does not transfer

For text, both ends of the request are priced and both are worth managing. A long prompt costs more than a short one. A long answer costs more than a short one. The Cost track built an entire discipline on this: trim the context, cache the prefix, cap the output, route the easy calls to a cheaper model. All of it is about **how many tokens passed through**.

Now consider a request that asks a model for a 4096×4096 image. Your prompt is perhaps sixty words. The output is one picture. Ask what the bill scales with and the text-trained answer — the prompt, the wording, the length — is close to irrelevant: moving from a forty-word prompt to a four-hundred-word prompt changes the input line by a few hundred tokens, while the image itself is billed at **3,780 output tokens** at that resolution. The prompt is a rounding error on the invoice you are trying to control.

The providers do not hide this. They publish it. What is missing is the mental model, which is what the rest of this lesson supplies.

### Part 2 — Generating by removing noise

The denoising family is the second dominant way to generate content, and its mechanism is unusual enough to be worth stating plainly.

**Adding noise is arithmetic, not modelling.** Take an image and add random values to every pixel, a little at a time, over some number of steps. After enough steps nothing of the original remains — the result is indistinguishable from pure noise. No model is involved in that direction. It is a schedule plus a random number generator.

**Removing noise is the model.** Train a network to look at a noisy image and predict the noise that was added to it. Do that well enough and you can run it backwards: hand it pure noise, let it predict the noise, subtract that prediction, and you are a fraction closer to an image. Repeat. This is **sampling**, and the pattern is a loop, not a single pass.

Three consequences follow, and they are the whole reason this phase exists:

- **One output costs many model calls.** A generation at thirty steps is thirty forward passes through the network, plus the decode at the end. Nothing in the text model you learned about works this way — there, one call produced one token and streaming gave you partial results continuously. Here there is no partial result worth showing, because the state after twelve steps is a blurry approximation, so the user waits in silence and then receives the finished thing.
- **Step count multiplies compute and time, and only improves quality until it stops.** The first steps settle composition — what is where. The middle steps settle form. The last steps adjust fine texture, and past a certain point consecutive steps produce changes below the visible threshold. The bill is linear in steps; the benefit is not.
- **The model never draws.** It refines a field of noise toward a plausible image under your prompt's influence. This is why some error classes exist at all: reconstructing high-frequency structure — small legible text, fine repeating patterns, the exact topology of fingers — is where a limited-capacity representation is least able to be precise. The failures are not random incompetence; they follow from where the information lives.

**Modernity, honestly.** Some current hosted models generate images by methods other than denoising, and a provider's documentation will generally not say which method produced your picture. Treat the mechanism above as the model you need for *judgement* — it explains the dials, the latency, the repeatability and the failure classes — and treat the billed unit, in Part 5, as the thing you actually measure. Part 7 is about why keeping those two apart is the difference between a claim and a guess.

### Part 3 — Why the denoising happens in a compressed space

If you ran the loop above on a 4096×4096 image, every one of the thirty steps would process twelve and a half million pixels. That is wasteful, because photographs are enormously redundant: neighbouring pixels are almost the same, and most of the visual content survives heavy compression.

So the standard arrangement wraps the denoiser in two small networks. An **encoder** turns the image into a compact representation — a few thousand numbers instead of millions — and a **decoder** turns the compact version back into pixels. The denoising loop then runs entirely in that compact space, which makes each step far cheaper, and only the final result is decoded.

Two things this explains:

**Why resolution behaves like a price multiplier.** Because the loop is resolution-independent up to the decode, the same model serves every output size — and the size stops being an architectural question and becomes a billing one. This is not a rule of nature, it is an observation about where these systems put their cost, and it is exactly what the published rates in Part 5 show.

**Why some detail cannot come back.** The compact representation has finite capacity, so whatever did not survive the encode is not available to be decoded, no matter how many steps you run. More steps refine the approximation; they cannot invent information the representation discarded. If you want legible small text in a generated image, the honest answer is a larger output and an edit pass, not a higher step count.

### Part 4 — The three dials

Local tools expose three controls, and knowing what each does is what lets you reason about a hosted API that exposes none of them.

**Steps.** The number of denoising iterations. Fewer steps leave visible noise or a half-formed composition. More steps converge, then plateau. The cost is linear and the benefit is not, so the correct setting is the *lowest* one that passes your own quality bar — which you can only know by looking at both ends.

**Guidance.** How strongly each step is pushed toward your prompt rather than toward a plausible image. Higher guidance makes the output follow the prompt more literally and look less natural; pushed far enough it produces blown-out colour and repeated artefacts. Lower guidance gives variety and realism and drifts away from what you asked for. It is a second dial with its own trade, and like steps it has a usable range rather than a direction of improvement.

**Seed.** The starting noise. Fix it and the run becomes repeatable *on the same model version with the same settings*, which is the only handle on reproducibility these systems offer. Change it and you get a different sample from the same distribution. Many hosted APIs do not expose it at all, and even where they do, a version change upstream can move the output — so a fixed seed makes a comparison *possible*, not permanent.

**This is where the eval habit breaks.** Every other phase assumed that the same input gives you something you can compare. Here, the same prompt twice gives you two different pictures, so "diff the output" is not an available test. What you need instead is a rubric and a judge — the machinery from `finetuning/04` and `rag/05` — applied to a batch of samples rather than to a single artifact. That is the correct adaptation, and it is only obvious once you know the sampling is stochastic.

### Part 5 — The exchange rates, and the arithmetic they buy you

Here is what makes this phase concrete. Providers publish a **conversion between media units and tokens**, and once you have it, media pricing stops being a mystery and becomes a multiplication.

From the Gemini API pricing page, verified 2026-10:

| Output | Published rate |
|---|---|
| Image at 1024×1024 | 1,120 output tokens |
| Image at 2048×2048 | 1,680 output tokens |
| Image at 4096×4096 | 3,780 output tokens |
| Video at 720p | 5,792 output tokens per second |
| Audio | 25 output tokens per second |

Those are token counts, not prices, and the difference matters because **the rate per token differs by modality.** At the published standard rates on the same page — images at $30 per million output tokens, video at $17.50 per million, speech audio at $9 per million — you get:

- A 1024×1024 image: 1,120 tokens × $30 per million = **about 3.4 cents**.
- The same image at 2048×2048: 1,680 tokens → **about 5 cents**, which is exactly 1.5× the first, because the rate is unchanged.
- The same image at 4096×4096: 3,780 tokens → **about 11.3 cents**, which is 3.375× the first.
- Three minutes of narration: 180 seconds × 25 = 4,500 audio tokens → **about 4 cents**.

Notice that the image ratios are clean: quadrupling the pixel count of a square image by doubling each side multiplies the tokens by 1.5, and quadrupling each side multiplies them by 3.375. When the rate per token is constant, the money ratio equals the token ratio — which is a free self-check on any conversion you do.

And notice what is absent: the prompt. A longer prompt adds text-input tokens at the text rate, which on the same pages is a fraction of the image output rate. **You cannot meaningfully save money on a media request by editing the prompt.** You save money by changing the resolution or the duration, or by not generating the asset at all.

### Part 6 — Where the arithmetic bites

Now do the video case, because it is the one that surprises people and it is a two-step calculation.

A ten-second 720p clip is 10 seconds × 5,792 tokens per second = **57,920 output tokens**. Divide by the 1,120 tokens of a 1024×1024 image and you get **about fifty-two**: one ten-second clip consumes as many output tokens as fifty-two images.

But at the published rates it does *not* cost fifty-two images. At $17.50 per million for video output, 57,920 tokens is **about $1.01**, and at $30 per million for image output, 1,120 tokens is about $0.034 — a ratio of **about thirty**. So the same comparison gives you two different answers, 52 by token count and 30 by money, and both are right.

**That gap is the lesson.** A token count is not a price. Two modalities can have the same meter and very different rates, so any claim about cost that stops at the token count is a claim about a proxy, not about the bill. Get in the habit of writing down both numbers, and of saying which one you mean.

Two more consequences that change how you would build:

**Duration is a first-class cost, and you cannot stop early.** Token streaming lets you cut a runaway answer off at any point and pay only for what you got. A video generation is paid for the clip you asked for, and the only way to spend less is to ask for less — a shorter clip, a lower resolution, or fewer attempts.

**The iteration loop is the real expense.** With text you read the answer and try again for pennies. Here, the first request is expensive and every retry is the same price again, and you cannot inspect the output before paying for it. A task you expect to regenerate twenty times costs twenty times, not once. Price the loop, not the request, and if the number is unacceptable, that is a signal to reduce resolution, shorten the clip, or find a non-generative way to meet the requirement.

**Batch is a straight fraction, and both providers offer it.** OpenAI's batch tier halves the image rates, and the Gemini page lists batch at a 50% reduction across the same modalities. For an unattended pipeline that pre-generates assets overnight, that is a real halving for a latency cost you never see. For an interactive feature where someone is waiting, it is not available at all — the same trade the Cost track describes for text, and it behaves identically.

**The modality column is not decoration.** A single media request can produce several billed lines at different rates: text and thinking output at one rate, image output at another, image *input* at a third if you sent a reference image. On the pages verified here, image input is $8 per million against $30 per million for image output — so the second generation conditioned on the first is not billed as a fresh image, and an edit endpoint is a different cost shape from a generation endpoint. Read the usage object line by line before you conclude anything about which part of the request was expensive.

### Part 7 — What a hosted API does not tell you

You can observe: the model name, the size and duration parameters you set, the published rate, the token counts in the usage object, the wall-clock latency, and whether a seed parameter exists.

You cannot observe: **the internal method**, the number of denoising steps the provider used, whether the prompt reached the model as you wrote it, or how much of the pipeline your request never sees. Some image APIs return a revised prompt alongside the image; if yours does, read it, because it is the provider telling you what the model was actually asked for — and it is often not what you typed.

This is not a reason to distrust the API. It is a reason to keep three kinds of statement separate in your notes, because they have different failure modes:

- **Measured** — "this request reported 1,680 output tokens and cost this much." Checkable, dated, yours.
- **Published** — "the provider documents 5,792 tokens per second at 720p." Checkable at the source, and it will change.
- **Inferred** — "so it is probably a denoising model running about thirty steps." A reasonable guess, and still a guess.

The habit is the same one `safety-career/03` applies to alignment claims, and it is what separates a reader who can defend a number from one who can only repeat it.

### Part 8 — What this changes about your judgement

Four decisions the rest of the curriculum has no way of preparing you for:

**Resolution is a requirement, not a preference.** Decide the output size from where the asset will be used — a thumbnail, a hero image, a print asset — and then use the cheapest tier that satisfies it. Choosing the largest setting "so it is sharp enough" is choosing a multiplier on every generation and every retry, forever.

**Generate cheap to choose, expensive to keep.** Because you cannot see the result before paying, the sane pattern is to explore at the lowest usable setting until you have the composition you want, then regenerate only the keepers at the final setting. This is exactly the opposite of how you would tune a prompt, and it exists because the artifact and the bill are the same object here.

**Some media requirements are not generation problems.** If what you need is a real photograph of a real product, a generated one is a liability dressed as a solution — and it will be priced as an experiment. Knowing when a stock asset, a user upload, or an empty state is the correct answer is part of the skill.

**And the media you generate is generated content.** It is subject to the provider's terms in the same way your prompts and outputs are, which means the obligations in `safety-career/02` apply to it. A picture you produced from a user's uploaded face is personal information under a statute like RA 10173, and "we generated it, we did not collect it" is not a distinction the definitions in §3(g) make.

## Hands-on practice tasks

1. Find the published output rate for images on two providers and write down the rate and the token count for a single 1024×1024 image, with the date you checked. <!-- id: intern-08-diffusion-and-generated-media-t01 band: quick energy: low -->
2. Compute the output-token cost of one image at three resolutions at a single published rate, and write the ratio between the smallest and the largest. Check that the money ratio equals the token ratio when the per-token rate is unchanged. <!-- id: intern-08-diffusion-and-generated-media-t02 band: quick energy: normal -->
3. Generate the same prompt at three resolutions. Write your predicted cost for each before generating, then compare with the usage object. Record every figure with the date. <!-- id: intern-08-diffusion-and-generated-media-t03 band: focused energy: high -->
4. Generate the same prompt ten times at default settings. Count how many you would actually use, then compute your cost per *usable* asset rather than per generation. <!-- id: intern-08-diffusion-and-generated-media-t04 band: focused energy: normal -->
5. Look for a seed parameter. If your API exposes one, run the same prompt twice with the same seed and twice with different seeds, and write down exactly what was identical and what was not. If it does not, record that the comparison is unavailable to you. <!-- id: intern-08-diffusion-and-generated-media-t05 band: focused energy: high -->
6. Run a local image model with the step count exposed. Generate at one step, at the default, and at roughly double the default. Time each one and record both where the image stops visibly improving and where the time keeps rising. <!-- id: intern-08-diffusion-and-generated-media-t06 band: deep energy: high -->
7. Fix the seed and vary guidance across three settings. Record what changes in how literally the prompt is followed and how natural the result looks, and identify the setting where it breaks down. <!-- id: intern-08-diffusion-and-generated-media-t07 band: focused energy: normal -->
8. Compute the output tokens in a ten-second 720p clip and express that number as a multiple of one 1024×1024 image's tokens. Then compute the money ratio at both published rates and explain why the two answers differ. <!-- id: intern-08-diffusion-and-generated-media-t08 band: quick energy: normal -->
9. Generate a short clip and record the wall-clock time alongside the usage. State whether that latency is acceptable for a person waiting on the result, and for an unattended pipeline. <!-- id: intern-08-diffusion-and-generated-media-t09 band: focused energy: normal -->
10. Price three minutes of narration at 25 audio tokens per second and the published audio rate. Compare it to the same script sent as text, and say which line dominates. <!-- id: intern-08-diffusion-and-generated-media-t10 band: focused energy: normal -->
11. Use an edit endpoint on an image you already generated. Read the usage object and identify every billed line, naming which one your input image landed on and how its rate compares to image output. <!-- id: intern-08-diffusion-and-generated-media-t11 band: deep energy: high -->
12. Send one media request and list every modality line in its usage object with its rate. State which line dominates and by what multiple, then check whether your first guess about the expensive part was right. <!-- id: intern-08-diffusion-and-generated-media-t12 band: focused energy: high -->
13. Take a task of your own that needs images. Write the requirement in pixels, then price both the cheapest setting that meets it and the setting you would have chosen by default. Say what the difference costs at the volume you expect. <!-- id: intern-08-diffusion-and-generated-media-t13 band: deep energy: high -->
14. Price the loop rather than the request: for a task where you expect to regenerate until satisfied, estimate the total at five, twenty and fifty attempts. State which of those numbers you would actually be willing to spend, and what you would change if you were not. <!-- id: intern-08-diffusion-and-generated-media-t14 band: deep energy: high -->
15. Write a dated note with three lists: what you measured, what the provider published, and what you inferred about the internals. Put anything you could not determine in the third list and label it as unresolved. <!-- id: intern-08-diffusion-and-generated-media-t15 band: ongoing energy: high -->

## Common Pitfalls

**Optimising the prompt to reduce the bill.** For text this is the main lever; for media it is nearly nothing. Your prompt is text input at the text rate while the output is a fixed number of tokens set by the resolution. Shortening it changes the invoice by a rounding error and can change the picture a great deal.

**Treating resolution as a quality setting only.** It is a price multiplier applied to every generation and every retry. The 1K-to-4K step is 3.375× the output tokens, permanently, for a difference you may not need.

**Comparing two generations of the same prompt.** The output is a sample, not a function of the prompt, so there is nothing to diff. Use a rubric and a judge over a batch, or fix the seed — and know that a seed only pins the run to a specific model version with fixed settings.

**Assuming a fixed seed makes anything permanently reproducible.** A version change upstream, a different guidance setting, or a different machine can all move the output. A seed makes a comparison possible now, not reproducible forever.

**Pricing from the token count alone.** A ten-second clip is about fifty-two images by tokens and about thirty by money, because the rates differ per modality. Quote both, and say which one you mean, or your estimate will be wrong in a direction that is not obvious.

**Reading only the output line of a media request.** Text and thinking output, image output and image input can all appear at different rates in one response, and on the pages verified here image input is well under a third of image output. An edit is not billed like a generation.

**Iterating at the most expensive setting.** Exploration and finalisation are different jobs. Iterate where it is cheap, then regenerate the keepers at full size.

**Believing the model name tells you the mechanism.** A provider's documentation generally does not say how your image was produced. Learn the denoising family for judgement, and keep what you measured separate from what you assumed.

**Expecting the step dial on a hosted API.** Local tools expose steps, guidance and seed; hosted endpoints usually expose size and little else. The dials are still there — they are simply not yours to set, which is exactly why the fixed denominator is the resolution you choose.

**Assuming more steps is always better.** The benefit plateaus and the bill does not. The correct setting is the lowest that passes your bar, which you can only find by looking at both ends once.

**Believing a higher step count recovers lost detail.** Whatever the compact representation discarded is not available to be decoded. More steps refine what is there; they do not invent what is not.

**Using generated media where the requirement is a real artefact.** A generated product photo is a liability in a way a stock one is not, and it is billed as an experiment too.

**Forgetting that generated media is generated content.** It falls under the provider's data terms like your prompts do, and a picture derived from a person's face is personal information under a statute like RA 10173 whatever you call the process that made it.

## Deliverable / proof of work

Write `portfolio/model-internals/08-diffusion-and-generated-media.md` containing:

- **Two dated rate lookups** — the published output rate and token count for a 1024×1024 image from two providers, with the date on each figure and a note on what would need re-checking.
- **The resolution conversion** — one image at three resolutions, each with its token count and its money cost at a stated rate, plus the ratio between the smallest and largest and a demonstration that the money ratio equals the token ratio when the rate is constant.
- **The prediction you checked** — your predicted cost for each of three resolutions, written before generating, next to the usage object you got.
- **Cost per usable asset** — ten generations of one prompt, how many you would use, and the arithmetic that turns the per-generation price into a per-usable-price.
- **The step experiment** — timings and images at one step, at the default and at double, with the point where quality stopped moving and the point where time did not.
- **The seed result** — what was identical with the same seed, what was not, and — if the API exposed no seed — a statement that the comparison is unavailable and what you used instead.
- **The video arithmetic** — the ten-second clip's tokens, its cost at the published video rate, both ratios against a 1024×1024 image, and one paragraph on why the two ratios differ.
- **The modality breakdown** — one media request's usage lines with their rates, which line dominated, and whether your prior guess was right.
- **The loop estimate** — total cost at five, twenty and fifty attempts for one of your own tasks, and what you would change if that number was unacceptable.
- **A three-list dated note** — measured, published, inferred — with everything you could not determine placed in the third list and marked unresolved.

## Checklist

- [ ] I can explain what scales a media bill without using the word "tokens" unqualified <!-- id: intern-08-diffusion-and-generated-media-c01 energy: normal -->
- [ ] I can say why shortening a prompt saves almost nothing on an image request <!-- id: intern-08-diffusion-and-generated-media-c02 energy: normal -->
- [ ] I can describe the denoising loop and say why one output costs many model calls <!-- id: intern-08-diffusion-and-generated-media-c03 energy: normal -->
- [ ] I can explain why generation is refinement rather than drawing, and what that predicts about failures <!-- id: intern-08-diffusion-and-generated-media-c04 energy: high -->
- [ ] I can say why the denoising happens in a compressed representation <!-- id: intern-08-diffusion-and-generated-media-c05 energy: normal -->
- [ ] I know why a higher step count cannot recover detail the representation discarded <!-- id: intern-08-diffusion-and-generated-media-c06 energy: high -->
- [ ] I can name the three dials and what each one trades away <!-- id: intern-08-diffusion-and-generated-media-c07 energy: low -->
- [ ] I have run a model at both ends of the step dial and seen where the benefit stops <!-- id: intern-08-diffusion-and-generated-media-c08 energy: high -->
- [ ] I can convert a media unit into tokens using a published rate, and say when I checked it <!-- id: intern-08-diffusion-and-generated-media-c09 energy: normal -->
- [ ] I have predicted a media cost before generating and checked it against the usage object <!-- id: intern-08-diffusion-and-generated-media-c10 energy: high -->
- [ ] I can compute a cost per usable asset rather than per generation <!-- id: intern-08-diffusion-and-generated-media-c11 energy: normal -->
- [ ] I can explain why the token ratio and the money ratio between two modalities differ <!-- id: intern-08-diffusion-and-generated-media-c12 energy: high -->
- [ ] I read every modality line in a media usage object, not only the output <!-- id: intern-08-diffusion-and-generated-media-c13 energy: normal -->
- [ ] I know that image input and image output carry different rates on the same request <!-- id: intern-08-diffusion-and-generated-media-c14 energy: normal -->
- [ ] I choose output resolution from the requirement rather than from the maximum <!-- id: intern-08-diffusion-and-generated-media-c15 energy: normal -->
- [ ] I explore at a low setting and regenerate only the keepers at full size <!-- id: intern-08-diffusion-and-generated-media-c16 energy: high -->
- [ ] I price the iteration loop, not the single request, before committing to a generative feature <!-- id: intern-08-diffusion-and-generated-media-c17 energy: high -->
- [ ] I know that batch pricing is a straight fraction traded for latency <!-- id: intern-08-diffusion-and-generated-media-c18 energy: low -->
- [ ] I can explain why two generations of one prompt cannot be compared as a diff <!-- id: intern-08-diffusion-and-generated-media-c19 energy: high -->
- [ ] I know what a fixed seed does and does not guarantee <!-- id: intern-08-diffusion-and-generated-media-c20 energy: high -->
- [ ] I can say what a hosted API does not reveal about its internals, and label my inference as inference <!-- id: intern-08-diffusion-and-generated-media-c21 energy: normal -->
- [ ] I know when the honest answer is not to generate the asset at all <!-- id: intern-08-diffusion-and-generated-media-c22 energy: normal -->
- [ ] I treat generated media as generated content under the provider's terms <!-- id: intern-08-diffusion-and-generated-media-c23 energy: normal -->

## Quiz

### Q1. You rewrite a sixty-word image prompt into four hundred words to improve the result. What happens to the bill? <!-- id: intern-08-diffusion-and-generated-media-q01 energy: normal -->

- [ ] It rises sharply, because the prompt is re-read at every denoising step
- [x] It moves by a rounding error, because the prompt is text input while the output is billed by the size of the image
- [ ] It falls, because a more specific prompt needs fewer steps
- [ ] It is unchanged in every case, because image models do not bill input tokens

**Why:** The output line is fixed by the resolution you chose, and the prompt is a few hundred text-input tokens at a rate far below the image output rate. So prompt length is nearly free and resolution is the lever. The first option is the tempting error: it is true that each step conditions on your prompt, but the prompt is not re-billed per step, and the step count is not something you set through the API at all. The last option is simply false — media requests do bill input, and multimodal input carries its own line.

### Q2. A ten-second 720p clip is about 57,920 output tokens and costs about $1.01, while a 1024×1024 image is 1,120 tokens and costs about $0.034. The clip is therefore about fifty-two times the image by tokens but about thirty times by money. Which conclusion is correct? <!-- id: intern-08-diffusion-and-generated-media-q02 energy: high -->

- [ ] One of the two figures must be wrong, since they describe the same comparison
- [ ] The token comparison is the real one, because tokens are the unit the meter records
- [ ] The money comparison is the real one, because tokens are an implementation detail
- [x] Both are right, because the two modalities have different prices per token, so a token count is a proxy for cost rather than a measure of it

**Why:** Video output is priced per million tokens at a lower rate than image output, so equal token counts do not imply equal money. Neither number is wrong and neither is automatically the one to quote — the error is quoting one while meaning the other. The practical rule is to write down both and say which you mean, because a cost estimate that stops at the token count is an estimate of a proxy.

### Q3. You generate the same prompt twice and get two different pictures. What is the correct way to test whether a prompt change made the output better? <!-- id: intern-08-diffusion-and-generated-media-q03 energy: high -->

- [ ] Generate once with each prompt and compare the two images directly
- [ ] Run each prompt many times and diff them pixel by pixel to find the stable part
- [x] Define a rubric and apply it to a batch of samples from each prompt, because the output is a sample rather than a function of the input
- [ ] Set the seed to a fixed value and then compare the two single images

**Why:** The starting noise is a random draw, so two single images differ for reasons unrelated to your change — comparing them tests nothing. A batch scored against a written rubric is the sampling-correct answer, and it is the same movement from artifact to distribution that the evaluation phases make. A fixed seed is genuinely useful for holding one variable still, but it pins the run to one model version with fixed settings, so it narrows a comparison rather than settling it, and on its own it still leaves you comparing one sample against one sample.

### Q4. A teammate proposes shipping a feature that generates a video on each user request, and asks you to review the cost model. What is the most important thing to say? <!-- id: intern-08-diffusion-and-generated-media-q04 energy: high -->

- [ ] The cost is fine because video output tokens are cheaper per token than image tokens
- [ ] The prompt should be shortened so the model does less work
- [ ] The main risk is that the user can stop the generation early and lose the work
- [x] Duration and resolution set the price and the user cannot be served a partial result, so the retry loop rather than the single request is what you must price

**Why:** Video is billed per second of output at a rate whose headline figure hides a per-resolution conversion, so duration is the dominant term and cannot be trimmed after the fact. There is no useful partial output, so every retry costs the full price and the user pays latency in silence. The first option inverts the arithmetic — video is cheaper *per token* than image output, which is exactly why the token count flatters it — and shortening the prompt changes the bill by a rounding error.

### Q5. You are asked to state how a hosted provider generates its images. Which answer is defensible? <!-- id: intern-08-diffusion-and-generated-media-q05 energy: normal -->

- [ ] "It is a diffusion model running about thirty denoising steps."
- [ ] "It is not a diffusion model, because the API does not expose a step count."
- [ ] "It is a transformer, so the same architecture as a language model."
- [x] "I can state the billed unit and the published rate from measurement, and beyond that the documentation does not say which method produced the image."

**Why:** You can measure tokens, resolution, latency and the presence or absence of a seed, and you can read a published rate — that is a real answer with real evidence behind it. The internal method is not part of the API surface, and several methods produce images today, so any confident architectural claim is inference presented as knowledge. Absence of a step parameter is not evidence of absence of denoising either: hosted endpoints simply do not expose the dials, which is a fact about the interface rather than about the model.

### Q6. A local image tool generates a blurry result containing small illegible text. Someone suggests doubling the step count. What is the most accurate response? <!-- id: intern-08-diffusion-and-generated-media-q06 energy: high -->

- [x] More steps refine what the representation already holds but cannot restore detail it discarded, so a larger output and an edit pass are the likelier fixes
- [ ] More steps will fix it, because the denoiser is still converging toward the true image
- [ ] Fewer steps will fix it, because the extra iterations are introducing the blur
- [ ] Nothing will fix it, because current models cannot render text at all

**Why:** The loop runs in a compressed representation with finite capacity, so fine high-frequency structure — small text above all — is exactly what is least likely to have survived the encode. Steps converge the approximation toward the best image *available from that representation*, which is why the benefit plateaus while the bill keeps rising. The honest expectation is that steps change little here and that resolution or an editing pass is where the gain is, and the claim that no model can render text contradicts what these models are documented as improving.

## You're ready to move on when...

You can look at a request for a generated image, clip or narration and state its cost before sending it, by converting the output's size through a published rate rather than by guessing from the prompt. You can explain why the prompt is nearly free and the resolution is the multiplier, and you have checked a prediction against a usage object. You have run a denoising model at both ends of the step dial and seen where quality stopped improving. You can say why two generations of one prompt cannot be compared as a diff, and what you would use instead. And you can divide your own notes into what you measured, what the provider published, and what you inferred — with the inference labelled.

## Free vs Paid

### What's free is enough

The whole mechanism half of this phase costs nothing. The Hugging Face diffusion course and the `diffusers` library are free and open, and a local model exposes the step count, guidance and seed that no hosted endpoint will show you — which makes the single most valuable experiment in the phase, the step dial at both ends, a zero-cost one. The published pricing pages are free to read, and the two rate lookups plus all the arithmetic in Part 5 can be done from them with a calculator. The most important output, the three-list note separating measurement from inference, is a page of writing.

### What a paid tier adds

Paid access buys the thing a local model cannot give you: **the hosted accounting**. The usage object, the modality lines, the per-resolution rates in practice rather than in a table, the edit endpoint and its image-input line, and the batch discount as something you can actually observe. It also buys the video case at all, since a ten-second clip needs infrastructure no laptop has. If your goal is to build a product that generates media, this is the part you cannot substitute — as is a paid tier for the TTS comparison, which is where narration turns out to be cheap and surprising.

### When it's worth paying

Pay when you have a specific feature in mind and need the real per-unit numbers rather than the published approximations — and then pay as little as possible while getting them. Generate at the lowest resolution that meets the requirement, explore before finalising, and put anything unattended through the batch tier for the straight halving. Do not pay to raise resolution "for quality" before you have decided where the asset will be displayed, and do not pay for a generated asset where a stock image, a user upload, or an empty state would meet the requirement honestly. The single most expensive habit in this phase is iterating on a feature at its final output size, and the cheapest corrective is one afternoon of exploring at the smallest one.

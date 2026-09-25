---
id: found-09-multimodal-and-vision
track: foundations
phase: 9
order: 90
title: Multimodal and Vision
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/foundations/09-multimodal-and-vision.md
exit_criteria: >
  You can send an image to a model, explain why it costs what it costs, and
  predict before testing which visual tasks it will fail. You can decide, with a
  measurement rather than an instinct, whether a task belongs to a vision model
  or to OCR and code.
---

## Goal of this phase

Every phase so far has treated the model's input as text. This one removes that assumption, and the interesting thing is how little changes and how much breaks.

**Very little changes in the mechanics.** An image arrives as tokens. It enters the same context window, competes for the same budget from Phase 3, and travels through the same attention layers you studied in Phase 4. Nothing about the architecture is special-cased for you.

**A great deal changes in practice.** Text tokenizes by rules you can reason about — roughly four characters to a token, and you can predict where the boundaries fall. An image tokenizes by *patching*, and the count is set by the provider's resolution policy rather than by anything in the picture. That single fact is behind almost every surprise in this phase: a screenshot that costs more than a novel, a chart the model reads confidently and wrongly, and a table of numbers that survives the round trip only if you asked for it in the right way.

By the end you will have sent real images, measured what they cost against the same content as text, reproduced at least two failure modes from the mechanism rather than by accident, and made a written routing decision — with numbers — about when a vision model is the right tool and when OCR plus code is.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1 is reading and getting one image through the API. Days 2–4 are the practice tasks. Day 5 is the write-up and the routing decision.

Budget an extra hour if you have never encoded a file to base64 or handled a binary payload in an HTTP request. That is the only genuinely new mechanical skill here.

## Skills you'll gain

- Send an image to a model and say what actually crossed the wire
- Explain how an image becomes tokens, and why the count is set by resolution policy rather than by file size
- Estimate the token cost of an image before sending it, and compare it against the same content as text
- Predict which visual tasks will fail, from the mechanism, before running them
- Extract structured data from a screenshot and validate it with a schema rather than trusting the prose
- Recognise the failure modes that look like model weakness but are resolution or framing problems
- Decide between a vision model, OCR plus code, and a text-only approach, and defend the choice with a measurement
- Say honestly where multimodal input is not the right tool, including the cases where it is a privacy hazard

## Specific topics to learn

### How an image becomes tokens

- Patching: why the image is cut into a grid rather than read as pixels
- The encoder that turns patches into vectors, and the projection into the language model's space
- Why the projection is lossy, and what that predicts about fine detail
- Tiling and resolution policies, and why the token count is provider-set
- Why file size and token count are almost unrelated — a compressed PNG and an uncompressed BMP of the same picture cost the same

### The cost of seeing

- Comparing an image's token count against the same information as text
- Why a high-resolution screenshot can exceed a long document
- The `detail`-style controls that exist and what each one trades
- Why resizing before sending is usually the largest single saving available
- Reading the usage field to confirm what you were actually billed for

### Sending an image

- Base64 inlining versus a URL reference, and when each is right
- The request shape: content as a list of typed parts rather than a string
- Interleaving text and images in one message, and why ordering matters
- Multiple images in one request, and what that does to the budget
- Why a URL reference is a fetch by the provider, with its own failure modes

### What vision is genuinely good at, and what it is not

- Reading large, clear text in an image — the reliable case
- Describing a scene at a general level — reliable but low precision
- Counting objects, reading small text, and reading dense tables — the predictable failures
- Fine spatial relations: "left of", "above", precise coordinates
- Why asking for coordinates is a different and much harder task than asking for a description

### Images as input to a pipeline

- Screenshot to structured data, and why the schema is what makes it safe
- Validating extracted values in code rather than trusting the model's confidence
- Where OCR plus deterministic parsing beats a vision model outright
- Using a vision model to locate a region and code to read it precisely
- Handling the case where the model invents a plausible value for an unreadable field

### The parts that are not about accuracy

- Images and privacy: what you are uploading, and to whom
- Screenshots that contain credentials, personal data, or someone else's information
- Provider retention and training terms for uploaded media
- Why "it is only a screenshot" is the wrong instinct
- Accessibility: describing images as a task in its own right

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | The language the image pipeline is written in | Free | https://www.python.org/downloads/ | Send your first image and read the usage numbers | Any language with an HTTP client |
| Pillow | Inspect and resize images, so you control the token count | Free/open-source | https://python-pillow.org/ | Resize a screenshot and measure what it saves | ImageMagick on the command line |
| `base64` (standard library) | Inline an image in a request without a URL | Free, standard library | https://docs.python.org/3/library/base64.html | Encode a local file and send it | A hosted URL, if the provider can fetch it |
| A vision-capable model | Something that can actually see | Free tier varies, and credit terms change — check current pricing | https://ai.google.dev/ | Compare its reading of a chart against your own | A local vision model served by Ollama |
| Ollama with a vision model | See the same pipeline run with no key and no per-image bill | Free | https://ollama.com/ | Repeat one task locally and compare the failure modes | A provider free tier |
| Tesseract OCR | The deterministic baseline that vision models are measured against | Free/open-source | https://github.com/tesseract-ocr/tesseract | Run OCR on the same image and diff the two extractions | Any OCR library, or the provider's document endpoint |
| Pydantic | Validate extracted fields instead of trusting them | Freemium, free tier | https://docs.pydantic.dev/ | Reject a hallucinated value before it reaches your data | `jsonschema`, or hand-written checks |
| `python-dotenv` | Keep the key out of the source, as in Phase 8 | Free | https://github.com/theskumar/python-dotenv | Reuse the pattern rather than re-deriving it | Environment variables set by your shell |
| An image editor or screenshot tool | Produce the controlled test images the tasks need | Free | https://www.gimp.org/ | Build the same content at three resolutions | Your operating system's own screenshot tool |

## Free/cheap resources

- **OpenAI — Images and vision guide** — https://developers.openai.com/api/docs/guides/images-vision
- **OpenAI — Image input cost calculator** — https://developers.openai.com/api/docs/guides/image-cost-calculator
- **Anthropic — Vision** — https://platform.claude.com/docs/en/build-with-claude/vision
- **Google — Gemini image understanding** — https://ai.google.dev/gemini-api/docs/image-understanding
- **Hugging Face — Vision-language models** — https://huggingface.co/docs/transformers/main/en/tasks/image_text_to_text
- **Tesseract OCR documentation** — https://tesseract-ocr.github.io/
- **Pillow — Image resizing** — https://pillow.readthedocs.io/en/stable/reference/Image.html
- **MDN — Base64 encoding** — https://developer.mozilla.org/en-US/docs/Glossary/Base64
- **OWASP — Privacy risks in machine learning** — https://owasp.org/www-project-top-ten/

## Lesson: The Model Does Not See What You See

### Part 1 — Why an image is not a picture to the model

Start with what is physically true, because the rest of the phase follows from it.

When you send an image to a vision model, the image is **not** handed to the language model as a grid of pixels. It is cut into a grid of **patches** — think of a tiled mosaic — and each patch is pushed through a separate encoder network that turns it into a vector. Those vectors are then **projected** into the same representation space the language model already uses for text, and from that point on they are simply more entries in the context, sitting alongside your words.

Two consequences follow immediately, and they explain most of what surprises people.

**First: the model never sees pixels, so it never sees detail the projection did not carry.** The encoder compresses each patch into a fixed number of numbers. If the patch contained a word rendered in eight pixels of height, that word is competing for room with everything else in the patch. The projection is the bottleneck, and it is lossy in a specific and predictable direction — small text, fine spatial detail, and exact counts degrade before gross content does.

> Think of it as describing a photograph to someone down a bad phone line. You will get across "a dog on a beach". You will not get across "the licence plate reads XK-4471". The failure is not that the listener is unintelligent. It is that the channel cannot carry that much detail, and no amount of asking again will put it there.
>
> Where the analogy breaks: a phone line degrades everything roughly equally, whereas the projection degrades **unevenly** — large clear text often survives perfectly while a dense table of small numbers turns to plausible noise. The unevenness is what makes some visual tasks reliable and others hopeless, and it is why you predict per task rather than per model.

**Second: the token count is set by policy, not by your file.** The provider decides how to tile and resize your image, and the number of patches that produces is what you pay for. The same photograph as a 40 KB JPEG and a 4 MB PNG can cost **the same** number of tokens, because both are resized to the same grid. Meanwhile a large screenshot can cost far more than a page of text.

**This is the single most counter-intuitive fact in the phase, so state it plainly: file size is not the bill. Resolution is the bill.**

### Part 2 — Doing the arithmetic before you send

You cannot reason about cost without a number, so let us build one. The exact constants are provider-specific and change — check the current documentation — but the *shape* of the calculation is stable, and that shape is what you should carry.

```text
An image is resized to fit a token grid. Roughly:

  tokens ≈ (width_px / patch_px) × (height_px / patch_px) + base_tokens

For a 1024 × 1024 image at a 32-pixel patch, ignoring the base:
  tokens ≈ (1024/32) × (1024/32) = 32 × 32 = 1,024 tokens

The same image downscaled to 512 × 512:
  tokens ≈ 16 × 16 = 256 tokens      <- one quarter the cost

At roughly 0.75 words per token for English prose, 1,024 tokens is
about 768 words — so one 1024px screenshot can cost more than a page
of written text, and halving each dimension divides the price by four.
```

**Do not memorise these constants.** They differ between providers, several apply an upper cap after which extra resolution is discarded, and they have changed more than once. What you should memorise is the **relationship**: cost scales with the *area* of the image, so a linear reduction in each dimension is a quadratic saving. Halving width and height is a fourfold cut. That relationship has survived every provider change so far, because it falls out of patching, and patching is how this works.

**And the practical corollary, which is where most of the money is:** the largest single saving available to you is usually **resizing before you send**. If the model is reading a paragraph of text, sending a 3000-pixel-wide screenshot at full resolution buys nothing and costs nine times what a 1000-pixel version would.

### Part 3 — Predicting failure instead of discovering it

You now have enough mechanism to *predict* which tasks will work. Do this before you test, because a prediction you then confirm teaches far more than a lucky guess.

Work through the failure modes in order of how often they bite:

**Counting.** Asked to count objects, a vision model is unreliable in a way that feels arbitrary, because the patches do not preserve a clean one-object-one-token mapping and the model has no counting mechanism — it has a pattern-completion mechanism that was trained on descriptions of counts. **Never rely on a vision model for a number that matters.** Have it produce a structured list, then count the list in code.

**Small text.** The failure is resolution, not language. If the text occupies few enough pixels that the patch cannot represent the letterforms distinctly, no prompt fixes it. The correct responses are to send a larger image, to crop to the region of interest, or to use OCR.

**Dense tables.** The model will often produce a beautifully formatted table with one or two values silently wrong. The structure survives; the digits do not. This is the most dangerous failure mode in the phase, because the output *looks* like high-quality work.

**Fine spatial relations.** "Which is to the left", "how far apart", "give me the bounding box" are different and much harder tasks than description. Rough spatial language is often fine; precise coordinates usually are not.

**Reading values that are not present.** Asked for a field that is missing, a vision model may supply a plausible value rather than an empty one. This is the vision form of the hallucination you met in Phase 7, and it is why extraction must end in schema validation rather than trust.

> **The rule that follows:** treat a vision model as a **probabilistic parser**, not an oracle. It is excellent at turning an image into candidate text, and unreliable at asserting that the text is right. So let it produce candidates, and put deterministic code after it to check them — which is exactly the chain you built in the prompting track, now with an image at the front.

### Part 4 — Screenshot to structured data, done properly

This is the workflow that pays for the phase, so build it in the shape that survives contact with real data. Notice that **only the first step involves a model.**

```text
1. SEND the image, asking for a specific schema and nothing else.

2. RECEIVE structured output (Phase 4 of the prompting track).

3. VALIDATE against the schema in code:
     - correct types?
     - required fields present?
     - values in plausible ranges?
     - a total that should equal the sum of its parts... does it?

4. FLAG rather than accept anything that failed validation.

5. FALL BACK to OCR plus parsing for the fields the model could not read.
```

**Step 3 is the whole point and it is the step people skip.** A cross-field check is worth more than any prompt: if a receipt lists line items and a total, then `sum(items) == total` is an arithmetic invariant that catches a misread digit regardless of how confident the model sounded. You are not asking whether the model is trustworthy; you are asking whether the *data* is internally consistent, which is a question code can answer exactly.

**Step 5 is the honest one.** OCR is deterministic, cheap, and bad at exactly the things vision models are good at — it needs clean, flat, high-contrast text and gives up on a photographed receipt at an angle. A vision model reads the awkward image and struggles with precision; OCR reads precision and struggles with awkwardness. **The best pipeline uses each where it is strong**, and the measurement in the practice tasks is how you find your own split.

### Part 5 — The part that is not about accuracy at all

One thing in this phase has no technical mitigation, so it needs saying plainly.

**Every image you send leaves your machine.** It goes to a provider, and it is subject to that provider's retention and training terms — the same documents you read in the cost and safety tracks, now applying to something far more revealing than a paragraph of text. A screenshot is not a neutral object. It routinely contains session tokens in a browser bar, a customer's name and address, a colleague's Slack messages, medical or financial detail, and someone else's face.

**The instinct to resist is "it is only a screenshot".** Three specific hazards:

- **Credentials.** Screenshots of dashboards and terminals capture API keys and session cookies. You have already built the habit of keeping keys out of git; extend it to keeping them out of images.
- **Third parties.** The people in your screenshots did not consent to being sent to a model provider, and under the data-protection principles you met in the safety track, that is your responsibility rather than the provider's.
- **Retention you cannot see.** A free tier with generous vision limits may be generous precisely because the media is used for training. Check the terms for the tier you are actually on, using the same individual-versus-business distinction from the vibecoding track, rather than assuming that paying exempts you.

**The mitigation is procedural, not technical:** crop to the region you need, redact before sending rather than after, prefer a locally served vision model for anything sensitive, and decide consciously rather than by default. That is the same discipline as the API-key drill in Phase 8, applied to a medium where the leak is easier to make and harder to notice.

## Hands-on practice tasks

1. Send one image to a vision model and print the full usage object. Record the input token count and confirm it is far larger than the prompt text alone. <!-- id: found-09-multimodal-and-vision-t01 band: quick energy: low -->
2. Take one screenshot and export it at three sizes — full resolution, half each dimension, quarter each dimension. Send all three and record the token counts. Verify that the counts scale with area rather than with file size. <!-- id: found-09-multimodal-and-vision-t02 band: focused energy: normal -->
3. Compress the same image to a small JPEG and convert a copy to an uncompressed BMP. Send both and compare the token counts. Write down what this proves about what you are actually billed for. <!-- id: found-09-multimodal-and-vision-t03 band: focused energy: normal -->
4. Send a page of text as an image and then as plain text. Compare token counts and compare accuracy on a question that requires reading a specific sentence. <!-- id: found-09-multimodal-and-vision-t04 band: focused energy: normal -->
5. Generate an image containing exactly 12 distinct objects — dots or icons, laid out clearly. Ask the model to count them, five times. Record every answer and the spread. <!-- id: found-09-multimodal-and-vision-t05 band: deep energy: high -->
6. Ask the same model to return the objects as a structured list instead, then count the list in code. Compare the reliability of the two approaches and write one sentence on why they differ. <!-- id: found-09-multimodal-and-vision-t06 band: deep energy: high -->
7. Build a table image with six rows of numbers where you know every value. Ask the model to extract it as JSON. Diff the extraction against ground truth and count the errors. <!-- id: found-09-multimodal-and-vision-t07 band: deep energy: high -->
8. Run the same table image through Tesseract. Compare its output against the vision model's — in accuracy, in failure mode, and in cost per image. <!-- id: found-09-multimodal-and-vision-t08 band: deep energy: high -->
9. Send a chart and ask two different questions: describe the trend, then state the value of a specific series at a specific point. Record which one is reliable and connect it to the projection argument in Part 1. <!-- id: found-09-multimodal-and-vision-t09 band: focused energy: high -->
10. Produce an invoice image with a deliberate mismatch — line items that do not sum to the stated total. Ask the model to extract it, then write the cross-field check that catches the inconsistency. <!-- id: found-09-multimodal-and-vision-t10 band: deep energy: high -->
11. Ask the model for a field that is genuinely absent from your image. Observe whether it returns an empty value or invents a plausible one. Repeat three times. <!-- id: found-09-multimodal-and-vision-t11 band: focused energy: high -->
12. Crop a small region out of a dense image and send only the crop. Compare the reading accuracy against sending the whole image, and note the token difference. <!-- id: found-09-multimodal-and-vision-t12 band: focused energy: normal -->
13. Send two images in one request and ask a question that requires comparing them. Confirm it works, then record the combined token cost against sending them separately. <!-- id: found-09-multimodal-and-vision-t13 band: focused energy: normal -->
14. Take the same image, send it once inlined as base64 and once by URL. Confirm the results match, then note which approach you would use for a private customer document and why. <!-- id: found-09-multimodal-and-vision-t14 band: focused energy: normal -->
15. Repeat one of the earlier tasks against a locally served vision model through Ollama. Compare accuracy and note where the smaller model fails first. <!-- id: found-09-multimodal-and-vision-t15 band: deep energy: normal -->
16. Audit five screenshots you would plausibly send in your own work. For each, list every piece of sensitive information visible and write the specific crop or redaction that would make it safe. <!-- id: found-09-multimodal-and-vision-t16 band: focused energy: high -->
17. Write the routing decision for one real task of your own: vision model, OCR plus code, or text only. Include the measurement that justifies it and the cost per thousand items. <!-- id: found-09-multimodal-and-vision-t17 band: ongoing energy: high -->

## Common Pitfalls

**Assuming file size predicts cost.** It does not. Both a compressed JPEG and a raw BMP of the same picture are resized to the same grid and cost the same. Resolution and the provider's tiling policy set the bill.

**Sending full-resolution screenshots to read a sentence.** This is the most common way to overpay in this phase. If the model only needs to read text, downscale first and confirm the reading still works. The saving is quadratic in the dimension you shrink.

**Trusting a vision model to count.** It has no counting mechanism; it has a pattern-completion mechanism trained on descriptions of counts. Ask for a list and count the list in code.

**Accepting a beautifully formatted table.** Structure survives the projection better than digits do, so a wrong value arrives looking exactly like a right one. Always diff against known values at least once before you trust the pipeline.

**Skipping schema validation because the model sounded confident.** Confidence is not evidence. A cross-field arithmetic check catches misread digits that no amount of prompt engineering prevents, and it costs three lines.

**Assuming a bigger image is always more accurate.** Past the provider's cap, extra resolution is discarded — you pay the same and gain nothing. Below the cap, more resolution usually helps, which is exactly why cropping to the region of interest beats sending the whole page.

**Reading a resolution failure as a reasoning failure.** If the model misreads small text, the problem is the pixels, not the prompt. Rewriting the instruction will not help; sending a larger or cropped image will.

**Uploading whatever is on screen.** Screenshots capture keys, session tokens, and other people's data. Crop and redact before sending, and treat a screenshot as a document that leaves your control.

**Assuming a paid tier means your images are not retained.** The individual-versus-business distinction you met in the vibecoding track applies to media too. Read the terms for the tier you are on.

**Reaching for vision when OCR and code would win.** If the text is clean, flat, and high-contrast, deterministic OCR is cheaper, faster, and auditable. Use the model for the awkward input, and code for the precise one.

**Asking for bounding boxes when you wanted a description.** Precise coordinates are a much harder task than scene description. Ask for what you need at the precision you actually require.

**Forgetting that images consume the same context budget as everything else.** Multiple large images in one conversation can exhaust a window that felt generous with text, which is the Phase 3 budget problem arriving in a new costume.

**Comparing providers on price per image without checking the resolution policy.** A cheaper per-image rate at a lower effective resolution can be the more expensive choice once you send a larger image to compensate.

## Deliverable / proof of work

Write `portfolio/foundations/09-multimodal-and-vision.md` containing:

- **Your working image pipeline** — one script that sends an image, prints the usage object, and validates the structured output against a schema. Include the command that runs it.
- **A cost table you measured yourself**: one screenshot at three resolutions and two compression levels, with the token count and computed cost for each, and one sentence stating the relationship you confirmed between resolution and price.
- **The same content as image and as text** — token counts and reading accuracy side by side, with your conclusion about when each is the right input.
- **The counting experiment** — the image you built, the five counts you received, and the structured-list-plus-code result. Your one-sentence explanation of why they differ.
- **A table extraction with a diff against ground truth** — the number of values you supplied, the number the model got wrong, and the specific wrong values. Then the same table through Tesseract, compared on the same axes.
- **Your cross-field validation code**, and a demonstration that it rejects the deliberate invoice mismatch from task 10.
- **One negative result** — a genuine attempt where vision was the wrong tool, with the measurement that showed it.
- **A privacy audit** of five real screenshots from your own work, listing for each the sensitive content visible and the crop or redaction that would make it safe.
- **A routing decision** for one real task, choosing between vision, OCR plus code, and text only, with its cost per thousand items and the measurement that justifies it.

## Checklist

- [ ] I can explain what a patch is and why an image becomes a grid of them rather than a set of pixels <!-- id: found-09-multimodal-and-vision-c01 energy: low -->
- [ ] I can explain why the projection from encoder to language model is lossy, and what that predicts <!-- id: found-09-multimodal-and-vision-c02 energy: normal -->
- [ ] I can state that file size does not determine token count and say what does <!-- id: found-09-multimodal-and-vision-c03 energy: normal -->
- [ ] I have measured that halving each dimension divides the token cost by about four <!-- id: found-09-multimodal-and-vision-c04 energy: normal -->
- [ ] I have sent an image and read the input token count from the usage object rather than estimating it <!-- id: found-09-multimodal-and-vision-c05 energy: normal -->
- [ ] I can estimate an image's token cost before sending it, to the right order of magnitude <!-- id: found-09-multimodal-and-vision-c06 energy: normal -->
- [ ] I can send an image both inlined as base64 and by URL reference, and say when each is appropriate <!-- id: found-09-multimodal-and-vision-c07 energy: low -->
- [ ] I can predict, before testing, which of two visual tasks will fail and why <!-- id: found-09-multimodal-and-vision-c08 energy: high -->
- [ ] I have reproduced the counting failure and shown that a structured list plus code is reliable <!-- id: found-09-multimodal-and-vision-c09 energy: high -->
- [ ] I have diffed a vision extraction against known values and found at least one error <!-- id: found-09-multimodal-and-vision-c10 energy: high -->
- [ ] I can explain why dense tables fail in the digits while surviving in structure <!-- id: found-09-multimodal-and-vision-c11 energy: normal -->
- [ ] I have compared a vision extraction against Tesseract OCR on accuracy, failure mode and cost <!-- id: found-09-multimodal-and-vision-c12 energy: high -->
- [ ] I validate extracted values against a schema before they reach anything downstream <!-- id: found-09-multimodal-and-vision-c13 energy: normal -->
- [ ] I have written a cross-field check that caught a deliberate inconsistency in the data <!-- id: found-09-multimodal-and-vision-c14 energy: high -->
- [ ] I know what happens when I ask for a field that is absent, and I check for invented values <!-- id: found-09-multimodal-and-vision-c15 energy: normal -->
- [ ] I can explain why asking for precise coordinates is harder than asking for a description <!-- id: found-09-multimodal-and-vision-c16 energy: normal -->
- [ ] I resize or crop before sending when full resolution adds nothing <!-- id: found-09-multimodal-and-vision-c17 energy: normal -->
- [ ] I have run one task against a locally served vision model with no upload to a provider <!-- id: found-09-multimodal-and-vision-c18 energy: normal -->
- [ ] I can name the sensitive content a screenshot can carry and the redaction that removes it <!-- id: found-09-multimodal-and-vision-c19 energy: high -->
- [ ] I have checked the retention and training terms for the tier I am actually using <!-- id: found-09-multimodal-and-vision-c20 energy: normal -->
- [ ] I can state a case where OCR plus code beats a vision model, with a measurement <!-- id: found-09-multimodal-and-vision-c21 energy: high -->
- [ ] I have written a routing decision for a real task of my own, with its cost per thousand items <!-- id: found-09-multimodal-and-vision-c22 energy: high -->

## Quiz

### Q1. You send a photograph as a 4 MB PNG and the same photograph as a 40 KB JPEG. What do you expect the token counts to be? <!-- id: found-09-multimodal-and-vision-q01 energy: normal -->

- [ ] The PNG costs about 100 times more, in proportion to file size
- [x] They are close to the same, because the provider resizes both to the same token grid and file size is not what is billed
- [ ] The JPEG costs more, because compression artifacts cost tokens to describe
- [ ] The count depends on the image content, so no prediction is possible

**Why:** Token count is determined by the resolution grid the provider applies, not by the bytes in the file. Both images are resized to the same patch grid, so they produce near-identical counts. This is why resizing before sending is the largest single saving available — and why reasoning about cost from file size leads you in the wrong direction.

### Q2. A model reads large headings perfectly but garbles the small print at the bottom of the same screenshot. What is the most useful diagnosis? <!-- id: found-09-multimodal-and-vision-q02 energy: high -->

- [ ] The model's language ability is weaker for smaller text
- [ ] The model is hallucinating and its output cannot be trusted at all
- [ ] The screenshot needs a higher contrast setting before sending
- [x] The small text occupies too few pixels for the patch grid to represent distinctly, so this is a resolution problem rather than a prompting problem

**Why:** The projection from patch to vector compresses each region into a fixed representation, so letterforms occupying very few pixels cannot survive it. Rewriting the prompt will not restore detail the channel never carried. The fixes are to send a larger image, crop to the region of interest, or use OCR for that region — and the same reasoning explains why the large headings survived intact.

### Q3. You need a reliable count of items visible in an image. What is the soundest approach? <!-- id: found-09-multimodal-and-vision-q03 energy: high -->

- [ ] Ask the model to count them, and ask three times to check consistency
- [ ] Ask the model to count them with a chain-of-thought prompt
- [x] Ask the model to return each item as a structured entry, then count the entries in code
- [ ] Send the image at the highest available resolution and ask again

**Why:** A language model has no counting mechanism — it produces plausible text conditioned on descriptions of counts, which is why repeated asks vary and why a longer reasoning chain does not add one. Turning the task into extraction plus a deterministic count removes the model from the part it is bad at while keeping it in the part it is good at. More resolution does not help, because the failure is the mechanism rather than the pixels.

### Q4. Your extraction returns a table of six values, formatted correctly, and one value is silently wrong. What should have caught it? <!-- id: found-09-multimodal-and-vision-q04 energy: high -->

- [x] A cross-field check in code — for example, verifying that line items sum to a stated total
- [ ] A stricter prompt instructing the model to be careful
- [ ] A lower temperature
- [ ] Sending the image at a higher resolution

**Why:** Structure survives the projection better than digits do, so a wrong value arrives looking exactly like a correct one and no prompt makes the model reliable at precision it cannot perceive. An arithmetic invariant is decidable by code regardless of the model's confidence, which is why validation belongs after extraction rather than trust. Lower temperature reduces variation in phrasing, not errors in reading.

### Q5. A task requires reading clean, flat, high-contrast text from a scanned form, at high volume. Which approach is most defensible? <!-- id: found-09-multimodal-and-vision-q05 energy: high -->

- [ ] A vision model, because it handles any layout without configuration
- [ ] A vision model, because OCR cannot read forms
- [x] OCR plus deterministic parsing, measured against the vision model on the same sample, because it is cheaper, faster and auditable when the text is clean
- [ ] Alternate between the two at random to average out their errors

**Why:** Tesseract-class OCR is exact when the input is clean, costs nothing per page, runs locally, and produces the same output for the same input — which makes it auditable in a way a sampled model call is not. Vision models earn their cost on awkward input: angles, poor lighting, mixed layout. The defensible move is the measurement, because the crossover point depends on your documents rather than on the general case.

### Q6. You are about to send a screenshot of your own dashboard to a hosted vision model. What is the most important consideration? <!-- id: found-09-multimodal-and-vision-q06 energy: high -->

- [ ] Whether the image is under the provider's size limit
- [x] What sensitive information the screenshot contains and where it will be retained, because uploaded media leaves your control under the provider's terms
- [ ] Whether a cheaper model would read it just as well
- [ ] Whether PNG or JPEG gives a smaller file

**Why:** Cost and size limits are real but recoverable; a leaked credential or a third party's personal data is not. Screenshots routinely capture session tokens, keys, customer details and other people's messages, and once sent the image is subject to retention and training terms you may not have read. The mitigation is procedural — crop, redact, prefer a local model for anything sensitive — which is why it belongs in the same habit as keeping keys out of source control.

## You're ready to move on when...

You can send an image and predict its cost before sending it. You can explain to someone else why file size does not determine the bill, and why small text fails while large text does not. You have watched a vision model misread a number you knew, and you have a validation step that catches it. You can say which of your own tasks belong to a vision model, which belong to OCR and code, and give a measurement rather than an opinion for the difference.

## Free vs Paid

**Free path:** a provider free tier with vision support, Pillow for resizing, Tesseract for OCR, and a locally served vision model through Ollama for anything you would rather not upload. This is a complete path through every task in the phase — the local model is genuinely useful here, because it lets you compare failure modes and it makes the privacy section practical rather than theoretical. Expect lower accuracy from a small local vision model; that is itself instructive, since it fails at the *same* tasks for the *same* reasons, just sooner.

**What paid buys:** higher effective resolution, which is the direct fix for small-text failures, and better accuracy on dense tables. If your work is document-heavy, the paid tier may be the honest answer rather than the frugal one — but measure it against OCR first, because for clean documents the deterministic path often wins outright on cost, speed and auditability.

**Watch the volatility.** Vision token accounting is provider-specific and has changed repeatedly, including the resolution caps and whether a base token charge applies. Every number in this phase is dated 2026-09 and should be re-measured rather than trusted. The relationships are stable — cost scales with area, small text fails first, structure outlives digits — and those are what you should carry forward when the constants move.

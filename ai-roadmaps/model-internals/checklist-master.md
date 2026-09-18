# Model Internals — Master Checklist

This is the **track-level** checklist. Phase checklists live inside the phase files and cover what each phase teaches. These items are the ones that should be true of you **when the whole track is done** — capabilities that need material from several phases together, and that no single phase can establish alone.

**The honesty rule.** Tick an item only if you could do it now, from nothing, without notes. Rule 6 of the study rules: your own words, or it did not happen. A checklist you filled in by recognition rather than ability will tell you that you understood something you cannot yet use, which is worse than an unticked box.

If you cannot tick an item, the phase it names is where to return.

---

## Where the time goes

- [ ] I can explain the difference between prefill and decode, and say which resource each one is bound by. <!-- id: intern-master-c01 energy: normal -->
- [ ] I can explain why time to first token and tokens per second behave differently, and predict which one a given change will affect. <!-- id: intern-master-c02 energy: high -->
- [ ] I can explain why generation speed is usually limited by memory bandwidth rather than raw compute. <!-- id: intern-master-c03 energy: high -->
- [ ] I can name the parts of a transformer block and say what each contributes. <!-- id: intern-master-c04 energy: normal -->
- [ ] I can explain why attention is quadratic in sequence length, and one practical consequence of that for serving. <!-- id: intern-master-c05 energy: high -->

## Memory arithmetic

- [ ] I can estimate the memory a named model needs at a given precision, and say whether it fits on a specific piece of hardware. <!-- id: intern-master-c06 energy: high -->
- [ ] I can compute KV cache size from sequence length, layer count and head dimensions. <!-- id: intern-master-c07 energy: high -->
- [ ] I can explain why the KV cache grows linearly with tokens while attention grows quadratically. <!-- id: intern-master-c08 energy: high -->
- [ ] I can explain what paged attention and continuous batching are solving, and why they are serving-layer concerns rather than model concerns. <!-- id: intern-master-c09 energy: high -->

## Quantization

- [ ] I can explain what quantization trades away, and why a 4-bit model is not simply a worse model. <!-- id: intern-master-c10 energy: normal -->
- [ ] I can choose a precision for a stated constraint — memory, speed, or quality — and defend the choice. <!-- id: intern-master-c11 energy: high -->
- [ ] I can explain why a quantization label is a name rather than a measured bit-width. <!-- id: intern-master-c12 energy: normal -->
- [ ] I have run the same prompt against at least two quantization levels and described the difference I observed. <!-- id: intern-master-c13 energy: normal -->

## Serving and scale

- [ ] I can explain why batching improves throughput and can worsen latency. <!-- id: intern-master-c14 energy: normal -->
- [ ] I can describe what a serving framework does that running a model directly does not. <!-- id: intern-master-c15 energy: normal -->
- [ ] I can explain what speculative decoding is, why it can be distribution-exact under stated conditions, and where that guarantee stops. <!-- id: intern-master-c16 energy: high -->
- [ ] I can explain what a mixture-of-experts model changes about the relationship between total size and per-token cost. <!-- id: intern-master-c17 energy: high -->

## Reading the landscape critically

- [ ] I can read a model card and separate what is measured from what is marketing. <!-- id: intern-master-c18 energy: high -->
- [ ] I can explain why two models' benchmark numbers are often not comparable. <!-- id: intern-master-c19 energy: high -->
- [ ] I can explain the difference between a base model and an instruction-tuned model, and why it matters for choosing one. <!-- id: intern-master-c20 energy: normal -->
- [ ] I can name what scale buys a model and what it does not. <!-- id: intern-master-c21 energy: normal -->

## The habits this track is really teaching

- [ ] I work out a performance question with arithmetic before reaching for a benchmark number. <!-- id: intern-master-c22 energy: high -->
- [ ] I can say of any claim I have learned here whether it is a durable mechanism or a volatile specific. <!-- id: intern-master-c23 energy: normal -->
- [ ] I can explain one mechanism from this track well enough that someone else could predict its behaviour from my explanation. <!-- id: intern-master-c24 energy: normal -->

---

## What this checklist is not

It is not a completion certificate, and ticking all of it does not mean you can build a serving system. It means you understand what such a system is doing and why, which is the prerequisite for reading one.

**This track has the highest proportion of volatile specifics in the curriculum, tied with Cost.** If you find yourself remembering a throughput figure rather than the reason for it, you have learned the wrong layer. The arithmetic in the first two sections is the part that stays true; the numbers it operates on do not.

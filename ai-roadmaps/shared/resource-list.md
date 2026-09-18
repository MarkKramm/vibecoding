# Resource List

Every free resource this curriculum points at, gathered in one place so you are not hunting through forty-four phase files to find a link you half-remember.

## How to read this list

Each entry is a name and a URL, grouped by what it is for. The curriculum is written for someone with **no budget**, so nothing here requires payment; where a resource has a paid tier, the free path is the one described. A handful of resources are open-weight model hubs or documentation sites rather than tools — those are listed because the phases use them as references, not because you must run anything.

Everything here is **stable in kind and volatile in detail.** A documentation URL stays where it is; the pricing page behind it, the model names on it, and the free-tier limits it describes do not. Where a phase depends on a specific number, the phase dates it and tells you to re-check. This list deliberately does **not** carry prices, model names or rate limits, because a list that did would be wrong within weeks and would be trusted anyway.

If you follow a link and it has moved, been renamed, or become paid, that is expected drift rather than an error in your study. Substitute the nearest equivalent and note the change in your weekly tracker. The closing section of this file covers what to do about it.

The two documents beside this one are not links. `study-rules.md` and `weekly-tracker-template.md` live in this same folder. Read the first before any phase, and copy the second every Monday.

## Where to get models and run them locally

Running a model on your own machine costs no money and no rate limit; it costs disk space, electricity and time. These are the free routes.

- Ollama — https://ollama.com/
- llama.cpp — https://github.com/ggml-org/llama.cpp
- LM Studio — https://lmstudio.ai/
- Hugging Face Models — https://huggingface.co/models
- Hugging Face Model Hub documentation — https://huggingface.co/docs/hub/index

## Hosted model playgrounds with a free tier

Use these for tasks that genuinely exceed your hardware. Know that free tiers often carry **different data-retention and training-use terms than paid ones**, so do not put other people's private data through them.

- Google AI Studio — https://aistudio.google.com/
- Groq Cloud Console — https://console.groq.com/
- OpenRouter — https://openrouter.ai/
- Hugging Face Spaces — https://huggingface.co/spaces

## Tokenizers and token counting

The fastest way to make tokenization concrete is to watch a sentence split. These tools do that live, in the browser, with no install.

- Tiktokenizer — https://tiktokenizer.vercel.app/
- OpenAI Tokenizer — https://platform.openai.com/tokenizer
- tiktoken — https://github.com/openai/tiktoken
- Hugging Face Tokenizers — https://github.com/huggingface/tokenizers

## Embeddings, vector search and retrieval

Everything the Retrieval & RAG track needs, and all of it runs offline or in a notebook.

- Sentence Transformers — https://sbert.net/
- FAISS — https://github.com/facebookresearch/faiss
- Chroma — https://www.trychroma.com/
- Qdrant — https://qdrant.tech/
- LanceDB — https://lancedb.com/
- rank_bm25 — https://github.com/dorianbrown/rank_bm25
- MTEB leaderboard — https://huggingface.co/spaces/mteb/leaderboard

## Evaluation and benchmarking

Evaluation is the highest-leverage skill in the curriculum, and it is the one most often skipped because it feels like overhead. These are the tools and references that make it cheap to start.

- Ragas — https://github.com/explodinggradients/ragas
- promptfoo — https://github.com/promptfoo/promptfoo
- OpenAI Evals — https://github.com/openai/evals
- EleutherAI lm-evaluation-harness — https://github.com/EleutherAI/lm-evaluation-harness
- scikit-learn metrics — https://scikit-learn.org/stable/modules/model_evaluation.html

## Fine-tuning on free hardware

Free GPU sessions are enough to learn the mechanics of LoRA and QLoRA on a small model. They are **not** enough to train anything large, and the sessions end — checkpoint to persistent storage.

- Google Colab — https://colab.research.google.com/
- Kaggle Notebooks — https://www.kaggle.com/docs/notebooks
- Unsloth — https://github.com/unslothai/unsloth
- Hugging Face PEFT — https://github.com/huggingface/peft
- Hugging Face TRL — https://github.com/huggingface/trl
- Hugging Face Transformers — https://github.com/huggingface/transformers
- Hugging Face Datasets — https://github.com/huggingface/datasets

## Agents, tools and protocols

The agent layer moves fastest of anything in this list. Treat the protocol and framework entries as volatile and read the current docs rather than a tutorial.

- Model Context Protocol — https://modelcontextprotocol.io/
- MCP servers repository — https://github.com/modelcontextprotocol/servers
- LangChain — https://python.langchain.com/
- LlamaIndex — https://docs.llamaindex.ai/
- DSPy — https://dspy.ai/
- Pydantic — https://docs.pydantic.dev/

## Serving, quantization and throughput

How inference is actually run, and why a quantized model fits where a full-precision one does not.

- vLLM — https://docs.vllm.ai/
- llama.cpp quantization guide — https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
- bitsandbytes — https://github.com/bitsandbytes-foundation/bitsandbytes
- GGUF specification — https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
- ONNX Runtime — https://onnxruntime.ai/

## Learning, reference and keeping up

Few high-signal sources beats many low-signal ones. Read these monthly rather than daily, and follow mechanisms rather than leaderboards.

- Hugging Face Course — https://huggingface.co/learn
- Hugging Face blog — https://huggingface.co/blog
- arXiv cs.CL — https://arxiv.org/list/cs.CL/recent
- Papers with Code — https://paperswithcode.com/
- Andrej Karpathy, Neural Networks: Zero to Hero — https://karpathy.ai/zero-to-hero.html
- Anthropic engineering blog — https://www.anthropic.com/engineering
- OpenAI Cookbook — https://cookbook.openai.com/
- Google Machine Learning Crash Course — https://developers.google.com/machine-learning/crash-course

## Python, notebooks and the local toolchain

The smallest toolchain that supports everything in this curriculum. If you have Python and a terminal, you have enough.

- Python — https://www.python.org/downloads/
- uv, a fast Python package manager — https://docs.astral.sh/uv/
- Jupyter — https://jupyter.org/
- Google Colab — https://colab.research.google.com/
- Visual Studio Code — https://code.visualstudio.com/
- Git — https://git-scm.com/
- GitHub — https://github.com/

## Publishing your work

Your deliverables are the portfolio. These are the places the Career track tells you to put them.

- GitHub Pages — https://pages.github.com/
- GitHub Skills — https://skills.github.com/
- Hugging Face Spaces — https://huggingface.co/spaces
- Obsidian, for notes you actually revisit — https://obsidian.md/

## Data privacy and Philippine context

Relevant to any project handling other people's information, which includes a favour for a local business.

- National Privacy Commission — https://privacy.gov.ph/
- Philippine Data Privacy Act of 2012, RA 10173 — https://privacy.gov.ph/data-privacy-act/
- Philippine Statistics Authority, OpenSTAT — https://openstat.psa.gov.ph/
- Project Gutenberg — https://www.gutenberg.org/

## Citation and reference tools

For the papers the phases cite, and for checking whether a claim you read somewhere is actually in the paper.

- arXiv — https://arxiv.org/
- Semantic Scholar — https://www.semanticscholar.org/
- Connected Papers — https://www.connectedpapers.com/
- Zotero — https://www.zotero.org/

## A note on links that stop working

Every URL here was checked when it was added, and some will have moved by the time you click them. That is the normal condition of a field that changes weekly, and it is not a sign that your copy of the curriculum is broken.

Three responses, in order of preference. First, **search for the name rather than the URL** — organisation names are far more stable than their documentation paths. Second, **use the Internet Archive**, which will usually have the page as it was. Third, **substitute the nearest equivalent and write down that you did.** A resource list is a starting point, not a contract, and the mechanism you were learning does not change because a vendor reorganised their docs.

- Internet Archive — https://web.archive.org/

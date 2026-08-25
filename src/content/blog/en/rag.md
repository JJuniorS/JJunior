---
translationKey: rag
title: "RAG: how to give an LLM real context"
description: "What Retrieval-Augmented Generation is, how the pipeline works, and when RAG helps (and when it doesn't)."
pubDate: 2026-08-25
tags:
  - AI
  - RAG
  - LLM
draft: false
---

## The problem a standalone LLM does not solve

Language models are impressive. They write, summarize, explain code, and even help with decisions.

But they have very concrete limits:

1. **Frozen knowledge** — the model only “knows” what it saw during training. After the data cutoff, the world keeps changing and it does not.
2. **Hallucination** — when it does not know, it often invents with confidence.
3. **Private data** — your company policy, internal handbook, customer ticket… that almost never lives in the model weights.

That is exactly where **RAG** (*Retrieval-Augmented Generation*) comes in.

Instead of asking the LLM to “remember everything,” we **retrieve** relevant passages from an external store and **pass that context** along with the question.

![Standalone LLM vs LLM with RAG](/JJunior/images/rag-vs-llm.png)

## What RAG is

The idea was popularized in the paper [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) (Lewis et al., 2020). In short: combine the model’s **parametric** memory (what lives in the weights) with a **non-parametric** memory (indexed documents you can update).

In product and application practice, the flow that shows up most often is:

> **Retrieve → Augment → Generate**

1. **Retrieve** — pull passages relevant to the question
2. **Augment** — build a prompt with the question plus retrieved context
3. **Generate** — the LLM answers *conditioned* on that context

[Microsoft’s documentation](https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation) describes the same pattern: retrieve content, enrich the prompt, and generate a more *grounded* answer.

Think of an **open-book** exam. The LLM still writes the answer — but now the material is open on the desk.

## The pipeline (from document to answer)

A typical RAG system has two phases: **prepare the knowledge base** and **answer questions**.

![RAG pipeline: from documents to the answer](/JJunior/images/rag-pipeline.png)

### 1. Ingestion

You collect PDFs, wikis, issues, READMEs, contracts, tickets… whatever is the source of truth.

Quality starts here. If the base is outdated, duplicated, or poorly structured, retrieval will return garbage — and the LLM will sound convincing about that garbage.

### 2. Chunking

Large documents do not go into the index (or the context window) whole. They are split into **chunks** — smaller pieces, ideally with one coherent idea.

A common trick is **overlap** between neighboring chunks, so you do not cut through the middle of an important sentence.

![Chunking with overlap](/JJunior/images/rag-chunking.png)

There is no magic size. Chunks that are too large mix topics. Chunks that are too small lose context. Tuning is usually empirical — which is why it is worth **comparing strategies** with a simple retrieval hit metric (hit rate / “true rate”: did the question bring back the right passage in the top-k?).

#### Common chunking strategies

When you slice a document, these are the ones that show up most in tutorials and frameworks:

| Strategy | Idea | When it makes sense |
| -------- | ---- | ------------------- |
| **Token** | Cut by a fixed token count (e.g. 500 + overlap) | Fast baseline; fairly uniform text |
| **Recursive** | Split by hierarchy: paragraph → line → space → character | Solid default for docs, Markdown, running prose |
| **Page** | Use the PDF page (or visual unit) as the chunk | Manuals and PDFs where a page is already a useful unit |
| **Semantic** | Cut where meaning shifts (boundaries between sentences/topics) | Long docs with several distinct subjects |

![Chunking strategies and HyDE](/JJunior/images/rag-chunking-strategies.png)

**Recursive** is usually the best starting point: it respects structure without the extra cost of semantic splitting. **Semantic** can win when a document mixes very different themes — but it needs embeddings already at ingest time (slower/more expensive). **Page** rises or falls with PDF layout: a well-written page helps; a page that mashed three topics onto one sheet becomes a confusing chunk.

Important: this is **indexing**. Do not confuse it with HyDE (below), which runs at **query time**.

### 3. Embeddings

Each chunk becomes a numeric **vector** (embedding) that represents the meaning of the text. The user question also becomes a vector, with the same embedding model.

Search stops being only “matching words” and becomes “nearby meaning.”

### 4. Vector store (index)

Vectors (and metadata: title, URL, date, permissions) live in an index optimized for similarity search — for example a vector database or a search service with vector support.

### 5. Retrieval at question time

When a question arrives:

1. Embed the query
2. Fetch the **top-k** most similar chunks
3. (Optional) rerank / filter those results
4. Build the augmented prompt
5. Call the LLM

In pseudocode:

```text
chunks = index.search(query, k=5)
prompt = """
Answer using only the context below.
If the context is not enough, say you do not know.

Context:
{chunks}

Question:
{query}
"""
answer = llm.generate(prompt)
```

No framework required. The pattern is the same in Python, .NET, or any orchestrator.

### HyDE: improve the *query*, not the split

**HyDE** (*Hypothetical Document Embeddings*) is not a chunking method. It is a query transformation:

1. The LLM generates a **hypothetical text** that would “answer” the question (it does not need to be correct)
2. You embed **that text**
3. You search the index with that vector — instead of the short question embedding

The intuition: a short question (“PTO policy?”) and a long handbook chunk live in different “neighborhoods” of vector space. A hypothetical paragraph about PTO lands semantically closer to the real chunks. The original paper is [Precise Zero-Shot Dense Retrieval without Relevance Labels](https://arxiv.org/abs/2212.10496) (Gao et al., 2022).

Classic trade-off: it can raise hit rate on vague queries, but it **adds latency and cost** (one extra LLM call per question). If the hypothetical answer hallucinates badly, retrieval can drift too.

In practical experiments (comparing token, recursive, page, semantic, and HyDE), what matters is not the technique’s name — it is measuring **true rate / hit rate** on *your* corpus. Someone else’s tutorial winner can lose on your PDF.

## What actually moves the needle

### Chunking is not a detail

A lot of the “bad RAG” I see is not a weak model — it is a **bad cut**.

Questions like:

- Am I using token, recursive, page, or semantic — and did I measure hit rate?
- Am I splitting through the middle of tables?
- Is metadata (title, section, product) attached to the chunk?
- Do legal docs / policies need larger chunks?

change the outcome more than swapping the LLM.

### Top-k and the prompt

Bringing **more** context is not automatically better:

- it burns context window
- it raises cost and latency
- it can mix irrelevant passages and confuse the model

Often, **3–8 good chunks** beat **20 mediocre ones**.

### Hybrid search and reranking

Vector search alone sometimes fails on proper nouns, error codes, IDs, and exact terms.

That is why modern stacks mix:

- **keyword / lexical** (BM25, etc.) — good for literal terms
- **vector** — good for paraphrase and intent
- **hybrid** — combines both
- **reranking** — a model (or semantic ranker) reorders candidates so only what really matters remains

Azure AI Search itself, in its [RAG overview](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview), highlights hybrid search and semantic ranking as pieces of the “classic” retrieval pattern.

You do not need everything on day one. But it is worth knowing that “embeddings + top-k only” is the starting point, not the ceiling.

## When RAG helps — and when it does not

### Where it usually shines

- FAQ / internal knowledge base
- Assistants over product documentation
- Search over policies, runbooks, tickets
- Answers with **citations** (“where did this come from?”)

### Where it usually struggles

| Situation | Why |
| --------- | --- |
| Dirty or outdated base | Garbage in, garbage out |
| Multi-hop questions | Need to join facts across docs; a simple retrieve may not be enough |
| Answers that need deep reasoning beyond the text | Context helps, but it does not replace model capability |
| Harsh real-time requirements | Every retrieve + generate adds latency |
| Broken access control | Risk of leaking a document the user should not see |

RAG **reduces** hallucination when the context is good. It does **not** eliminate hallucination: the model can still ignore the context or invent details.

That is why the prompt matters — and evaluation does too.

## How to know if your RAG is good

“It looks like it answered well” does not scale.

When evaluating RAG systems, two questions show up all the time:

1. **Did retrieval bring the right context?** (relevance / context precision)
2. **Is the answer faithful to what was retrieved?** (faithfulness)

In [Ragas](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/), for example, **faithfulness** measures whether claims in the answer can be supported by the retrieved context — a way to catch when the model “left the text.”

A minimum checklist I would use:

1. Build a small set of real questions (20–50 already helps)
2. Define the expected answer or the correct source / chunk
3. Measure **hit rate** (true rate): did the right passage land in the top-k?
4. Also measure: is the answer citable? did it invent? (*faithfulness*)
5. Tune chunking (token vs recursive vs page vs semantic) / HyDE / hybrid / k **before** blaming the model

Microsoft also publishes a [RAG solution design and evaluation guide](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide) — useful once you move past a prototype.

## What I would try first

If you are getting started:

1. Pick **one** small, trustworthy knowledge base
2. Start with **recursive** + embeddings + top-k
3. Force the LLM to **cite** passages
4. Measure hit rate; if needed, try page/semantic — and only then HyDE
5. Look at the failures — it is almost always retrieval, not model “IQ”
6. Then add hybrid search / reranking / formal evaluation

RAG is not magic. It is an engineering pattern: **give the LLM the right material, at the right time**.

And in the end, the differentiator is rarely the framework name. It is the quality of the base, the cut, the retrieve — and the discipline to measure whether the answer actually came from the context.

## References

- Lewis et al. (2020). [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) (arXiv). NeurIPS PDF: [proceedings](https://proceedings.neurips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html).
- Microsoft Learn. [Retrieval-augmented generation](https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation).
- Microsoft Learn. [Retrieval Augmented Generation (RAG) in Azure AI Search](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview).
- Microsoft Azure Architecture Center. [RAG solution design and evaluation guide](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide).
- Ragas. [Faithfulness metric](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/).
- Gao et al. (2022). [Precise Zero-Shot Dense Retrieval without Relevance Labels](https://arxiv.org/abs/2212.10496) (HyDE).
- Ronnald Hawk. [How to build a perfect RAG AI agent (5 steps)](https://www.youtube.com/watch?v=LZoLvV7p25A) — practical comparison of strategies and true rate.

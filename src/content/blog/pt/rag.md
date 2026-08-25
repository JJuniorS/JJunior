---
translationKey: rag
title: "RAG: como dar contexto real para uma LLM"
description: "O que é Retrieval-Augmented Generation, como funciona o pipeline e quando RAG ajuda (e quando não)."
pubDate: 2026-08-25
tags:
  - IA
  - RAG
  - LLM
draft: false
---

## O problema que a LLM sozinha não resolve

Modelos de linguagem são impressionantes. Eles escrevem, resumem, explicam código e até ajudam a tomar decisões.

Mas eles têm limites bem concretos:

1. **Conhecimento congelado** — o modelo só “sabe” o que viu no treinamento. Depois do corte de dados, o mundo continua mudando e ele não.
2. **Alucinação** — quando não sabe, muitas vezes inventa com confiança.
3. **Dados privados** — a política da sua empresa, o manual interno, o ticket do cliente… isso quase nunca está nos pesos do modelo.

É exatamente nesse espaço que entra o **RAG** (*Retrieval-Augmented Generation*).

Em vez de pedir para a LLM “lembrar de tudo”, a gente **busca** trechos relevantes numa base externa e **entrega esse contexto** junto com a pergunta.

![LLM sozinha vs LLM com RAG](/JJunior/images/rag-vs-llm.png)

## O que é RAG

A ideia foi popularizada no paper [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) (Lewis et al., 2020). Em resumo: combinar a memória **paramétrica** do modelo (o que está nos pesos) com uma memória **não paramétrica** (documentos indexados que você pode atualizar).

Na prática de produto/aplicação, o fluxo que mais aparece hoje é:

> **Retrieve → Augment → Generate**

1. **Retrieve** — recuperar trechos relevantes para a pergunta
2. **Augment** — montar um prompt com pergunta + contexto recuperado
3. **Generate** — a LLM responde *condicionada* a esse contexto

A [documentação da Microsoft](https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation) descreve o mesmo padrão: recuperar conteúdo, enriquecer o prompt e gerar uma resposta mais “ancorada” (*grounded*).

Pense em uma prova **com consulta**. A LLM ainda escreve a resposta — mas agora ela tem o material aberto na mesa.

## O pipeline (do documento até a resposta)

Um sistema RAG típico tem duas fases: **preparar a base** e **responder perguntas**.

![Pipeline RAG: documentos até a resposta](/JJunior/images/rag-pipeline.png)

### 1. Ingestão

Você coleta PDFs, wikis, issues, READMEs, contratos, tickets… o que for a fonte da verdade.

A qualidade começa aqui. Se a base está desatualizada, duplicada ou mal estruturada, o retrieval vai devolver lixo — e a LLM vai soar convincente sobre esse lixo.

### 2. Chunking

Documentos grandes não entram inteiros no índice (nem no contexto). Eles são divididos em **chunks** — pedaços menores, idealmente com uma ideia coerente.

Um truque comum é usar **overlap** (sobreposição) entre chunks vizinhos, para não cortar no meio de uma frase importante.

![Chunking com overlap](/JJunior/images/rag-chunking.png)

Não existe tamanho mágico. Chunks muito grandes misturam assuntos. Chunks muito pequenos perdem contexto. O ajuste costuma ser empírico — e por isso vale **comparar estratégias** com uma métrica simples de acerto no retrieval (hit rate / “true rate”: a pergunta trouxe o trecho certo no top-k?).

#### Estratégias comuns de chunking

Na hora de fatiar o documento, estas são as que mais aparecem em tutoriais e frameworks:

| Estratégia | Ideia | Quando faz sentido |
| ---------- | ----- | ------------------ |
| **Token** | Corta por quantidade fixa de tokens (ex.: 500 + overlap) | Baseline rápido; texto relativamente uniforme |
| **Recursive** | Quebra em hierarquia: parágrafo → linha → espaço → caractere | Default sólido para docs, Markdown, texto corrido |
| **Page** | Usa a página do PDF (ou unidade visual) como chunk | Manuais e PDFs em que a página já é uma unidade útil |
| **Semantic** | Corta onde o significado muda (fronteira entre frases/tópicos) | Docs longos com vários assuntos distintos |

![Estratégias de chunking e HyDE](/JJunior/images/rag-chunking-strategies.png)

**Recursive** costuma ser o melhor ponto de partida: respeita estrutura sem o custo extra do semantic. **Semantic** pode ganhar quando o documento mistura temas bem diferentes — mas exige embeddings já na ingestão (mais lento/caro). **Page** brilha ou falha junto com o layout do PDF: página bem escrita ajuda; página que misturou três assuntos no mesmo “folha” vira um chunk confuso.

Importante: isso é **indexação**. Não confundir com HyDE (abaixo), que age na **hora da pergunta**.

### 3. Embeddings

Cada chunk vira um **vetor** numérico (embedding) que representa o significado do texto. A pergunta do usuário também vira um vetor, com o mesmo modelo de embedding.

A busca deixa de ser só “palavra igual” e passa a ser “significado próximo”.

### 4. Vector store (índice)

Os vetores (e metadados: título, URL, data, permissões) ficam num índice otimizado para busca por similaridade — por exemplo um vector database ou um search service com suporte a vetores.

### 5. Retrieval na hora da pergunta

Quando chega uma pergunta:

1. Gera o embedding da query
2. Busca os **top-k** chunks mais similares
3. (Opcional) reordena / filtra esses resultados
4. Monta o prompt aumentado
5. Chama a LLM

Em pseudocódigo:

```text
chunks = index.search(query, k=5)
prompt = """
Use apenas o contexto abaixo para responder.
Se o contexto não for suficiente, diga que não sabe.

Contexto:
{chunks}

Pergunta:
{query}
"""
answer = llm.generate(prompt)
```

Nada de framework obrigatório aqui. O padrão é o mesmo em Python, .NET ou qualquer orquestrador.

### HyDE: melhorar a *query*, não o corte

**HyDE** (*Hypothetical Document Embeddings*) não é uma forma de chunking. É uma transformação da pergunta:

1. A LLM gera um **texto hipotético** que “responderia” a pergunta (não precisa estar certo)
2. Você gera o embedding **desse texto**
3. Busca no índice com esse vetor — em vez do embedding da pergunta curta

A intuição: pergunta curta (“política de PTO?”) e chunk longo de manual vivem em “bairros” diferentes do espaço vetorial. Um parágrafo hipotético sobre PTO fica semanticamente mais perto dos chunks reais. O paper original é o [Precise Zero-Shot Dense Retrieval without Relevance Labels](https://arxiv.org/abs/2212.10496) (Gao et al., 2022).

Trade-off clássico: pode subir o hit rate em queries vagas, mas **soma latência e custo** (uma chamada de LLM a mais por pergunta). Se o hipotético alucinar feio, a busca também pode desviar.

Em experimentos práticos (comparando token, recursive, page, semantic e HyDE), o que importa não é o nome da técnica — é medir o **true rate / hit rate** no *seu* corpus. O vencedor do tutorial de outra pessoa pode perder no seu PDF.

## Peças que fazem diferença na prática

### Chunking não é detalhe

Boa parte dos “RAG ruins” que eu vejo não é modelo fraco — é **corte ruim**.

Perguntas como:

- Estou usando token, recursive, page ou semantic — e medi o hit rate?
- Estou cortando no meio de tabelas?
- Metadados (título, seção, produto) estão junto do chunk?
- Documentos jurídicos/políticas precisam de chunks maiores?

mudam o resultado mais do que trocar a LLM.

### Top-k e o prompt

Trazer **mais** contexto não é automaticamente melhor:

- consome janela de contexto
- aumenta custo e latência
- pode misturar trechos irrelevantes e confundir o modelo

Muitas vezes, **3–8 chunks bons** batem **20 chunks medianos**.

### Hybrid search e reranking

Só busca vetorial às vezes falha em nomes próprios, códigos de erro, IDs, termos exatos.

Por isso stacks modernas misturam:

- **keyword / lexical** (BM25 etc.) — bom em termos literais
- **vector** — bom em paráfrases e intenção
- **hybrid** — combina os dois
- **reranking** — um modelo (ou ranker semântico) reordena os candidatos para ficar só o que realmente importa

A própria Azure AI Search, no [overview de RAG](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview), destaca hybrid search e semantic ranking como peças do padrão “clássico” de retrieval.

Você não precisa de tudo no dia 1. Mas vale saber que “só embedding + top-k” é o ponto de partida, não o teto.

## Quando RAG ajuda — e quando não

### Onde costuma brilhar

- FAQ / base de conhecimento interna
- Assistente sobre documentação de produto
- Busca em policies, runbooks, tickets
- Respostas com **citação** da fonte (“de onde veio isso?”)

### Onde costuma sofrer

| Situação | Por quê |
| -------- | ------- |
| Base suja ou desatualizada | Garbage in, garbage out |
| Perguntas multi-hop | Precisa juntar fatos de vários docs; um retrieve simples pode não bastar |
| Respostas que exigem raciocínio profundo além do texto | O contexto ajuda, mas não substitui capacidade do modelo |
| Requisitos de tempo real demais | Cada retrieve + generate soma latência |
| Controle de acesso mal feito | Risco de vazar documento que o usuário não deveria ver |

RAG **reduz** alucinação quando o contexto é bom. Ele **não elimina** alucinação: o modelo ainda pode ignorar o contexto ou inventar detalhes.

Por isso o prompt importa — e a avaliação também.

## Como saber se o RAG está bom

“Parece que respondeu bem” não escala.

Em avaliação de sistemas RAG, duas perguntas aparecem o tempo todo:

1. **O retrieval trouxe o contexto certo?** (relevance / context precision)
2. **A resposta é fiel ao que foi recuperado?** (faithfulness)

No [Ragas](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/), por exemplo, **faithfulness** mede se as afirmações da resposta podem ser sustentadas pelo contexto recuperado — um jeito de detectar quando o modelo “saiu do texto”.

Um checklist mínimo que eu usaria:

1. Monte um conjunto pequeno de perguntas reais (20–50 já ajuda)
2. Defina a resposta esperada ou a fonte / chunk correto
3. Meça o **hit rate** (true rate): o trecho certo entrou no top-k?
4. Meça também: resposta citável? resposta inventou? (*faithfulness*)
5. Ajuste chunking (token vs recursive vs page vs semantic) / HyDE / hybrid / k **antes** de culpar o modelo

A Microsoft também publica um [guia de design e avaliação de soluções RAG](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide) — útil se você estiver indo além do protótipo.

## O que eu experimentaria primeiro

Se você está começando:

1. Escolha **uma** base pequena e confiável
2. Comece com **recursive** + embeddings + top-k
3. Force a LLM a **citar** trechos
4. Meça hit rate; se precisar, teste page/semantic — e só então HyDE
5. Olhe os casos em que errou — quase sempre é retrieval, não “IQ” do modelo
6. Depois adicione hybrid search / reranking / avaliação formal

RAG não é magia. É um padrão de engenharia: **dar à LLM o material certo, na hora certa**.

E, no fim das contas, o diferencial raramente é o nome do framework. É a qualidade da base, do corte, do retrieve — e a disciplina de medir se a resposta realmente veio do contexto.

## Referências

- Lewis et al. (2020). [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) (arXiv). PDF NeurIPS: [proceedings](https://proceedings.neurips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html).
- Microsoft Learn. [Retrieval-augmented generation](https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation).
- Microsoft Learn. [Retrieval Augmented Generation (RAG) in Azure AI Search](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview).
- Microsoft Azure Architecture Center. [RAG solution design and evaluation guide](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide).
- Ragas. [Faithfulness metric](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/).
- Gao et al. (2022). [Precise Zero-Shot Dense Retrieval without Relevance Labels](https://arxiv.org/abs/2212.10496) (HyDE).
- Ronnald Hawk. [Como criar um agente de IA RAG perfeito (5 passos)](https://www.youtube.com/watch?v=LZoLvV7p25A) — comparação prática de estratégias e true rate.

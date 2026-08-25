# Design: Artigo sobre RAG (JJunior)

**Data:** 2026-08-25  
**Status:** aguardando revisão do usuário  
**Commits:** não criar commits neste trabalho (pedido explícito)

## Objetivo

Publicar um artigo em português no blog JJunior explicando RAG de forma prática (~15–20 min de leitura), com um toque avançado (limites, hybrid search, avaliação), fontes confiáveis e diagramas gerados/incluídos no repositório.

## Decisões alinhadas

| Decisão | Escolha |
|---------|---------|
| Foco | Mistura B+C, mais para B (prático com limites/avaliação) |
| Extensão | Médio (~15–20 min) |
| Idioma | Só PT nesta entrega (`src/content/blog/pt/rag.md`) |
| Abordagem narrativa | “Do problema ao pipeline” |
| Código | Pseudocódigo / snippets curtos; toque de C# só se couber naturalmente |
| Imagens | Gerar no fluxo (opção A); se qualidade fraca, fornecer prompts |
| Publicação | `draft: false` por padrão (ajustável na implementação) |

## Arquivo e frontmatter

**Caminho:** `src/content/blog/pt/rag.md`

```yaml
translationKey: rag
title: "RAG: como dar contexto real para uma LLM"
description: "O que é Retrieval-Augmented Generation, como funciona o pipeline e quando RAG ajuda (e quando não)."
pubDate: 2026-08-25
tags:
  - IA
  - RAG
  - LLM
draft: false
```

Título/descrição podem ser ajustados levemente na redação final, mantendo o mesmo `translationKey`.

## Estrutura do conteúdo

1. **Abertura** — por que LLM sozinha falha (corte de conhecimento, alucinação, dados privados/internos)
2. **O que é RAG** — definição curta; ideia *retrieve → augment → generate*; citar paper Lewis et al. (2020)
3. **Pipeline** — ingestão → chunking → embeddings → vector store → query → retrieval → prompt → resposta (+ imagem 1)
4. **Peças importantes** — chunking/overlap, embeddings, similaridade; snippets curtos
5. **Retrieval um pouco além** — top-k, hybrid search, reranking (visão prática, sem tutorial de framework)
6. **Quando ajuda / quando não** — lixo na base, multi-hop, latência/custo (+ imagem 2)
7. **Como saber se está bom** — avaliação em alto nível (relevance, faithfulness); citar docs/frameworks de eval
8. **Fechamento** — o que experimentar no dia a dia + lista de referências

**Tom:** diário técnico pessoal, como `a-bolha-da-ia-e-se-a-conta-nao-bater.md` — claro, opinativo com leveza, links externos para fontes.

**Fora de escopo nesta entrega:**
- Versão em inglês
- Tutorial completo de LangChain/LlamaIndex/Semantic Kernel
- Código de produção / PoC no repositório
- Commits ou PR

## Imagens

Salvar em `public/images/` e referenciar no Markdown como `/JJunior/images/<nome>.png` (padrão do blog).

| Arquivo | Uso | Conteúdo |
|---------|-----|----------|
| `rag-pipeline.png` | Seção pipeline | Fluxo completo: documentos → chunks → embeddings → store → pergunta → retrieve → LLM → resposta |
| `rag-vs-llm.png` | Abertura ou “quando ajuda” | Contraste LLM sozinha vs LLM + retrieval |
| `rag-chunking.png` | Seção chunking (opcional) | Documento dividido em chunks com overlap |

**Estilo visual:** diagramas limpos e didáticos; evitar estética genérica “IA roxa”; textos em português nas figuras quando legível.

**Fallback:** se a geração automática ficar ruim, entregar prompts prontos para o autor gerar em ferramenta especializada e substituir os arquivos.

## Fontes confiáveis (obrigatórias no artigo)

Usar links canônicos; preferir paper/docs oficiais a blogs genéricos.

1. **Paper original RAG** — Lewis et al., *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* (NeurIPS 2020)  
   - https://arxiv.org/abs/2005.11401  
   - PDF NeurIPS: https://proceedings.neurips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html
2. **Documentação prática (escolher 1–2 na redação):**  
   - Azure / Microsoft Learn sobre RAG  
   - OpenAI cookbook / docs sobre retrieval  
   - LangChain ou LlamaIndex docs (conceitos de indexing/retrieval), sem virar tutorial da lib
3. **Avaliação:**  
   - RAGAS (docs/paper) e/ou menção a métricas de faithfulness / context relevance

Na redação, verificar URLs finais antes de publicar; não inventar números ou claims sem fonte.

## Critérios de sucesso

- [ ] Artigo em PT no path acima, frontmatter válido segundo `src/content.config.ts`
- [ ] Leitura coerente em ~15–20 min
- [ ] Pelo menos 2 imagens no post (pipeline + LLM vs RAG)
- [ ] Fontes linkadas (paper + docs)
- [ ] Sem commit criado por este trabalho
- [ ] Estilo alinhado aos posts PT existentes

## Ordem de implementação (após aprovação desta spec)

1. Gerar imagens e salvar em `public/images/`
2. Escrever `src/content/blog/pt/rag.md`
3. Revisar links e referências de imagens
4. (Opcional) `astro build` / preview local — sem commit

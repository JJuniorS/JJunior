---
translationKey: plano-rollback
title: "Rollback: o plano que você faz antes de precisar"
description: "Por que um caminho de volta precisa existir antes do incidente — e o que um rollback realmente faz (e não faz) no CI/CD."
pubDate: 2026-09-11
tags:
  - DevOps
  - CI/CD
  - GitHub Actions
draft: false
---

## A gente automatiza a ida. A volta fica para depois.

Este blog publica sozinho. Eu faço push na `main`, o GitHub Actions gera o site estático e o GitHub Pages coloca no ar. É o tipo de fluxo que a gente ama enquanto está funcionando: rápido, previsível, sem cerimônia.

O problema é o que acontece no minuto seguinte a um deploy ruim.

Um CSS que quebra o layout no celular. Um `astro.config` com `base` errado e todas as rotas em 404. Um artigo publicado com um erro que você só percebe quando já está no ar. Nada disso é um desastre de produção com milhares de usuários — mas o reflexo é o mesmo: **você precisa voltar. Agora.**

E é exatamente nesse momento que a maioria dos times descobre que não tem um plano de rollback. Tem um plano de deploy.

> Rollback não é o botão de pânico que você inventa no incidente. É a decisão que você toma **antes**, quando ainda está calmo o suficiente para pensar.

## O que um plano de rollback realmente é

Um plano de rollback responde três perguntas, por escrito, com antecedência:

1. **Para onde eu volto?** Qual versão era a última boa — tag, release, artefato, commit.
2. **Como eu volto?** Qual comando, workflow ou ação na UI executa isso sem improvisar.
3. **O que o rollback *não* resolve?** Porque republicar o site antigo não desfaz o commit ruim na `main`.

A terceira pergunta é a que mais vejo ser ignorada.

Rollback de **o que o usuário está vendo** e rollback de **o que está no git** são coisas diferentes. No GitHub Pages, eu consigo republicar o HTML da release anterior em poucos minutos. Isso tira o problema do ar. Mas o código na `main` continua sendo o código novo. O próximo push — ou até um re-run inocente do deploy — coloca o erro de volta.

Então o plano tem dois tempos:

| Tempo | Objetivo | Exemplo neste blog |
| ----- | -------- | ------------------ |
| **Mitigação** | Tirar o problema do ar | Workflow manual republica a release anterior no Pages |
| **Correção** | Impedir que o problema volte | `git revert` (ou hotfix) na `main`, depois um deploy de verdade |

Se você só faz o primeiro, comprou tempo. Se você só faz o segundo, o usuário continua vendo o erro enquanto você arruma. Os dois juntos é que formam o plano.

## Por que isso precisa existir *antes* do incidente

Sob pressão, a gente escolhe mal.

Não porque seja incompetente. Porque incidente comprime o tempo, mistura ego (“fui eu que quebrei”) e tira o espaço de pensar em trade-offs. É o pior momento para descobrir que o GitHub Actions **não tem** uma etapa que fica pausada depois do deploy esperando você clicar “voltar”.

Eu quis exatamente isso no CI deste blog: uma etapa parada, pronta, que eu disparo só se der errado. A intuição é boa. A implementação, no GitHub Actions, é outra.

Quando o deploy termina, o workflow **acaba**. Não existe um job opcional que fica horas ou dias à espera de um clique. O que existe — e o que eu acabei usando — é um workflow separado, disparado na mão (`workflow_dispatch`). Ele não fica pausado no mesmo run. Ele fica **sempre disponível** na aba Actions, com o nome explícito: *Rollback GitHub Pages*.

A diferença parece pequena. Na prática, é a diferença entre “preciso inventar um caminho agora” e “preciso clicar no caminho que já existe”.

Três razões pelas quais eu acho que isso importa mesmo num projeto pessoal:

- **Memória é péssima em crise.** Daqui a seis meses eu não vou lembrar se o rollback é “re-run do deploy antigo”, “checkout da tag” ou “um `git revert` às pressas”.
- **O caminho feliz enviesa o desenho.** A gente testa o deploy. Quase ninguém testa o “e se isso falhar?”.
- **Velocidade de voltar vale mais do que perfeição.** Mitigar em cinco minutos e corrigir com calma é melhor do que ficar 40 minutos tentando um hotfix com o site quebrado.

Isso não é pessimismo. É humildade operacional.

## O que eu configurei aqui

Na prática, o fluxo deste repositório ficou assim:

```
Push na main
  ├─ deploy.yml     → build + GitHub Pages
  └─ release.yml    → tag + GitHub Release

Se der errado
  └─ rollback.yml   → Actions → Run workflow
                      (tag vazia = penúltima release)
```

O rollback **não** cria uma release nova. Não mexe na `main`. Só faz checkout da tag anterior, gera o site de novo e publica. O grupo de concorrência é o mesmo do deploy (`pages`): se um deploy ruim ainda estiver rodando, o rollback cancela e assume.

Dois cuidados que eu anotei para o eu do futuro:

1. **Preciso de pelo menos duas releases.** Sem histórico, não existe “versão anterior”.
2. **Depois do rollback, a `main` ainda está errada.** Sem revert ou hotfix, o próximo push desfaz a mitigação.

O botão sozinho não é o plano. O plano é saber o que o botão faz — e o que ele deixa para eu fazer depois.

## Rollback não é covardia. É senioridade de operação.

É tentador tratar rollback como coisa de sistema grande: banco, blue/green, feature flag, canary. Esses mecanismos são o mesmo *princípio* em escalas diferentes: **nunca deixe o caminho de ida sem um caminho de volta conhecido**.

Num site estático, o caminho de volta é uma tag e um workflow manual. Numa API, pode ser republicar a imagem anterior. Num app com migração de banco, às vezes rollback *nem é possível* — e aí o plano muda de nome: feature flag, migrate-forward, ou “essa mudança é irreversível, então o deploy precisa de outro tipo de cuidado”.

A pergunta útil não é “qual ferramenta eu uso?”. É: **se isso quebrar daqui a dez minutos, eu sei exatamente o que fazer sem abrir o ChatGPT?**

Se a resposta for “eu descubro na hora”, você tem um deploy. Ainda não tem um plano.

## O que eu levo daqui

Configurar rollback neste blog foi desproporcionalmente educativo para o tamanho do projeto. Não porque GitHub Pages seja difícil. Porque me forçou a separar três ideias que eu costumava misturar:

- **Publicar** — colocar a versão nova no ar
- **Mitigar** — voltar o que o usuário vê para a última versão boa
- **Corrigir** — deixar o repositório e o próximo deploy coerentes com essa versão (ou com o hotfix)

A primeira a gente ama automatizar. A segunda precisa de um gatilho manual consciente — não de um job eterno esperando aprovação. A terceira é git, conversa e, de novo, calma.

> O melhor plano de rollback é o que você nunca usa. O segundo melhor é o que você usa sem precisar pensar.

Esse texto existe porque eu quis o segundo. E porque o primeiro, sozinho, é só esperança.

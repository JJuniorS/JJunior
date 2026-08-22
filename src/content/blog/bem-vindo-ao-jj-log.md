---
title: "Bem-vindo ao JJ Log"
description: "O que é este blog, por que existe, e o que você pode esperar encontrar aqui."
pubDate: 2026-08-22
tags:
  - meta
  - blog
draft: false
---

## O que é o JJ Log

O **JJ Log** é meu diário técnico pessoal — um espaço para publicar artigos sobre desenvolvimento de software, arquitetura, IA, .NET, Angular, DevOps e projetos que estou construindo ou estudando.

A ideia é simples: tudo que eu aprendo, experimento ou construo pode se transformar em um artigo.

## Por que este blog existe

Acredito em **aprender em público**. Escrever sobre o que estou estudando me ajuda a:

1. Consolidar conhecimento
2. Compartilhar experiências reais
3. Documentar decisões e aprendizados
4. Conectar com outros desenvolvedores

> "Ensinar é aprender duas vezes." — Joseph Joubert

## O que você encontrará aqui

Assuntos que provavelmente aparecerão no blog:

- Desenvolvimento com **.NET** e **Angular**
- Inteligência artificial e experimentos locais
- Arquitetura de software e boas práticas
- DevOps, CI/CD e automação
- Projetos pessoais e tutoriais práticos

| Área        | Exemplos                          |
| ----------- | --------------------------------- |
| Backend     | APIs, RAG, integrações            |
| Frontend    | Angular, UX, componentes            |
| Infra       | GitHub Actions, deploy estático     |
| Aprendizado | Notas de estudo, experimentos     |

## Como funciona por baixo dos panos

Cada artigo é um arquivo Markdown no repositório. Para publicar, basta criar um `.md`, adicionar frontmatter e fazer push:

```bash
git add src/content/blog/meu-artigo.md
git commit -m "add: meu novo artigo"
git push
```

O site é gerado estaticamente com **Astro** — sem banco de dados, sem backend, sem CMS.

Exemplo de código C# que pode aparecer nos artigos:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run();
```

Para referência externa, confira a [documentação do Astro](https://docs.astro.build).

Bem-vindo ao **JJ Log**. Espero que encontre algo útil por aqui.

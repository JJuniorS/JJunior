---
translationKey: welcome-post
title: "Welcome to JJunior"
description: "What this blog is, why it exists, and what you can expect to find here."
pubDate: 2026-08-22
tags:
  - meta
  - blog
draft: false
---

## What is JJunior

**JJunior** is my personal technical journal — a place to publish articles about software development, architecture, AI, .NET, Angular, DevOps, and projects I'm building or studying.

The idea is simple: everything I learn, experiment with, or build can become an article.

## Why this blog exists

I believe in **learning in public**. Writing about what I'm studying helps me to:

1. Consolidate knowledge
2. Share real-world experiences
3. Document decisions and learnings
4. Connect with other developers

> "To teach is to learn twice." — Joseph Joubert

## What you'll find here

Topics that will likely appear on the blog:

- Development with **.NET** and **Angular**
- Artificial intelligence and local experiments
- Software architecture and best practices
- DevOps, CI/CD, and automation
- Personal projects and practical tutorials

| Area      | Examples                          |
| --------- | --------------------------------- |
| Backend   | APIs, RAG, integrations           |
| Frontend  | Angular, UX, components           |
| Infra     | GitHub Actions, static deploy     |
| Learning  | Study notes, experiments          |

## How it works under the hood

Each article is a Markdown file in the repository. To publish, just create a `.md` file, add frontmatter, and push:

```bash
git add src/content/blog/en/my-article.md
git commit -m "add: my new article"
git push
```

The site is statically generated with **Astro** — no database, no backend, no CMS.

Example C# code that may appear in articles:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run();
```

For external reference, check the [Astro documentation](https://docs.astro.build).

Welcome to **JJunior**. I hope you find something useful here.

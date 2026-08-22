# JJunior

Um diário técnico sobre código, tecnologia, aprendizado e projetos.

Site estático construído com [Astro](https://astro.build), TypeScript e Markdown. Cada artigo é um arquivo `.md` no repositório — sem banco de dados, backend ou CMS.

## Estrutura do projeto

```
src/
├── components/       # Header, Footer, ArticleCard, Seo
├── content/
│   └── blog/         # Artigos em Markdown
├── layouts/          # BaseLayout e ArticleLayout
├── pages/
│   ├── index.astro   # Página inicial
│   ├── rss.xml.js    # Feed RSS
│   └── blog/         # Páginas individuais dos artigos
├── styles/
│   └── global.css    # Estilos globais e tipografia
└── content.config.ts # Schema da collection "blog"
```

## Como criar um novo artigo

1. Crie um arquivo `.md` em `src/content/blog/`:

```md
---
title: "Título do artigo"
description: "Breve descrição para listagens e SEO."
pubDate: 2026-08-22
tags:
  - tag1
  - tag2
draft: false
---

Conteúdo do artigo em Markdown...
```

2. O slug da URL é gerado automaticamente a partir do nome do arquivo.
   - `meu-artigo.md` → `/blog/meu-artigo/`

3. Artigos com `draft: true` **não aparecem** no site, RSS ou sitemap.

4. Faça commit e push:

```bash
git add src/content/blog/meu-artigo.md
git commit -m "add: meu artigo"
git push
```

## Executar localmente

```bash
npm install
npm run dev
```

Acesse: [http://localhost:4321/](http://localhost:4321/)

## Gerar build de produção

```bash
npm run build
npm run preview
```

O output estático fica em `dist/`.

## Publicar no GitHub Pages

### Pré-requisitos

1. Repositório no GitHub — para servir na raiz (`https://seu-usuario.github.io/`), use um repositório **`seu-usuario.github.io`** ou um domínio customizado
2. Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions** como source

### Configurar URL do site

Antes do primeiro deploy, atualize em [`astro.config.mjs`](astro.config.mjs):

```js
site: 'https://seu-usuario.github.io',
```

Substitua `seu-usuario` pelo seu username do GitHub.

Também atualize a URL do sitemap em [`public/robots.txt`](public/robots.txt).

> Se o repositório **não** for `seu-usuario.github.io` (ex: `seu-usuario/JJunior`), o GitHub Pages servirá em um subpath (`/JJunior/`). Nesse caso, adicione `base: '/JJunior/'` de volta no `astro.config.mjs`.

### Deploy automático

A cada push na branch `main`, o workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) faz build e publica automaticamente.

Site disponível em: `https://seu-usuario.github.io/`

## Fluxo de publicação

```
Criar arquivo .md → Adicionar frontmatter → Git commit → Push → Build Astro → Artigo no ar
```

## Stack

- Astro 7 + TypeScript (strict)
- Content Collections com schema Zod
- Markdown com syntax highlighting (Shiki)
- RSS (`@astrojs/rss`)
- Sitemap (`@astrojs/sitemap`)
- CSS próprio (sem Tailwind)

## Licença

Projeto pessoal — JJunior.

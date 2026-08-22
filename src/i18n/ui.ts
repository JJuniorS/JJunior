import type { Locale } from './config';

export const ui = {
  pt: {
    siteDescription:
      'Um diário técnico sobre código, tecnologia, aprendizado e projetos.',
    navLabel: 'Principal',
    articles: 'Artigos',
    rss: 'RSS',
    articlesHeading: 'Artigos',
    emptyState: 'Nenhum artigo publicado ainda. Em breve!',
    tags: 'Tags',
    switchLanguage: 'Trocar idioma',
  },
  en: {
    siteDescription:
      'A technical journal about code, technology, learning, and projects.',
    navLabel: 'Main',
    articles: 'Articles',
    rss: 'RSS',
    articlesHeading: 'Articles',
    emptyState: 'No articles published yet. Coming soon!',
    tags: 'Tags',
    switchLanguage: 'Switch language',
  },
} as const;

export type UiKey = keyof (typeof ui)['pt'];

export function useTranslations(lang: Locale) {
  return ui[lang];
}

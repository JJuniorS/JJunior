import type { CollectionEntry } from 'astro:content';
import { getAlternateLocale, type Locale, locales } from './config';

export function getPostLang(post: CollectionEntry<'blog'>): Locale {
  const lang = post.id.split('/')[0];
  if (lang !== 'pt' && lang !== 'en') {
    throw new Error(`Invalid locale in post id: ${post.id}`);
  }
  return lang;
}

export function getPostSlug(post: CollectionEntry<'blog'>): string {
  return post.id.split('/').slice(1).join('/');
}

export function findTranslation(
  posts: CollectionEntry<'blog'>[],
  translationKey: string,
  targetLang: Locale,
): CollectionEntry<'blog'> | undefined {
  return posts.find(
    (post) =>
      post.data.translationKey === translationKey &&
      getPostLang(post) === targetLang &&
      !post.data.draft,
  );
}

/** Path relative to the site root (includes base), e.g. /JJunior/pt/blog/foo/ */
export function localePath(lang: Locale, path?: string): string {
  if (!path) {
    return `${lang}/`;
  }

  const trimmed = path.replace(/^\/|\/$/g, '');
  if (trimmed.endsWith('.xml')) {
    return `${lang}/${trimmed}`;
  }

  return `${lang}/${trimmed}/`;
}

export function localizedPath(lang: Locale, path?: string): string {
  return `${import.meta.env.BASE_URL}${localePath(lang, path)}`;
}

export function localizedUrl(site: URL, lang: Locale, path?: string): string {
  return new URL(localizedPath(lang, path), site.origin).href;
}

export function buildAlternatePaths(
  currentLang: Locale,
  options: {
    path?: string;
    posts?: CollectionEntry<'blog'>[];
    translationKey?: string;
  } = {},
): Partial<Record<Locale, string>> {
  const { path, posts, translationKey } = options;
  const paths: Partial<Record<Locale, string>> = {};

  for (const locale of locales) {
    if (translationKey && posts) {
      const translation = findTranslation(posts, translationKey, locale);
      if (translation) {
        paths[locale] = localizedPath(
          locale,
          `blog/${getPostSlug(translation)}`,
        );
      }
      continue;
    }

    paths[locale] = localizedPath(locale, path);
  }

  return paths;
}

export function buildAlternateUrls(
  site: URL,
  currentLang: Locale,
  options: {
    path?: string;
    posts?: CollectionEntry<'blog'>[];
    translationKey?: string;
  } = {},
): Partial<Record<Locale, string>> {
  const { path, posts, translationKey } = options;
  const urls: Partial<Record<Locale, string>> = {};

  for (const locale of locales) {
    if (translationKey && posts) {
      const translation = findTranslation(posts, translationKey, locale);
      if (translation) {
        urls[locale] = localizedUrl(
          site,
          locale,
          `blog/${getPostSlug(translation)}`,
        );
      }
      continue;
    }

    urls[locale] = localizedUrl(site, locale, path);
  }

  const alternateLang = getAlternateLocale(currentLang);
  if (!urls[alternateLang]) {
    return urls;
  }

  return urls;
}

export function getAlternateUrl(
  site: URL,
  currentLang: Locale,
  options: {
    path?: string;
    posts?: CollectionEntry<'blog'>[];
    translationKey?: string;
  } = {},
): string | null {
  const alternateLang = getAlternateLocale(currentLang);
  const urls = buildAlternateUrls(site, currentLang, options);
  return urls[alternateLang] ?? null;
}

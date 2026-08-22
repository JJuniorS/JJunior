import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { locales, type Locale } from '../../i18n/config';
import { useTranslations } from '../../i18n/ui';
import { getPostLang, getPostSlug, localizedUrl } from '../../i18n/utils';

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}

export async function GET(context: {
  site: URL;
  params: { lang: string };
}) {
  const lang = context.params.lang as Locale;
  const t = useTranslations(lang);

  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .filter((post) => getPostLang(post) === lang)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'JJunior',
    description: t.siteDescription,
    site: localizedUrl(context.site, lang),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: localizedUrl(context.site, lang, `blog/${getPostSlug(post)}`),
    })),
  });
}

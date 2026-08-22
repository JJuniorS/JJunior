import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

const siteDescription =
  'Um diário técnico sobre código, tecnologia, aprendizado e projetos.';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const base = import.meta.env.BASE_URL;

  return rss({
    title: 'JJ Log',
    description: siteDescription,
    site: new URL(import.meta.env.BASE_URL, context.site).href,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `${base}blog/${post.id}/`,
    })),
  });
}

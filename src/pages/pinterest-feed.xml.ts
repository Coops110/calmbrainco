import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { products } from '../data/products';
import { SITE } from '../lib/seo';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const entries = await getCollection('products');
  const dataBySlug = new Map(entries.map((e) => [e.id, e.data]));

  const items = Object.values(products)
    .map((product) => {
      const data = dataBySlug.get(product.slug);
      const title = escapeXml(data?.title ?? product.title);
      const description = escapeXml(data?.description ?? product.title);
      return `  <item>
    <g:id>${product.slug}</g:id>
    <title>${title}</title>
    <description>${description}</description>
    <link>${SITE}/shop/${product.slug}/</link>
    <g:image_link>${SITE}/og/${product.slug}.png</g:image_link>
    <g:availability>in stock</g:availability>
    <g:price>${product.price.toFixed(2)} USD</g:price>
    <g:condition>new</g:condition>
    <g:product_type>Printable planners &gt; ADHD planners</g:product_type>
    <g:brand>Calm Brain Co</g:brand>
  </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Calm Brain Co Product Catalog</title>
  <link>${SITE}/shop/</link>
  <description>Printable ADHD planners, instant PDF downloads.</description>
${items}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

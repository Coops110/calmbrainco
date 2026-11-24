import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';
import { products } from '../data/products';

function stripMd(markdown: string) {
  return markdown.replace(/\r\n/g, '\n');
}

export const GET: APIRoute = async () => {
  const productEntries = await getCollection('products');

  const parts: string[] = [
    '# Calm Brain Co: full site text',
    '',
    'Generated from the live content collections. Every product and key fact on calmbrainco.pages.dev in one file.',
    '',
  ];

  for (const entry of productEntries) {
    const product = products[entry.id];
    const { body } = entry;
    parts.push(`## ${entry.data.title}`);
    parts.push(`https://calmbrainco.pages.dev/shop/${entry.id}/`);
    parts.push('');
    parts.push(`Price: US$${product.price.toFixed(2)}. Pages: ${product.pageCount}. Format: PDF, US Letter and A4. Gumroad: ${product.gumroad} Payhip: ${product.payhip}`);
    parts.push('');
    parts.push(stripMd(body ?? ''));
    parts.push('');
    parts.push('Questions:');
    for (const item of entry.data.faq) {
      parts.push(`Q: ${item.q}`);
      parts.push(`A: ${item.a}`);
    }
    parts.push('\n---\n');
  }


  return new Response(parts.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};

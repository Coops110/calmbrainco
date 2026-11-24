import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Product copy only. Real page renders, prices, checkout URLs and the page
// list live in src/data/products.ts next to the imported images, since content
// collections can't cleanly hold `astro:assets` image imports for a fixed,
// hand-ordered gallery. This file holds only what an editor would want to
// change in prose: tagline, intro body, features, FAQ.
const productSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  description: z.string(), // meta description
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  publishDate: z.string(),
  modifiedDate: z.string().optional(),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: productSchema,
});

export const collections = { products };

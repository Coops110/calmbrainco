import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Every product lives in this one collection regardless of category, so the
// shop index and homepage "featured" grid work automatically as new products
// get added — no page code changes needed, just a new markdown file. The
// `category` field is what lets the site expand past ADHD later (e.g.
// 'adhd', 'anxiety', 'focus') without restructuring anything.
const productSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  description: z.string(), // used as the meta description + shop card blurb
  price: z.number(),
  category: z.string().default('adhd'),
  heroImage: z.string(),
  gallery: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
  features: z.array(z.string()).default([]),
  checkout: z.object({
    gumroad: z.string().url().optional(),
    payhip: z.string().url().optional(),
  }),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  draft: z.boolean().default(false),
  publishDate: z.string(),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: productSchema,
});

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishDate: z.string(),
  modifiedDate: z.string().optional(),
  author: z.string().default('Calm Brain Co'),
  category: z.string().default('ADHD'),
  tags: z.array(z.string()).default([]),
  relatedProduct: z.string().optional(), // slug into the products collection, for a CTA at the end of the post
  draft: z.boolean().default(false),
  noindex: z.boolean().default(false),
  image: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: blogSchema,
});

export const collections = { products, blog };

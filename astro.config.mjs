import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://calmbrainco.shop',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [
    sitemap({
      changefreq: undefined,
      priority: undefined,
      serialize(item) {
        // Google ignores priority/changefreq; keep the file minimal and honest.
        return item;
      },
    }),
  ],
});

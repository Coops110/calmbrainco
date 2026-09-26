import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://calmbrainco.pages.dev',
  trailingSlash: 'never',
  build: {
    format: 'directory'
  },
  compressHTML: true,
  integrations: [sitemap()],
});

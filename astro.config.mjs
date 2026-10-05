import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://calmbrainco.shop',
  trailingSlash: 'never',
  build: {
    format: 'directory'
  },
  compressHTML: true,
  integrations: [sitemap()],
});

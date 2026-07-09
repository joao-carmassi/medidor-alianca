// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import process from 'node:process';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  site: env.ASTRO_SITE,
  base: env.ASTRO_BASE,
  vite: {
    plugins: [tailwindcss()],
  },
});

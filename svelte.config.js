// Build scaffold for the kb export. The export carries only src/ (apps/kb/ → src/), so this
// file rebuilds what the support repo runs around it: .svx pages through mdsvex, the runbook
// layout, the #lib alias, and a static prerender of every page.
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

// mdsvex imports layouts by this exact path, so it has to be absolute.
const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.svx'],
      layout: { runbook },
    }),
  ],
  kit: {
    // The built site is kept in the repo, so the pages can be read as the desk sees them.
    adapter: adapter({ pages: 'build', assets: 'build' }),
    alias: { '#lib': 'src/lib' },
    // One self-contained file per page: styles inline, so a saved page looks the same offline.
    inlineStyleThreshold: Infinity,
    prerender: { entries: ['/kb'] },
  },
};

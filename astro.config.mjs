import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Patches node_modules/vite/dist/client/client.mjs
function patchViteErrorOverlay() {
  return {
    name: 'patch-vite-error-overlay',
    transform(code, id) {
      if (id.includes('vite/dist/client/client.mjs')) {
        return code.replace(
          /const editorLink = this\.createLink\(`Open in editor\${[^}]*}\`, void 0\);[\s\S]*?codeHeader\.appendChild\(editorLink\);/g,
          ''
        );
      }
    },
  };
}

export default defineConfig({
  base: '',
  output: 'server',
  devToolbar: {
    enabled: false,
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: false,
    },
  }),
  integrations: [
    react(),
  ],
  vite: {
    plugins: [tailwindcss(), patchViteErrorOverlay()],
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: [
          '**/lost+found/**',
          '**/dist/**',
          '**/node_modules/**',
          '**/src/site-components/**',
          '**/*.md',
          /[/\\]webflow\.json$/,
        ],
      },
    },
    resolve: {
      alias: import.meta.env.PROD
        ? {
            'react-dom/server': 'react-dom/server.edge',
          }
        : undefined,
    },
  },
});
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const appVersion = packageJson.version ?? '2.0.0';

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
  output: 'static',
  devToolbar: {
    enabled: false,
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  integrations: [
    react(),
  ],
  vite: {
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
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

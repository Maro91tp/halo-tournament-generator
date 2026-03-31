import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const baseVersion = packageJson.version ?? '2.0.0';
const versionBaseCommit = Number(packageJson.versionBaseCommit ?? 0);

function getGitCommitCount() {
  try {
    return Number(
      execSync('git rev-list --count HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim()
    );
  } catch {
    return versionBaseCommit;
  }
}

function buildAppVersion(version, currentCommitCount) {
  const [major = '2', minor = '0'] = String(version).split('.');
  const patch = Math.max(0, currentCommitCount - versionBaseCommit);
  return `${major}.${minor}.${patch}`;
}

const appVersion = buildAppVersion(baseVersion, getGitCommitCount());

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

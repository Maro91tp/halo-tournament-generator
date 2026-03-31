import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const baseVersion = packageJson.version ?? '2.0.0';
const versionBaseSha = packageJson.versionBaseSha ?? '';

function getLocalPatchCount() {
  if (!versionBaseSha) return 0;

  try {
    return Number(
      execSync(`git rev-list ${versionBaseSha}..HEAD --count`, { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim()
    );
  } catch {
    return 0;
  }
}

async function getRemotePatchCount() {
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const repo = process.env.VERCEL_GIT_REPO_SLUG;
  const headSha = process.env.VERCEL_GIT_COMMIT_SHA;

  if (!owner || !repo || !headSha || !versionBaseSha) {
    return null;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/compare/${versionBaseSha}...${headSha}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': `${owner}-${repo}-version-check`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return typeof data.total_commits === 'number' ? data.total_commits : null;
  } catch {
    return null;
  }
}

function buildAppVersion(version, patchCount) {
  const [major = '2', minor = '0'] = String(version).split('.');
  const patch = Math.max(0, patchCount);
  return `${major}.${minor}.${patch}`;
}

const remotePatchCount = await getRemotePatchCount();
const appVersion = buildAppVersion(baseVersion, remotePatchCount ?? getLocalPatchCount());

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

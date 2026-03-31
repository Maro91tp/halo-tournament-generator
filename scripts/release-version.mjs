import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const releaseType = process.argv[2];

if (!['minor', 'major'].includes(releaseType)) {
  console.error('Usage: node scripts/release-version.mjs <minor|major>');
  process.exit(1);
}

const packageJsonPath = new URL('../package.json', import.meta.url);
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const [major, minor] = String(packageJson.version ?? '2.0.0')
  .split('.')
  .map((value) => Number(value || 0));

const nextVersion =
  releaseType === 'major'
    ? `${major + 1}.0.0`
    : `${major}.${minor + 1}.0`;

const currentHeadSha = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
  .toString()
  .trim();

packageJson.version = nextVersion;
packageJson.versionBaseSha = currentHeadSha;

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log(`Updated version to ${nextVersion} with base sha ${currentHeadSha}`);

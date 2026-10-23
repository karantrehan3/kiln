import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Plugin } from 'vite';

interface BuildInfoOptions {
  /** "owner/name" of a public GitHub repo; enables window.BI()'s latest-commit check. */
  repo?: string;
  /** Branch that production deploys from. */
  deployBranch: string;
}

const git = (args: string): string | undefined => {
  try {
    return (
      execSync(`git ${args}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() ||
      undefined
    );
  } catch {
    return undefined;
  }
};

/**
 * Bakes build metadata into the bundle as __BUILD_INFO__, read by window.BI() (src/lib/buildInfo.ts).
 * Commit/branch come from Render's build args first (.git is stripped from Docker builds there),
 * then local git. Never fails the build - unknown values are reported as "unknown".
 */
export const buildInfoPlugin = ({ repo, deployBranch }: BuildInfoOptions): Plugin => ({
  name: 'build-info',
  config(_, { mode }) {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'));
    const env = process.env;

    const buildInfo = {
      name: pkg.name,
      version: pkg.version,
      commit: env.RENDER_GIT_COMMIT || git('rev-parse HEAD') || 'unknown',
      branch: env.RENDER_GIT_BRANCH || git('rev-parse --abbrev-ref HEAD') || 'unknown',
      builtAt: new Date().toISOString(),
      mode,
      repo: repo ?? null,
      deployBranch,
    };

    return { define: { __BUILD_INFO__: JSON.stringify(buildInfo) } };
  },
});

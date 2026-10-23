/**
 * window.BI() - prints build info in the browser console and checks whether
 * this deploy matches the latest commit on the deploy branch.
 * __BUILD_INFO__ is injected at build time by vite/buildInfoPlugin.ts.
 */

interface BuildInfo {
  name: string;
  version: string;
  commit: string;
  branch: string;
  builtAt: string;
  mode: string;
  repo: string | null;
  deployBranch: string;
}

declare const __BUILD_INFO__: BuildInfo;

declare global {
  interface Window {
    BI?: () => void;
  }
}

const checkLatest = async ({ repo, commit, deployBranch }: BuildInfo): Promise<void> => {
  // base = deployed commit, head = deploy branch; "ahead" means the branch has newer commits
  const response = await fetch(
    `https://api.github.com/repos/${repo}/compare/${commit}...${deployBranch}`,
  );
  if (!response.ok) {
    throw new Error(`GitHub API responded ${response.status}`);
  }
  const { status, ahead_by: behindBy } = (await response.json()) as {
    status: string;
    ahead_by: number;
  };

  if (status === 'identical') {
    console.info(`✅ Latest: matches ${repo}@${deployBranch}`);
  } else if (status === 'ahead') {
    console.warn(`⚠️ Outdated: ${behindBy} commit(s) behind ${repo}@${deployBranch}`);
  } else {
    console.warn(`ℹ️ Deployed commit is not on ${deployBranch} (GitHub status: ${status})`);
  }
};

export const initialiseBuildInfo = (): void => {
  window.BI = () => {
    console.table(__BUILD_INFO__);
    if (!__BUILD_INFO__.repo || __BUILD_INFO__.commit === 'unknown') {
      return;
    }
    checkLatest(__BUILD_INFO__).catch((error: unknown) => {
      console.error('Could not check for a newer version:', error);
    });
  };
};

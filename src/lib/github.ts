/**
 * Minimal GitHub Contents API client used by the admin portal.
 *
 * Security model
 * --------------
 * There is no server and no committed secret. The editor supplies their own
 * fine-grained personal access token at sign-in; it is held in sessionStorage
 * (or localStorage only if they explicitly opt in) and sent as an Authorization
 * header directly to api.github.com.
 *
 * The authorization boundary is GitHub itself, not the /admin route: without a
 * token that carries Contents:write on this repository, every write below is
 * rejected by GitHub with 401/403. Hiding the route would not add security and
 * is not relied on for any.
 */

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
}

export interface FileHandle {
  /** Blob SHA of the version we read — required by GitHub to update safely. */
  sha: string;
  content: string;
}

const API = 'https://api.github.com';

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function request<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { ...headers(token), ...(init?.headers ?? {}) },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) detail = body.message;
    } catch {
      /* Non-JSON error bodies are rare but not worth failing over. */
    }
    throw new GitHubError(detail, response.status);
  }

  return (await response.json()) as T;
}

/** Encode a UTF-8 string as base64 without tripping over non-Latin1 characters. */
export function toBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Decode base64 (as returned by the Contents API) back to a UTF-8 string. */
export function fromBase64(input: string): string {
  const binary = atob(input.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Verify a token and return the account it belongs to. */
export function getViewer(token: string): Promise<GitHubUser> {
  return request<GitHubUser>(`${API}/user`, token);
}

/**
 * Confirm the token can actually write to the target repository, so sign-in
 * fails immediately rather than at the first save.
 */
export async function checkRepoAccess(token: string, config: RepoConfig): Promise<boolean> {
  const repo = await request<{ permissions?: { push?: boolean } }>(
    `${API}/repos/${config.owner}/${config.repo}`,
    token,
  );
  return Boolean(repo.permissions?.push);
}

/** Read a text file from the repository, returning its content and blob SHA. */
export async function readFile(
  token: string,
  config: RepoConfig,
  path: string,
): Promise<FileHandle | null> {
  try {
    const file = await request<{ sha: string; content: string; encoding: string }>(
      `${API}/repos/${config.owner}/${config.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(config.branch)}`,
      token,
    );
    return { sha: file.sha, content: fromBase64(file.content) };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Create or update a file. Passing the SHA we last read makes the write
 * conflict rather than silently clobber a change made elsewhere.
 */
export async function writeFile(
  token: string,
  config: RepoConfig,
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<{ sha: string; commitUrl: string }> {
  const result = await request<{ content: { sha: string }; commit: { html_url: string } }>(
    `${API}/repos/${config.owner}/${config.repo}/contents/${encodeURI(path)}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: toBase64(content),
        branch: config.branch,
        ...(sha ? { sha } : {}),
      }),
    },
  );
  return { sha: result.content.sha, commitUrl: result.commit.html_url };
}

/** Upload binary media (already base64-encoded) to the repository. */
export async function writeBinaryFile(
  token: string,
  config: RepoConfig,
  path: string,
  base64Content: string,
  message: string,
): Promise<{ sha: string; commitUrl: string }> {
  // An existing file at the same path needs its SHA to be replaced.
  let sha: string | undefined;
  try {
    const existing = await request<{ sha: string }>(
      `${API}/repos/${config.owner}/${config.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(config.branch)}`,
      token,
    );
    sha = existing.sha;
  } catch (error) {
    if (!(error instanceof GitHubError && error.status === 404)) throw error;
  }

  const result = await request<{ content: { sha: string }; commit: { html_url: string } }>(
    `${API}/repos/${config.owner}/${config.repo}/contents/${encodeURI(path)}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: base64Content,
        branch: config.branch,
        ...(sha ? { sha } : {}),
      }),
    },
  );
  return { sha: result.content.sha, commitUrl: result.commit.html_url };
}

/** Latest workflow run, so the dashboard can show deployment state. */
export async function latestWorkflowRun(
  token: string,
  config: RepoConfig,
): Promise<{ status: string; conclusion: string | null; html_url: string; created_at: string } | null> {
  try {
    const runs = await request<{
      workflow_runs: {
        status: string;
        conclusion: string | null;
        html_url: string;
        created_at: string;
      }[];
    }>(
      `${API}/repos/${config.owner}/${config.repo}/actions/runs?per_page=1&branch=${encodeURIComponent(config.branch)}`,
      token,
    );
    return runs.workflow_runs[0] ?? null;
  } catch {
    // Workflow visibility is a nice-to-have; a token without Actions scope
    // should still be able to edit content.
    return null;
  }
}

export const repoConfig: RepoConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || 'VidvathamaIIITH',
  repo: import.meta.env.VITE_GITHUB_REPO || 'VidvathamaIIITH.github.io',
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
};

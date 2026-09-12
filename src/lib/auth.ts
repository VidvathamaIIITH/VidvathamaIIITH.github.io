import { getViewer, checkRepoAccess, repoConfig, GitHubError, type GitHubUser } from './github';

const TOKEN_KEY = 'cms.token';
const USER_KEY = 'cms.user';

export interface Session {
  token: string;
  user: GitHubUser;
}

/**
 * Token storage.
 *
 * sessionStorage by default — the token dies with the tab. localStorage only
 * when the editor ticks "remember on this device", which is an explicit,
 * informed choice surfaced in the sign-in form.
 */
function store(persist: boolean): Storage {
  return persist ? window.localStorage : window.sessionStorage;
}

export function loadSession(): Session | null {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      const token = storage.getItem(TOKEN_KEY);
      const rawUser = storage.getItem(USER_KEY);
      if (token && rawUser) {
        return { token, user: JSON.parse(rawUser) as GitHubUser };
      }
    } catch {
      /* Storage may be unavailable (private mode, blocked cookies). */
    }
  }
  return null;
}

export function saveSession(session: Session, persist: boolean): void {
  try {
    const storage = store(persist);
    storage.setItem(TOKEN_KEY, session.token);
    storage.setItem(USER_KEY, JSON.stringify(session.user));
  } catch {
    /* A session that cannot be persisted still works for this page view. */
  }
}

export function clearSession(): void {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
    } catch {
      /* Nothing to clear if storage is unavailable. */
    }
  }
}

export class AuthError extends Error {}

/**
 * Exchange a token for a session, failing fast when the token is invalid or
 * lacks write access to the content repository.
 */
export async function signIn(token: string, persist: boolean): Promise<Session> {
  const trimmed = token.trim();
  if (!trimmed) throw new AuthError('Enter a personal access token.');

  let user: GitHubUser;
  try {
    user = await getViewer(trimmed);
  } catch (error) {
    if (error instanceof GitHubError && (error.status === 401 || error.status === 403)) {
      throw new AuthError('GitHub rejected that token. Check that it is valid and not expired.');
    }
    throw new AuthError('Could not reach GitHub. Check your connection and try again.');
  }

  let canWrite = false;
  try {
    canWrite = await checkRepoAccess(trimmed, repoConfig);
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) {
      throw new AuthError(
        `This token cannot see ${repoConfig.owner}/${repoConfig.repo}. Grant it repository access, or check the repository name.`,
      );
    }
    throw new AuthError('Could not verify repository access.');
  }

  if (!canWrite) {
    throw new AuthError(
      `This token can read ${repoConfig.owner}/${repoConfig.repo} but not write to it. Grant Contents: Read and write.`,
    );
  }

  const session: Session = { token: trimmed, user };
  saveSession(session, persist);
  return session;
}

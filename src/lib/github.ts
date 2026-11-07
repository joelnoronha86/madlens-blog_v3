export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  download_url: string | null;
  html_url: string;
}

export interface GitHubContentResponse {
  content: string;
  encoding: string;
  sha: string;
}

export interface GitHubCommitResponse {
  commit: {
    author: { name: string; email: string; date: string };
    message: string;
  };
  sha: string;
}

class GitHubClient {
  private token: string;
  private owner: string;
  private repo: string;
  private branch: string;

  constructor(token: string, owner: string, repo: string, branch = 'main') {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  async listDirectory(path: string): Promise<GitHubFile[]> {
    const res = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`,
      { headers: this.headers() }
    );
    if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
    return res.json();
  }

  async getFile(path: string): Promise<GitHubContentResponse> {
    const res = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`,
      { headers: this.headers() }
    );
    if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
    return res.json();
  }

  async createOrUpdateFile(
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<GitHubCommitResponse> {
    const body: Record<string, unknown> = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: this.branch,
    };
    if (sha) body.sha = sha;

    const res = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${res.status} ${error.message ?? res.statusText}`);
    }
    return res.json();
  }

  async deleteFile(path: string, message: string, sha: string): Promise<GitHubCommitResponse> {
    const res = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
      {
        method: 'DELETE',
        headers: this.headers(),
        body: JSON.stringify({ message, sha, branch: this.branch }),
      }
    );
    if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
    return res.json();
  }
}

export function createGitHubClient(
  token: string,
  owner: string,
  repo: string,
  branch?: string
) {
  return new GitHubClient(token, owner, repo, branch);
}

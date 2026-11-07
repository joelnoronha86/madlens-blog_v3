'use client';

import { useState, useEffect } from 'react';
import { Save, GitBranch, FileText, Image as ImageIcon } from 'lucide-react';

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  postsPath: string;
  imagesPath: string;
}

const DEFAULT_CONFIG: GitHubConfig = {
  token: '',
  owner: '',
  repo: '',
  branch: 'main',
  postsPath: 'src/content/posts',
  imagesPath: 'src/content/assets',
};

export function SettingsClient() {
  const [config, setConfig] = useState<GitHubConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('github_config');
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      localStorage.setItem('github_config', JSON.stringify(config));
      setStatus('success');
      setStatusMessage('GitHub configuration saved.');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setStatusMessage('Failed to save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text mb-2">Settings</h1>
        <p className="text-muted font-body">
          Configure GitHub repository connection for storing posts and images.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-heading font-bold text-text mb-6">GitHub Configuration</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Personal Access Token
            </label>
            <input
              type="password"
              value={config.token}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, token: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              placeholder="ghp_..."
            />
            <p className="text-xs text-muted mt-1">
              Create a token at GitHub Settings → Developer settings → Personal access tokens.
              Needs repo scope.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Repository Owner
              </label>
              <input
                type="text"
                value={config.owner}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, owner: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                placeholder="your-username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Repository Name
              </label>
              <input
                type="text"
                value={config.repo}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, repo: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                placeholder="madlens-blog"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Branch
              </label>
              <input
                type="text"
                value={config.branch}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, branch: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                placeholder="main"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Posts Path
              </label>
              <input
                type="text"
                value={config.postsPath}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, postsPath: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                placeholder="src/content/posts"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Images Path
            </label>
            <input
              type="text"
              value={config.imagesPath}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, imagesPath: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              placeholder="src/content/assets"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-lg bg-text text-surface font-medium hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>

      {status === 'success' && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-100 text-green-800 text-sm">
          {statusMessage}
        </div>
      )}
      {status === 'error' && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-800 text-sm">
          {statusMessage}
        </div>
      )}

      <div className="bg-surface/50 border border-border rounded-lg p-6">
        <h2 className="text-xl font-heading font-bold text-text mb-4">How It Works</h2>
        <ul className="space-y-3 text-sm text-muted font-body">
          <li className="flex items-start gap-3">
            <GitBranch className="w-4 h-4 mt-0.5 text-accent" />
            Posts are stored as Markdown files with frontmatter in your GitHub repo.
          </li>
          <li className="flex items-start gap-3">
            <FileText className="w-4 h-4 mt-0.5 text-accent" />
            Drafts have <code className="font-tech">draft: true</code> and are hidden from production.
          </li>
          <li className="flex items-start gap-3">
            <ImageIcon className="w-4 h-4 mt-0.5 text-accent" />
            Images are committed to the images path and referenced by URL.
          </li>
        </ul>
      </div>
    </div>
  );
}

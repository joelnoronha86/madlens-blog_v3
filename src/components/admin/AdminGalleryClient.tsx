'use client';

import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, RefreshCw } from 'lucide-react';
import { createGitHubClient } from '../../lib/github';

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

export function AdminGalleryClient() {
  const [config, setConfig] = useState<GitHubConfig>(DEFAULT_CONFIG);
  const [images, setImages] = useState<{ name: string; path: string; url: string; size: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubClient, setGithubClient] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('github_config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
        if (parsed.token && parsed.owner && parsed.repo) {
          setGithubClient(createGitHubClient(parsed.token, parsed.owner, parsed.repo, parsed.branch));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (githubClient) {
      loadImages();
    }
  }, [githubClient]);

  const loadImages = async () => {
    if (!githubClient) return;
    setIsLoading(true);
    setError(null);
    try {
      const files = await githubClient.listDirectory(config.imagesPath);
      const imageFiles = files.filter((f: any) => f.type === 'file' && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name));
      const mapped = imageFiles.map((f: any) => ({
        name: f.name,
        path: f.path,
        url: f.download_url || `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${f.path}`,
        size: f.size,
      }));
      setImages(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !githubClient) return;
    setIsUploading(true);
    setError(null);
    try {
      const imagePath = `${config.imagesPath}/${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const base64 = btoa(String.fromCharCode(...bytes));
      await githubClient.createOrUpdateFile(
        imagePath,
        base64,
        `chore(assets): upload image "${file.name}"`
      );
      const url = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${imagePath}`;
      setImages((prev) => [...prev, { name: file.name, path: imagePath, url, size: file.size }]);
      e.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (name: string, path: string, sha: string) => {
    if (!confirm(`Delete image "${name}"?`)) return;
    if (!githubClient) return;
    try {
      await githubClient.deleteFile(path, `chore(assets): delete image "${name}"`, sha);
      setImages((prev) => prev.filter((img) => img.path !== path));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  if (!config.token || !config.owner || !config.repo) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-surface border border-border rounded-lg p-8">
          <ImageIcon className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-text mb-2">GitHub Configuration Required</h2>
          <p className="text-muted font-body mb-6">
            Please configure your GitHub repository in Settings before using the gallery.
          </p>
          <a
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-text text-surface rounded-lg font-medium hover:bg-accent transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37M9 10.8a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1H9z" />
            </svg>
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text mb-2">Image Gallery</h1>
          <p className="text-muted font-body">
            All saved images from natural dyeing processes, plants, and geographies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-6 py-3 bg-text text-surface rounded-lg font-medium hover:bg-accent transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={loadImages}
            disabled={isLoading}
            className="px-4 py-3 rounded-lg border border-border bg-surface text-text hover:bg-surface/50 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-800 text-sm">
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted">No images in the gallery yet.</p>
          <p className="text-sm text-muted mt-2">Upload images to use them in your essays.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.path} className="group rounded-lg overflow-hidden border border-border bg-surface">
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="p-3">
                <h4 className="text-sm font-medium text-text truncate">{img.name}</h4>
                <p className="text-xs text-muted font-tech">
                  {(img.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex justify-between items-center px-3 py-2 border-t border-border bg-surface/50">
                <button
                  onClick={() => navigator.clipboard.writeText(img.url)}
                  className="text-xs text-accent hover:text-accent-hover font-medium"
                  title="Copy URL"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleDelete(img.name, img.path, '')}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

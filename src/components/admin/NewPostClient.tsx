'use client';

import { useState, useEffect } from 'react';
import { TiptapEditor } from './TiptapEditor.tsx';
import { Save, FileText, Upload, Check, X, Image as ImageIcon } from 'lucide-react';
import { createGitHubClient } from '../../lib/github';

interface PostFormData {
  title: string;
  description: string;
  tags: string[];
  content: string;
  coverImage: string;
  draft: boolean;
}

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

export function NewPostClient() {
  const [config, setConfig] = useState<GitHubConfig>(DEFAULT_CONFIG);
  const [form, setForm] = useState<PostFormData>({
    title: '',
    description: '',
    tags: [],
    content: '',
    coverImage: '',
    draft: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
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

  const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filePath = `${config.postsPath}/${slug}.md`;

  const frontmatter = `---
title: "${form.title}"
description: "${form.description}"
tags: [${form.tags.map((t) => `"${t}"`).join(', ')}]
draft: ${form.draft}
${form.draft ? '' : `publishedAt: "${new Date().toISOString()}"`}
${form.coverImage ? `coverImage: "${form.coverImage}"` : ''}
author: "Researcher-Artist"
---

${form.content}`;

  const handleSaveDraft = async () => {
    if (!githubClient) {
      setError('Please configure GitHub settings first.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const draftContent = frontmatter.replace('draft: false', 'draft: true');
      await githubClient.createOrUpdateFile(
        filePath,
        draftContent,
        `chore(posts): save draft "${form.title}"`
      );
      alert('Draft saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!githubClient) {
      setError('Please configure GitHub settings first.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await githubClient.createOrUpdateFile(
        filePath,
        frontmatter,
        `chore(posts): publish "${form.title}"`
      );
      alert('Post published successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (url: string) => {
    setForm((prev) => ({ ...prev, coverImage: url }));
  };

  const handleImageUpload = async (file: File) => {
    if (!githubClient) throw new Error('GitHub not configured');
    const imagePath = `${config.imagesPath}/${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode(...bytes));
    await githubClient.createOrUpdateFile(
      imagePath,
      base64,
      `chore(assets): upload image "${file.name}"`
    );
    const imageUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${imagePath}`;
    setImages((prev) => [...prev, { url: imageUrl, name: file.name }]);
    return imageUrl;
  };

  if (!config.token || !config.owner || !config.repo) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-surface border border-border rounded-lg p-8">
          <ImageIcon className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-text mb-2">GitHub Configuration Required</h2>
          <p className="text-muted font-body mb-6">
            Please configure your GitHub repository in Settings before creating posts.
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              placeholder="Enter post title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              placeholder="Brief description of your essay"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Tags</label>
            <input
              type="text"
              value={form.tags.join(', ')}
              onChange={(e) => {
                const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                setForm((prev) => ({ ...prev, tags }));
              }}
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              placeholder="e.g. madder, indigo, chemistry, field notes"
            />
            <p className="text-xs text-muted mt-1">Comma-separated tags</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Cover Image</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, coverImage: e.target.value }))
                }
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                placeholder="Image URL from gallery"
              />
              <button
                onClick={() => {
                  // Image gallery selection handled by TiptapEditor
                }}
                className="px-4 py-2 rounded-lg border border-border bg-surface text-text hover:bg-surface/50"
              >
                Browse Gallery
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Body</label>
            <TiptapEditor
              content={form.content}
              onChange={(html) =>
                setForm((prev) => ({ ...prev, content: html }))
              }
              imageGallery={{
                images,
                onSelect: handleImageSelect,
                onUpload: handleImageUpload,
              }}
            />
          </div>
          <div className="flex items-center gap-4 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.draft}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, draft: e.target.checked }))
                }
                className="rounded border-border text-accent focus:ring-accent"
              />
              Save as draft
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <button
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="px-6 py-3 rounded-lg border border-border bg-surface text-text font-medium hover:bg-surface/50 disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Draft
            </>
          )}
        </button>
        <button
          onClick={handlePublish}
          disabled={isSaving}
          className="px-6 py-3 rounded-lg bg-text text-surface font-medium hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publishing...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" /> Publish
            </>
          )}
        </button>
      </div>
    </div>
  );
}

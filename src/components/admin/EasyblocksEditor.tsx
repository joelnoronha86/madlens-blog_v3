'use client';

import { useState, useEffect } from 'react';
import { Save, Layout, Palette, Image as ImageIcon } from 'lucide-react';

interface EasyblocksConfig {
  backendId: string;
  token: string;
}

interface Block {
  id: string;
  type: 'text' | 'image' | 'heading' | 'gallery' | 'divider';
  content: any;
  styles: Record<string, any>;
}

export function EasyblocksEditor({ config }: { config: EasyblocksConfig }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  useEffect(() => {
    loadBlocks();
  }, [config]);

  const loadBlocks = async () => {
    if (!config.backendId || !config.token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `https://api.easyblocks.io/v1/backends/${config.backendId}/blocks`,
        {
          headers: { Authorization: `Bearer ${config.token}` },
        }
      );
      if (!res.ok) throw new Error('Failed to load blocks');
      const data = await res.json();
      setBlocks(data.blocks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load easyblocks');
    } finally {
      setIsLoading(false);
    }
  };

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: {},
      styles: {},
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlock(newBlock.id);
  };

  const saveBlocks = async () => {
    if (!config.backendId || !config.token) return;
    setIsSaving(true);
    try {
      const res = await fetch(
        `https://api.easyblocks.io/v1/backends/${config.backendId}/blocks`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${config.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blocks }),
        }
      );
      if (!res.ok) throw new Error('Failed to save blocks');
      alert('Page layout saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted font-body">Loading easyblocks...</p>
        </div>
      </div>
    );
  }

  if (!config.backendId || !config.token) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-surface border border-border rounded-lg p-8">
          <Layout className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-text mb-2">Easyblocks Configuration Required</h2>
          <p className="text-muted font-body mb-6">
            Please enter your easyblocks.io backend identifier and token in Settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text mb-2">Page Builder</h1>
          <p className="text-muted font-body">
            Drag and drop blocks to build your website pages visually.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveBlocks}
            disabled={isSaving}
            className="px-6 py-3 rounded-lg bg-text text-surface font-medium hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Block palette */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-sm font-heading font-bold text-text uppercase tracking-wider">Blocks</h3>
          <div className="space-y-2">
            {[
              { type: 'heading', label: 'Heading', icon: <span className="font-heading font-bold text-lg">H</span> },
              { type: 'text', label: 'Text', icon: <span className="font-body">T</span> },
              { type: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
              { type: 'gallery', label: 'Gallery', icon: <Palette className="w-4 h-4" /> },
              { type: 'divider', label: 'Divider', icon: <span className="w-4 h-4 border-t border-text" /> },
            ].map((block) => (
              <button
                key={block.type}
                onClick={() => addBlock(block.type)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-surface text-text hover:bg-surface/50 transition-colors"
              >
                {block.icon}
                <span className="font-body text-sm">{block.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-9 border border-border rounded-lg bg-surface min-h-[600px] relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button
              onClick={() => setBlocks([])}
              className="px-3 py-1.5 rounded text-xs text-red-600 border border-red-200 hover:bg-red-50"
            >
              Clear All
            </button>
          </div>

          <div className="p-8 space-y-8" id="easyblocks-canvas">
            {blocks.map((block) => (
              <div
                key={block.id}
                className={`relative group mb-6 p-4 rounded-lg border-2 ${
                  selectedBlock === block.id
                    ? 'border-accent bg-accent/5'
                    : 'border-transparent hover:border-border'
                }`}
              >
                {selectedBlock === block.id && (
                  <button
                    onClick={() => setSelectedBlock(null)}
                    className="absolute -top-3 -right-3 p-1 rounded bg-red-500 text-white hover:bg-red-600"
                    title="Remove block"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {block.type === 'heading' && (
                  <h2 className="font-heading font-bold text-2xl text-text">{block.content.text || 'Heading'}</h2>
                )}
                {block.type === 'text' && (
                  <p className="font-body text-text">{block.content.text || 'Paragraph text...'}</p>
                )}
                {block.type === 'image' && (
                  <div className="aspect-video bg-surface/50 border border-dashed border-border rounded flex items-center justify-center">
                    <span className="text-muted font-tech">{block.content.url || 'Image block'}</span>
                  </div>
                )}
                {block.type === 'gallery' && (
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-surface/50 border border-dashed border-border rounded" />
                    ))}
                  </div>
                )}
                {block.type === 'divider' && (
                  <div className="h-px bg-border" />
                )}
              </div>
            ))}
            {blocks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-muted">
                <Palette className="w-8 h-8 mb-2" />
                <p>No blocks yet. Add blocks from the left panel.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedBlock && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-sm font-heading font-bold text-text mb-4">Block Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Block Type</label>
              <span className="font-tech text-sm">{selectedBlock}</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Typography</label>
              <select className="w-full px-3 py-2 rounded border border-border bg-surface text-text">
                <option>Cormorant Garamond</option>
                <option>Lora</option>
                <option>Courier Prime</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Font Size</label>
              <input
                type="range"
                min="12"
                max="48"
                step="2"
                className="w-full accent-accent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

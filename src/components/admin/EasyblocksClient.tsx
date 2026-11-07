'use client';

import { useState, useEffect } from 'react';
import { EasyblocksEditor } from './EasyblocksEditor.tsx';

interface EasyblocksConfig {
  backendId: string;
  token: string;
}

export function EasyblocksClient() {
  const [config, setConfig] = useState<EasyblocksConfig>({
    backendId: '',
    token: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('easyblocks_config');
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleConfigChange = (key: keyof EasyblocksConfig, value: string) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    localStorage.setItem('easyblocks_config', JSON.stringify(next));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text mb-2">Easyblocks Page Builder</h1>
        <p className="text-muted font-body">
          Configure your easyblocks.io backend and build pages visually with drag-and-drop.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-heading font-bold text-text mb-6">Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Backend Identifier
            </label>
            <input
              type="text"
              value={config.backendId}
              onChange={(e) => handleConfigChange('backendId', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              placeholder="your-backend-id"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              API Token
            </label>
            <input
              type="password"
              value={config.token}
              onChange={(e) => handleConfigChange('token', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              placeholder="your-api-token"
            />
          </div>
          <p className="text-xs text-muted">
            Get your backend identifier and token from app.easyblocks.io
          </p>
        </div>
      </div>

      <EasyblocksEditor config={config} />
    </div>
  );
}

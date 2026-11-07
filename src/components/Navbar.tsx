'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-xl text-accent tracking-tight">
              Geographies
            </span>
            <span className="font-body text-sm text-muted">of Textiles & Natural Dyes</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-text hover:text-accent transition-colors font-medium">
              Home
            </a>
            <a href="/gallery" className="text-text hover:text-accent transition-colors font-medium">
              Gallery
            </a>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-md text-text hover:bg-surface/50"
              aria-label="Open menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-surface p-4">
            <a href="/" className="block py-2 text-text hover:text-accent transition-colors">
              Home
            </a>
            <a href="/gallery" className="block py-2 text-text hover:text-accent transition-colors">
              Gallery
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}

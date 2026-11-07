'use client';

import { ClerkProvider } from '@clerk/react';
import type { ReactNode } from 'react';

const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AdminClerkProvider({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    console.warn(
      'PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Admin auth will not work until configured.'
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey ?? ''}>
      {children}
    </ClerkProvider>
  );
}

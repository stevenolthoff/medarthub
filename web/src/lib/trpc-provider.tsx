"use client"; // This component must be a client component

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { trpc, createTRPCClient } from './trpc'; // Import both trpc and the factory function

/**
 * `TRPCReactProvider` is a client component that sets up the tRPC client and React Query
 * context for the rest of your Next.js application.
 */
export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  // Instantiate the tRPC client using the factory function from trpc.ts
  const [trpcClient] = useState(createTRPCClient);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

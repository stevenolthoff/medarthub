import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import Cookies from 'js-cookie';
import { type AppRouter } from 'api';

// Function to get the correct URL for the tRPC API
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should always point to the API server
    return 'http://localhost:3001';
  }
  if (process.env.VERCEL_URL) {
    // SSR should use vercel url
    return `https://${process.env.VERCEL_URL}`;
  }
  // Dev SSR should use localhost with API port (e.g., 3001)
  return `http://localhost:3001`;
}

/**
 * `trpc` is the entry point for using tRPC client-side hooks.
 * It's created with `createTRPCReact` for React components.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * `createTRPCClient` is a factory function to create a new tRPC client instance.
 * This is used within the `TRPCReactProvider` to ensure a fresh client per request/component instance (in SSR scenarios).
 */
export const createTRPCClient = () => {
  return trpc.createClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        headers() {
          const token = Cookies.get('auth-token');
          if (token) {
            return {
              authorization: `Bearer ${token}`,
            };
          }
          return {};
        },
      }),
    ],
  });
};

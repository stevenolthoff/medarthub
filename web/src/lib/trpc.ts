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
        fetch(url, options) {
          return fetch(url, options).then((response) => {
            // Check for the 'X-Refreshed-Token' header on each response.
            // Note: Browser headers are automatically lowercased.
            const refreshedToken = response.headers.get('x-refreshed-token');
            if (refreshedToken) {
              // If a new token is found, update the cookie. This extends the session.
              Cookies.set('auth-token', refreshedToken, { expires: 7, secure: process.env.NODE_ENV === 'production' });
              
              // Log token refresh for debugging (remove in production)
              if (process.env.NODE_ENV === 'development') {
                console.log('🔄 Token refreshed automatically - session extended');
              }
            }
            return response;
          });
        },
      }),
    ],
  });
};

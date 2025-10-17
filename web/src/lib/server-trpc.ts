// web/src/lib/server-trpc.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'api'; // Import the AppRouter type from the API workspace
import superjson from 'superjson';
import { headers } from 'next/headers'; // Next.js specific for accessing request headers in Server Components

/**
 * Creates a tRPC client for use in Next.js Server Components and API Routes.
 * This client will include authentication headers if an auth-token cookie is present
 * in the incoming server request.
 */
export function createServerTRPCClient() {
  const getApiBaseUrl = () => {
    // IMPORTANT: Adjust this based on your actual deployment setup.
    // In local development, `http://localhost:3001` is assumed for the API.
    // For Vercel deployment, if the API is a separate service, replace this
    // with its public URL (e.g., via NEXT_PUBLIC_API_URL environment variable).
    // If your API is co-located as Next.js API routes, you might use just `/`.
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  };

  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        transformer: superjson,
        async headers() {
          // Access cookies from the incoming request headers (server-side)
          // This is called within each request context, so headers() is available
          const headersList = await headers();
          const authToken = headersList.get('cookie')?.split('; ').find((row: string) => row.startsWith('auth-token='))?.split('=')[1];
          
          // Pass the auth token from the server component's request to the tRPC API
          if (authToken) {
            return {
              authorization: `Bearer ${authToken}`,
            };
          }
          return {};
        },
      }),
    ],
  });
}

export const serverTrpc = createServerTRPCClient();

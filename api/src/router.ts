import { router } from './trpc';
import { healthRouter } from './procedures/health';
import { authRouter } from './procedures/auth';
import { userRouter } from './procedures/user'; // Import the new user router
import { artistRouter } from './procedures/artist'; // Import the new artist router

/**
 * The main tRPC application router.
 * This combines all individual routers into a single API surface.
 * 
 * Example usage:
 * - `trpc.auth.signup.mutate()`
 * - `trpc.health.check.query()`
 * - `trpc.user.getByUsername.query()` // New
 */
export const appRouter = router({
  health: healthRouter, // Mount the healthRouter under the 'health' namespace
  auth: authRouter, // Mount the authentication router
  user: userRouter, // Mount the new user router under the 'user' namespace
  artist: artistRouter, // Mount the new artist router under the 'artist' namespace
  // Add other feature-specific routers here as your API grows, e.g.:
  // items: itemRouter,
});

/**
 * Type for the main tRPC application router.
 * This type is used by the tRPC client for end-to-end type safety.
 */
export type AppRouter = typeof appRouter;

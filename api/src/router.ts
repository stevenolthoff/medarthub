import { router } from './trpc';
import { healthRouter } from './procedures/health';

/**
 * The main tRPC application router.
 * This combines all individual routers into a single API surface.
 * 
 * Example usage:
 * - `trpc.health.check.query()`
 */
export const appRouter = router({
  health: healthRouter, // Mount the healthRouter under the 'health' namespace
  // Add other feature-specific routers here as your API grows, e.g.:
  // auth: authRouter,
  // users: userRouter,
  // items: itemRouter,
});

/**
 * Type for the main tRPC application router.
 * This type is used by the tRPC client for end-to-end type safety.
 */
export type AppRouter = typeof appRouter;

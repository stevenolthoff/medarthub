import { publicProcedure, router } from '../trpc';

/**
 * Router for health-related procedures.
 */
export const healthRouter = router({
  /**
   * Public procedure to check the health of the tRPC API.
   * Returns a status object with an 'ok' status, service name, and current timestamp.
   */
  check: publicProcedure.query(() => {
    return { status: 'ok', service: 'tRPC API', timestamp: new Date() };
  }),
});

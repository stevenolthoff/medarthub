import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { type CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { PrismaClient } from '@prisma/client';

/**
 * Creates context for tRPC procedures.
 * This context is available in every tRPC procedure.
 */
export const createContext = ({ req, res }: CreateExpressContextOptions): {
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
  prisma: PrismaClient;
  userId: string | string[];
} => {
  // Access Prisma client from app.locals, assuming it's initialized in app.ts
  const prisma = req.app.locals.prisma as PrismaClient; 

  // Example: Extract user ID from a custom header (in a real app, use proper auth)
  const userId = req.headers['x-user-id'] || 'anonymous'; 

  return {
    req,
    res,
    prisma,
    userId,
  };
};

/**
 * Type for the tRPC context.
 */
export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initializes tRPC with the defined context and SuperJSON transformer.
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Export reusable router and procedure helpers.
 */
export const router = t.router;
export const publicProcedure = t.procedure;
// For protected procedures, you would add an .use() call here for authentication/authorization
// export const protectedProcedure = t.procedure.use(isAuthed);

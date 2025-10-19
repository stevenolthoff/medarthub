import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { type CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import prisma from './lib/prisma';

// Define the JWT payload type
interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Creates context for tRPC procedures.
 * This context is available in every tRPC procedure.
 */
export const createContext = async ({ req, res }: CreateExpressContextOptions): Promise<{
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
  prisma: typeof prisma;
  user: User | null;
}> => { 

  let user: User | null = null;
  const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      // Fetch user from DB to ensure it's still valid and get full user object
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { 
          id: true, 
          username: true, 
          email: true, 
          name: true, 
          createdAt: true,
          artist: {
            select: {
              slug: true
            }
          }
        }, // Select only safe fields including artist slug
      }) as User | null;
    } catch (error) {
      console.error('JWT verification failed:', error);
      // Token is invalid or expired, user remains null
    }
  }

  return {
    req,
    res,
    prisma, // Provide the imported singleton prisma object in the context
    user, // Provide the user object in the context
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
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof Error && 'issues' in error.cause && Array.isArray(error.cause.issues)
            ? error.cause.issues
            : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers.
 */
export const router = t.router;
export const publicProcedure: typeof t.procedure = t.procedure;

/**
 * Middleware to protect procedures, ensuring only authenticated users can access them.
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated.' });
  }
  return next({
    ctx: {
      user: ctx.user, // Ensure the user object is available in protected procedures
    },
  });
});

export const protectedProcedure: typeof t.procedure = t.procedure.use(isAuthed);

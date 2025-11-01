import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { type CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { Prisma } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config/config';
import prisma from './lib/prisma';

// Define the JWT payload type
interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Define select object for reuse and type generation
const userWithArtistProfileSelect = {
  id: true,
  username: true,
  email: true,
  name: true,
  createdAt: true,
  artist: {
    select: {
      id: true,
      slug: true,
      profilePic: {
        select: {
          key: true,
          width: true,
          height: true,
        },
      },
      bannerImage: {
        select: {
          key: true,
          width: true,
          height: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

// Define the final type from the select object
export type UserWithArtistProfile = Prisma.UserGetPayload<{
  select: typeof userWithArtistProfileSelect;
}> | null;

/**
 * Creates context for tRPC procedures.
 * This context is available in every tRPC procedure.
 */
export const createContext = async ({ req, res }: CreateExpressContextOptions): Promise<{
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
  prisma: typeof prisma;
  user: UserWithArtistProfile;
}> => { 

  let user: UserWithArtistProfile = null;
  const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      // Fetch user from DB to ensure it's still valid and get full user object
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: userWithArtistProfileSelect,
      });

      if (user) {
        const now = Date.now() / 1000;
        const tokenLifetime = decoded.exp - decoded.iat;
        const tokenAge = now - decoded.iat;

        // Refresh if the token is more than halfway through its life
        if (tokenAge > tokenLifetime / 2) {
          const newToken = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn } as SignOptions
          );
          // Set custom header on the response for the client to pick up
          res.setHeader('X-Refreshed-Token', newToken);
          
          // Log token refresh for debugging (remove in production)
          if (config.nodeEnv === 'development') {
            const remainingTime = Math.round(tokenLifetime - tokenAge);
            console.log(`🔄 Token refreshed for user ${user.id}. Old token had ${remainingTime}s remaining.`);
          }
        }
      }
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
      ...ctx, // Spread the original context
      user: ctx.user, // Now, user is correctly typed as non-nullable
    },
  });
});

export const protectedProcedure: typeof t.procedure = t.procedure.use(isAuthed);

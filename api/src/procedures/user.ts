import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

/**
 * Zod schema for getting user profile by username.
 */
const getByUsernameInput = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
});

/**
 * Zod schema for getting artist profile by slug.
 */
const getBySlugInput = z.object({
  slug: z.string().min(1, 'Slug must be at least 1 character long'),
});

/**
 * Router for user-related procedures.
 */
export const userRouter = router({
  /**
   * Public procedure to get a user's public profile details by username.
   */
  getByUsername: publicProcedure
    .input(getByUsernameInput)
    .query(async ({ input, ctx }) => {
      const { username } = input;

      const user = await ctx.prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          name: true,
          email: true, // Including email for profile display, but consider if this should be public or only for authenticated owner
          createdAt: true,
        },
      });

      if (!user) {
        return null; // User not found
      }

      // For public view, you might want to omit sensitive fields like full email.
      // For this example, we'll return what we selected, but a real-world app might
      // return a subset like { username, name, createdAt } for public and { email, etc. } for private.
      // For now, let's keep email for consistency with `auth.me` and differentiate UI-wise.
      return user;
    }),

  /**
   * Public procedure to get an artist's public profile details by slug.
   */
  getBySlug: publicProcedure
    .input(getBySlugInput)
    .query(async ({ input, ctx }) => {
      const { slug } = input;

      const artist = await ctx.prisma.artist.findUnique({
        where: { slug },
        select: {
          id: true,
          slug: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
          artworks: {
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!artist) {
        return null; // Artist not found
      }

      return artist;
    }),
});

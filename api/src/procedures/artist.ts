import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

/**
 * Zod schema for getting artist profile by slug.
 */
const getBySlugInput = z.object({
  slug: z.string().min(1, 'Slug must be at least 1 character long'),
});

/**
 * Router for artist-related procedures.
 */
export const artistRouter = router({
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

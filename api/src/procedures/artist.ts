import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router, protectedProcedure } from '../trpc';
import { ArtworkStatus } from '@prisma/client';

/**
 * Zod schema for getting artist profile by slug.
 */
const getBySlugInput = z.object({
  slug: z.string().min(1, 'Slug must be at least 1 character long'),
});

/**
 * Zod schema for creating artwork.
 */
const createArtworkInput = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  description: z.string().optional(),
  status: z.nativeEnum(ArtworkStatus).default(ArtworkStatus.DRAFT),
  coverImageId: z.string().uuid('Invalid image ID format').optional().nullable(), // Optional cover image ID
});

/**
 * Zod schema for updating artwork.
 */
const updateArtworkInput = z.object({
  artworkId: z.string().min(1, 'Artwork ID is required'),
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ArtworkStatus).optional(),
  coverImageId: z.string().uuid('Invalid image ID format').optional().nullable(), // Optional cover image ID
});

/**
 * Zod schema for deleting artwork.
 */
const deleteArtworkInput = z.object({
  artworkId: z.string().min(1, 'Artwork ID is required'),
});

/**
 * Zod schema for unpublishing artwork.
 */
const unpublishArtworkInput = z.object({
  artworkId: z.string().min(1, 'Artwork ID is required'),
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
              status: true,
              coverImage: { // Include cover image data
                select: {
                  id: true,
                  key: true,
                  filename: true,
                  contentType: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            where: (ctx.user?.artist?.slug === slug)
              ? {} // No filter for owner
              : { status: ArtworkStatus.PUBLISHED }, // Only published for public view
          },
        },
      });

      if (!artist) {
        return null; // Artist not found
      }

      return artist;
    }),

  /**
   * Protected procedure to create a new artwork for the authenticated artist.
   */
  createArtwork: protectedProcedure
    .input(createArtworkInput)
    .mutation(async ({ input, ctx }) => {
      // Ensure the authenticated user has an associated artist profile
      if (!ctx.user?.artist?.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User does not have an artist profile.',
        });
      }

      const { title, description, status, coverImageId } = input; // Destructure coverImageId
      const artistId = ctx.user.artist!.id;

      // Generate a slug for the artwork
      const baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      let artworkSlug = baseSlug;
      let counter = 0;

      // Ensure slug uniqueness
      while (true) {
        const existingArtwork = await ctx.prisma.artwork.findUnique({
          where: { slug: artworkSlug },
        });
        if (!existingArtwork) {
          break;
        }
        counter++;
        artworkSlug = `${baseSlug}-${counter}`;
      }

      const newArtwork = await ctx.prisma.artwork.create({
        data: {
          title,
          description: description || '',
          slug: artworkSlug,
          status,
          artistId,
          coverImageId, // Associate with cover image if provided
        },
        // Select necessary fields including image info for the response
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          createdAt: true,
          status: true,
          coverImage: {
            select: {
              id: true,
              key: true,
              filename: true,
              contentType: true,
            },
          },
        },
      });

      // If a coverImageId was provided, update the Image record to link it to this artwork
      if (coverImageId) {
        await ctx.prisma.image.update({
          where: { id: coverImageId },
          data: { originalArtworkId: newArtwork.id }, // Link Image to the new Artwork
        });
      }

      return {
        message: 'Artwork created successfully!',
        artwork: newArtwork,
      };
    }),

  /**
   * Protected procedure to update an existing artwork for the authenticated artist.
   */
  updateArtwork: protectedProcedure
    .input(updateArtworkInput)
    .mutation(async ({ input, ctx }) => {
      // Ensure the authenticated user has an associated artist profile
      if (!ctx.user?.artist?.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User does not have an artist profile.',
        });
      }

      const { artworkId, title, description, status, coverImageId } = input; // Destructure coverImageId
      const artistId = ctx.user.artist!.id;

      // Verify the artwork belongs to the authenticated artist
      const existingArtwork = await ctx.prisma.artwork.findFirst({
        where: {
          id: artworkId,
          artistId: artistId,
        },
        select: { // Select coverImageId for proper old/new comparison
          id: true,
          slug: true,
          title: true,
          description: true,
          createdAt: true,
          status: true,
          coverImageId: true,
        },
      });

      if (!existingArtwork) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Artwork not found or does not belong to the user.',
        });
      }

      // Prepare update data
      const updateData: {
        title?: string;
        description?: string;
        status?: ArtworkStatus;
        slug?: string;
        coverImageId?: string | null; // Allow setting to null to remove cover image
      } = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (coverImageId !== undefined) updateData.coverImageId = coverImageId; // Update coverImageId

      // Handle title update and slug regeneration if title changes
      if (title && title !== existingArtwork.title) {
        const baseSlug = title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        let artworkSlug = baseSlug;
        let counter = 0;

        while (true) {
          const collisionArtwork = await ctx.prisma.artwork.findUnique({
            where: { slug: artworkSlug },
          });
          // If no collision, or if collision is with the current artwork itself, it's fine.
          if (!collisionArtwork || collisionArtwork.id === artworkId) {
            break;
          }
          counter++;
          artworkSlug = `${baseSlug}-${counter}`;
        }
        updateData.slug = artworkSlug;
      }

      const updatedArtwork = await ctx.prisma.artwork.update({
        where: { id: artworkId },
        data: updateData,
        // Select necessary fields including image info for the response
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          createdAt: true,
          status: true,
          coverImage: {
            select: {
              id: true,
              key: true,
              filename: true,
              contentType: true,
            },
          },
        },
      });

      // Handle Image record association changes
      if (coverImageId !== undefined && coverImageId !== existingArtwork.coverImageId) {
        // If there was an old cover image, clear its artwork association
        if (existingArtwork.coverImageId) {
          await ctx.prisma.image.update({
            where: { id: existingArtwork.coverImageId },
            data: { originalArtworkId: null },
          });
        }
        // If a new coverImageId is provided, link it to this artwork
        if (coverImageId) {
          await ctx.prisma.image.update({
            where: { id: coverImageId },
            data: { originalArtworkId: updatedArtwork.id },
          });
        }
      }

      return {
        message: 'Artwork updated successfully!',
        artwork: updatedArtwork,
      };
    }),

  /**
   * Protected procedure to delete an artwork belonging to the authenticated artist.
   */
  deleteArtwork: protectedProcedure
    .input(deleteArtworkInput)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.artist?.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User does not have an artist profile.',
        });
      }

      const { artworkId } = input;
      const artistId = ctx.user.artist!.id;

      // Verify the artwork belongs to the authenticated artist and get its coverImageId
      const existingArtwork = await ctx.prisma.artwork.findFirst({
        where: {
          id: artworkId,
          artistId: artistId,
        },
        select: {
          id: true,
          coverImageId: true, // Need to get this to potentially delete the associated image
        },
      });

      if (!existingArtwork) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Artwork not found or does not belong to the user.',
        });
      }

      // Delete the artwork and, if it has a cover image, delete that image record too.
      // (Actual R2 file deletion would be a separate, more complex process, e.g., via lifecycle rules or background job).
      await ctx.prisma.$transaction(async (tx) => {
        if (existingArtwork.coverImageId) {
          await tx.image.delete({
            where: { id: existingArtwork.coverImageId },
          });
        }
        await tx.artwork.delete({
          where: { id: artworkId },
        });
      });

      return {
        message: 'Artwork deleted successfully!',
        artworkId: artworkId,
      };
    }),

  /**
   * Protected procedure to unpublish an artwork (set status to DRAFT) belonging to the authenticated artist.
   */
  unpublishArtwork: protectedProcedure
    .input(unpublishArtworkInput)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.artist?.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User does not have an artist profile.',
        });
      }

      const { artworkId } = input;
      const artistId = ctx.user.artist!.id;

      // Verify the artwork belongs to the authenticated artist
      const existingArtwork = await ctx.prisma.artwork.findFirst({
        where: {
          id: artworkId,
          artistId: artistId,
        },
      });

      if (!existingArtwork) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Artwork not found or does not belong to the user.',
        });
      }

      const updatedArtwork = await ctx.prisma.artwork.update({
        where: { id: artworkId },
        data: {
          status: ArtworkStatus.DRAFT,
        },
      });

      return {
        message: 'Artwork unpublished successfully!',
        artwork: updatedArtwork,
      };
    }),
});

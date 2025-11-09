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
 * Zod schema for setting profile picture.
 */
const setProfilePictureInput = z.object({
  imageId: z.string().uuid('Invalid image ID format'),
});

/**
 * Zod schema for setting banner image.
 */
const setBannerImageInput = z.object({
  imageId: z.string().uuid('Invalid image ID format'),
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
 * Zod schema for updating artist profile.
 */
const updateProfileInput = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  headline: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  websiteUrl: z.string().url('Must be a valid URL').or(z.literal('')).nullable().optional(),
  about: z.string().max(2000, 'About section cannot exceed 2000 characters').nullable().optional(),
});

/**
 * Zod schema for updating the artist slug.
 */
const updateSlugInput = z.object({
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters.')
    .max(50, 'Slug cannot be more than 50 characters.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug can only contain lowercase letters, numbers, and hyphens, and cannot start, end, or have consecutive hyphens.'
    ),
});

/**
 * Router for artist-related procedures.
 */
export const artistRouter = router({
  /**
   * Public procedure to get a list of all artists with a preview of their work.
   */
  list: publicProcedure.query(async ({ ctx }) => {
    const artists = await ctx.prisma.artist.findMany({
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
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        artworks: {
          where: { status: ArtworkStatus.PUBLISHED },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            slug: true,
            title: true,
            coverImage: {
              select: {
                id: true,
                key: true,
                width: true,
                height: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return artists.filter(artist => artist.artworks.length > 0);
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
          headline: true,
          company: true,
          location: true,
          websiteUrl: true,
          about: true,
          createdAt: true,
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
                  width: true,
                  height: true,
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
   * Protected procedure to update artist profile information.
   */
  updateProfile: protectedProcedure
    .input(updateProfileInput)
    .mutation(async ({ input, ctx }) => {
      const artistId = ctx.user!.artist?.id;

      if (!artistId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User does not have an artist profile.' });
      }

      const { name, ...artistData } = input;

      // Convert empty strings to null
      const cleanedArtistData = Object.fromEntries(
        Object.entries(artistData).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      );

      await ctx.prisma.$transaction(async (tx) => {
        // Update User table if name is provided
        if (name) {
          await tx.user.update({
            where: { id: ctx.user!.id },
            data: { name },
          });
        }

        // Update Artist table with the rest of the data
        if (Object.keys(cleanedArtistData).length > 0) {
          await tx.artist.update({
            where: { id: artistId },
            data: cleanedArtistData,
          });
        }
      });

      return { success: true, message: 'Profile updated successfully.' };
    }),

  /**
   * Protected procedure for an artist to update their own profile slug.
   */
  updateSlug: protectedProcedure
    .input(updateSlugInput)
    .mutation(async ({ input, ctx }) => {
      const artistId = ctx.user!.artist?.id;
      const currentSlug = ctx.user!.artist?.slug;

      if (!artistId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User does not have an artist profile.',
        });
      }

      const nextSlug = input.slug.trim();

      if (nextSlug === currentSlug) {
        return {
          success: true,
          message: 'Slug is unchanged.',
          slug: currentSlug,
        };
      }

      const existingArtist = await ctx.prisma.artist.findUnique({
        where: { slug: nextSlug },
        select: { id: true },
      });

      if (existingArtist && existingArtist.id !== artistId) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This slug is already taken. Please choose another one.',
        });
      }

      const updatedArtist = await ctx.prisma.artist.update({
        where: { id: artistId },
        data: { slug: nextSlug },
        select: { slug: true },
      });

      return {
        success: true,
        message: 'Slug updated successfully.',
        slug: updatedArtist.slug,
      };
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
              width: true,
              height: true,
            },
          },
        },
      });

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
              width: true,
              height: true,
            },
          },
        },
      });

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

  /**
   * Protected procedure to set the profile picture for the authenticated artist.
   */
  setProfilePicture: protectedProcedure
    .input(setProfilePictureInput)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.artist?.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User does not have an artist profile.',
        });
      }

      const { imageId } = input;
      const artistId = ctx.user.artist.id;

      const image = await ctx.prisma.image.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Image not found.',
        });
      }

      await ctx.prisma.$transaction(async (tx) => {
        const currentArtist = await tx.artist.findUnique({
          where: { id: artistId },
          select: { profilePicImageId: true },
        });
        const oldImageId = currentArtist?.profilePicImageId;

        await tx.artist.update({
          where: { id: artistId },
          data: { profilePicImageId: imageId },
        });

         if (oldImageId && oldImageId !== imageId) {
           const oldImageInUseAsCover = await tx.artwork.findFirst({
             where: { coverImageId: oldImageId },
           });
           const oldImageInUseAsBanner = await tx.artist.findFirst({
             where: { bannerImageId: oldImageId },
           });
           if (!oldImageInUseAsCover && !oldImageInUseAsBanner) {
             await tx.image.delete({
               where: { id: oldImageId },
             });
           }
         }
      });

      return {
        success: true,
        message: 'Profile picture updated successfully.',
      };
    }),

  /**
   * Protected procedure to remove the profile picture for the authenticated artist.
   */
  removeProfilePicture: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.user?.artist?.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User does not have an artist profile.',
        });
      }

      const artistId = ctx.user.artist.id;

      await ctx.prisma.$transaction(async (tx) => {
        // 1. Get the current artist to find the profile picture ID
        const currentArtist = await tx.artist.findUnique({
          where: { id: artistId },
          select: { profilePicImageId: true },
        });

        const oldImageId = currentArtist?.profilePicImageId;

        // If there's no profile picture to remove, we're done.
        if (!oldImageId) {
          return;
        }

        // 2. Set the artist's profilePicImageId to null
        await tx.artist.update({
          where: { id: artistId },
          data: { profilePicImageId: null },
        });

         // 3. Delete the old image record if it's not used elsewhere
         const oldImageInUseAsCover = await tx.artwork.findFirst({
           where: { coverImageId: oldImageId },
         });
         const oldImageInUseAsBanner = await tx.artist.findFirst({
           where: { bannerImageId: oldImageId },
         });

         if (!oldImageInUseAsCover && !oldImageInUseAsBanner) {
           await tx.image.delete({
             where: { id: oldImageId },
           });
         }
      });

      return {
        success: true,
        message: 'Profile picture removed successfully.',
      };
    }),

  /**
   * Protected procedure to set the banner image for the authenticated artist.
   */
  setBannerImage: protectedProcedure
    .input(setBannerImageInput)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.artist?.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User does not have an artist profile.',
        });
      }

      const { imageId } = input;
      const artistId = ctx.user.artist.id;

      const image = await ctx.prisma.image.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Image not found.',
        });
      }

      await ctx.prisma.$transaction(async (tx) => {
        const currentArtist = await tx.artist.findUnique({
          where: { id: artistId },
          select: { bannerImageId: true },
        });
        const oldImageId = currentArtist?.bannerImageId;

        await tx.artist.update({
          where: { id: artistId },
          data: { bannerImageId: imageId },
        });

        if (oldImageId && oldImageId !== imageId) {
          const oldImageInUseAsCover = await tx.artwork.findFirst({
            where: { coverImageId: oldImageId },
          });
          const oldImageInUseAsProfile = await tx.artist.findFirst({
            where: { profilePicImageId: oldImageId },
          });

          if (!oldImageInUseAsCover && !oldImageInUseAsProfile) {
            await tx.image.delete({
              where: { id: oldImageId },
            });
          }
        }
      });

      return {
        success: true,
        message: 'Banner image updated successfully.',
      };
    }),

  /**
   * Protected procedure to remove the banner image for the authenticated artist.
   */
  removeBannerImage: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user?.artist?.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'User does not have an artist profile.',
      });
    }

    const artistId = ctx.user.artist.id;

    await ctx.prisma.$transaction(async (tx) => {
      const currentArtist = await tx.artist.findUnique({
        where: { id: artistId },
        select: { bannerImageId: true },
      });

      const oldImageId = currentArtist?.bannerImageId;
      if (!oldImageId) return;

      await tx.artist.update({
        where: { id: artistId },
        data: { bannerImageId: null },
      });

      const oldImageInUseAsCover = await tx.artwork.findFirst({
        where: { coverImageId: oldImageId },
      });
      const oldImageInUseAsProfile = await tx.artist.findFirst({
        where: { profilePicImageId: oldImageId },
      });

      if (!oldImageInUseAsCover && !oldImageInUseAsProfile) {
        await tx.image.delete({
          where: { id: oldImageId },
        });
      }
    });

    return {
      success: true,
      message: 'Banner image removed successfully.',
    };
  }),
});

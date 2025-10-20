import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

const createUploadUrlInput = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().refine(
    (val) => val.startsWith('image/'),
    'Only image files are allowed'
  ),
  fileSize: z.number().int().positive('File size must be positive'),
  width: z.number().int().positive('Width must be positive').optional(),
  height: z.number().int().positive('Height must be positive').optional(),
});

// Maximum allowed file size for images (e.g., 10MB)
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const imageRouter = router({
  /**
   * Protected procedure to generate a signed URL for R2 image upload
   * and create an initial Image record in the database.
   */
  createUploadUrl: protectedProcedure
    .input(createUploadUrlInput)
    .mutation(async ({ input, ctx }) => {
      const { filename, contentType, fileSize, width, height } = input;
      const userId = ctx.user?.id; // Get user ID from authenticated context

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated.',
        });
      }

      if (fileSize > MAX_FILE_SIZE_BYTES) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
        });
      }

      try {
        const imageId = randomUUID();
        const fileExtension = filename.split('.').pop();
        const finalFileExtension = fileExtension ? `.${fileExtension}` : '';
        const key = `users/${userId}/images/${imageId}/original${finalFileExtension}`;

        const cmd = new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          ContentType: contentType,
          ChecksumAlgorithm: undefined, // Prevent SDK from adding x-amz-checksum header to signed URL
        });

        const url = await getSignedUrl(s3, cmd, { expiresIn: 300, signableHeaders: new Set(['host']) }); // 5 min expiry

        // Create a new Image record in the database with pending status
        const newImage = await ctx.prisma.image.create({
          data: {
            id: imageId, // Use the generated UUID as the ID
            key,
            filename,
            contentType,
            size: fileSize,
            width,
            height,
          },
        });

        return {
          id: newImage.id, // Return the ID of the new Image record
          key: newImage.key, // Return the R2 key
          uploadUrl: url,
        };
      } catch (error: any) {
        console.error('TRPC Error: Failed to generate signed URL or create image record:', error);
        let message = 'Failed to generate upload URL due to a server error.';
        
        if (error.Code === 'InvalidAccessKeyId' || error.Code === 'SignatureDoesNotMatch') {
          message = 'Authentication failed with R2. Check server R2 credentials.';
        } else if (error.Code === 'NoSuchBucket') {
          message = 'The specified R2 bucket does not exist or server lacks access.';
        } else if (error.message && error.message.includes('Network Error')) {
          message = 'Server could not connect to R2 storage. Check network configuration.';
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: message,
          cause: error,
        });
      }
    }),
});

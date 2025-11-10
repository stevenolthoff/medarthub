import { z } from 'zod';
import { randomBytes } from 'crypto';
import { AccessRequestStatus } from '@prisma/client';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { sendInviteEmail } from '../lib/email';

const submitAccessRequestInput = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  artworkExampleUrl: z.string().url('A valid URL for your artwork is required'),
  message: z.string().max(1000, 'Message cannot exceed 1000 characters.').optional(),
});

export const accessRequestRouter = router({
  submit: publicProcedure
    .input(submitAccessRequestInput)
    .mutation(async ({ input, ctx }) => {
      const { name, email, artworkExampleUrl, message } = input;

      const newRequest = await ctx.prisma.accessRequest.create({
        data: {
          name,
          email,
          artworkExampleUrl,
          message,
        },
      });

      // TODO: Implement email notification to admin

      return {
        success: true,
        message: 'Your request has been submitted successfully!',
        requestId: newRequest.id,
      };
    }),
  processApproved: adminProcedure.mutation(async ({ ctx }) => {
    const approvedRequests = await ctx.prisma.accessRequest.findMany({
      where: {
        status: AccessRequestStatus.APPROVED,
        inviteCode: null,
      },
    });

    if (approvedRequests.length === 0) {
      return { success: true, message: 'No new approved requests to process.', processedCount: 0 };
    }

    let processedCount = 0;
    const errors: { email: string; error: string }[] = [];

    for (const request of approvedRequests) {
      try {
        const code = randomBytes(8).toString('hex').toUpperCase();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await ctx.prisma.inviteCode.create({
          data: { code, expiresAt, accessRequestId: request.id },
        });

        await sendInviteEmail(request.email, request.name, code);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process request for ${request.email}:`, error);
        errors.push({ email: request.email, error: (error as Error).message });
      }
    }

    return {
      success: errors.length === 0,
      message: `Processed ${processedCount} of ${approvedRequests.length} requests.`,
      processedCount,
      errors,
    };
  }),
});


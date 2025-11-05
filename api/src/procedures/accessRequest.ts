import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

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
});


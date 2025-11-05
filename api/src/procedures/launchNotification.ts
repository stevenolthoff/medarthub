import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';

const subscribeInput = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export const launchNotificationRouter = router({
  subscribe: publicProcedure
    .input(subscribeInput)
    .mutation(async ({ input, ctx }) => {
      const { email } = input;

      try {
        const newSubscriber = await ctx.prisma.launchSubscriber.create({
          data: {
            email,
          },
        });

        return {
          success: true,
          message: 'Thank you for subscribing! We will notify you at launch.',
          subscriberId: newSubscriber.id,
        };
      } catch (error: any) {
        // Check for Prisma's unique constraint violation error
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
          // This email is already subscribed. We treat this as a success for the user
          // to prevent leaking information about who is already on the list.
          return {
            success: true,
            message: 'You are already on the list! We will notify you at launch.',
          };
        }
        
        // For other errors, re-throw a TRPC error
        console.error('Failed to subscribe to launch notifications:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
        });
      }
    }),
});


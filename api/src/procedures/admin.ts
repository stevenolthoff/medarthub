import { randomBytes } from 'crypto';
import { TRPCError } from '@trpc/server';
import { AccessRequestStatus } from '@prisma/client';
import { z } from 'zod';
import { adminProcedure, router } from '../trpc';
import { sendInviteEmail } from '../lib/email';

export const adminRouter = router({
  listAccessRequests: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.accessRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        inviteCode: {
          select: {
            code: true,
            expiresAt: true,
            isUsed: true,
            createdAt: true,
          },
        },
      },
    });
  }),
  approveAndSendInvite: adminProcedure
    .input(z.object({ accessRequestId: z.string().uuid('Invalid access request ID.') }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.accessRequest.findUnique({
        where: { id: input.accessRequestId },
        include: { inviteCode: true },
      });

      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Access request not found.' });
      }

      if (request.status !== AccessRequestStatus.PENDING) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `This request is already ${request.status.toLowerCase()}.`,
        });
      }

      if (request.inviteCode) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'An invite has already been sent for this request.',
        });
      }

      const code = randomBytes(8).toString('hex').toUpperCase();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await ctx.prisma.$transaction([
        ctx.prisma.accessRequest.update({
          where: { id: request.id },
          data: { status: AccessRequestStatus.APPROVED },
        }),
        ctx.prisma.inviteCode.create({
          data: {
            code,
            expiresAt,
            accessRequestId: request.id,
          },
        }),
      ]);

      await sendInviteEmail(request.email, request.name, code);

      return {
        success: true,
        message: `Invite sent to ${request.email}.`,
      };
    }),
});


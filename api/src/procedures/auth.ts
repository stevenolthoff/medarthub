import { z } from 'zod';
import bcrypt from 'bcrypt';
import { TRPCError } from '@trpc/server';
import jwt, { SignOptions } from 'jsonwebtoken'; // Import jsonwebtoken
import { publicProcedure, router, protectedProcedure } from '../trpc';
import config from '../../config/config'; // Import config for JWT secret and expiry

const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10;

/**
 * Zod schema for user signup input.
 * Includes validation for email format, password length, and password confirmation.
 */
const signupInput = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Point the error specifically to the confirmPassword field
});

/**
 * Zod schema for user login input.
 */
const loginInput = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Router for authentication-related procedures (signup, login).
 */
export const authRouter = router({
  /**
   * Procedure for user registration.
   * Hashes the password and creates a new user in the database.
   */
  signup: publicProcedure
    .input(signupInput)
    .mutation(async ({ input, ctx }) => {
      const { name, email, password } = input;

      // Check if user with this email already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists.',
        });
      }

      // Hash the password
      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      // Create new user
      const newUser = await ctx.prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      return {
        message: 'Account created successfully!',
        user: newUser,
      };
    }),

  /**
   * Procedure for user login.
   * Verifies credentials, generates a JWT, and returns it.
   */
  login: publicProcedure
    .input(loginInput)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      console.log(`[AUTH] Login attempt for email: ${email}`); // LOG 1

      // Find the user by email
      const user = await ctx.prisma.user.findUnique({
        where: { email },
      });
      console.log(`[AUTH] User lookup result for ${email}: ${user ? 'Found' : 'Not Found'}`); // LOG 2

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        });
      }

      // Compare the provided password with the stored hashed password
      console.log(`[AUTH] Comparing password for user: ${user.id}`); // LOG 3
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      console.log(`[AUTH] Password comparison result: ${isPasswordValid}`); // LOG 4

      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        });
      }

      // Generate JWT
      console.log(`[AUTH] Generating JWT for user: ${user.id}`); // LOG 5
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn } as SignOptions
      );
      console.log(`[AUTH] JWT generated for user: ${user.id}, token length: ${token.length}`); // LOG 6

      console.log('[AUTH] Login successful, sending response.'); // LOG 7
      return {
        message: 'Logged in successfully!',
        token, // Return the JWT
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),
  
  /**
   * Procedure to get the currently authenticated user's details.
   */
  me: protectedProcedure.query(({ ctx }) => {
    // The user object is already attached to ctx by the isAuthed middleware
    return ctx.user;
  }),
});

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { TRPCError } from '@trpc/server';
import jwt, { SignOptions } from 'jsonwebtoken'; // Import jsonwebtoken
import { publicProcedure, router, protectedProcedure } from '../trpc';
import config from '../../config/config'; // Import config for JWT secret and expiry

/**
 * Utility function to create a clean slug from a name
 */
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10;

/**
 * Zod schema for user signup input.
 * Includes validation for email format, password length, password confirmation, and username.
 */
const signupInput = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Point the error specifically to the confirmPassword field
});

/**
 * Zod schema for user login input.
 * Accepts either email or username for login.
 */
const loginInput = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
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
      const { username, name, email, password } = input;

      // Check if user with this email or username already exists
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists.',
          });
        }
        if (existingUser.username === username) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Username is already taken.',
          });
        }
      }

      // Hash the password
      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      // Generate clean slug from user's name
      const artistSlug = createSlug(name);

      // Create new user and artist in a transaction
      const result = await ctx.prisma.$transaction(async (tx) => {
        // Create the user
        const newUser = await tx.user.create({
          data: {
            username,
            name,
            email,
            passwordHash,
          },
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            createdAt: true,
          },
        });

        // Create the artist for this user
        const newArtist = await tx.artist.create({
          data: {
            slug: artistSlug,
            userId: newUser.id,
          },
          select: {
            id: true,
            slug: true,
            createdAt: true,
          },
        });

        return { user: newUser, artist: newArtist };
      });

      return {
        message: 'Account and artist profile created successfully!',
        user: result.user,
        artist: result.artist,
      };
    }),

  /**
   * Procedure for user login.
   * Verifies credentials, generates a JWT, and returns it.
   * Accepts either email or username for login.
   */
  login: publicProcedure
    .input(loginInput)
    .mutation(async ({ input, ctx }) => {
      const { emailOrUsername, password } = input;
      console.log(`[AUTH] Login attempt for: ${emailOrUsername}`); // LOG 1

      // Find the user by either email or username
      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [
            { email: emailOrUsername },
            { username: emailOrUsername },
          ],
        },
      });
      console.log(`[AUTH] User lookup result for ${emailOrUsername}: ${user ? 'Found' : 'Not Found'}`); // LOG 2

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email/username or password.',
        });
      }

      // Compare the provided password with the stored hashed password
      console.log(`[AUTH] Comparing password for user: ${user.id}`); // LOG 3
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      console.log(`[AUTH] Password comparison result: ${isPasswordValid}`); // LOG 4

      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email/username or password.',
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
          username: user.username,
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

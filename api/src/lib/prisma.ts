import { PrismaClient } from '@prisma/client';

// Add prisma to the globalThis object to prevent multiple instances of Prisma Client in development
// (This is common with hot-reloading, e.g., Next.js, Bun --hot, Nodemon)
declare global {
   
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient({
  // Optionally add logging for debugging database queries in development
  // log: ['query', 'info', 'warn', 'error'],
});

// In development, attach the Prisma client to globalThis.
// This ensures that subsequent hot reloads reuse the existing instance.
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

export default prisma;

import 'dotenv/config';
import app from './app';
import { PrismaClient } from '@prisma/client';

const prisma = app.locals.prisma as PrismaClient; // Access Prisma client from app.locals

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API on :${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

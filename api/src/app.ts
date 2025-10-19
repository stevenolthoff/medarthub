import express from 'express';
import cors from 'cors';
import path from 'node:path';
// Removed S3Client, PutObjectCommand, getSignedUrl, randomUUID from here
// as they are now handled within the tRPC image procedure.
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { randomUUID } from "crypto";

// TRPC Imports
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router'; // Import the main tRPC router
import { createContext } from './trpc'; // Import the context factory

// Removed S3Client instantiation here as it's now in image.ts

// Validate required environment variables (keep this general as R2 is still used)
const requiredEnvVars = {
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_ENDPOINT: process.env.R2_ENDPOINT,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\nPlease create a .env file with the required R2 credentials.');
  console.error('See the README for setup instructions.');
} else {
  console.log('✅ All R2 environment variables are present.');
}

// Removed BUCKET as it's now used in image.ts
// const BUCKET = process.env.R2_BUCKET_NAME!;

const app: express.Application = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Added Vite client origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));

app.use(express.json());
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'medarthub-api' });
});

// Test endpoint to verify server is receiving requests
app.post('/api/test-login', (req, res) => {
  console.log('🧪 [TEST] Received test login request:', req.body);
  res.json({ message: 'Test endpoint working', received: req.body });
});

// Add tRPC middleware
app.use(
  '/api/trpc', // Mount tRPC router under /api/trpc
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ path, error }) => {
      console.error(`❌ tRPC failed on path ${path || 'unknown'}: ${error.message}`);
      // Log full error in development, or to a separate error logging system in production
      if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
      }
    },
  })
);

// Removed the direct Express endpoint for R2 signed URL generation
// as it's now handled by tRPC's `imageRouter.createUploadUrl`.
// interface CreateUploadUrlRequestBody {
//   filename: string;
//   contentType: string;
// }
// app.post("/api/createUploadUrl", async (req: express.Request<Record<string, never>, Record<string, never>, CreateUploadUrlRequestBody>, res: express.Response) => {
//   // ... (removed content)
// });

// Routes
// app.use('/api/items', itemRoutes);

// --- Static serving (production) ---
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA catch-all (exclude /api)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global error handler (should be after routes)
// app.use(errorHandler);

export default app;

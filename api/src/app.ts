import express from 'express';
import path from 'node:path';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
// import itemRoutes from './routes/itemRoutes';
// import { errorHandler } from './middlewares/errorHandler'

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Validate required environment variables
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
  // Using console.error directly instead of process.exit(1)
  // to allow the server to start for other routes if needed,
  // but log a critical error that affects R2 functionality.
  // In a real production app, you might want to exit for critical config.
} else {
  console.log('✅ All R2 environment variables are present.');
}

const BUCKET = process.env.R2_BUCKET_NAME!;

const app: express.Application = express();

app.use(express.json());
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'medarthub-api' });
});

// Remove these specific console.logs here as they are covered by the initial validation
// console.log(process.env.R2_BUCKET_NAME);
// console.log(process.env.R2_ENDPOINT);
// console.log(process.env.R2_ACCESS_KEY_ID);
// console.log(process.env.R2_SECRET_ACCESS_KEY);

// Define an interface for the request body of createUploadUrl
interface CreateUploadUrlRequestBody {
  filename: string;
  contentType: string;
}

app.post("/api/createUploadUrl", async (req: express.Request<{}, {}, CreateUploadUrlRequestBody>, res) => {
  const userId = req.headers["x-user-id"] || "anon";
  const { filename, contentType } = req.body;

  // Log the received payload on the server
  console.log('Server: Received /api/createUploadUrl request:');
  console.log('  - Headers:', req.headers);
  console.log('  - Raw body:', req.body);
  console.log('  - Parsed values:', { userId, filename, contentType });

  // Basic validation for required fields
  if (!filename || !contentType) {
    console.error('Server: Validation failed: filename or contentType missing/falsy', { filename, contentType });
    return res.status(400).json({ error: "filename and contentType are required in the request body." });
  }

  try {
    const id = randomUUID();
    const fileExtension = filename.split('.').pop();
    // Handle cases where fileExtension might be undefined (e.g., filename without extension)
    // A more robust solution might check and use a default or reject if no extension.
    // For now, if it's undefined, the key will contain '.undefined', which R2 typically handles fine but is not ideal.
    const finalFileExtension = fileExtension ? `.${fileExtension}` : ''; // Ensure it's empty or starts with '.'
    
    // Construct the S3 key
    const key = `users/${userId}/images/${id}/original${finalFileExtension}`;
    console.log('Server: Generated S3 Key:', key);

    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      // CRITICAL FIX: Explicitly set ChecksumAlgorithm to undefined
      // to prevent the SDK from adding x-amz-checksum headers to the signed URL.
      // This ensures R2 does not expect a specific (e.g., empty) checksum.
      ChecksumAlgorithm: undefined, 
    });

    // It's good practice to explicitly list signed headers, especially if adding
    // other headers besides 'host'. For 'UNSIGNED-PAYLOAD', 'host' is usually
    // sufficient if no other custom headers are client-sent and needed for signing.
    const url = await getSignedUrl(s3, cmd, { expiresIn: 300, signableHeaders: new Set(['host']) }); // 5 min
    console.log('Server: Successfully generated signed URL.');

    res.json({ key, url });
  } catch (error: any) {
    console.error('Server: Error generating signed URL or interacting with R2:', error);
    // Provide a more specific error message to the client, but keep sensitive details server-side
    let clientErrorMessage = 'Failed to generate upload URL due to a server error.';
    if (error.Code === 'InvalidAccessKeyId' || error.Code === 'SignatureDoesNotMatch') {
      clientErrorMessage = 'Authentication failed with R2. Check your R2 credentials.';
    } else if (error.Code === 'NoSuchBucket') {
      clientErrorMessage = 'The specified R2 bucket does not exist or you do not have access.';
    } else if (error.message.includes('Network Error')) { // Basic check for network issues
      clientErrorMessage = 'Server could not connect to R2 storage. Check network configuration.';
    }
    res.status(500).json({ error: clientErrorMessage });
  }
});

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

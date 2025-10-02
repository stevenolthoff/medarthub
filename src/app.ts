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

const BUCKET = process.env.R2_BUCKET_NAME!;

const app = express();

app.use(express.json());
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'medarthub-api' });
});

console.log(process.env.R2_BUCKET_NAME);
console.log(process.env.R2_ENDPOINT);
console.log(process.env.R2_ACCESS_KEY_ID);
console.log(process.env.R2_SECRET_ACCESS_KEY);

// Define an interface for the request body of createUploadUrl
interface CreateUploadUrlRequestBody {
  filename: string;
  contentType: string;
}

app.post("/api/createUploadUrl", async (req: express.Request<{}, {}, CreateUploadUrlRequestBody>, res) => {
  const userId = req.headers["x-user-id"] || "anon";
  const { filename, contentType } = req.body;

  // Basic validation for required fields
  if (!filename || !contentType) {
    return res.status(400).json({ error: "filename and contentType are required in the request body." });
  }

  const id = randomUUID();
  const fileExtension = filename.split('.').pop(); // Extract extension from filename
  
  // Construct the S3 key using the derived extension
  const key = `users/${userId}/images/${id}/original.${fileExtension}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType, // Use the client-provided Content-Type
  });

  const url = await getSignedUrl(s3, cmd, { expiresIn: 300 }); // 5 min

  res.json({ key, url });
});

// Routes
// app.use('/api/items', itemRoutes);

// --- Static serving (production) ---
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// SPA catch-all (exclude /api)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global error handler (should be after routes)
// app.use(errorHandler);

export default app;

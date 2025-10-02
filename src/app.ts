import express from 'express';
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
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

console.log(process.env.R2_BUCKET_NAME);
console.log(process.env.R2_ENDPOINT);
console.log(process.env.R2_ACCESS_KEY_ID);
console.log(process.env.R2_SECRET_ACCESS_KEY);

app.post("/createUploadUrl", async (req, res) => {
  const userId = req.headers["x-user-id"] || "anon";
  const id = randomUUID();
  const key = `users/${userId}/images/${id}/original.jpg`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: "image/jpeg",
  });

  const url = await getSignedUrl(s3, cmd, { expiresIn: 300 }); // 5 min

  res.json({ key, url });
});

// Routes
// app.use('/api/items', itemRoutes);

// Global error handler (should be after routes)
// app.use(errorHandler);

export default app;

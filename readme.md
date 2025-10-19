# MedArtHub

A full-stack application with tRPC API backend, Vite React testing client, and Next.js web UI.

## Architecture

- **web** - The main UI (Next.js application)
- **client** - Testing ground (Vite React application) 
- **api** - tRPC backend with shared types
- **types** - Connected between web and tRPC for type safety

## Setup

### Environment Variables

Create a `.env` file in the project root (monorepo root) with your Cloudflare R2 credentials:

```bash
# Cloudflare R2 Configuration
R2_BUCKET_NAME=your-bucket-name
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key

# API Server Configuration
PORT=3001 # API server listens on this port
```

**To get your R2 credentials:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create a bucket or use an existing one
4. Go to "Manage R2 API tokens"
5. Create a new API token with R2 permissions
6. Use the token details to fill in the `.env` file

## Development and Production

### Development

1. From repo root: `npm run dev`
2. `client` (React) will be available at `http://localhost:5173`.
3. `web` (Next.js) will be available at `http://localhost:3000`.
4. `api` (Express) will be available at `http://localhost:3001`.
5. In the browser console of the client or web app, `fetch('/api/health').then(r=>r.json())` should return `{ ok: true, service: 'medarthub-api' }`.

### Production

1. From repo root: `npm run build`
2. `npm start`
3. Visit `http://localhost:3001` → This will serve the built `client` (React) SPA, and API routes will also be available under `/api`.

## Example of how to manually upload image to R2:

```
# Step 1: Request a signed upload URL
# Note: You can pipe the output to a tool like 'jq' to easily extract the URL.
# If jq is not installed, install it: brew install jq (macOS) or sudo apt-get install jq (Linux)
SIGNED_URL=$(curl -s -X POST http://localhost:3001/api/createUploadUrl \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-id" \
  -d '{"filename":"test.png","contentType":"image/png"}' | jq -r '.url')

# Verify the URL (optional)
echo "Generated URL: $SIGNED_URL"

# Step 2: Use the signed URL to upload the file
# Ensure the Content-Type header matches the one provided in Step 1
curl -v -X PUT "$SIGNED_URL" \
  -H "Content-Type: image/png" \
  --data-binary @/Users/steven/Desktop/test.png
```

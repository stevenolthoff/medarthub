# MedArtHub

A full-stack application with Express API backend and Vite React frontend.

## Frontend/Backend dev & prod

### Development

1. From repo root: `npm run dev`
2. Visit `http://localhost:5174` → see React page.
3. In browser console, `fetch('/api/health').then(r=>r.json())` → `{ ok: true, service: 'medarthub-api' }`.

### Production

1. From repo root: `npm run build`
2. `npm start`
3. Visit `http://localhost:3001` → should serve built SPA; `GET /api/health` still works.

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

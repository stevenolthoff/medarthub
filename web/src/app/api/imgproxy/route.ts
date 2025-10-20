import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const IMGPROXY_KEY = process.env.IMGPROXY_KEY;
const IMGPROXY_SALT = process.env.IMGPROXY_SALT;
const IMGPROXY_URL = process.env.NEXT_PUBLIC_IMGPROXY_URL;
const R2_PUBLIC_ENDPOINT = process.env.NEXT_PUBLIC_R2_PUBLIC_ENDPOINT;

function toUrlSafeBase64(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateSignedImgproxyUrl(
  r2Key: string,
  options: { width?: number; height?: number; quality?: number; format?: string } = {}
): string {
  if (!IMGPROXY_URL || !IMGPROXY_KEY || !IMGPROXY_SALT || !R2_PUBLIC_ENDPOINT) {
    return `${(R2_PUBLIC_ENDPOINT || '').replace(/\/$/, '')}/${r2Key}`;
  }

  const keyBuffer = Buffer.from(IMGPROXY_KEY, 'hex');
  const saltBuffer = Buffer.from(IMGPROXY_SALT, 'hex');

  let path = '';
  const resizeOption = options.width && options.height
    ? `rs:fit:${options.width}:${options.height}`
    : options.width ? `w:${options.width}`
    : options.height ? `h:${options.height}`
    : '';
  const qualityOption = options.quality ? `q:${options.quality}` : '';
  const formatOption = options.format ? `f:${options.format}` : '';
  const processingOptions = [resizeOption, qualityOption, formatOption].filter(Boolean);
  if (processingOptions.length > 0) {
    path += `/${processingOptions.join('/')}`;
  }

  const r2SourceUrl = `${R2_PUBLIC_ENDPOINT.replace(/\/$/, '')}/${r2Key}`;
  const encodedSourceUrl = toUrlSafeBase64(Buffer.from(r2SourceUrl));
  path += `/plain/${encodedSourceUrl}`;

  const hmac = crypto.createHmac('sha256', keyBuffer);
  hmac.update(saltBuffer);
  hmac.update(path);
  const signature = toUrlSafeBase64(hmac.digest());

  return `${IMGPROXY_URL}/${signature}${path}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageKey = searchParams.get('key');
  const width = searchParams.get('w');
  const height = searchParams.get('h');
  const quality = searchParams.get('q');
  const format = searchParams.get('f');

  if (!imageKey) {
    return NextResponse.json({ error: 'Image key is required' }, { status: 400 });
  }

  const optimizedUrl = generateSignedImgproxyUrl(imageKey, {
    width: width ? parseInt(width, 10) : undefined,
    height: height ? parseInt(height, 10) : undefined,
    quality: quality ? parseInt(quality, 10) : undefined,
    format: format || undefined,
  });

  return NextResponse.json({ url: optimizedUrl });
}



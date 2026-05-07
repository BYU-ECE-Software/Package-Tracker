import { Client } from 'minio';

// Server-side MinIO client (used only in Next route handlers)
const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
const port = Number(process.env.MINIO_PORT || 9000);
const useSSL = (process.env.MINIO_USE_SSL || 'false') === 'true';

const accessKey = process.env.MINIO_ROOT_USER || 'dummy';
const secretKey = process.env.MINIO_ROOT_PASSWORD || 'dummy';

if (!accessKey || !secretKey) {
  throw new Error('Missing MINIO_ROOT_USER or MINIO_ROOT_PASSWORD in environment variables.');
}

export const minioClient = new Client({
  endPoint,
  port,
  useSSL,
  accessKey,
  secretKey,
});

// Key Bucket names centralized
// Edit this portion of the file
export const SAMPLE_IMAGES_BUCKET = 'sample-images';

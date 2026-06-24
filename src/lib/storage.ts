import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME || "screenshot-analyzer-images";

function getClient(): S3Client | null {
  if (!R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_KEY) return null;
  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY,
    },
  });
}

export async function uploadImage(
  key: string,
  buffer: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  const client = getClient();
  if (!client || !R2_BUCKET) return null;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: new Uint8Array(buffer),
        ContentType: contentType,
      })
    );
    return `${R2_ENDPOINT}/${R2_BUCKET}/${key}`;
  } catch (error) {
    console.error("R2 upload error:", error);
    return null;
  }
}

export async function getImage(key: string): Promise<Buffer | null> {
  const client = getClient();
  if (!client || !R2_BUCKET) return null;

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );
    const body = await response.Body?.transformToByteArray();
    return body ? Buffer.from(body) : null;
  } catch {
    return null;
  }
}

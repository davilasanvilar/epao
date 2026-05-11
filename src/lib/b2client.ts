import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function getB2Client(endpoint: string, region: string, accessKeyId: string, secretAccessKey: string) {
  return new S3Client({
    endpoint: `https://${endpoint}`,
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
}

export async function uploadToB2(client: S3Client, bucketName: string, key: string, fileBuffer: ArrayBuffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: new Uint8Array(fileBuffer),
    ContentType: contentType,
  });
  
  await client.send(command);
  return key;
}

export async function deleteFromB2(client: S3Client, bucketName: string, key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  
  await client.send(command);
}

export function getPublicB2Url(bucketName: string, endpoint: string, key: string) {
  if (!key) return '';
  return `https://${bucketName}.${endpoint}/${key}`;
}

export async function getPresignedB2Url(client: S3Client, bucketName: string, key: string, expiresIn: number = 3600) {
  if (!key) return '';
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return await getSignedUrl(client, command, { expiresIn });
}

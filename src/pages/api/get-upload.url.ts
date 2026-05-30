import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { APIRoute } from "astro";

// Initialize the S3 client pointing to Backblaze
const s3 = new S3Client({
  endpoint: import.meta.env.B2_ENDPOINT,
  region: import.meta.env.B2_REGION,
  credentials: {
    accessKeyId: import.meta.env.B2_KEY_ID,
    secretAccessKey: import.meta.env.B2_APPLICATION_KEY,
  },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { filename, contentType } = (await request.json()) as {
      filename: string;
      contentType: string;
    };

    const id = crypto.randomUUID();

    const command = new PutObjectCommand({
      Bucket: import.meta.env.B2_BUCKET_NAME,
      Key: id,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return new Response(JSON.stringify({ url: signedUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return new Response(JSON.stringify({ error: "Failed to generate URL" }), { status: 500 });
  }
};

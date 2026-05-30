import type { APIRoute } from "astro";
import { getB2Client, getPresignedB2Url } from "../../lib/b2client";

// Astro Cloudflare adapter will provide the `env` object at runtime.
// At build time, we fall back to import.meta.env
// @ts-ignore
import { env as cfEnv } from "cloudflare:workers";

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return new Response("Missing key", { status: 400 });
    }

    const endpoint = cfEnv?.B2_ENDPOINT || import.meta.env.B2_ENDPOINT;
    const region = cfEnv?.B2_REGION || import.meta.env.B2_REGION;
    const keyId = cfEnv?.B2_KEY_ID || import.meta.env.B2_KEY_ID;
    const appKey = cfEnv?.B2_APPLICATION_KEY || import.meta.env.B2_APPLICATION_KEY;
    const bucketName = cfEnv?.B2_BUCKET_NAME || import.meta.env.B2_BUCKET_NAME;

    const b2Client = getB2Client(endpoint, region, keyId, appKey);

    const presignedUrl = await getPresignedB2Url(b2Client, bucketName, key);

    return Response.redirect(presignedUrl, 302);
  } catch (error) {
    console.error("B2 image fetch error:", error);
    return new Response("Error fetching image", { status: 500 });
  }
};

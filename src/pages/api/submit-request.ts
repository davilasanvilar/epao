import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';


export const POST: APIRoute = async ({ request }) => {
  const db = env.DB;

  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Insert into D1
    await db.prepare(
      "INSERT INTO requests (name, email, message) VALUES (?, ?, ?)"
    )
      .bind(name, email, message)
      .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};
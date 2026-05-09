import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

interface TurnstileResponse {
  success: boolean;
  error: string;
}

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

    const token = formData.get('cf-turnstile-response');

    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent("0x4AAAAAADMOOSpqvuX7mfcbaYspui_-JoY")}&response=${encodeURIComponent(token as string)}`,
    });

    const outcome = await verify.json() as TurnstileResponse;

    if (!outcome.success) {
      return new Response(JSON.stringify({ error: "Verification failed" }), { status: 403 });
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
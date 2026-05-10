import type { APIRoute } from 'astro';
import { turso } from '../../lib/tursoclient';

interface TurnstileResponse {
  success: boolean;
  error: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const token = formData.get('cf-turnstile-response');

    const params = new URLSearchParams();
    params.append('secret', '0x4AAAAAADMOOSpqvuX7mfcbaYspui_-JoY');
    params.append('response', token as string);

    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const outcome = await verify.json() as TurnstileResponse;

    if (!outcome.success) {
      return new Response(JSON.stringify({ error: outcome.error }), { status: 403 });
    }

    // Insert into Turso
    await turso.execute({
      sql: "INSERT INTO requests (name, email, message) VALUES (?, ?, ?)",
      args: [name, email, message]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};

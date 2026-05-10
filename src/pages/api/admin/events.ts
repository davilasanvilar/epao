import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../lib/tursoclient';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request }) => {
  try {
    const url = env.TURSO_CONNECTION_URL || import.meta.env.TURSO_CONNECTION_URL;
    const token = env.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
      console.error("Missing Turso configuration");
      return new Response(JSON.stringify({ error: "Server Configuration Error" }), { status: 500 });
    }

    const turso = getTursoClient(url, token);

    let name, description, price, date, img;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await request.json();
      name = data.name;
      description = data.description;
      price = data.price;
      date = data.date;
      img = data.img;
    } else {
      const formData = await request.formData();
      name = formData.get('name') as string;
      description = formData.get('description') as string;
      price = parseFloat(formData.get('price') as string);
      date = formData.get('date') as string;
      img = formData.get('img') as string;
    }

    if (!name || !description || price === undefined || isNaN(Number(price)) || !date || !img) {
      return new Response(JSON.stringify({ error: "Missing or invalid fields" }), { status: 400 });
    }

    // Insert into Turso
    await turso.execute({
      sql: "INSERT INTO events (name, description, price, date, img) VALUES (?, ?, ?, ?, ?)",
      args: [name, description, Number(price), date, img]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: unknown) {
    console.error("Submission error:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};

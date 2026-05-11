import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../lib/tursoclient';
import { getB2Client, uploadToB2, deleteFromB2, getPresignedB2Url } from '../../../lib/b2client';
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

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const date = formData.get('date') as string;
    
    let img = '';
    const imageFile = formData.get('image') as File | null;

    if (!name || !description || isNaN(price) || !date) {
      return new Response(JSON.stringify({ error: "Missing or invalid fields" }), { status: 400 });
    }

    if (imageFile && imageFile.size > 0) {
      const b2Client = getB2Client(env.B2_ENDPOINT, env.B2_REGION, env.B2_KEY_ID, env.B2_APPLICATION_KEY);
      img = crypto.randomUUID();
      const buffer = await imageFile.arrayBuffer();
      await uploadToB2(b2Client, env.B2_BUCKET_NAME, img, buffer, imageFile.type);
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

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = env.TURSO_CONNECTION_URL || import.meta.env.TURSO_CONNECTION_URL;
    const token = env.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
      return new Response(JSON.stringify({ error: "Server Configuration Error" }), { status: 500 });
    }

    const turso = getTursoClient(url, token);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return new Response(JSON.stringify({ error: "Invalid pagination parameters" }), { status: 400 });
    }

    const offset = (page - 1) * limit;

    const sqlCount = `SELECT COUNT(*) as count FROM events`;
    const countResult = await turso.execute(sqlCount);
    const totalCount = countResult.rows[0].count as number;

    const sqlData = `SELECT * FROM events ORDER BY date DESC LIMIT ? OFFSET ?`;
    const dataResult = await turso.execute({
      sql: sqlData,
      args: [limit, offset]
    });

    const b2Client = getB2Client(env.B2_ENDPOINT, env.B2_REGION, env.B2_KEY_ID, env.B2_APPLICATION_KEY);

    const events = await Promise.all(dataResult.rows.map(async row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      date: row.date,
      img: row.img,
      imgUrl: row.img ? await getPresignedB2Url(b2Client, env.B2_BUCKET_NAME, row.img as string) : ""
    })));

    return new Response(JSON.stringify({
      data: events,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }), { status: 200 });

  } catch (error: unknown) {
    console.error("Fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const url = env.TURSO_CONNECTION_URL || import.meta.env.TURSO_CONNECTION_URL;
    const token = env.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
      return new Response(JSON.stringify({ error: "Server Configuration Error" }), { status: 500 });
    }

    const turso = getTursoClient(url, token);
    const formData = await request.formData();
    
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const date = formData.get('date') as string;
    const deleteImage = formData.get('deleteImage') === 'true';
    
    const imageFile = formData.get('image') as File | null;

    if (!id || !name || !description || isNaN(price) || !date) {
      return new Response(JSON.stringify({ error: "Missing or invalid fields" }), { status: 400 });
    }

    const currentEvent = await turso.execute({ sql: "SELECT img FROM events WHERE id = ?", args: [id] });
    let currentImg = currentEvent.rows[0]?.img as string;

    const b2Client = getB2Client(env.B2_ENDPOINT, env.B2_REGION, env.B2_KEY_ID, env.B2_APPLICATION_KEY);

    if (deleteImage && currentImg) {
      try {
        await deleteFromB2(b2Client, env.B2_BUCKET_NAME, currentImg);
      } catch (e) {
        console.error("Failed to delete image from B2", e);
      }
      currentImg = '';
    } else if (imageFile && imageFile.size > 0) {
      if (!currentImg) currentImg = crypto.randomUUID();
      const buffer = await imageFile.arrayBuffer();
      await uploadToB2(b2Client, env.B2_BUCKET_NAME, currentImg, buffer, imageFile.type);
    }

    await turso.execute({
      sql: "UPDATE events SET name = ?, description = ?, price = ?, date = ?, img = ? WHERE id = ?",
      args: [name, description, Number(price), date, currentImg, id]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: unknown) {
    console.error("Update error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = env.TURSO_CONNECTION_URL || import.meta.env.TURSO_CONNECTION_URL;
    const token = env.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
      return new Response(JSON.stringify({ error: "Server Configuration Error" }), { status: 500 });
    }

    const turso = getTursoClient(url, token);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
    }

    const currentEvent = await turso.execute({ sql: "SELECT img FROM events WHERE id = ?", args: [id] });
    const currentImg = currentEvent.rows[0]?.img as string;

    if (currentImg) {
      const b2Client = getB2Client(env.B2_ENDPOINT, env.B2_REGION, env.B2_KEY_ID, env.B2_APPLICATION_KEY);
      try {
        await deleteFromB2(b2Client, env.B2_BUCKET_NAME, currentImg);
      } catch (e) {
        console.error("Failed to delete image from B2 on event delete", e);
      }
    }

    await turso.execute({
      sql: "DELETE FROM events WHERE id = ?",
      args: [id]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: unknown) {
    console.error("Delete error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};

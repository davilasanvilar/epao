import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../lib/tursoclient';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = env.TURSO_CONNECTION_URL || import.meta.env.TURSO_CONNECTION_URL;
    const token = env.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
      console.error("Missing Turso configuration");
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

    const sqlCount = `SELECT COUNT(*) as count FROM requests`;
    const countResult = await turso.execute(sqlCount);
    const totalCount = countResult.rows[0].count as number;

    const sqlData = `SELECT * FROM requests ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const dataResult = await turso.execute({
      sql: sqlData,
      args: [limit, offset]
    });

    const requestsData = dataResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      created_at: row.created_at
    }));

    return new Response(JSON.stringify({
      data: requestsData,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }), { status: 200 });

  } catch (error: unknown) {
    console.error("Fetch requests error:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "An unexpected error occurred";
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

    await turso.execute({
      sql: "DELETE FROM requests WHERE id = ?",
      args: [id]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: unknown) {
    console.error("Delete request error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};

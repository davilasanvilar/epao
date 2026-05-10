import type { APIRoute } from 'astro';
import { getTursoClient } from '../../lib/tursoclient';
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
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const type = searchParams.get('type') || 'future'; // 'future' or 'past'

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return new Response(JSON.stringify({ error: "Invalid pagination parameters" }), { status: 400 });
    }

    const offset = (page - 1) * limit;

    // We assume the stored date is an ISO8601 string or similar, allowing string comparison.
    // We want to compare with today's date (ignoring time) to include today's events in future.
    // SQLite date('now', 'localtime') gives YYYY-MM-DD.
    // Since dates might include time, we can compare substr(date, 1, 10).
    const dateCondition = type === 'future' ? ">= date('now', 'localtime')" : "< date('now', 'localtime')";
    const orderDirection = type === 'future' ? "ASC" : "DESC";

    const sqlCount = `SELECT COUNT(*) as count FROM events WHERE substr(date, 1, 10) ${dateCondition}`;
    const countResult = await turso.execute(sqlCount);
    const totalCount = countResult.rows[0].count as number;

    const sqlData = `SELECT * FROM events WHERE substr(date, 1, 10) ${dateCondition} ORDER BY date ${orderDirection} LIMIT ? OFFSET ?`;
    const dataResult = await turso.execute({
      sql: sqlData,
      args: [limit, offset]
    });

    const events = dataResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      date: row.date,
      img: row.img
    }));

    return new Response(JSON.stringify({
      events,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }), { status: 200 });

  } catch (error: unknown) {
    console.error("Fetch error:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};

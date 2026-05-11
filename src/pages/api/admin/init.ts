export const prerender = false;

import { getTursoClient } from "../../../lib/tursoclient";

export async function GET() {
  try {
    const url = import.meta.env.TURSO_CONNECTION_URL || process.env.TURSO_CONNECTION_URL;
    const token = import.meta.env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
      return new Response(JSON.stringify({ error: "Missing Turso config" }), { status: 500 });
    }

    const turso = getTursoClient(url, token);

    const schema = `
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        date TEXT NOT NULL,
        img TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        isVideo BOOLEAN,
        url TEXT,
        description TEXT,
        img TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const statements = schema.split(';').filter(s => s.trim().length > 0);
    for (const s of statements) {
      await turso.execute(s);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

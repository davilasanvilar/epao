import { createClient } from "@libsql/client";

export const turso = createClient({
    url: import.meta.env.TURSO_CONNECTION_URL,
    authToken: import.meta.env.TURSO_AUTH_TOKEN,
});
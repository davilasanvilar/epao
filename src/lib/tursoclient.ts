import { createClient } from "@libsql/client/web";

export function getTursoClient(url: string, authToken: string) {
  return createClient({
    url,
    authToken,
  });
}

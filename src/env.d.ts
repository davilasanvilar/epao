/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// 1. Definimos tus variables de Cloudflare (wrangler)
type Env = {
    DB: D1Database;
};

// 2. Importamos el tipo 'Runtime' que inyecta Cloudflare
type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

// 3. Fusionamos ese Runtime con el objeto Locals de Astro
declare namespace App {
    interface Locals extends Runtime { }
}
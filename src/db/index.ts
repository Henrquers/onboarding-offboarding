import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não está definida. Copie .env.example para .env e preencha a URL do Postgres.",
  );
}

declare global {
  var __sql: ReturnType<typeof postgres> | undefined;
}

// Em serverless cada invocação pode reaproveitar o módulo; um cliente por
// processo evita estourar o limite de conexões do Neon/Supabase.
const client =
  globalThis.__sql ??
  postgres(connectionString, {
    max: 1,
    // Pools em modo transaction (pgbouncer) não suportam prepared statements.
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__sql = client;
}

export const db = drizzle(client, { schema });
export { schema };

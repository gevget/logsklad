import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

function createDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and add a PostgreSQL connection string.");
  }

  const client = postgres(url, {
    max: 1,
    prepare: false,
    ssl: url.includes("supabase") ? "require" : undefined,
  });

  return { client, db: drizzle(client, { schema }) };
}

let database: ReturnType<typeof createDatabase> | undefined;

export function getDatabase() {
  database ??= createDatabase();
  return database;
}

import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

if (!connectionString) {
  console.warn(
    "DATABASE_URL is not set. Set it in your environment (.env.local or Vercel project settings)."
  );
}

export const sql = neon(connectionString);

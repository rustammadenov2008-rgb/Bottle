/**
 * Запускает миграции из папки /migrations против базы данных,
 * указанной в DATABASE_URL.
 *
 * Использование:
 *   npm run db:migrate
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

async function main() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error(
      "DATABASE_URL не задан. Добавь его в .env.local (см. .env.example) или экспортируй в переменные окружения перед запуском."
    );
    process.exit(1);
  }

  const sql = neon(connectionString);
  const migrationsDir = join(process.cwd(), "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const fullPath = join(migrationsDir, file);
    const content = readFileSync(fullPath, "utf-8");
    console.log(`Применяю миграцию: ${file}`);
    await sql.query(content);
  }

  console.log("Все миграции применены успешно.");
}

main().catch((err) => {
  console.error("Ошибка миграции:", err);
  process.exit(1);
});

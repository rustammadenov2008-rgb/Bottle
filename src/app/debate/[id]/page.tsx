import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { rowToDebate, DebateRow } from "@/lib/types";
import { DebateRoom } from "@/components/DebateRoom";

async function loadDebate(id: string) {
  const rows = (await sql`
    SELECT * FROM debates WHERE id = ${id} LIMIT 1;
  `) as unknown as DebateRow[];
  if (rows.length === 0) return null;
  return rowToDebate(rows[0]);
}

export default async function DebatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const debate = await loadDebate(id);

  if (!debate) {
    notFound();
  }

  return <DebateRoom initialDebate={debate} />;
}

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { rowToDebate, DebateRow } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = (await sql`
      SELECT * FROM debates WHERE id = ${id} LIMIT 1;
    `) as unknown as DebateRow[];

    if (rows.length === 0) {
      return NextResponse.json({ error: "Спор не найден." }, { status: 404 });
    }

    return NextResponse.json({ debate: rowToDebate(rows[0]) });
  } catch (err) {
    console.error("Ошибка получения спора:", err);
    return NextResponse.json(
      { error: "Не удалось загрузить спор." },
      { status: 500 }
    );
  }
}

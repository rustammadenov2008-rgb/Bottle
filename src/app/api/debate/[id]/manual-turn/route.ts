import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { rowToDebate, DebateRow } from "@/lib/types";
import { makeMessage, recomputeAnalytics } from "@/lib/debate-engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const text = String(body.text ?? "").trim();

    if (!text) {
      return NextResponse.json(
        { error: "Текст ответа не может быть пустым." },
        { status: 400 }
      );
    }

    const rows = (await sql`
      SELECT * FROM debates WHERE id = ${id} LIMIT 1;
    `) as unknown as DebateRow[];

    if (rows.length === 0) {
      return NextResponse.json({ error: "Спор не найден." }, { status: 404 });
    }

    const debate = rowToDebate(rows[0]);

    if (debate.status !== "awaiting_manual_grok") {
      return NextResponse.json(
        { error: "Спор сейчас не ожидает ручного ввода." },
        { status: 400 }
      );
    }

    const message = makeMessage("grok", text);
    const updatedMessages = [...debate.messages, message];
    const analytics = recomputeAnalytics(updatedMessages);
    const newTurn = debate.currentTurn + 1;
    const status = newTurn >= debate.maxTurns ? "finished" : "in_progress";

    const updatedRows = (await sql`
      UPDATE debates
      SET messages = ${JSON.stringify(updatedMessages)}::jsonb,
          analytics = ${JSON.stringify(analytics)}::jsonb,
          current_turn = ${newTurn},
          status = ${status},
          updated_at = now()
      WHERE id = ${id}
      RETURNING *;
    `) as unknown as DebateRow[];

    return NextResponse.json({ debate: rowToDebate(updatedRows[0]) });
  } catch (err) {
    console.error("Ошибка ручного хода:", err);
    return NextResponse.json(
      { error: "Не удалось сохранить ручной ответ." },
      { status: 500 }
    );
  }
}

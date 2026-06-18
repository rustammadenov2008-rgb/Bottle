import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { rowToDebate, DebateRow, Debate } from "@/lib/types";
import { callGemini } from "@/lib/gemini";
import { callGrok } from "@/lib/grok";
import { buildTurnPrompt, makeMessage, recomputeAnalytics } from "@/lib/debate-engine";

async function loadDebate(id: string): Promise<Debate | null> {
  const rows = (await sql`
    SELECT * FROM debates WHERE id = ${id} LIMIT 1;
  `) as unknown as DebateRow[];
  if (rows.length === 0) return null;
  return rowToDebate(rows[0]);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const debate = await loadDebate(id);

    if (!debate) {
      return NextResponse.json({ error: "Спор не найден." }, { status: 404 });
    }

    if (debate.status === "finished") {
      return NextResponse.json({ debate });
    }

    if (debate.status === "awaiting_manual_grok") {
      return NextResponse.json({ debate });
    }

    if (debate.currentTurn >= debate.maxTurns) {
      return NextResponse.json({ debate });
    }

    const isGeminiTurn = debate.currentTurn % 2 === 0;
    const prompt = buildTurnPrompt(debate);

    if (isGeminiTurn) {
      const text = await callGemini(debate.personaGemini, prompt);
      const message = makeMessage("gemini", text);
      const updatedMessages = [...debate.messages, message];
      const analytics = recomputeAnalytics(updatedMessages);
      const newTurn = debate.currentTurn + 1;
      const status = newTurn >= debate.maxTurns ? "finished" : "in_progress";

      const rows = (await sql`
        UPDATE debates
        SET messages = ${JSON.stringify(updatedMessages)}::jsonb,
            analytics = ${JSON.stringify(analytics)}::jsonb,
            current_turn = ${newTurn},
            status = ${status},
            updated_at = now()
        WHERE id = ${id}
        RETURNING *;
      `) as unknown as DebateRow[];

      return NextResponse.json({ debate: rowToDebate(rows[0]) });
    }

    // Ход Grok
    try {
      const text = await callGrok(debate.personaGrok, prompt);
      const message = makeMessage("grok", text);
      const updatedMessages = [...debate.messages, message];
      const analytics = recomputeAnalytics(updatedMessages);
      const newTurn = debate.currentTurn + 1;
      const status = newTurn >= debate.maxTurns ? "finished" : "in_progress";

      const rows = (await sql`
        UPDATE debates
        SET messages = ${JSON.stringify(updatedMessages)}::jsonb,
            analytics = ${JSON.stringify(analytics)}::jsonb,
            current_turn = ${newTurn},
            status = ${status},
            updated_at = now()
        WHERE id = ${id}
        RETURNING *;
      `) as unknown as DebateRow[];

      return NextResponse.json({ debate: rowToDebate(rows[0]) });
    } catch (err) {
      console.error("Ошибка вызова Grok, переключаюсь на ручной режим:", err);
      const rows = (await sql`
        UPDATE debates
        SET status = 'awaiting_manual_grok', updated_at = now()
        WHERE id = ${id}
        RETURNING *;
      `) as unknown as DebateRow[];

      return NextResponse.json({
        debate: rowToDebate(rows[0]),
        warning:
          "Grok недоступен (нет ключа или ошибка API). Нужно ввести ответ вручную.",
      });
    }
  } catch (err) {
    console.error("Ошибка выполнения хода:", err);
    return NextResponse.json(
      { error: "Не удалось выполнить ход спора." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { sql } from "@/lib/db";
import { rowToDebate, DebateRow } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = String(body.topic ?? "").trim();
    const personaGemini = String(body.personaGemini ?? "").trim();
    const personaGrok = String(body.personaGrok ?? "").trim();
    const rounds = Math.max(1, Math.min(6, Number(body.rounds) || 3));

    if (!topic || !personaGemini || !personaGrok) {
      return NextResponse.json(
        { error: "Нужно указать тему и обе личности участников." },
        { status: 400 }
      );
    }

    const id = nanoid(10);
    const maxTurns = rounds * 2;

    const rows = (await sql`
      INSERT INTO debates (id, topic, persona_gemini, persona_grok, total_rounds, current_turn, max_turns, status, messages, analytics)
      VALUES (
        ${id},
        ${topic},
        ${personaGemini},
        ${personaGrok},
        ${rounds},
        0,
        ${maxTurns},
        'in_progress',
        '[]'::jsonb,
        '{"wordsGemini":0,"wordsGrok":0,"agreementsGemini":0,"agreementsGrok":0}'::jsonb
      )
      RETURNING *;
    `) as unknown as DebateRow[];

    return NextResponse.json({ debate: rowToDebate(rows[0]) });
  } catch (err) {
    console.error("Ошибка создания спора:", err);
    return NextResponse.json(
      { error: "Не удалось создать спор. Проверь подключение к базе данных." },
      { status: 500 }
    );
  }
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TOPIC_PRESETS = [
  "Что лучше: утренняя или вечерняя пробежка?",
  "Удалённая работа эффективнее офиса?",
  "Стоит ли учить детей программированию с раннего возраста?",
  "Криптовалюты — это будущее денег или пузырь?",
];

export function DebateSetupForm() {
  const router = useRouter();
  const [topic, setTopic] = useState(TOPIC_PRESETS[0]);
  const [personaGemini, setPersonaGemini] = useState(
    "Ты страстный фанат утренних пробежек. Аргументируй жёстко, с фактами, не сдавайся легко, отвечай по делу, 2-4 предложения."
  );
  const [personaGrok, setPersonaGrok] = useState(
    "Ты убеждённый сторонник вечерних пробежек. Аргументируй жёстко, с фактами, не сдавайся легко, отвечай по делу, 2-4 предложения."
  );
  const [rounds, setRounds] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!topic.trim() || !personaGemini.trim() || !personaGrok.trim()) {
      setError("Заполни тему и обе личности участников.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/debate/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, personaGemini, personaGrok, rounds }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Не удалось создать спор.");
      }
      router.push(`/debate/${data.debate.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="text-xs uppercase tracking-[0.14em] text-text-dim font-mono mb-2 block">
          Тема спора
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full"
          placeholder="О чём спорят?"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {TOPIC_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTopic(preset)}
              className="text-xs px-2.5 py-1 rounded-full border border-line text-text-dim hover:text-text hover:border-gold transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.14em] text-gemini font-mono mb-2 block">
            Gemini — позиция
          </label>
          <textarea
            value={personaGemini}
            onChange={(e) => setPersonaGemini(e.target.value)}
            rows={4}
            className="w-full resize-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.14em] text-grok font-mono mb-2 block">
            Grok — позиция
          </label>
          <textarea
            value={personaGrok}
            onChange={(e) => setPersonaGrok(e.target.value)}
            rows={4}
            className="w-full resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-[0.14em] text-text-dim font-mono">
          Раунды
        </label>
        <input
          type="number"
          min={1}
          max={6}
          value={rounds}
          onChange={(e) =>
            setRounds(Math.max(1, Math.min(6, Number(e.target.value) || 1)))
          }
          className="w-20"
        />
        <span className="text-xs text-text-dim">
          ({rounds * 2} реплик всего)
        </span>
      </div>

      {error && (
        <p className="text-sm text-grok bg-grok-dim/20 border border-grok-dim rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="font-display font-bold text-base bg-gold text-ink rounded-xl px-6 py-3 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Готовлю арену..." : "Начать спор"}
      </button>
    </form>
  );
}

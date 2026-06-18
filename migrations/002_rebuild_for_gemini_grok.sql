-- Эта миграция нужна только тем, кто уже применил старую версию
-- 001_create_debates.sql (со столбцами persona_claude/persona_gpt/verdict).
-- Если ты применяешь миграции на чистую базу в первый раз — этот файл
-- ничего не делает (DROP TABLE IF EXISTS безопасен), просто пропусти его.

DROP TABLE IF EXISTS debates;

CREATE TABLE debates (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  persona_gemini TEXT NOT NULL,
  persona_grok TEXT NOT NULL,
  total_rounds INTEGER NOT NULL DEFAULT 3,
  current_turn INTEGER NOT NULL DEFAULT 0,
  max_turns INTEGER NOT NULL DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'in_progress',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  analytics JSONB NOT NULL DEFAULT '{"wordsGemini":0,"wordsGrok":0,"agreementsGemini":0,"agreementsGrok":0}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debates_created_at ON debates (created_at DESC);

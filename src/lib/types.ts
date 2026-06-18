export type Speaker = "gemini" | "grok";

export interface DebateMessage {
  speaker: Speaker;
  text: string;
  wordCount: number;
  agreementHits: number;
  createdAt: string;
}

export interface DebateAnalytics {
  wordsGemini: number;
  wordsGrok: number;
  agreementsGemini: number;
  agreementsGrok: number;
}

export type DebateStatus = "in_progress" | "awaiting_manual_grok" | "finished";

export interface Debate {
  id: string;
  topic: string;
  personaGemini: string;
  personaGrok: string;
  totalRounds: number;
  currentTurn: number;
  maxTurns: number;
  status: DebateStatus;
  messages: DebateMessage[];
  analytics: DebateAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface DebateRow {
  id: string;
  topic: string;
  persona_gemini: string;
  persona_grok: string;
  total_rounds: number;
  current_turn: number;
  max_turns: number;
  status: DebateStatus;
  messages: DebateMessage[];
  analytics: DebateAnalytics;
  created_at: string;
  updated_at: string;
}

export function rowToDebate(row: DebateRow): Debate {
  return {
    id: row.id,
    topic: row.topic,
    personaGemini: row.persona_gemini,
    personaGrok: row.persona_grok,
    totalRounds: row.total_rounds,
    currentTurn: row.current_turn,
    maxTurns: row.max_turns,
    status: row.status,
    messages: row.messages ?? [],
    analytics:
      row.analytics ?? {
        wordsGemini: 0,
        wordsGrok: 0,
        agreementsGemini: 0,
        agreementsGrok: 0,
      },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

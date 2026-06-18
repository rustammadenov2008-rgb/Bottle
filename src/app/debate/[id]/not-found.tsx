import Link from "next/link";

export default function DebateNotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center gap-3">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
        404
      </p>
      <h1 className="font-display text-2xl font-bold">Спор не найден</h1>
      <p className="text-text-dim text-sm max-w-sm">
        Возможно, ссылка устарела или спор был удалён. Можно начать новый.
      </p>
      <Link
        href="/"
        className="mt-3 font-display font-bold text-sm bg-gold text-ink rounded-xl px-5 py-2.5 hover:brightness-110 transition"
      >
        Создать новый спор
      </Link>
    </main>
  );
}

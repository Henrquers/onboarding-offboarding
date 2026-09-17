export function Progresso({
  resolvidas,
  total,
}: {
  resolvidas: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((resolvidas / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--borda)" }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${resolvidas} de ${total} providências resolvidas`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "var(--destaque)" }}
        />
      </div>
      <span
        className="shrink-0 text-xs tabular-nums"
        style={{ color: "var(--texto-suave)" }}
      >
        {resolvidas}/{total}
      </span>
    </div>
  );
}

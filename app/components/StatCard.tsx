export default function StatCard({
  label,
  value,
  hint,
  accent
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-2 p-5 shadow-soft">
      <p className="text-xs uppercase tracking-widest text-text-muted">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${accent ? 'text-accent' : 'text-text'}`}>
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-text-muted">{hint}</p> : null}
    </div>
  );
}

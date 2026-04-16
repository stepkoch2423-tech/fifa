interface LoadingOverlayProps {
  active: boolean;
  label: string;
}

export function LoadingOverlay({ active, label }: LoadingOverlayProps) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/60 backdrop-blur-md">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="mx-4 flex min-w-[220px] items-center gap-4 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96)_0%,rgba(4,8,20,0.98)_100%)] px-5 py-4 text-white shadow-[0_24px_80px_rgba(2,6,23,0.6)]"
      >
        <span className="screen-loader-spinner" aria-hidden="true" />
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
            Football Cards
          </div>
          <div className="text-sm font-medium text-slate-100">{label}</div>
        </div>
      </div>
    </div>
  );
}

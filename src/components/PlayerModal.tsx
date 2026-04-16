import { useEffect, useEffectEvent } from "react";
import { createPortal } from "react-dom";
import type { Club, Player } from "../types/football";
import {
  getOptimizedPlayerImageUrl,
  getTopAttributes,
  PLAYER_STAT_KEYS,
} from "../utils/playerHelpers";

interface PlayerModalProps {
  player: Player | null;
  club: Club | null;
  onClose: () => void;
}

function StatBar({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-slate-100 tabular-nums">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/6">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            background: `linear-gradient(90deg, ${accent} 0%, #facc15 100%)`,
          }}
        />
      </div>
    </div>
  );
}

export function PlayerModal({ player, club, onClose }: PlayerModalProps) {
  const handleClose = useEffectEvent(() => {
    onClose();
  });

  useEffect(() => {
    if (!player || !club) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [player, club, handleClose]);

  if (!player || !club) return null;

  const topAttributes = getTopAttributes(player, 4);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end bg-slate-950/78 p-3 backdrop-blur md:items-center md:justify-center md:p-6"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-modal-title"
        className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/10 bg-[#050816] shadow-[0_30px_120px_rgba(2,6,23,0.82)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative overflow-hidden px-5 pb-6 pt-5 sm:px-6"
          style={{
            background: `linear-gradient(145deg, ${club.colors.start} 0%, ${club.colors.end} 100%)`,
            color: club.colors.text,
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full border border-black/10 bg-black/20 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Закрыть
          </button>

          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[26px] border border-black/10 bg-black/10">
              <img
                src={getOptimizedPlayerImageUrl(player.photoUrl, "modal")}
                alt={`Портрет ${player.name}`}
                width={640}
                height={820}
                decoding="async"
                fetchPriority="high"
                className="h-full w-full object-cover object-top"
              />
            </div>

            <div className="min-w-0 pt-10 sm:pt-8">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em]">
                <span>{club.shortName}</span>
                <span>•</span>
                <span>{player.position}</span>
                <span>•</span>
                <span>{player.nationality}</span>
              </div>

              <h2
                id="player-modal-title"
                className="mt-3 text-4xl font-black text-balance sm:text-5xl"
              >
                {player.name}
              </h2>

              <p
                className="mt-3 max-w-2xl text-sm leading-6 sm:text-base"
                style={{ color: club.colors.mutedText }}
              >
                {player.form}. Полный профиль игрока с физическими данными, сезонной
                статистикой и всеми ключевыми футбольными характеристиками.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-[20px] bg-black/18 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.2em]">
                    OVR / POT
                  </div>
                  <div className="mt-1 text-3xl font-black tabular-nums">
                    {player.overall}
                    <span className="ml-2 text-lg opacity-80">/ {player.potential}</span>
                  </div>
                </div>
                <div className="rounded-[20px] bg-black/18 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.2em]">
                    Стоимость
                  </div>
                  <div className="mt-1 text-lg font-semibold">{player.value}</div>
                </div>
                <div className="rounded-[20px] bg-black/18 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.2em]">
                    Лучшие качества
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {topAttributes.map((attribute) => (
                      <span
                        key={`${player.id}-${attribute.key}`}
                        className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold"
                      >
                        {attribute.label} {attribute.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    Профиль
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <div>Возраст: {player.age}</div>
                    <div>Рост: {player.heightCm} см</div>
                    <div>Вес: {player.weightKg} кг</div>
                    <div>Рабочая нога: {player.preferredFoot}</div>
                    <div>Игровой номер: #{player.kitNumber}</div>
                    <div>Клуб: {club.name}</div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    Сезон
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-[18px] bg-slate-950/70 p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        Матчи
                      </div>
                      <div className="mt-1 font-semibold text-white tabular-nums">
                        {player.season.appearances}
                      </div>
                    </div>
                    <div className="rounded-[18px] bg-slate-950/70 p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        Голы
                      </div>
                      <div className="mt-1 font-semibold text-white tabular-nums">
                        {player.season.goals}
                      </div>
                    </div>
                    <div className="rounded-[18px] bg-slate-950/70 p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        Ассисты
                      </div>
                      <div className="mt-1 font-semibold text-white tabular-nums">
                        {player.season.assists}
                      </div>
                    </div>
                    <div className="rounded-[18px] bg-slate-950/70 p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        {player.position === "GK" ? "Сухие матчи" : "Форма"}
                      </div>
                      <div className="mt-1 font-semibold text-white tabular-nums">
                        {player.position === "GK"
                          ? player.season.cleanSheets ?? 0
                          : player.form}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Все характеристики
              </div>
              <div className="mt-4 space-y-4">
                {PLAYER_STAT_KEYS.map((entry) => (
                  <StatBar
                    key={entry.key}
                    label={entry.label}
                    value={player[entry.key]}
                    accent={club.colors.accent}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

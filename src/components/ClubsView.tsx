import { startTransition, useMemo, useState } from "react";
import type { Club, Player } from "../types/football";
import { cn } from "../utils/cn";
import { getClubInitials } from "../utils/football";
import { getOptimizedPlayerImageUrl } from "../utils/playerHelpers";
import { PlayerModal } from "./PlayerModal";

interface ClubsViewProps {
  clubs: Club[];
  players: Player[];
}

function RatingBar({
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

export function ClubsView({ clubs, players }: ClubsViewProps) {
  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id ?? "");
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

  const selectedClub = useMemo(
    () => clubs.find((club) => club.id === selectedClubId) ?? clubs[0] ?? null,
    [clubs, selectedClubId],
  );

  const squad = useMemo(() => {
    if (!selectedClub) return [];

    return [...players]
      .filter((player) => player.clubId === selectedClub.id)
      .sort((left, right) => right.overall - left.overall);
  }, [players, selectedClub]);

  const averageOverall = useMemo(() => {
    if (!squad.length) return 0;

    return Math.round(
      squad.reduce((total, player) => total + player.overall, 0) / squad.length,
    );
  }, [squad]);

  const playerMap = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );
  const topPerformers = squad.slice(0, 4);
  const activePlayer = activePlayerId ? playerMap.get(activePlayerId) ?? null : null;
  const activeClub = activePlayer
    ? clubs.find((club) => club.id === activePlayer.clubId) ?? null
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] panel-enter">
      <aside className="space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur">
          <h2 className="text-lg font-black text-white">Галерея клубов</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Переключайтесь между клубами и открывайте полный профиль игрока прямо из состава.
          </p>
        </div>

        <div className="space-y-3">
          {clubs.map((club) => {
            const isSelected = club.id === selectedClub?.id;

            return (
              <button
                key={club.id}
                type="button"
                onClick={() => setSelectedClubId(club.id)}
                className={cn(
                  "w-full overflow-hidden rounded-[24px] border text-left transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                  isSelected
                    ? "border-white/20 shadow-[0_18px_40px_rgba(15,23,42,0.28)]"
                    : "border-white/10",
                )}
                style={{
                  background: `linear-gradient(135deg, ${club.colors.start} 0%, ${club.colors.end} 100%)`,
                  color: club.colors.text,
                }}
              >
                <div className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <div
                      className="text-[11px] uppercase tracking-[0.24em]"
                      style={{ color: club.colors.mutedText }}
                    >
                      {club.league}
                    </div>
                    <div className="mt-2 text-xl font-black">{club.shortName}</div>
                    <div
                      className="mt-1 text-sm leading-6"
                      style={{ color: club.colors.mutedText }}
                    >
                      {club.form}
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-black/20 px-3 py-2 text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em]">OVR</div>
                    <div className="text-2xl font-black tabular-nums">{club.rating}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="space-y-6">
        {selectedClub ? (
          <>
            <div
              className="overflow-hidden rounded-[30px] border border-white/10"
              style={{
                background: `linear-gradient(135deg, ${selectedClub.colors.start} 0%, ${selectedClub.colors.end} 100%)`,
                color: selectedClub.colors.text,
              }}
            >
              <div className="grid gap-6 px-5 py-6 sm:grid-cols-[110px_minmax(0,1fr)_170px] sm:px-6 sm:py-7">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-black/20 text-3xl font-black">
                  {getClubInitials(selectedClub.shortName)}
                </div>

                <div className="min-w-0">
                  <div
                    className="text-[11px] uppercase tracking-[0.24em]"
                    style={{ color: selectedClub.colors.mutedText }}
                  >
                    {selectedClub.country} • {selectedClub.league}
                  </div>
                  <h2 className="mt-3 text-3xl font-black text-balance">
                    {selectedClub.name}
                  </h2>
                  <p
                    className="mt-3 max-w-2xl text-sm leading-6"
                    style={{ color: selectedClub.colors.mutedText }}
                  >
                    {selectedClub.identity}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-black/18 px-3 py-2">
                      Форма: {selectedClub.form}
                    </span>
                    <span className="rounded-full bg-black/18 px-3 py-2">
                      Стадион: {selectedClub.stadium}
                    </span>
                    <span className="rounded-full bg-black/18 px-3 py-2">
                      Основан: {selectedClub.founded}
                    </span>
                  </div>
                </div>

                <div className="rounded-[24px] bg-black/20 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em]">Состав</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>Игроков</span>
                      <span className="font-semibold tabular-nums">{squad.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Средний OVR</span>
                      <span className="font-semibold tabular-nums">{averageOverall}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Атака</span>
                      <span className="font-semibold tabular-nums">
                        {selectedClub.attackRating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Стартовый XI</span>
                      <span className="font-semibold tabular-nums">
                        {Math.min(squad.length, 11)} / 11
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-white">Профиль клуба</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Сильные стороны команды и ключевые рейтинги.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200">
                    OVR {selectedClub.rating}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <RatingBar
                    label="ATT"
                    value={selectedClub.attackRating}
                    accent={selectedClub.colors.accent}
                  />
                  <RatingBar
                    label="MID"
                    value={selectedClub.midfieldRating}
                    accent={selectedClub.colors.accent}
                  />
                  <RatingBar
                    label="DEF"
                    value={selectedClub.defenceRating}
                    accent={selectedClub.colors.accent}
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-white">Лидеры состава</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Открывайте ключевых игроков клуба с фото и полными характеристиками.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {topPerformers.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => startTransition(() => setActivePlayerId(player.id))}
                      className="content-auto-card overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] text-left transition-transform duration-200 hover:-translate-y-1 hover:border-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                    >
                      <div className="flex gap-3 p-3">
                        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-slate-950/70">
                          <img
                            src={getOptimizedPlayerImageUrl(player.photoUrl, "card")}
                            alt={`Портрет ${player.name}`}
                            width={180}
                            height={240}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-lg font-semibold text-white">
                            {player.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {player.position} • {player.form}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-amber-400/12 px-2.5 py-1 font-semibold text-amber-200">
                              OVR {player.overall}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-slate-200">
                              POT {player.potential}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">Полный состав</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Весь состав клуба с быстрым доступом к полной карточке игрока.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200">
                  Игроков: {squad.length}
                </span>
              </div>

              <div className="mt-5 overflow-hidden rounded-[22px] border border-white/10">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-950/90 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Игрок</th>
                        <th className="px-3 py-3 font-medium">Позиция</th>
                        <th className="px-3 py-3 font-medium">OVR</th>
                        <th className="px-3 py-3 font-medium">Матчи</th>
                        <th className="px-3 py-3 font-medium">Голы</th>
                        <th className="px-3 py-3 font-medium">Ассисты</th>
                      </tr>
                    </thead>
                    <tbody>
                      {squad.map((player) => (
                        <tr
                          key={player.id}
                          className="content-auto-row border-t border-white/8 bg-white/[0.02] text-slate-200"
                        >
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                startTransition(() => setActivePlayerId(player.id))
                              }
                              className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                            >
                              <div className="h-14 w-12 overflow-hidden rounded-[14px] border border-white/10 bg-slate-950/70">
                                <img
                                  src={getOptimizedPlayerImageUrl(player.photoUrl, "table")}
                                  alt={`Портрет ${player.name}`}
                                  width={96}
                                  height={128}
                                  loading="lazy"
                                  decoding="async"
                                  className="h-full w-full object-cover object-top"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-white">
                                  {player.name}
                                </div>
                                <div className="mt-1 text-xs text-slate-400">
                                  {player.nationality} • #{player.kitNumber}
                                </div>
                              </div>
                            </button>
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-300">
                            {player.position}
                          </td>
                          <td className="px-3 py-3 font-semibold text-amber-300 tabular-nums">
                            {player.overall}
                          </td>
                          <td className="px-3 py-3 tabular-nums">
                            {player.season.appearances}
                          </td>
                          <td className="px-3 py-3 tabular-nums">{player.season.goals}</td>
                          <td className="px-3 py-3 tabular-nums">{player.season.assists}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[30px] border border-dashed border-white/12 bg-slate-950/45 px-6 py-16 text-center text-sm leading-6 text-slate-400">
            Выберите клуб слева, чтобы открыть профиль и состав.
          </div>
        )}
      </section>

      <PlayerModal
        player={activePlayer}
        club={activeClub}
        onClose={() => setActivePlayerId(null)}
      />
    </div>
  );
}

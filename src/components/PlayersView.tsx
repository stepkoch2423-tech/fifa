import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type { Club, Player, Position } from "../types/football";
import { useInfiniteSlice } from "../hooks/useInfiniteSlice";
import {
  getOptimizedPlayerImageUrl,
  getTopAttributes,
} from "../utils/playerHelpers";
import { PlayerModal } from "./PlayerModal";

interface PlayersViewProps {
  players: Player[];
  clubs: Club[];
}

const POSITIONS: (Position | "ALL")[] = [
  "ALL",
  "GK",
  "CB",
  "LB",
  "RB",
  "CDM",
  "CM",
  "CAM",
  "LW",
  "RW",
  "ST",
];

export function PlayersView({ players, clubs }: PlayersViewProps) {
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
  const [clubFilter, setClubFilter] = useState<string | "ALL">("ALL");
  const [minOverall, setMinOverall] = useState(82);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(search);
  const clubMap = useMemo(
    () => new Map(clubs.map((club) => [club.id, club])),
    [clubs],
  );
  const playerMap = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );

  const filteredPlayers = useMemo(() => {
    const searchTerm = deferredSearch.trim().toLowerCase();

    return players
      .filter((player) => {
        if (!searchTerm) return true;

        const club = clubMap.get(player.clubId);
        return (
          player.name.toLowerCase().includes(searchTerm) ||
          player.nationality.toLowerCase().includes(searchTerm) ||
          club?.name.toLowerCase().includes(searchTerm) ||
          club?.shortName.toLowerCase().includes(searchTerm)
        );
      })
      .filter((player) =>
        positionFilter === "ALL" ? true : player.position === positionFilter,
      )
      .filter((player) => (clubFilter === "ALL" ? true : player.clubId === clubFilter))
      .filter((player) => player.overall >= minOverall)
      .sort((left, right) => right.overall - left.overall);
  }, [players, deferredSearch, clubMap, positionFilter, clubFilter, minOverall]);

  const { hasMore, sentinelRef, visibleItems, visibleCount } = useInfiniteSlice(
    filteredPlayers,
    {
      initialCount: 12,
      step: 12,
    },
  );

  const activePlayer = activePlayerId ? playerMap.get(activePlayerId) ?? null : null;
  const activeClub = activePlayer ? clubMap.get(activePlayer.clubId) ?? null : null;

  return (
    <div className="space-y-6 panel-enter">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-4 backdrop-blur sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Поиск
            </span>
            <input
              name="player-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="Игрок, клуб или страна"
              className="h-11 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-sky-300/60 focus:bg-slate-900/80 focus-visible:ring-2 focus-visible:ring-sky-300/40"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Позиция
            </span>
            <select
              name="player-position"
              value={positionFilter}
              onChange={(event) =>
                setPositionFilter(event.target.value as Position | "ALL")
              }
              className="h-11 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-100 outline-none transition-colors focus:border-sky-300/60 focus:bg-slate-900/80 focus-visible:ring-2 focus-visible:ring-sky-300/40"
            >
              {POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position === "ALL" ? "Все позиции" : position}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Клуб
            </span>
            <select
              name="player-club"
              value={clubFilter}
              onChange={(event) => setClubFilter(event.target.value)}
              className="h-11 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-100 outline-none transition-colors focus:border-sky-300/60 focus:bg-slate-900/80 focus-visible:ring-2 focus-visible:ring-sky-300/40"
            >
              <option value="ALL">Все клубы</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.shortName}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              <span>Минимальный OVR</span>
              <span className="rounded-full bg-emerald-400/12 px-2 py-1 text-emerald-200">
                {minOverall}+
              </span>
            </div>
            <input
              name="player-overall"
              type="range"
              min={80}
              max={94}
              value={minOverall}
              onChange={(event) => setMinOverall(Number(event.target.value))}
              className="h-11 w-full cursor-pointer appearance-none rounded-[18px] bg-transparent accent-emerald-400"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite" className="text-sm text-slate-400">
            Найдено игроков:{" "}
            <span className="font-semibold text-slate-100">{filteredPlayers.length}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
              Показано: {visibleCount} / {filteredPlayers.length}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
              Полные составы: {clubs.length} клубов / {players.length} игроков
            </span>
          </div>
        </div>
      </section>

      <section className="player-card-grid">
        {visibleItems.map((player) => {
          const club = clubMap.get(player.clubId);
          const accent = club?.colors.accent ?? "#facc15";
          const topAttributes = getTopAttributes(player);

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => startTransition(() => setActivePlayerId(player.id))}
              className="content-auto-card group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,27,0.96)_0%,rgba(6,10,21,0.94)_100%)] p-3 text-left transition-transform duration-200 hover:-translate-y-1 hover:border-sky-300/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <div className="absolute inset-x-0 bottom-0 h-20 bg-[radial-gradient(circle_at_bottom,rgba(14,165,233,0.14),transparent_70%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

              <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[96px_minmax(0,1fr)_80px]">
                <div className="relative h-[132px] overflow-hidden rounded-[20px] border border-white/8 bg-[#060c18]">
                  <img
                    src={getOptimizedPlayerImageUrl(player.photoUrl, "card")}
                    alt={`Портрет ${player.name}`}
                    width={220}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="player-photo-focus h-full w-full"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02)_0%,rgba(2,6,23,0.42)_100%)]" />
                  <span className="absolute left-2 top-2 rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950">
                    {player.position}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="truncate text-[11px] uppercase tracking-[0.34em] text-slate-500">
                    {club?.name ?? "Club"}
                  </div>
                  <h3 className="mt-1 truncate text-[2rem] font-black leading-none text-white">
                    {player.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-400">
                    <span>{player.nationality}</span>
                    <span>#{player.kitNumber}</span>
                    <span>{player.value}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {topAttributes.map((attribute) => (
                      <span
                        key={`${player.id}-${attribute.key}`}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] font-bold text-slate-200"
                      >
                        {attribute.label} {attribute.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.82)_0%,rgba(10,15,28,0.92)_100%)] px-4 py-3 sm:col-span-1 sm:block sm:px-3 sm:py-4 sm:text-center">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    OVR
                  </div>
                  <div className="text-4xl font-black leading-none text-amber-300 tabular-nums sm:mt-1">
                    {player.overall}
                  </div>
                  <div className="text-[11px] text-slate-400 sm:mt-2">
                    POT {player.potential}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Матчи
                  </div>
                  <div className="mt-1 text-2xl font-black text-white tabular-nums">
                    {player.season.appearances}
                  </div>
                </div>
                <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Голы
                  </div>
                  <div className="mt-1 text-2xl font-black text-white tabular-nums">
                    {player.season.goals}
                  </div>
                </div>
                <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Ассисты
                  </div>
                  <div className="mt-1 text-2xl font-black text-white tabular-nums">
                    {player.season.assists}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span
                  className="rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{
                    backgroundColor: `${accent}22`,
                    color: accent,
                  }}
                >
                  {player.form}
                </span>
                <span className="text-sm text-slate-400 transition-colors group-hover:text-slate-200">
                  Открыть полный профиль
                </span>
              </div>
            </button>
          );
        })}

        {!filteredPlayers.length ? (
          <div className="col-span-full rounded-[26px] border border-dashed border-white/12 bg-slate-950/45 px-6 py-10 text-center text-sm leading-6 text-slate-400">
            Под выбранные фильтры никто не попал. Попробуйте снизить порог OVR или
            убрать часть ограничений.
          </div>
        ) : null}

        {hasMore ? (
          <div
            ref={sentinelRef}
            className="col-span-full rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4 text-center text-sm text-slate-400"
          >
            Подгружаем ещё карточки…
          </div>
        ) : filteredPlayers.length > visibleCount ? null : filteredPlayers.length > 12 ? (
          <div className="col-span-full px-4 pb-2 text-center text-sm text-slate-500">
            Показаны все найденные игроки.
          </div>
        ) : null}
      </section>

      <PlayerModal
        player={activePlayer}
        club={activeClub}
        onClose={() => setActivePlayerId(null)}
      />
    </div>
  );
}

import { startTransition, useMemo, useState } from "react";
import type { Club, Match, Player } from "../types/football";
import { useOverlayTransition } from "../hooks/useOverlayTransition";
import { cn } from "../utils/cn";
import {
  formatLongMatchDate,
  formatMatchDate,
  getClubInitials,
} from "../utils/football";
import { getOptimizedPlayerImageUrl } from "../utils/playerHelpers";
import { BettingPanel } from "./BettingPanel";
import { LoadingOverlay } from "./LoadingOverlay";
import { PlayerModal } from "./PlayerModal";

interface MatchesViewProps {
  matches: Match[];
  clubs: Club[];
  players: Player[];
  selectedId: string | null;
  onSelectMatch: (matchId: string) => void;
}

const STATUS_COPY: Record<
  Match["status"],
  { label: string; className: string }
> = {
  Scheduled: {
    label: "Скоро",
    className: "border-sky-300/40 bg-sky-400/10 text-sky-200",
  },
  Live: {
    label: "Live",
    className: "border-rose-300/50 bg-rose-500/12 text-rose-200",
  },
  Finished: {
    label: "Завершён",
    className: "border-emerald-300/40 bg-emerald-400/10 text-emerald-200",
  },
};

function StatusBadge({ status }: { status: Match["status"] }) {
  const config = STATUS_COPY[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
        config.className,
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

export function MatchesView({
  matches,
  clubs,
  players,
  selectedId,
  onSelectMatch,
}: MatchesViewProps) {
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const { overlay, runWithOverlay } = useOverlayTransition("Загружаем матч");

  const clubMap = useMemo(
    () => new Map(clubs.map((club) => [club.id, club])),
    [clubs],
  );
  const playerMap = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );

  const sortedMatches = useMemo(() => {
    const statusOrder: Record<Match["status"], number> = {
      Live: 0,
      Scheduled: 1,
      Finished: 2,
    };

    return [...matches].sort((left, right) => {
      if (statusOrder[left.status] !== statusOrder[right.status]) {
        return statusOrder[left.status] - statusOrder[right.status];
      }

      return new Date(left.date).getTime() - new Date(right.date).getTime();
    });
  }, [matches]);

  const selectedMatch = useMemo(() => {
    return sortedMatches.find((match) => match.id === selectedId) ?? sortedMatches[0] ?? null;
  }, [sortedMatches, selectedId]);

  const homeClub = selectedMatch ? clubMap.get(selectedMatch.homeClubId) : null;
  const awayClub = selectedMatch ? clubMap.get(selectedMatch.awayClubId) : null;
  const activePlayer = activePlayerId ? playerMap.get(activePlayerId) ?? null : null;
  const activeClub = activePlayer ? clubMap.get(activePlayer.clubId) ?? null : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_420px] panel-enter">
      <section className="space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white">Матчи и афиша</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Полные составы, внутренние детали матча и рабочая демо-ставка.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200">
              Матчей: {matches.length}
            </span>
          </div>
        </div>

        <div className="grid gap-4">
          {sortedMatches.map((match) => {
            const clubHome = clubMap.get(match.homeClubId);
            const clubAway = clubMap.get(match.awayClubId);
            const isSelected = selectedMatch?.id === match.id;

            return (
              <article
                key={match.id}
                className={cn(
                  "content-auto-card overflow-hidden rounded-[26px] border bg-[linear-gradient(180deg,rgba(15,23,42,0.72)_0%,rgba(3,7,18,0.96)_100%)] p-4 transition-transform duration-200 hover:-translate-y-1",
                  isSelected
                    ? "border-sky-300/40 shadow-[0_20px_60px_rgba(14,165,233,0.12)]"
                    : "border-white/10",
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    runWithOverlay(() =>
                      startTransition(() => onSelectMatch(match.id)),
                    )
                  }
                  className="w-full text-left focus-visible:outline-none"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        {match.competition}
                      </div>
                      <div className="text-sm text-slate-500">{match.round}</div>
                    </div>
                    <StatusBadge status={match.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 text-xs font-black text-white">
                      {clubHome ? getClubInitials(clubHome.shortName) : "H"}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-white">
                        {clubHome?.shortName ?? "Хозяева"}
                      </div>
                      <div className="truncate text-xs text-slate-400">
                        {clubHome?.league ?? ""}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-2 text-center">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        Счёт
                      </div>
                      <div className="mt-1 text-xl font-black text-white tabular-nums">
                        {match.homeGoals}
                        <span className="mx-2 text-slate-500">:</span>
                        {match.awayGoals}
                      </div>
                    </div>

                    <div className="min-w-0 text-right">
                      <div className="truncate text-base font-semibold text-white">
                        {clubAway?.shortName ?? "Гости"}
                      </div>
                      <div className="truncate text-xs text-slate-400">
                        {clubAway?.league ?? ""}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-400">
                    {formatLongMatchDate(match.date)} • {match.stadium}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{match.headline}</p>
                </button>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      runWithOverlay(() =>
                        startTransition(() => onSelectMatch(match.id)),
                      )
                    }
                    className="rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    Открыть детали
                  </button>
                  <a
                    href={match.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/14 bg-white/6 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:border-emerald-300/60 hover:bg-emerald-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    Матч-центр
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        {selectedMatch && homeClub && awayClub ? (
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/60 backdrop-blur">
            <div
              className="px-5 py-6"
              style={{
                background: `linear-gradient(135deg, ${homeClub.colors.end} 0%, ${awayClub.colors.end} 100%)`,
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-white">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                    {selectedMatch.competition}
                  </div>
                  <h2 className="text-2xl font-black text-balance">
                    {selectedMatch.round}
                  </h2>
                </div>
                <StatusBadge status={selectedMatch.status} />
              </div>

              <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-white">
                <div className="min-w-0 text-right">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                    Хозяева
                  </div>
                  <div className="mt-2 text-xl font-semibold">{homeClub.shortName}</div>
                </div>
                <div className="rounded-[24px] border border-white/15 bg-black/20 px-5 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                    Счёт
                  </div>
                  <div className="mt-1 text-3xl font-black tabular-nums">
                    {selectedMatch.homeGoals}
                    <span className="mx-2 opacity-70">:</span>
                    {selectedMatch.awayGoals}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                    Гости
                  </div>
                  <div className="mt-2 text-xl font-semibold">{awayClub.shortName}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/80">
                <span className="rounded-full bg-black/20 px-3 py-2">
                  {formatMatchDate(selectedMatch.date)}
                </span>
                <span className="rounded-full bg-black/20 px-3 py-2">
                  {selectedMatch.stadium}
                </span>
                <span className="rounded-full bg-black/20 px-3 py-2">
                  {selectedMatch.broadcast}
                </span>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <BettingPanel match={selectedMatch} clubs={clubs} />

              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Сюжет матча
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {selectedMatch.headline}
                </p>
                <a
                  href={selectedMatch.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full border border-white/14 bg-white/6 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:border-sky-300/60 hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  Открыть внешнюю афишу
                </a>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Полные составы
                </div>
                <div className="mt-4 grid gap-3">
                  {selectedMatch.lineups.map((lineup) => {
                    const lineupClub = clubMap.get(lineup.clubId);

                    return (
                      <div
                        key={lineup.clubId}
                        className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white">
                            {lineupClub?.shortName ?? "Клуб"}
                          </div>
                          <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-slate-300">
                            {lineup.formation}
                          </span>
                        </div>
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                          {lineup.players.map((entry) => {
                            const player = playerMap.get(entry.playerId);
                            return (
                              <li
                                key={entry.playerId}
                                className="content-auto-row rounded-[14px] border border-white/8 bg-white/[0.03] px-3 py-2"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    runWithOverlay(() =>
                                      startTransition(() =>
                                        setActivePlayerId(entry.playerId),
                                      ),
                                      "Открываем карточку игрока",
                                    )
                                  }
                                  className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                                >
                                  <span className="flex min-w-0 items-center gap-3">
                                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10 bg-slate-900/80">
                                      {player ? (
                                        <img
                                          src={getOptimizedPlayerImageUrl(
                                            player.photoUrl,
                                            "table",
                                          )}
                                          alt={`Портрет ${player.name}`}
                                          width={96}
                                          height={96}
                                          loading="lazy"
                                          decoding="async"
                                          className="player-photo-focus h-full w-full"
                                        />
                                      ) : null}
                                    </span>
                                    <span className="truncate text-sm text-slate-200">
                                      {player?.name ?? "Игрок"}
                                    </span>
                                  </span>
                                  <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    {entry.position}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[30px] border border-dashed border-white/12 bg-slate-950/45 px-6 py-16 text-center text-sm leading-6 text-slate-400">
            Выберите матч слева, чтобы открыть детали, составы и ставку.
          </div>
        )}
      </aside>

      <PlayerModal
        player={activePlayer}
        club={activeClub}
        onClose={() => setActivePlayerId(null)}
      />
      <LoadingOverlay active={overlay.visible} label={overlay.label} />
    </div>
  );
}

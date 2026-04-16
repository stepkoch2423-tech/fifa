import { startTransition, useMemo, useState } from "react";
import type { Club, Match, Player } from "../types/football";
import {
  formatLongMatchDate,
  formatMatchDate,
  getClubInitials,
} from "../utils/football";
import { useOverlayTransition } from "../hooks/useOverlayTransition";
import { getOptimizedPlayerImageUrl } from "../utils/playerHelpers";
import { LoadingOverlay } from "./LoadingOverlay";
import { PlayerModal } from "./PlayerModal";

interface DashboardViewProps {
  players: Player[];
  clubs: Club[];
  matches: Match[];
  onNavigate: (view: "dashboard" | "players" | "clubs" | "matches") => void;
  onOpenMatch: (matchId: string) => void;
  stats: {
    clubs: number;
    players: number;
    matches: number;
    scheduled: number;
    topRated?: Player | null;
  };
}

export function DashboardView({
  players,
  clubs,
  matches,
  onNavigate,
  onOpenMatch,
  stats,
}: DashboardViewProps) {
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const { overlay, runWithOverlay } = useOverlayTransition("Открываем карточку игрока");

  const clubMap = useMemo(
    () => new Map(clubs.map((club) => [club.id, club])),
    [clubs],
  );
  const playerMap = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );

  const upcomingMatches = useMemo(
    () =>
      [...matches]
        .filter((match) => match.status === "Scheduled")
        .sort(
          (left, right) =>
            new Date(left.date).getTime() - new Date(right.date).getTime(),
        )
        .slice(0, 3),
    [matches],
  );

  const featuredPlayers = useMemo(
    () => [...players].sort((left, right) => right.overall - left.overall).slice(0, 3),
    [players],
  );

  const liveSpotlight = useMemo(
    () =>
      [...matches]
        .filter((match) => match.status !== "Scheduled")
        .sort(
          (left, right) =>
            new Date(right.date).getTime() - new Date(left.date).getTime(),
        )[0] ?? null,
    [matches],
  );

  const activePlayer = activePlayerId ? playerMap.get(activePlayerId) ?? null : null;
  const activeClub = activePlayer ? clubMap.get(activePlayer.clubId) ?? null : null;

  return (
    <div className="space-y-6 panel-enter">
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(4,8,20,0.98)_0%,rgba(8,18,39,0.94)_46%,rgba(4,8,20,0.98)_100%)] px-5 py-6 sm:px-8 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(59,130,246,0.22),transparent_22%),radial-gradient(circle_at_24%_70%,rgba(250,204,21,0.16),transparent_16%),radial-gradient(circle_at_78%_70%,rgba(168,85,247,0.14),transparent_18%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(34,197,94,0.24),transparent_60%)]" />

        <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_460px]">
          <div className="flex min-h-[620px] flex-col justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-200">
                Official Home Screen
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl xl:text-6xl">
                Football Cards
              </h1>

              <div className="mt-5 max-w-2xl space-y-4">
                <p className="text-lg font-medium leading-8 text-slate-200 sm:text-xl">
                  Премиальная футбольная коллекция, где лучшие игроки, клубы и матчи
                  собраны в одном мощном цифровом хабе.
                </p>
                <p className="max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                  Открывайте карточки звёзд, изучайте полные составы, следите за афишей,
                  сравнивайте рейтинги и ощущайте атмосферу большого футбола так, будто
                  держите редкую коллекцию у себя в руках.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate("players")}
                  className="rounded-full bg-[linear-gradient(90deg,#facc15_0%,#f59e0b_100%)] px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Смотреть игроков
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("matches")}
                  className="rounded-full border border-white/14 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition-transform hover:-translate-y-0.5 hover:border-sky-300/60 hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  Перейти к матчам
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  Игроки
                </div>
                <div className="mt-2 text-3xl font-black text-white tabular-nums">
                  {stats.players}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  Клубы
                </div>
                <div className="mt-2 text-3xl font-black text-white tabular-nums">
                  {stats.clubs}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  Матчи
                </div>
                <div className="mt-2 text-3xl font-black text-white tabular-nums">
                  {stats.matches}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  Скоро
                </div>
                <div className="mt-2 text-3xl font-black text-emerald-300 tabular-nums">
                  {stats.scheduled}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative mx-auto w-full max-w-[430px]">
              <div className="absolute inset-0 rounded-[42px] bg-[radial-gradient(circle,rgba(250,204,21,0.18),transparent_60%)] blur-3xl" />
              <div className="absolute -inset-6 rounded-[46px] border border-white/8 bg-white/[0.02] backdrop-blur-sm" />
              <img
                src="/football-cards-logo-optimized.jpg"
                alt="Football Cards logo"
                width={600}
                height={600}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="relative z-10 mx-auto w-full drop-shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
        <div className="grid gap-6">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  Карточки звёзд
                </div>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Лидеры базы прямо на главной
                </h2>
              </div>
            </div>

            <div className="featured-player-grid mt-5">
              {featuredPlayers.map((player) => {
                const club = clubMap.get(player.clubId);

                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() =>
                      runWithOverlay(() =>
                        startTransition(() => setActivePlayerId(player.id)),
                      )
                    }
                    className="group overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,34,0.9)_0%,rgba(7,11,24,0.96)_100%)] text-left transition-all duration-200 hover:-translate-y-1 hover:border-amber-300/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={getOptimizedPlayerImageUrl(player.photoUrl, "hero")}
                        alt={`Портрет ${player.name}`}
                        width={440}
                        height={560}
                        loading="lazy"
                        decoding="async"
                        className="player-photo-focus h-full w-full transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.88)_100%)]" />
                      <div className="absolute left-4 top-4 rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950">
                        {player.position}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                        {club?.name ?? "Клуб"}
                      </div>
                      <div className="mt-2 text-2xl font-black text-white">
                        {player.name}
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        OVR {player.overall} • POT {player.potential}
                      </div>
                      <div className="mt-3 text-sm font-medium text-amber-300 transition-colors group-hover:text-amber-200">
                        Открыть профиль
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  Прямой вход
                </div>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Быстрые переходы
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => onNavigate("players")}
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                <div className="text-[11px] uppercase tracking-[0.26em] text-slate-500">
                  Players
                </div>
                <div className="mt-2 text-xl font-black text-white">База игроков</div>
                <div className="mt-2 text-sm text-slate-400">
                  Полные карточки, фото и характеристики.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("clubs")}
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <div className="text-[11px] uppercase tracking-[0.26em] text-slate-500">
                  Clubs
                </div>
                <div className="mt-2 text-xl font-black text-white">Составы клубов</div>
                <div className="mt-2 text-sm text-slate-400">
                  Полные команды и лидеры по позициям.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("matches")}
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <div className="text-[11px] uppercase tracking-[0.26em] text-slate-500">
                  Matches
                </div>
                <div className="mt-2 text-xl font-black text-white">Матчи и ставки</div>
                <div className="mt-2 text-sm text-slate-400">
                  Афиша, составы и демо-ставка на исход.
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  Афиша
                </div>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Ближайшие матчи
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("matches")}
                className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-sky-300/60 hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                Ко всем матчам
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {upcomingMatches.map((match) => {
                const homeClub = clubMap.get(match.homeClubId);
                const awayClub = clubMap.get(match.awayClubId);

                return (
                  <article
                    key={match.id}
                    className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenMatch(match.id)}
                      className="w-full text-left focus-visible:outline-none"
                    >
                      <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        <span>{match.round}</span>
                        <span>{formatMatchDate(match.date)}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-[auto_1fr_auto_1fr] items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-slate-950/70 text-xs font-black text-white">
                          {homeClub ? getClubInitials(homeClub.shortName) : "H"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">
                            {homeClub?.shortName ?? "Хозяева"}
                          </div>
                          <div className="truncate text-xs text-slate-400">
                            {homeClub?.league ?? ""}
                          </div>
                        </div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          VS
                        </div>
                        <div className="min-w-0 text-right">
                          <div className="truncate text-sm font-semibold text-white">
                            {awayClub?.shortName ?? "Гости"}
                          </div>
                          <div className="truncate text-xs text-slate-400">
                            {awayClub?.league ?? ""}
                          </div>
                        </div>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          {liveSpotlight ? (
            <div className="rounded-[30px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur">
              <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                Spotlight
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">
                Последняя громкая игра
              </h2>
              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-sm font-semibold text-white">
                  {clubMap.get(liveSpotlight.homeClubId)?.shortName ?? "Хозяева"}
                  <span className="mx-2 text-slate-500">vs</span>
                  {clubMap.get(liveSpotlight.awayClubId)?.shortName ?? "Гости"}
                </div>
                <div className="mt-3 text-3xl font-black text-amber-300 tabular-nums">
                  {liveSpotlight.homeGoals}:{liveSpotlight.awayGoals}
                </div>
                <div className="mt-3 text-sm text-slate-400">
                  {formatLongMatchDate(liveSpotlight.date)}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <PlayerModal
        player={activePlayer}
        club={activeClub}
        onClose={() => setActivePlayerId(null)}
      />
      <LoadingOverlay active={overlay.visible} label={overlay.label} />
    </div>
  );
}

import { useMemo, useState } from "react";
import { ClubsView } from "./components/ClubsView";
import { DashboardView } from "./components/DashboardView";
import { MatchesView } from "./components/MatchesView";
import { PlayersView } from "./components/PlayersView";
import { CLUBS } from "./data/clubs";
import { MATCHES } from "./data/matches";
import { PLAYERS } from "./data/players";
import { cn } from "./utils/cn";

type ViewKey = "dashboard" | "players" | "clubs" | "matches";

const NAV_ITEMS: { id: ViewKey; label: string }[] = [
  { id: "dashboard", label: "Главная" },
  { id: "players", label: "Игроки" },
  { id: "clubs", label: "Клубы" },
  { id: "matches", label: "Матчи" },
];

export default function App() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
    MATCHES[0]?.id ?? null,
  );

  const stats = useMemo(() => {
    const scheduled = MATCHES.filter((match) => match.status === "Scheduled").length;
    const topRated = [...PLAYERS].sort((a, b) => b.overall - a.overall)[0];

    return {
      clubs: CLUBS.length,
      players: PLAYERS.length,
      matches: MATCHES.length,
      scheduled,
      topRated,
    };
  }, []);

  const handleOpenMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setView("matches");
  };

  return (
    <div className="app-shell min-h-screen text-slate-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="glow-orb glow-orb-a" />
        <div className="glow-orb glow-orb-b" />
        <div className="glow-orb glow-orb-c" />
        <div className="grid-overlay" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-slate-950/55 px-4 py-4 shadow-[0_24px_80px_rgba(2,6,23,0.4)] backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">
                Football Cards
              </div>
              <div className="mt-1 text-2xl font-black text-white sm:text-3xl">
                Ultimate Football Hub
              </div>
              <div className="mt-2 text-sm text-slate-400">
                {stats.players} игроков • {stats.clubs} клубов • {stats.matches} матчей
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                    view === item.id
                      ? "border-sky-300/50 bg-sky-400/15 text-white"
                      : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="mt-6 flex-1">
          {view === "dashboard" ? (
            <DashboardView
              players={PLAYERS}
              clubs={CLUBS}
              matches={MATCHES}
              onNavigate={setView}
              onOpenMatch={handleOpenMatch}
              stats={stats}
            />
          ) : null}

          {view === "players" ? (
            <PlayersView players={PLAYERS} clubs={CLUBS} />
          ) : null}

          {view === "clubs" ? <ClubsView clubs={CLUBS} players={PLAYERS} /> : null}

          {view === "matches" ? (
            <MatchesView
              matches={MATCHES}
              clubs={CLUBS}
              players={PLAYERS}
              selectedId={selectedMatchId}
              onSelectMatch={setSelectedMatchId}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

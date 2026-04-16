import { useEffect, useMemo, useState } from "react";
import type { Club, Match } from "../types/football";
import {
  type BetOutcome,
  getMatchOdds,
  getOutcomeLabel,
} from "../utils/betting";
import { cn } from "../utils/cn";

interface BettingPanelProps {
  match: Match;
  clubs: Club[];
}

interface StoredBet {
  id: string;
  matchId: string;
  createdAt: string;
  stake: number;
  outcome: BetOutcome;
  odds: number;
  potentialWin: number;
  title: string;
}

const STORAGE_KEY = "football-demo-bets-v1";

function readStoredBets() {
  if (typeof window === "undefined") return [] as StoredBet[];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredBet[]) : [];
  } catch {
    return [];
  }
}

export function BettingPanel({ match, clubs }: BettingPanelProps) {
  const homeClub = clubs.find((club) => club.id === match.homeClubId);
  const awayClub = clubs.find((club) => club.id === match.awayClubId);

  const odds = useMemo(() => getMatchOdds(match, clubs), [match, clubs]);
  const [selectedOutcome, setSelectedOutcome] = useState<BetOutcome>("home");
  const [stake, setStake] = useState("1000");
  const [savedBets, setSavedBets] = useState<StoredBet[]>(() => readStoredBets());
  const [isPlaced, setIsPlaced] = useState(false);

  useEffect(() => {
    setIsPlaced(false);
  }, [match.id]);

  const stakeValue = Number(stake) || 0;
  const activeOdds = odds[selectedOutcome];
  const potentialWin = Number((stakeValue * activeOdds).toFixed(2));

  const matchBets = useMemo(
    () => savedBets.filter((bet) => bet.matchId === match.id).slice(0, 3),
    [savedBets, match.id],
  );

  const selections: { outcome: BetOutcome; label: string; odds: number }[] = [
    {
      outcome: "home",
      label: homeClub ? `${homeClub.shortName} победит` : "Победа хозяев",
      odds: odds.home,
    },
    {
      outcome: "draw",
      label: "Ничья",
      odds: odds.draw,
    },
    {
      outcome: "away",
      label: awayClub ? `${awayClub.shortName} победит` : "Победа гостей",
      odds: odds.away,
    },
  ];

  const placeBet = () => {
    if (!stakeValue || stakeValue <= 0) return;

    const bet: StoredBet = {
      id: `${match.id}-${selectedOutcome}-${Date.now()}`,
      matchId: match.id,
      createdAt: new Date().toISOString(),
      stake: stakeValue,
      outcome: selectedOutcome,
      odds: activeOdds,
      potentialWin,
      title: `${homeClub?.shortName ?? "Хозяева"} vs ${awayClub?.shortName ?? "Гости"}`,
    };

    const nextBets = [bet, ...savedBets].slice(0, 20);
    setSavedBets(nextBets);
    setIsPlaced(true);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBets));
    }
  };

  return (
    <section className="rounded-[22px] border border-emerald-300/14 bg-[linear-gradient(180deg,rgba(4,16,12,0.88)_0%,rgba(3,8,18,0.94)_100%)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/80">
            Демо-купон
          </div>
          <h3 className="mt-2 text-lg font-black text-white">Ставка на матч</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Выберите исход, укажите сумму и сохраните ставку прямо в приложении.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-slate-300">
          Локально
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {selections.map((selection) => (
          <button
            key={selection.outcome}
            type="button"
            onClick={() => setSelectedOutcome(selection.outcome)}
            className={cn(
              "flex items-center justify-between rounded-[18px] border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
              selectedOutcome === selection.outcome
                ? "border-emerald-300/50 bg-emerald-400/10"
                : "border-white/10 bg-white/[0.03] hover:border-white/20",
            )}
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white">
                {selection.label}
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-slate-500">
                {getOutcomeLabel(selection.outcome)}
              </span>
            </span>
            <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-black text-amber-300">
              {selection.odds.toFixed(2)}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Сумма ставки
          </span>
          <input
            type="number"
            min={100}
            step={100}
            value={stake}
            onChange={(event) => setStake(event.target.value)}
            className="h-12 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors focus:border-emerald-300/60 focus:bg-slate-900/80 focus-visible:ring-2 focus-visible:ring-emerald-300/30"
            placeholder="1000"
          />
        </label>
        <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Возможный выигрыш
          </div>
          <div className="mt-2 text-xl font-black text-emerald-300 tabular-nums">
            ₽{potentialWin.toLocaleString("ru-RU")}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Коэффициент: <span className="font-semibold text-white">{activeOdds.toFixed(2)}</span>
        </div>
        <button
          type="button"
          onClick={placeBet}
          disabled={stakeValue <= 0}
          className="rounded-full bg-[linear-gradient(90deg,#22c55e_0%,#facc15_100%)] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          Поставить
        </button>
      </div>

      {isPlaced ? (
        <div className="mt-4 rounded-[18px] border border-emerald-300/20 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-100">
          Ставка сохранена: {homeClub?.shortName ?? "Хозяева"} vs {awayClub?.shortName ?? "Гости"} •{" "}
          {getOutcomeLabel(selectedOutcome)} • ₽{stakeValue.toLocaleString("ru-RU")}
        </div>
      ) : null}

      {matchBets.length ? (
        <div className="mt-4 space-y-2">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Последние ставки на этот матч
          </div>
          {matchBets.map((bet) => (
            <div
              key={bet.id}
              className="flex items-center justify-between gap-3 rounded-[16px] border border-white/8 bg-white/[0.03] px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {getOutcomeLabel(bet.outcome)} • ₽{bet.stake.toLocaleString("ru-RU")}
                </div>
                <div className="text-xs text-slate-400">
                  Потенциал: ₽{bet.potentialWin.toLocaleString("ru-RU")}
                </div>
              </div>
              <div className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-amber-300">
                {bet.odds.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

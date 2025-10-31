import { Translate } from "../types";

type OverviewSectionProps = {
  username?: string;
  isPremium: boolean;
  gameCount: number;
  favoriteCount: number;
  totalPlays: number;
  onUpgrade: () => void;
  onCreate: () => void;
  onDiscover: () => void;
  onBilling: () => void;
  onShowTrash: () => void;
  t: Translate;
};

const OverviewSection = ({
  username,
  isPremium,
  gameCount,
  favoriteCount,
  totalPlays,
  onUpgrade,
  onCreate,
  onDiscover,
  onBilling,
  onShowTrash,
  t,
}: OverviewSectionProps) => (
  <div className="mx-auto max-w-6xl px-6 mt-10">
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6">
        <div className="text-xl font-bold mb-1">
          {t("home.welcome", { username: username || "" }) || `Velkommen, ${username}!`}
        </div>
        <div className="text-white/80 mb-4">{isPremium ? "Premium" : "Standard"}</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-2xl font-extrabold">{gameCount}</div>
            <div className="text-xs text-white/70">Quizer</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-2xl font-extrabold">{favoriteCount}</div>
            <div className="text-xs text-white/70">Favoritter</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-2xl font-extrabold">{totalPlays}</div>
            <div className="text-xs text-white/70">Spillinger</div>
          </div>
        </div>
        {!isPremium && (
          <button
            onClick={onUpgrade}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white font-semibold shadow hover:shadow-lg active:scale-95 transition"
          >
            Oppgrader til Premium
          </button>
        )}
      </div>
      <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6 md:col-span-2">
        <div className="text-sm font-semibold mb-3">Navigasjon</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onCreate}
            className="rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-sm text-white hover:bg-white/20 transition"
          >
            Lag ny
          </button>
          <button
            onClick={onDiscover}
            className="rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-sm text-white hover:bg-white/20 transition"
          >
            Oppdag
          </button>
          <button
            onClick={onBilling}
            className="rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-sm text-white hover:bg-white/20 transition"
          >
            Abonnement
          </button>
          <button
            onClick={onShowTrash}
            className="rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-sm text-white hover:bg-white/20 transition"
          >
            Papirkurv
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default OverviewSection;

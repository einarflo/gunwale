import { Translate } from "../types";

type PremiumBannerProps = {
  t: Translate;
  onUpgrade: () => void;
};

const PremiumBanner = ({ t, onUpgrade }: PremiumBannerProps) => (
  <div className="mx-auto max-w-6xl px-6 mt-8">
    <div className="relative w-full rounded-3xl bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.75)_12%,rgba(168,85,247,0.75)_28%,rgba(245,158,11,0.95)_50%,rgba(236,72,153,0.85)_72%,rgba(99,102,241,0.75)_88%,transparent_100%)] p-[2px] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle,rgba(245,158,11,0.25)_0%,rgba(236,72,153,0.2)_35%,rgba(99,102,241,0.2)_65%,transparent_85%)] blur-[28px] opacity-80 -z-10" />
      <div className="relative flex items-center justify-between gap-3 rounded-[2.25rem] bg-white/5 py-3 px-4 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 rounded-[2.25rem] bg-[radial-gradient(60%_60%_at_50%_100%,rgba(236,72,153,0.2),transparent_70%)] -z-10" />
        <div className="pointer-events-none absolute inset-x-4 -top-[1px] -z-20" aria-hidden>
          <div className="h-[2px] w-full bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.85)_12%,rgba(168,85,247,0.85)_28%,rgba(245,158,11,1)_50%,rgba(236,72,153,0.9)_72%,rgba(99,102,241,0.85)_88%,transparent_100%)]" />
          <div className="pointer-events-none absolute -top-3 left-0 right-0 h-10 bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.45)_12%,rgba(168,85,247,0.45)_28%,rgba(245,158,11,0.6)_50%,rgba(236,72,153,0.45)_72%,rgba(99,102,241,0.45)_88%,transparent)] blur-xl" />
        </div>
        <span className="relative text-sm sm:text-base font-semibold text-white/90">
          {t("home.premium.text") ||
            "Upgrade to Premium – no ads, exclusive upgrades and more features"}
        </span>
        <button
          onClick={onUpgrade}
          className="relative ml-2 sm:ml-4 shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white font-bold text-sm shadow hover:shadow-lg active:scale-95 transition"
        >
          {t("profile.subscription.startPremium") || "Start Premium"}
        </button>
      </div>
    </div>
  </div>
);

export default PremiumBanner;

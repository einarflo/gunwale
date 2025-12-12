import { Translate } from "../types";

type PremiumBannerProps = {
  t: Translate;
  onUpgrade: () => void;
};

const PremiumBanner = ({ t, onUpgrade }: PremiumBannerProps) => (
  <div className="mx-auto max-w-6xl px-6 mt-8">
    <div
      onClick={onUpgrade}
      className="relative w-full rounded-3xl bg-gradient-to-r from-[#6a71fa] via-[#9c8afa] to-[#f97474] p-5 sm:p-6 cursor-pointer shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
    >
      <div className="pointer-events-none absolute -inset-2 rounded-[28px] bg-gradient-to-r from-[#6a71fa]/25 via-[#9c8afa]/22 to-[#f97474]/22 blur-3xl animate-pulse-slow" />
      <span className="relative text-base sm:text-lg font-bold text-white drop-shadow">
        {t("home.premium.text") || "Upgrade to Premium here"}
      </span>
    </div>
  </div>
);

export default PremiumBanner;

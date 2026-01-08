import { MouseEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Translate } from "../types";

type PremiumBannerProps = {
  t: Translate;
};

const DISMISS_KEY = "premiumBannerDismissed";

const PremiumBanner = ({ t }: PremiumBannerProps) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return sessionStorage.getItem(DISMISS_KEY) === "true";
  });

  useEffect(() => {
    if (dismissed) {
      sessionStorage.setItem(DISMISS_KEY, "true");
    }
  }, [dismissed]);

  if (dismissed) {
    return null;
  }

  const handleDismiss = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setDismissed(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 mt-8">
      <div
        onClick={() => navigate("/purchase")}
        className="relative flex w-full items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-[#6a71fa] via-[#9c8afa] to-[#f97474] p-5 sm:p-6 cursor-pointer shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
      >
        <div className="pointer-events-none absolute -inset-2 rounded-[28px] bg-gradient-to-r from-[#6a71fa]/25 via-[#9c8afa]/22 to-[#f97474]/22 blur-3xl animate-pulse-slow" />
        <span className="relative text-base sm:text-lg font-bold text-white drop-shadow">
          {t("home.premium.text") || "Upgrade to Premium here"}
        </span>
        <button
          type="button"
          onClick={handleDismiss}
          className="relative rounded-full border border-white/60 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30"
        >
          {"Not now"}
        </button>
      </div>
    </div>
  );
};

export default PremiumBanner;

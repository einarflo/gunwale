import GlobalStyles from "./landing/GlobalStyles";
import ParallaxOrbs from "./ParallaxOrbs";
import ParallaxScroll from "./ParallaxScroll";
import tavlLogo from "../images/tavl-white.png";

type SplashScreenProps = {
  title: string;
  subtitle?: string;
  hint?: string;
};

const SplashScreen = ({ title, subtitle, hint }: SplashScreenProps) => {
  return (
    <div
      className="relative min-h-screen bg-[#1e1b4b] text-white overflow-hidden"
      style={{
        fontFamily:
          'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <GlobalStyles />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.35)_0%,transparent_60%),linear-gradient(to_bottom_right,#4f46e5,#9333ea,#ec4899)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] animate-pulse-slow" />
      <ParallaxOrbs />
      <ParallaxScroll />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-10 text-center shadow-[0_30px_90px_rgba(12,10,52,0.55)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(70%_80%_at_50%_100%,rgba(236,72,153,0.28),transparent_80%)] opacity-90" />
          <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25)_0%,rgba(236,72,153,0.2)_45%,transparent_80%)] blur-2xl -z-10" />
          <div className="relative flex flex-col items-center gap-6">
            <img src={tavlLogo} alt="Tavl" className="h-10 w-auto drop-shadow-[0_8px_20px_rgba(69,51,153,0.45)]" />
            <div className="relative">
              <div className="mx-auto h-16 w-16 rounded-full border border-white/20 bg-white/10 p-[3px] shadow-inner shadow-indigo-900/30">
                <div className="relative h-full w-full rounded-full bg-[#1e1b4b]/70">
                  <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-400 border-r-pink-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500/35 via-purple-500/35 to-pink-500/35 blur-[2px]" />
                </div>
              </div>
              <span className="sr-only">{title}</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white/95">{title}</h1>
              {subtitle && <p className="text-sm text-white/75">{subtitle}</p>}
            </div>
            {hint && <p className="text-xs uppercase tracking-[0.3em] text-white/50">{hint}</p>}

            <div className="relative w-full pt-6">
              <div className="mx-auto h-[2px] w-full bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.85)_12%,rgba(168,85,247,0.85)_28%,rgba(245,158,11,1)_50%,rgba(236,72,153,0.9)_72%,rgba(99,102,241,0.85)_88%,transparent_100%)]" />
              <div
                className="pointer-events-none absolute -top-4 left-0 right-0 h-12 bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.4)_12%,rgba(168,85,247,0.4)_28%,rgba(245,158,11,0.55)_50%,rgba(236,72,153,0.4)_72%,rgba(99,102,241,0.4)_88%,transparent)] blur-2xl"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

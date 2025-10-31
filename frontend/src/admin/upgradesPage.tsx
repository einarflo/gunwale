import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { upgrades } from "../data/upgrades";
import { useKeycloak } from "../auth/KeycloakProvider";
import { useI18n } from "../i18n/I18nProvider";
import GlobalStyles from "../components/landing/GlobalStyles";
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";

const UpgradesPage = () => {
  const navigate = useNavigate();
  const { isPremium } = useKeycloak();
  const { t } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>(isPremium ? 'premium' : 'free');

  const visibleUpgrades = useMemo(() => {
    return upgrades.filter((upgrade) => (selectedPlan === 'premium' ? true : !upgrade.premium));
  }, [selectedPlan]);

  return (
    <div
      className="relative min-h-screen bg-[#1e1b4b] text-white overflow-hidden"
      style={{ fontFamily: 'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}
    >
      <GlobalStyles />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.35)_0%,transparent_60%),linear-gradient(to_bottom_right,#4f46e5,#9333ea,#ec4899)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse-slow" />
      <ParallaxOrbs />
      <ParallaxScroll />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 mt-20">
        <header className="mb-10 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-3">{t('header.upgrades')}</h1>
          <p className="text-base sm:text-lg text-white/70">
            {t('upgrades.subtitle') || 'Explore powerful upgrades tailored to every plan.'}
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <article className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6 shadow-lg shadow-indigo-900/25">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-white">{t('profile.subscription.free')}</h2>
              {!isPremium && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-100 border border-emerald-300/40">
                  {t('common.current') || 'Current'}
                </span>
              )}
            </div>
            <p className="text-sm text-white/70">{t('profile.subscription.freeDesc')}</p>
            <div className="mt-5">
              <button
                onClick={() => navigate('/')}
                className="rounded-full bg-white/10 border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                {t('profile.subscription.seePlans')}
              </button>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 backdrop-blur-xl border border-white/20 p-6 shadow-xl shadow-purple-900/30">
            <div className="absolute inset-0 pointer-events-none opacity-80 bg-[radial-gradient(circle_at_20%_-10%,rgba(255,255,255,0.4)_0%,transparent_55%)]" />
            <div className="relative flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-white">{t('profile.subscription.premium')}</h2>
              {isPremium ? (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-emerald-500/25 text-emerald-50 border border-emerald-300/40">
                  {t('common.current') || 'Current'}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-white/20 text-white border border-white/30">
                  {t('home.premium.badge') || 'Premium'}
                </span>
              )}
            </div>
            <p className="relative text-sm text-white/85">{t('profile.subscription.premiumDesc')}</p>
            <div className="relative mt-5 flex flex-wrap items-center gap-3">
              {!isPremium && (
                <button
                  onClick={() => navigate('/purchase')}
                  className="rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/35 hover:shadow-purple-900/45 transition-transform hover:-translate-y-0.5"
                >
                  {t('profile.subscription.startPremium')}
                </button>
              )}
              <button
                onClick={() => navigate('/home/upgrades')}
                className="rounded-full bg-white/10 border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                {t('profile.subscription.seePlans')}
              </button>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-lg shadow-indigo-900/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{t('header.upgrades')}</h2>
              <p className="text-sm text-white/60 mt-1">
                {t('upgrades.premiumIncludesFree') || 'Premium includes every Free upgrade.'}
              </p>
            </div>
            <div className="inline-flex rounded-full border border-white/20 bg-white/10 p-1">
              <button
                onClick={() => setSelectedPlan('free')}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  selectedPlan === 'free'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-900/30'
                    : 'text-white/70'
                }`}
              >
                {t('profile.subscription.free')}
              </button>
              <button
                onClick={() => setSelectedPlan('premium')}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  selectedPlan === 'premium'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-900/30'
                    : 'text-white/70'
                }`}
              >
                {t('profile.subscription.premium')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleUpgrades.map((upgrade, index) => (
              <article
                key={index}
                className="group relative rounded-2xl border border-white/10 bg-white/8 backdrop-blur-md p-5 transition hover:border-white/20 hover:bg-white/12"
              >
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(70%_50%_at_50%_100%,rgba(236,72,153,0.22),transparent_70%)]" />
                <div
                  className={`relative rounded-xl overflow-hidden border border-white/10 mb-4 bg-gradient-to-r ${
                    upgrade.color || 'from-indigo-500/30 via-purple-500/30 to-pink-500/30'
                  }`}
                >
                  <img src={upgrade.image} alt="" className="h-28 w-full object-contain bg-white/70 backdrop-blur" />
                </div>
                <div className="relative flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">{upgrade.header}</h3>
                  {upgrade.premium && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/40">
                      {t('home.premium.badge') || 'Premium'}
                    </span>
                  )}
                </div>
                <p className="relative text-sm text-white/70 mb-3">{upgrade.description}</p>
                {upgrade.price && (
                  <p className="relative text-xs uppercase tracking-wide text-white/50">{upgrade.price}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UpgradesPage;

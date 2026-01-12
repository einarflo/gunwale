import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { upgrades } from "../data/upgrades";
import { useKeycloak } from "../auth/KeycloakProvider";
import { useI18n } from "../i18n/I18nProvider";
import GlobalStyles from "../components/landing/GlobalStyles";
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";
import Footer from "../components/Footer";

const UpgradesPage = () => {
  const navigate = useNavigate();
  const { isPremium } = useKeycloak();
  const { t } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>(isPremium ? 'premium' : 'free');

  const freeUpgrades = useMemo(() => upgrades.filter((upgrade) => !upgrade.premium), []);
  const premiumUpgrades = useMemo(() => upgrades, []);

  const freeCardDescription = isPremium
    ? (t('upgrades.plan.freeIncluded') || 'Free plan is included with Premium.')
    : t('profile.subscription.freeDesc');

  const premiumCardDescription = isPremium
    ? t('profile.subscription.premiumDesc')
    : (t('upgrades.plan.premiumUpgrade') || 'Upgrade to Premium to unlock all upgrades.');

  const visibleUpgrades = useMemo(() => {
    return upgrades.filter((upgrade) => (selectedPlan === 'premium' ? true : !upgrade.premium));
  }, [selectedPlan]);

  return (
    <div
      className="relative min-h-screen bg-white text-slate-900 overflow-hidden"
      style={{ fontFamily: 'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}
    >
      <GlobalStyles />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_28%,rgba(93,184,104,0.18)_0%,transparent_58%),radial-gradient(circle_at_82%_32%,rgba(249,116,116,0.18)_0%,transparent_58%),radial-gradient(circle_at_50%_12%,rgba(156,138,250,0.22)_0%,transparent_60%),linear-gradient(to_bottom_right,rgba(16,24,39,0.08),rgba(156,138,250,0.08),transparent)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(156,138,250,0.06)_0%,transparent_72%),radial-gradient(circle_at_70%_80%,rgba(93,184,104,0.12)_0%,transparent_60%)] animate-pulse-slow" />
      <ParallaxOrbs />
      <ParallaxScroll />

      <div className="relative z-10 mx-auto max-w-7xl px-6 mt-32">

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <article className="relative overflow-hidden rounded-2xl border border-white/20 p-6 shadow-xl shadow-indigo-200/40">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
            <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover opacity-90" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-white">{t('profile.subscription.free')}</h2>
                {!isPremium && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-white/20 text-white border border-white/40">
                    {t('common.current') || 'Current'}
                  </span>
                )}
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
                {t('upgrades.plan.freePrice') || 'Free'}
              </p>
              <p className="text-sm text-white/85">{freeCardDescription}</p>
              <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm w-fit">
                <div className="flex flex-wrap gap-2">
                  {freeUpgrades.map((upgrade) => (
                    <div
                      key={upgrade.header}
                      className="h-10 w-10 rounded-xl bg-white"
                      title={upgrade.header}
                    >
                      <img src={upgrade.image} alt="" className="h-full w-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>
              {isPremium && (
                <div className="mt-5">
                  <button
                    onClick={() => setSelectedPlan('free')}
                    className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#6A71FA] shadow-lg shadow-indigo-200/40 transition hover:bg-[#6A71FA] hover:text-white"
                  >
                    {t('upgrades.plan.changeTo', { plan: t('profile.subscription.free') }) || 'Change to Free'}
                  </button>
                </div>
              )}
            </div>
          </article>

          <article className="relative overflow-hidden rounded-2xl border border-white/20 p-6 shadow-xl shadow-indigo-200/40">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="relative flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-white">{t('profile.subscription.premium')}</h2>
              {isPremium ? (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-white/20 text-white border border-white/40">
                  {t('common.current') || 'Current'}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-white/20 text-white border border-white/30">
                  {t('home.premium.badge') || 'Premium'}
                </span>
              )}
            </div>
            <p className="relative text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
              {t('upgrades.plan.premiumPrice') || '50 NOK / year'}
            </p>
            <p className="relative text-sm text-white/85">{premiumCardDescription}</p>
            <div className="relative mt-4 rounded-2xl bg-white p-3 shadow-sm w-fit">
              <div className="flex flex-wrap gap-2">
                {premiumUpgrades.map((upgrade) => (
                  <div
                    key={upgrade.header}
                    className="h-10 w-10 rounded-xl bg-white"
                    title={upgrade.header}
                  >
                    <img src={upgrade.image} alt="" className="h-full w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mt-5 flex flex-wrap items-center gap-3">
              {!isPremium && (
                <button
                  onClick={() => navigate('/purchase')}
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#6A71FA] shadow-lg shadow-indigo-200/40 transition hover:bg-[#6A71FA] hover:text-white"
                >
                  {t('profile.subscription.startPremium')}
                </button>
              )}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('header.upgrades')}</h2>
              <p className="text-sm text-slate-600 mt-1">
                {t('upgrades.premiumIncludesFree') || 'Premium includes every Free upgrade.'}
              </p>
            </div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setSelectedPlan('free')}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  selectedPlan === 'free'
                    ? 'bg-[#6A71FA] text-white shadow-lg shadow-indigo-200/40'
                    : 'text-slate-600'
                }`}
              >
                {t('profile.subscription.free')}
              </button>
              <button
                onClick={() => setSelectedPlan('premium')}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  selectedPlan === 'premium'
                    ? 'bg-[#6A71FA] text-white shadow-lg shadow-indigo-200/40'
                    : 'text-slate-600'
                }`}
              >
                {t('profile.subscription.premium')}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {visibleUpgrades.map((upgrade, index) => (
              <article
                key={index}
                className="group relative rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div
                    className={`h-16 w-16 shrink-0 rounded-2xl`}
                  >
                    <img src={upgrade.image} alt="" className="h-full w-full object-contain bg-white rounded-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900">{upgrade.header}</h3>
                      {upgrade.premium && (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                          {t('home.premium.badge') || 'Premium'}
                        </span>
                      )}
                      {upgrade.price && (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {upgrade.price}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{upgrade.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default UpgradesPage;

import { useNavigate } from "react-router-dom";
import { upgrades } from "../data/upgrades";
import { useKeycloak } from "../auth/KeycloakProvider";
import { useI18n } from "../i18n/I18nProvider";
import { useMemo, useState } from "react";
import GlobalStyles from '../components/landing/GlobalStyles';
import AnimatedGradientBackground from '../components/landing/AnimatedGradientBackground';

const UpgradesPage = () => {
  const navigate = useNavigate();
  const { isPremium } = useKeycloak();
  const { t } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>(isPremium ? 'premium' : 'free');

  const visibleUpgrades = useMemo(() => {
    return upgrades.filter(u => selectedPlan === 'premium' ? true : !u.premium);
  }, [selectedPlan]);

  return (
    <>
      <GlobalStyles />
      <AnimatedGradientBackground />
      <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <div className="text-3xl font-extrabold text-blue-800">{t('header.upgrades')}</div>
        <div className="text-gray-600">{t('upgrades.subtitle') || 'Explore upgrades by plan'}</div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="rounded-2xl bg-white/90 shadow p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-bold text-gray-900">{t('profile.subscription.free')}</div>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-700">{t('profile.subscription.free')}</span>
          </div>
          <div className="text-gray-700">{t('profile.subscription.freeDesc')}</div>
          <div className="mt-4">
            <button onClick={() => navigate('/')} className="rounded-xl bg-white px-5 py-2 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">{t('profile.subscription.seePlans')}</button>
          </div>
        </div>
        <div className="rounded-2xl bg-white/90 shadow p-6 border-2 border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-bold text-gray-900">{t('profile.subscription.premium')}</div>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-green-100 text-green-800">{t('home.premium.badge') || 'Premium'}</span>
          </div>
          <div className="text-gray-700">{t('profile.subscription.premiumDesc')}</div>
          <div className="mt-4 flex gap-3">
            {!isPremium && (
              <button onClick={() => navigate('/purchase')} className="rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-5 py-2 text-white font-bold shadow hover:scale-105 transition">{t('profile.subscription.startPremium')}</button>
            )}
            <button onClick={() => navigate('/home/upgrades')} className="rounded-xl bg-white px-5 py-2 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">{t('profile.subscription.seePlans')}</button>
          </div>
        </div>
      </div>

      {/* Plan toggle + Upgrades grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-900">{t('header.upgrades')}</div>
          <div className="inline-flex rounded-xl border-2 border-blue-200 overflow-hidden">
            <button
              onClick={() => setSelectedPlan('free')}
              className={`px-4 py-2 text-sm font-semibold ${selectedPlan === 'free' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700'}`}
            >
              {t('profile.subscription.free')}
            </button>
            <button
              onClick={() => setSelectedPlan('premium')}
              className={`px-4 py-2 text-sm font-semibold ${selectedPlan === 'premium' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700'}`}
            >
              {t('profile.subscription.premium')}
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-6">
          {t('upgrades.premiumIncludesFree') || 'Premium includes all Free upgrades'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleUpgrades.map((u, idx) => (
            <div key={idx} className="rounded-2xl bg-white/90 shadow p-4 border-2 border-gray-100">
              <div className={`rounded-xl overflow-hidden bg-gradient-to-r ${u.color || ''} mb-3`}>
                <img src={u.image} alt="" className="w-full h-40 object-contain bg-white" />
              </div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-lg font-bold text-gray-900">{u.header}</div>
                {u.premium && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">{t('home.premium.badge') || 'Premium'}</span>
                )}
              </div>
              <div className="text-sm text-gray-700 mb-3">{u.description}</div>
              <div className="text-xs text-gray-500">{u.price}</div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
};

export default UpgradesPage;

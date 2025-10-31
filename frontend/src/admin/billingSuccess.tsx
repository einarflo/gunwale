import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import GlobalStyles from '../components/landing/GlobalStyles';
import AnimatedGradientBackground from '../components/landing/AnimatedGradientBackground';

const BillingSuccess = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <>
      <GlobalStyles />
      <AnimatedGradientBackground />
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl w-full rounded-2xl bg-white/95 p-8 border-2 border-green-200 shadow">
          <div className="text-3xl font-extrabold text-green-700 mb-2">{t('billing.success.title') || 'Purchase successful'}</div>
          <div className="text-gray-700 mb-6">{t('billing.success.subtitle') || 'Click below to activate Premium on your account.'}</div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/home')} className="rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-3 text-white font-bold shadow hover:scale-105 transition">{t('billing.activate') || 'Start Tavl Premium'}</button>
            <button onClick={() => navigate('/home/profile')} className="rounded-xl bg-white px-6 py-3 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">{t('billing.goProfile') || 'Go to profile'}</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillingSuccess;


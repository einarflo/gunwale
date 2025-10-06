import { useEffect, useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { post } from '../api';
import { useI18n } from '../i18n/I18nProvider';
import { useNavigate } from 'react-router-dom';
import GlobalStyles from '../components/landing/GlobalStyles';
import AnimatedGradientBackground from '../components/landing/AnimatedGradientBackground';


// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe("pk_test_51Rv0aaD1ydfl2frEdPYfmclUx0aLdMHAKMBPsKYIXbBuDyFoeHFGOfR1ZciOgGJ0ZJgv7dKWEO00OWGKy8HHSbm5008S9MPHH4");

const Purchase = () => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();
  const navigate = useNavigate();

  const init = useCallback(() => {
    setLoading(true);
    setError(null);
    post("/billing/create-checkout-session", {
      success_url: `${window.location.origin}/stripe-return`,
      cancel_url: `${window.location.origin}/home/upgrades`
    })
      .then(res => {
        const clientSecret = res?.data?.clientSecret;
        if (typeof clientSecret !== 'string' || clientSecret.length === 0) {
          throw new Error('Missing clientSecret');
        }
        setOptions({ clientSecret });
        setLoading(false);
      })
      .catch(err => {
        console.log("Error when creating checkout session", err);
        setError(t('billing.error') || 'Something went wrong. Please try again.');
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    init();
  }, [init]);


  if (loading) {
    return (
      <>
        <GlobalStyles />
        <AnimatedGradientBackground />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-b-4 border-blue-400" />
            <div className="text-xl font-semibold text-purple-700">{t('billing.loading') || 'Loading…'}</div>
            <div className="text-gray-500 text-sm">{t('billing.subtitle') || 'Upgrade to Premium and unlock more features.'}</div>
          </div>
        </div>
      </>
    );
  }

  if (error || !options) {
    return (
      <>
        <GlobalStyles />
        <AnimatedGradientBackground />
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="max-w-xl w-full rounded-2xl bg-white/95 p-8 border-2 border-red-200 shadow">
            <div className="text-2xl font-extrabold text-red-700 mb-2">{t('billing.fail.title') || 'Payment not completed'}</div>
            <div className="text-gray-700 mb-6">{error || (t('billing.fail.subtitle') || 'Your purchase could not be completed. You can try again or return to the Premium page.')}</div>
            <div className="flex gap-3">
              <button onClick={init} className="rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-3 text-white font-bold shadow hover:scale-105 transition">{t('billing.retry') || 'Try again'}</button>
              <button onClick={() => navigate('/home/premium')} className="rounded-xl bg-white px-6 py-3 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">{t('billing.goPremium') || 'Premium page'}</button>
            </div>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <GlobalStyles />
      <AnimatedGradientBackground />
      <div id="checkout" className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-3xl w-full">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </>
  );
};

export default Purchase;

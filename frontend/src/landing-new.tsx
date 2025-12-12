/* eslint-disable jsx-a11y/anchor-is-valid */
import {  useEffect, useState } from "react";
import Header from "./components/landing/Header";
import ParallaxOrbs from "./components/ParallaxOrbs";
import ParallaxScroll from "./components/ParallaxScroll";
import BottomCta from "./components/BottomCta";
import Footer from "./components/Footer";
import UpgradesSection from "./components/landing/UpgradesSection";

import { upgrades as upgradesData } from "./data/upgrades";
import { useNavigate } from "react-router-dom";
import { FeaturedQuizzes } from "./components/landing/FeaturedQuizzes";
import { useI18n } from "./i18n/I18nProvider";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [pin, setPin] = useState('');

  const [selectedUpgrade, setSelectedUpgrade] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-advance upgrades until user interacts
  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setInterval(() => {
      setSelectedUpgrade((i) => (i + 1) % upgradesData.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [autoPlay]);

  return (
    <div
      className="relative min-h-screen bg-white text-slate-900 overflow-hidden"
      style={{ fontFamily: 'Inter, \"Plus Jakarta Sans\", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}
    >
      {/* Layered gradients and subtle glow (Tailwind only) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(121,127,252,0.2)_0%,transparent_55%),radial-gradient(circle_at_80%_70%,rgba(107,113,250,0.18)_0%,transparent_55%),linear-gradient(to_bottom_right,rgba(121,127,252,0.12),rgba(107,113,250,0.1),transparent)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(121,127,252,0.05)_0%,transparent_70%)] animate-pulse-slow" />
      {/* Parallax orbs reacting to mouse movement */}
      <ParallaxOrbs />
      {/* Parallax layers that follow scroll */}
      <ParallaxScroll />
      {/* Top band glows + stars extending behind nav */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[65vh] -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(50%_35%_at_15%_10%,rgba(121,127,252,0.18)_0%,transparent_60%),radial-gradient(45%_30%_at_85%_8%,rgba(107,113,250,0.16)_0%,transparent_62%),radial-gradient(30%_25%_at_50%_0%,rgba(121,127,252,0.12)_0%,transparent_65%)]" />
        <div className="absolute inset-0 opacity-70 animate-pulse-slow bg-[radial-gradient(circle_at_8%_16%,rgba(121,127,252,0.6)_0_1px,transparent_2px),radial-gradient(circle_at_14%_28%,rgba(107,113,250,0.5)_0_1px,transparent_2px),radial-gradient(circle_at_22%_12%,rgba(121,127,252,0.5)_0_1px,transparent_2px),radial-gradient(circle_at_32%_22%,rgba(107,113,250,0.45)_0_1px,transparent_2px),radial-gradient(circle_at_41%_9%,rgba(121,127,252,0.58)_0_1px,transparent_2px),radial-gradient(circle_at_55%_14%,rgba(107,113,250,0.5)_0_1px,transparent_2px),radial-gradient(circle_at_63%_6%,rgba(121,127,252,0.5)_0_1px,transparent_2px),radial-gradient(circle_at_72%_18%,rgba(107,113,250,0.45)_0_1px,transparent_2px),radial-gradient(circle_at_82%_10%,rgba(121,127,252,0.55)_0_1px,transparent_2px),radial-gradient(circle_at_90%_22%,rgba(107,113,250,0.48)_0_1px,transparent_2px)]" />
      </div>
      {/* Bottom band glows + extra stars for lower sections */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[70vh] -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_90%,rgba(121,127,252,0.18),transparent_60%),radial-gradient(50%_35%_at_80%_85%,rgba(107,113,250,0.18),transparent_60%),radial-gradient(40%_30%_at_50%_100%,rgba(121,127,252,0.14),transparent_62%)]" />
        <div className="absolute inset-0 opacity-70 animate-pulse-slow bg-[radial-gradient(circle_at_12%_82%,rgba(121,127,252,0.55)_0_2px,transparent_3px),radial-gradient(circle_at_24%_88%,rgba(107,113,250,0.5)_0_2px,transparent_3px),radial-gradient(circle_at_36%_78%,rgba(121,127,252,0.5)_0_2px,transparent_3px),radial-gradient(circle_at_58%_90%,rgba(107,113,250,0.45)_0_2px,transparent_3px),radial-gradient(circle_at_72%_80%,rgba(121,127,252,0.5)_0_2px,transparent_3px),radial-gradient(circle_at_86%_92%,rgba(107,113,250,0.45)_0_2px,transparent_3px)]" />
      </div>
      <Header />

      <main className="relative z-10 pt-20">
      {/* Hero */}
      <section className="relative px-6 sm:px-8 pt-28 sm:pt-24 pb-16 sm:pb-20">
        {/* Light radial glows and tiny star-like speckles */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(121,127,252,0.16),transparent_62%),radial-gradient(40%_30%_at_85%_20%,rgba(107,113,250,0.12),transparent_62%),radial-gradient(35%_28%_at_55%_15%,rgba(121,127,252,0.1),transparent_65%)]" />
          <div className="absolute inset-0 opacity-70 animate-pulse-slow bg-[radial-gradient(circle_at_12%_28%,rgba(121,127,252,0.45)_0_1px,transparent_2px),radial-gradient(circle_at_24%_42%,rgba(107,113,250,0.42)_0_1px,transparent_2px),radial-gradient(circle_at_36%_18%,rgba(121,127,252,0.4)_0_1px,transparent_2px),radial-gradient(circle_at_48%_34%,rgba(107,113,250,0.38)_0_1px,transparent_2px),radial-gradient(circle_at_60%_20%,rgba(121,127,252,0.4)_0_1px,transparent_2px),radial-gradient(circle_at_72%_38%,rgba(107,113,250,0.38)_0_1px,transparent_2px),radial-gradient(circle_at_84%_26%,rgba(121,127,252,0.4)_0_1px,transparent_2px),radial-gradient(circle_at_18%_60%,rgba(107,113,250,0.36)_0_1px,transparent_2px),radial-gradient(circle_at_34%_68%,rgba(121,127,252,0.4)_0_1px,transparent_2px),radial-gradient(circle_at_50%_62%,rgba(107,113,250,0.36)_0_1px,transparent_2px),radial-gradient(circle_at_66%_58%,rgba(121,127,252,0.36)_0_1px,transparent_2px),radial-gradient(circle_at_82%_64%,rgba(107,113,250,0.36)_0_1px,transparent_2px)]" />
        </div>
        <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 items-start min-h-[50vh] max-w-5xl mx-auto pt-16">
          <div className="space-y-5">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 mb-1 leading-tight text-center md:text-left">
              <span>Play </span><span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">smarter</span>,
              <br />
              <span>climb faster.</span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg mb-2 max-w-2xl text-center md:text-left mx-auto md:mx-0">
              Real-time multiplayer quizzes with upgrades, power-ups, and beautifully fast interactions.
            </p>
            <div className="flex flex-col gap-4 items-center md:items-start">
              <div className="flex items-center bg-white shadow-sm border border-rose-100 rounded-full p-1 w-full sm:w-[440px] max-w-full">
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') navigate('join/' + pin); }}
                  placeholder="Join game pin"
                  className="bg-transparent placeholder-slate-400 text-slate-900 px-4 py-3 outline-none w-full"
                />
                <button
                  onClick={() => { navigate('join/' + pin); }}
                  className="rounded-full bg-rose-600 text-white px-6 py-2.5 font-semibold hover:bg-rose-500 transition-colors duration-200 shadow-sm bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 "
                >
                  Join
                </button>
              </div>
            </div>
          </div>
            <div className="relative rounded-3xl border border-slate-200/80 bg-white/60 shadow-xl shadow-indigo-200/40 overflow-hidden p-5 sm:p-6">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
              <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
              <div className="relative space-y-3">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="text-xl sm:text-xl font-bold text-white">{t('landing.discover.title')}</div>
                    <p className="text-sm text-white/80 max-w-sm">
                      {t('landing.discover.body')}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-indigo-700">
                      <span className="px-3 py-1 rounded-full bg-white/80 border border-indigo-100">{t('tags.geography')}</span>
                      <span className="px-3 py-1 rounded-full bg-white/80 border border-indigo-100">{t('tags.filmTv')}</span>
                      <span className="px-3 py-1 rounded-full bg-white/80 border border-indigo-100">{t('tags.music')}</span>
                      <span className="px-3 py-1 rounded-full bg-white/80 border border-indigo-100">{t('tags.sports')}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/discover')}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#6A71FA] px-5 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-indigo-200/50"
                >
                  {t('landing.discover.cta')}
                  <span aria-hidden className="text-lg leading-none">→</span>
                </button>
              </div>
            </div>
        </div>
        </div>
      </section>

      {/* Upgrade highlight card */}
      <section className="relative">
        <UpgradesSection
          upgrades={upgradesData}
          selectedUpgrade={selectedUpgrade}
          setSelectedUpgrade={(idx) => { setSelectedUpgrade(idx); setAutoPlay(false); }}
          setAutoPlay={setAutoPlay}
          autoPlay={autoPlay}
        />
      </section>

      {/* Featured quizzes (live data) */}
      <FeaturedQuizzes />
      <BottomCta />
      <Footer />
      </main>
    </div>
  );
}

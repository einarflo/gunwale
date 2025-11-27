/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback, useEffect, useRef, useState } from "react";
import type React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "./components/landing/Header";
import ParallaxOrbs from "./components/ParallaxOrbs";
import ParallaxScroll from "./components/ParallaxScroll";
import BottomCta from "./components/BottomCta";
import Footer from "./components/Footer";
import mockup from "./images/tavl-placeholder.jpg";
import { upgrades as upgradesData } from "./data/upgrades";
import { Link } from "react-router-dom";
import { get } from "./api";

interface LandingPageProps {
  signIn?: () => void;
  playMode?: () => void;
  setGamePin?: (pin: string) => void;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center max-w-2xl mx-auto mb-10">
    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{title}</h2>
    {subtitle && <p className="text-slate-600">{subtitle}</p>}
  </div>
);

// How it works section removed; card component no longer needed

type Quiz = { id: number; title: string; tags: string[]; image?: string };
const FeaturedCard: React.FC<{ quiz: Quiz }> = ({ quiz }) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ scale: 1.02 }}
    className="rounded-xl overflow-hidden bg-white backdrop-blur-sm border border-slate-100 shadow-xl transition-transform duration-200"
  >
    <div className="aspect-[16/9] overflow-hidden">
      <img src={quiz.image || mockup} alt={quiz.title} className="h-full w-full object-cover" />
    </div>
    <div className="p-4">
      <div className="text-slate-900 font-semibold mb-2">{quiz.title}</div>
      <div className="flex flex-wrap gap-2">
        {quiz.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

// Featured Quizzes (fetch from public endpoint)
type Difficulty = 'Easy' | 'Medium' | 'Hard' | string;
type QuizApiItem = {
  id?: string | number;
  uuid?: string | number;
  name: string;
  difficulty?: Difficulty;
  plays?: number;
  favCount?: number;
  coverImageUrl?: string | null; // legacy/camelCase
  cover_image_url?: string | null; // API snake_case
  qcount?: number;
  description?: string | null;
  created_by_name?: string | null;
  tags?: Array<{ slug: string; name: string }>;
};

const diffEmoji: Record<string, string> = { Easy: '🟢', Medium: '🟡', Hard: '🔴' };
const diffClasses: Record<string, string> = {
  Easy: 'bg-emerald-500/20 text-emerald-200',
  Medium: 'bg-amber-500/20 text-amber-200',
  Hard: 'bg-rose-500/20 text-rose-200',
};
const diffLightClasses: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-rose-100 text-rose-700',
};

const hslFromString = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 70% 55% / 0.35)`;
};

const QuizCard: React.FC<{ q: QuizApiItem }> = ({ q }) => {
  const id = String(q.uuid || q.id);
  const tags = q.tags || [];
  const diff = q.difficulty || 'Unknown';
  const badgeClass = diffClasses[diff] || 'bg-rose-100 text-rose-700';
  const badgeLight = diffLightClasses[diff] || 'bg-gray-100 text-gray-700';
  const moreTags = Math.max(0, (tags?.length || 0) - 3);
  const tint = hslFromString(id + (q.name || 'tavl'));
  const cover = q.cover_image_url || q.coverImageUrl;
  return (
    <Link
      to={`/game/${encodeURIComponent(id)}`}
      aria-label={`Open quiz ${q.name}`}
      className="group relative rounded-xl border border-rose-100 bg-white backdrop-blur-sm transition hover:shadow-xl hover:shadow-rose-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white min-w-[260px] sm:min-w-[280px] snap-start"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
        {cover ? (
          <img
            loading="lazy"
            src={cover}
            alt={q.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full relative">
            <img
              loading="lazy"
              src={mockup}
              alt={`${q.name} cover placeholder`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${tint}, transparent)` }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/15 to-transparent" />
        {/* Hover/Focus CTA */}
        <div className="absolute inset-0 hidden place-items-center group-hover:grid focus-within:grid">
          <Link
            to={`/game/${encodeURIComponent(id)}`}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-amber-400 text-white font-medium shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Play now
          </Link>
        </div>
      </div>
      <div className="bg-white text-[#0b0a1a]">
        <div className="p-4">
          <div className="font-semibold truncate" title={q.name}>{q.name}</div>
          {q.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{q.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-700">
            <span className={`text-xs px-2 py-1 rounded-full border border-black/10 ${badgeLight}`}>{diff}</span>
            {typeof q.qcount === 'number' && <span className="text-xs text-gray-600">{q.qcount} questions</span>}
            {typeof q.plays === 'number' && <span className="text-xs text-gray-600">{q.plays} plays</span>}
            {q.created_by_name && <span className="text-xs text-gray-500">by {q.created_by_name}</span>}
          </div>
          {(tags && tags.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.slice(0, 3).map(t => (
                <span key={t.slug || t.name} className="text-[10px] px-2 py-0.5 rounded-full border border-black/10 bg-gray-100 text-gray-700">
                  {t.name}
                </span>
              ))}
              {moreTags > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-black/10 bg-gray-100 text-gray-700">+{moreTags}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export const FeaturedQuizzes: React.FC<{ limit?: number }> = ({ limit = 12 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<QuizApiItem[]>([]);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true); setError(null);
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    get<QuizApiItem[]>(`/games/public?${params.toString()}`, { signal: ac.signal as any })
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(err => { if (!ac.signal.aborted) setError('Failed to load quizzes'); })
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, [limit]);

  const retry = () => {
    setLoading(true); setError(null);
    const ac = new AbortController();
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    get<QuizApiItem[]>(`/games/public?${params.toString()}`, { signal: ac.signal as any })
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(err => { if (!ac.signal.aborted) setError('Failed to load quizzes'); })
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
  };

  // Build looped list for infinite scroll
  const base = items.slice(0, limit);
  const looped = base.length ? [...base, ...base, ...base] : [];

  // Position to start of middle segment
  useEffect(() => {
    const el = rowRef.current; if (!el) return;
    if (!looped.length) return;
    const mid = base.length;
    const child = el.children.item(mid) as HTMLElement | null;
    if (child) el.scrollLeft = child.offsetLeft - 8;
  }, [looped.length]);

  // Keep scroll within middle segment for seamless looping
  const handleScroll = () => {
    const el = rowRef.current; if (!el || !looped.length) return;
    const seg = base.length;
    const midStart = el.children.item(seg) as HTMLElement | null;
    const lastStart = el.children.item(seg * 2) as HTMLElement | null;
    if (!midStart || !lastStart) return;
    const span = lastStart.offsetLeft - midStart.offsetLeft;
    if (el.scrollLeft < midStart.offsetLeft - 20) el.scrollLeft += span;
    else if (el.scrollLeft > lastStart.offsetLeft + 20) el.scrollLeft -= span;
  };

  // Auto-scroll disabled for now per request

  const scrollByCards = (dir: -1 | 1) => {
    const el = rowRef.current; if (!el) return;
    const viewport = el.clientWidth;
    const delta = Math.max(260, Math.min(360, viewport * 0.32)) * dir;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section className="relative mt-20 text-slate-900 w-full">
      {/* Local background glows specifically for Featured row */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_60%,rgba(248,113,113,0.2),transparent_60%),radial-gradient(60%_40%_at_80%_40%,rgba(239,68,68,0.22),transparent_60%),radial-gradient(40%_30%_at_50%_50%,rgba(248,113,113,0.12),transparent_62%)]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_12%_58%,rgba(248,113,113,0.6)_0_2px,transparent_3px),radial-gradient(circle_at_88%_42%,rgba(239,68,68,0.6)_0_2px,transparent_3px)]" />
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <div className="container mx-auto px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Featured quizzes</h2>
          <p className="text-slate-600">Curated sets to get you started</p>
        </div>
      </div>
      {loading && (
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 px-6 sm:px-8" style={{ WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="min-w-[260px] sm:min-w-[280px] rounded-xl border border-slate-100 bg-white overflow-hidden snap-start shadow-sm">
                <div className="aspect-[16/10] bg-[linear-gradient(90deg,rgba(248,113,113,0.06)_25%,rgba(248,113,113,0.15)_37%,rgba(248,113,113,0.06)_63%)] bg-[length:400%_100%] animate-[shimmer_1.2s_infinite]" />
                <div className="p-4 h-14 bg-white" />
              </div>
            ))}
          </div>
        </div>
      )}
      {!loading && error && (
        <div className="mx-auto max-w-xl rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={retry} className="rounded-lg px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white">Try again</button>
          </div>
        </div>
      )}
      {!loading && !error && (
        <div
          className="relative w-full"
          onMouseEnter={() => setPause(true)}
          onMouseLeave={() => setPause(false)}
          onFocus={() => setPause(true)}
          onBlur={() => setPause(false)}
        >
          <button
            aria-label="Scroll left"
            onClick={() => scrollByCards(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white border border-rose-100 p-2 text-rose-600 hover:bg-rose-50 shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scrollByCards(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white border border-rose-100 p-2 text-rose-600 hover:bg-rose-50 shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div ref={rowRef} onScroll={handleScroll} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 scroll-smooth px-6 sm:px-8" style={{ WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)' }}>
            {looped.map((q, i) => (
              <QuizCard key={`${String(q.uuid || q.id)}-${i}`} q={q} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default function LandingPage({ signIn, playMode, setGamePin }: LandingPageProps) {
  const onJoin = useCallback(() => {
    if (playMode) playMode();
    window.location.href = "/join";
  }, [playMode]);
  const [pin, setPin] = useState("");
  const [selectedUpgrade, setSelectedUpgrade] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [tintColor, setTintColor] = useState<string>('rgba(99,102,241,0.45)');
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches?.[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    touchStartX.current = null;
    if (start == null || endX == null) return;
    const dx = endX - start;
    if (Math.abs(dx) < 40) return;
    setAutoPlay(false);
    if (dx < 0) setSelectedUpgrade(i => (i + 1) % upgradesData.length);
    else setSelectedUpgrade(i => (i - 1 + upgradesData.length) % upgradesData.length);
  };

  // Compute a dominant color from the selected upgrade icon (no external libs)
  useEffect(() => {
    const src = upgradesData[selectedUpgrade]?.image;
    if (!src) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const onLoad = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = 24, h = 24;
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 40) continue; // skip near-transparent
          r += data[i]; g += data[i + 1]; b += data[i + 2];
          count++;
        }
        if (count > 0) {
          r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
          // Slightly boost saturation by blending toward the strongest channel
          const max = Math.max(r, g, b);
          const boost = 0.15;
          r = Math.round(r + (max - r) * boost);
          g = Math.round(g + (max - g) * boost);
          b = Math.round(b + (max - b) * boost);
          setTintColor(`rgba(${r}, ${g}, ${b}, 0.45)`);
        }
      } catch (_) {
        // Fallback to a pleasant pink/indigo mix
        setTintColor('rgba(147, 51, 234, 0.40)');
      }
    };
    const onError = () => setTintColor('rgba(147, 51, 234, 0.40)');
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    img.src = src;
    return () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
  }, [selectedUpgrade]);

  // Auto-advance upgrades until user interacts
  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setInterval(() => {
      setSelectedUpgrade((i) => (i + 1) % upgradesData.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [autoPlay]);

  const featured: Quiz[] = [
    { id: 1, title: "Tech & AI Basics", tags: ["Easy", "Tech"] },
    { id: 2, title: "World Capitals Sprint", tags: ["Medium", "Geo"] },
    { id: 3, title: "Design Systems 101", tags: ["Easy", "Design"] },
    { id: 4, title: "JavaScript Brain Teasers", tags: ["Hard", "Code"] },
    { id: 5, title: "Pop Culture Blitz", tags: ["Easy", "Fun"] },
    { id: 6, title: "Math Speedrun", tags: ["Hard", "Math"] },
    { id: 7, title: "Startup Lingo", tags: ["Medium", "Biz"] },
    { id: 8, title: "UX Copy Challenge", tags: ["Medium", "Design"] },
  ];

  return (
    <div
      className="relative min-h-screen bg-white text-slate-900 overflow-hidden"
      style={{ fontFamily: 'Inter, \"Plus Jakarta Sans\", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}
    >
      {/* Layered gradients and subtle glow (Tailwind only) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.18)_0%,transparent_55%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.16)_0%,transparent_55%),linear-gradient(to_bottom_right,rgba(236,72,153,0.12),rgba(99,102,241,0.08),transparent)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04)_0%,transparent_70%)] animate-pulse-slow" />
      {/* Parallax orbs reacting to mouse movement */}
      <ParallaxOrbs />
      {/* Parallax layers that follow scroll */}
      <ParallaxScroll />
      {/* Top band glows + stars extending behind nav */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[65vh] -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(50%_35%_at_15%_10%,rgba(99,102,241,0.18)_0%,transparent_60%),radial-gradient(45%_30%_at_85%_8%,rgba(168,85,247,0.16)_0%,transparent_62%),radial-gradient(30%_25%_at_50%_0%,rgba(236,72,153,0.1)_0%,transparent_65%)]" />
        <div className="absolute inset-0 opacity-70 animate-pulse-slow bg-[radial-gradient(circle_at_8%_16%,rgba(99,102,241,0.55)_0_1px,transparent_2px),radial-gradient(circle_at_14%_28%,rgba(168,85,247,0.5)_0_1px,transparent_2px),radial-gradient(circle_at_22%_12%,rgba(236,72,153,0.5)_0_1px,transparent_2px),radial-gradient(circle_at_32%_22%,rgba(168,85,247,0.45)_0_1px,transparent_2px),radial-gradient(circle_at_41%_9%,rgba(99,102,241,0.6)_0_1px,transparent_2px),radial-gradient(circle_at_55%_14%,rgba(168,85,247,0.5)_0_1px,transparent_2px),radial-gradient(circle_at_63%_6%,rgba(236,72,153,0.5)_0_1px,transparent_2px),radial-gradient(circle_at_72%_18%,rgba(168,85,247,0.45)_0_1px,transparent_2px),radial-gradient(circle_at_82%_10%,rgba(99,102,241,0.55)_0_1px,transparent_2px),radial-gradient(circle_at_90%_22%,rgba(236,72,153,0.5)_0_1px,transparent_2px)]" />
      </div>
      {/* Bottom band glows + extra stars for lower sections */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[70vh] -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_90%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(50%_35%_at_80%_85%,rgba(168,85,247,0.18),transparent_60%),radial-gradient(40%_30%_at_50%_100%,rgba(236,72,153,0.14),transparent_62%)]" />
        <div className="absolute inset-0 opacity-70 animate-pulse-slow bg-[radial-gradient(circle_at_12%_82%,rgba(99,102,241,0.55)_0_2px,transparent_3px),radial-gradient(circle_at_24%_88%,rgba(168,85,247,0.5)_0_2px,transparent_3px),radial-gradient(circle_at_36%_78%,rgba(236,72,153,0.5)_0_2px,transparent_3px),radial-gradient(circle_at_58%_90%,rgba(168,85,247,0.45)_0_2px,transparent_3px),radial-gradient(circle_at_72%_80%,rgba(99,102,241,0.5)_0_2px,transparent_3px),radial-gradient(circle_at_86%_92%,rgba(236,72,153,0.45)_0_2px,transparent_3px)]" />
      </div>
      <Header forceDark />

      <main className="relative z-10">
      {/* Hero */}
      <section className="relative px-6 sm:px-8 pt-28 sm:pt-24 pb-16 sm:pb-20">
        {/* Light radial glows and tiny star-like speckles */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(99,102,241,0.16),transparent_62%),radial-gradient(40%_30%_at_85%_20%,rgba(168,85,247,0.12),transparent_62%),radial-gradient(35%_28%_at_55%_15%,rgba(236,72,153,0.1),transparent_65%)]" />
          <div className="absolute inset-0 opacity-70 animate-pulse-slow bg-[radial-gradient(circle_at_12%_28%,rgba(99,102,241,0.45)_0_1px,transparent_2px),radial-gradient(circle_at_24%_42%,rgba(168,85,247,0.42)_0_1px,transparent_2px),radial-gradient(circle_at_36%_18%,rgba(236,72,153,0.4)_0_1px,transparent_2px),radial-gradient(circle_at_48%_34%,rgba(168,85,247,0.38)_0_1px,transparent_2px),radial-gradient(circle_at_60%_20%,rgba(99,102,241,0.4)_0_1px,transparent_2px),radial-gradient(circle_at_72%_38%,rgba(168,85,247,0.38)_0_1px,transparent_2px),radial-gradient(circle_at_84%_26%,rgba(236,72,153,0.4)_0_1px,transparent_2px),radial-gradient(circle_at_18%_60%,rgba(168,85,247,0.36)_0_1px,transparent_2px),radial-gradient(circle_at_34%_68%,rgba(99,102,241,0.4)_0_1px,transparent_2px),radial-gradient(circle_at_50%_62%,rgba(168,85,247,0.36)_0_1px,transparent_2px),radial-gradient(circle_at_66%_58%,rgba(236,72,153,0.36)_0_1px,transparent_2px),radial-gradient(circle_at_82%_64%,rgba(99,102,241,0.36)_0_1px,transparent_2px)]" />
        </div>
        <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center min-h-[60vh] md:min-h-[70vh]">
          <motion.div variants={fadeInUp} initial="hidden" animate="show">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              <span>Play smarter,</span>
              <br />
              <span>climb faster.</span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg mb-10 max-w-xl">
              Real-time multiplayer quizzes with upgrades, power-ups, and beautifully fast interactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center bg-white shadow-sm border border-rose-100 rounded-full p-1 w-full sm:w-auto">
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Join game pin"
                  className="bg-transparent placeholder-slate-400 text-slate-900 px-4 py-3 outline-none w-full sm:w-64"
                />
                <button
                  onClick={() => { setGamePin?.(pin); onJoin(); }}
                  className="rounded-full bg-rose-600 text-white px-6 py-2.5 font-semibold hover:bg-rose-500 transition-colors duration-200 shadow-sm"
                >
                  Join
                </button>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeIn}
            className="relative hidden md:block"
          >
            <div className="absolute -inset-6 bg-rose-200/40 blur-2xl rounded-3xl pointer-events-none" />
            <div className="relative rounded-3xl overflow-hidden border border-rose-100 bg-white backdrop-blur-sm shadow-2xl shadow-rose-200/80">
              <img src={mockup} alt="Tavl mockup" className="w-full h-full object-cover grayscale-[8%]" />
            </div>
          </motion.div>
        </div>
        </div>
      </section>

      {/* Removed How it works section as requested */}

      {/* Upgrade highlight card */}
      <section className="relative container mx-auto px-6 sm:px-8 pb-14">

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="relative rounded-3xl overflow-hidden px-4 sm:px-8 py-4 sm:py-6 pl-6 pr-6 md:pl-14 md:pr-14 lg:pl-20 lg:pr-20 lg:py-10 bg-white backdrop-blur-md border border-rose-100 shadow-[0_20px_70px_rgba(244,63,94,0.14)] h-[145px] md:h-[145px] lg:h-[190px]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Dynamic color tint computed from the upgrade icon with smooth fade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedUpgrade}
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                background: `radial-gradient(120% 80% at 0% 0%, ${tintColor} 0%, rgba(0,0,0,0) 60%), radial-gradient(120% 80% at 100% 100%, ${tintColor} 0%, rgba(0,0,0,0) 60%)`,
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(60%_40%_at_15%_10%,rgba(248,113,113,0.35),transparent_60%)]" />
          {/* Swipe left/right on mobile to change upgrade; buttons removed */}

          {/* Upgrade content */}
          <div className="relative z-10 grid grid-cols-[auto,1fr] items-center gap-4 sm:gap-6 md:gap-8">
            <div className="flex-shrink-0">
              <img
                src={upgradesData[selectedUpgrade].image}
                alt={upgradesData[selectedUpgrade].header}
                className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 object-contain drop-shadow-lg"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-100 via-rose-200 to-amber-100 text-rose-700 ring-1 ring-rose-200 shadow-sm">
                  {upgradesData[selectedUpgrade].price}
                </span>
                {upgradesData[selectedUpgrade].premium && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-200 via-rose-200 to-rose-300 text-rose-800 ring-1 ring-rose-200 shadow-sm">
                    Premium
                  </span>
                )}
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 truncate">
                {upgradesData[selectedUpgrade].header}
              </div>
              <div className="text-slate-600 text-sm sm:text-base leading-snug max-h-[48px] sm:max-h-[52px] overflow-hidden">
                {upgradesData[selectedUpgrade].description}
              </div>
            </div>
          </div>
          {/* Mobile prev/next removed; swipe to navigate */}
        </motion.div>
        {/* Dots outside the card, pulled down */}
        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
          {upgradesData.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to upgrade ${idx + 1}`}
              onClick={() => { setAutoPlay(false); setSelectedUpgrade(idx); }}
              className={[
                "h-2.5 w-2.5 rounded-full transition-all duration-200",
                idx === selectedUpgrade
                  ? "bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.2)]"
                  : "bg-rose-200 hover:bg-rose-300"
              ].join(' ')}
            />
          ))}
        </div>
      </section>

      {/* Featured quizzes (live data) */}
      <FeaturedQuizzes limit={12} />
      <BottomCta />
      <Footer />
      </main>
    </div>
  );
}

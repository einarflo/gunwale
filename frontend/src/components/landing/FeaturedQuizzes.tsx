import { useEffect, useRef, useState } from "react";
import QuizCard, { QuizApiItem } from "./QuizCard";
import { get } from "../../api";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const FeaturedQuizzes: React.FC<{ limit?: number }> = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<QuizApiItem[]>([]);
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    get<QuizApiItem[]>(`/games/public?limit=12`)
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load quizzes'))
      .finally(() => setLoading(false));
  }, []);

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
          </div>
        </div>
      )}
      {!loading && !error && (
        <div
          className="relative w-full"
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
          <div ref={rowRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 scroll-smooth px-6 sm:px-8" style={{ WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)' }}>
            {items.map((q, i) => (
              <QuizCard key={`${String(q.uuid || q.id)}-${i}`} q={q} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

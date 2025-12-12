import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import mockup from "../../images/tavl-placeholder.jpg";


const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};



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

export type QuizApiItem = {
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

export default QuizCard;
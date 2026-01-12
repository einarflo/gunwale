import { useNavigate } from "react-router-dom";
import { Translate } from "../types";

type OverviewSectionProps = {
  username?: string;
  isPremium: boolean;
  gameCount: number;
  favoriteCount: number;
  totalPlays: number;
  t: Translate;
};

const OverviewSection = ({
  username,
  isPremium,
  gameCount,
  favoriteCount,
  totalPlays,
  t,
}: OverviewSectionProps) => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-6xl px-6 mt-10">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="relative rounded-3xl shadow-xl shadow-indigo-200/40 overflow-hidden p-5 sm:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
          <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
          <div className="relative space-y-3">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="space-y-2">
                <div className="text-xl sm:text-xl font-bold text-white">{t('landing.discover.title')}</div>
                <p className="text-sm text-white/80 max-w-sm">
                  {t('landing.discover.body')}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/discover')}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#6A71FA] px-5 py-3 text-sm font-semibold hover:bg-[#6A71FA] hover:text-white transition-colors shadow-lg shadow-indigo-200/50"
            >
              {t('landing.discover.cta')}
              <span aria-hidden className="text-lg leading-none">→</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-5 mt-4">
            <h1 className="text-4xl sm:text-4xl font-extrabold text-slate-900 mb-1 text-center md:text-left">
              <span>{t('overview.greeting')} </span>
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">{username}</span>!
            </h1>
            <p className="text-slate-600 text-base sm:text-lg mb-2 max-w-2xl text-center md:text-left mx-auto md:mx-0">
              {t('overview.stats', { gameCount, favoriteCount, totalPlays })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
};

export default OverviewSection;

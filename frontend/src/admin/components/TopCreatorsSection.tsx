import type { Translate } from "../home/types";

type TopCreator = {
  userId: string;
  username: string;
  heartCount: number;
  createdQuizCount: number;
  level?: number | null;
};

type TopCreatorsSectionProps = {
  creators: TopCreator[];
  onCreatorClick: (userId: string) => void;
  t: Translate;
};

const TopCreatorsSection = ({ creators, onCreatorClick, t }: TopCreatorsSectionProps) => {
  if (!creators.length) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 md:p-6 shadow-xl shadow-indigo-200/40">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
      <div className="absolute -left-16 -top-12 h-52 w-52 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover opacity-90" />
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
          <div>
            <div className="text-lg font-bold text-white">{t("discover.topCreators.title") || "Top creators"}</div>
            <div className="text-sm text-white/80">{t("discover.topCreators.subtitle") || "Most loved quiz makers right now"}</div>
          </div>
          <div className="text-xs text-white/70">
            {t("discover.topCreators.metric") || "Total hearts"}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator, index) => (
            <button
              key={creator.userId}
              onClick={() => onCreatorClick(creator.userId)}
              className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-left text-white shadow-sm transition hover:bg-white/25"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6A71FA] font-bold">
                {creator.username?.slice(0, 1)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{creator.username || creator.userId}</span>
                  {index < 3 && (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      {t("discover.topCreators.top") || "Top"}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/80">
                  {creator.createdQuizCount} {t("discover.topCreators.quizzes") || "quizzes"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">♥ {creator.heartCount}</div>
                {typeof creator.level === "number" && (
                  <div className="text-[10px] text-white/70">
                    {t("discover.topCreators.level") || "Lvl"} {creator.level}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopCreatorsSection;

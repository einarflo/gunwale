import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "../api";
import GlobalStyles from "../components/landing/GlobalStyles";
import Header from "../components/landing/Header";
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";
import { useI18n } from "../i18n/I18nProvider";
import mockup from "../images/tavl-placeholder.jpg";

interface CreatorProfile {
  userId: string;
  username: string;
  level: number | null;
  xp: number | null;
  totalPoints: number | null;
  playedQuizzes: number | null;
  createdQuizzes: number | null;
  premiumSince?: string | null;
  memberSince?: string | null;
}

interface CreatorGame {
  uuid?: string;
  id?: string | number;
  name: string;
  description?: string | null;
  qcount?: number;
  plays?: number;
  favCount?: number;
  tags?: Array<{ slug: string; name: string }>;
  cover_image_url?: string | null;
  coverImageUrl?: string | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  participants?: number;
  avgScore?: number;
  difficulty?: string;
}

interface ResponseShape {
  user: CreatorProfile;
  games: CreatorGame[];
}

const CreatorPublic = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [games, setGames] = useState<CreatorGame[]>([]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await get<ResponseShape>(`/users/${encodeURIComponent(userId)}/public-games`);
      const data = res.data;
      setProfile(data?.user ?? null);
      setGames(Array.isArray(data?.games) ? data.games : []);
    } catch (err: any) {
      console.error("Failed to load creator games", err);
      setError(t("creator.error") || "Failed to load creator");
      setProfile(null);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [userId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const title = useMemo(() => {
    if (profile?.username) return profile.username;
    if (userId) return userId;
    return t("creator.title") || "Creator";
  }, [profile?.username, userId, t]);

  const stats = useMemo(() => {
    return [
      {
        key: "level",
        label: t("creator.stats.level") || "Level",
        value: profile?.level != null ? profile.level : "—",
      },
      {
        key: "xp",
        label: t("creator.stats.xp") || "XP",
        value: profile?.xp != null ? profile.xp.toLocaleString() : "—",
      },
      {
        key: "totalPoints",
        label: t("creator.stats.totalPoints") || "Total points",
        value: profile?.totalPoints != null ? profile.totalPoints.toLocaleString() : "—",
      },
      {
        key: "createdQuizzes",
        label: t("creator.stats.created") || "Created quizzes",
        value: profile?.createdQuizzes != null ? profile.createdQuizzes : games.length,
      },
      {
        key: "playedQuizzes",
        label: t("creator.stats.played") || "Played quizzes",
        value: profile?.playedQuizzes != null ? profile.playedQuizzes : "—",
      },
      {
        key: "gameCount",
        label: t("creator.stats.games") || "Public quizzes",
        value: games.length,
      },
    ];
  }, [profile, games.length, t]);

  const openGame = (gameId: string) => {
    navigate(`/game/${encodeURIComponent(gameId)}`);
  };

  return (
    <div
      className="relative min-h-screen bg-[#1e1b4b] text-white overflow-hidden"
      style={{ fontFamily: 'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}
    >
      <GlobalStyles />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.35)_0%,transparent_60%),linear-gradient(to_bottom_right,#4f46e5,#9333ea,#ec4899)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse-slow" />
      <ParallaxOrbs />
      <ParallaxScroll />
      <Header />

      <div className="mx-auto mt-20 max-w-6xl px-4 py-6 md:px-6 md:py-8 text-white">
        <button
          onClick={() => navigate("/discover")}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20 transition"
        >
          ← {t("creator.back") || "Back to Discover"}
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 md:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.35)] mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.25em] text-white/60">{t("creator.title") || "Creator"}</div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">{title}</h1>
              <p className="text-white/70 max-w-2xl">
                {t("creator.subtitle") || "Public quizzes published by this creator."}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-center shadow-inner shadow-indigo-900/20"
                >
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">{stat.label}</div>
                  <div className="mt-1 text-lg font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
            {t("common.loading") || "Loading…"}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-rose-300/40 bg-rose-500/20 p-6 text-center text-white">
            {error}
          </div>
        )}

        {!loading && !error && games.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
            {t("creator.none") || "This creator has no public quizzes yet."}
          </div>
        )}

        {!loading && !error && games.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((g, idx) => {
              const gid = String(g.uuid || g.id);
              const cover = (g as any).cover_image_url || (g as any).coverImageUrl || null;
              return (
                <div
                  key={gid}
                  onClick={() => openGame(gid)}
                  className="group relative rounded-xl border border-white/10 bg-white/10 backdrop-blur-md hover:bg-white/15 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className={`relative ${idx % 6 === 0 ? "aspect-[16/8]" : "aspect-[16/9]"} overflow-hidden`}>
                    {cover ? (
                      <img src={cover} alt={g.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <img src={mockup} alt={`${g.name} placeholder`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    )}
                    {(idx % 6 === 0) && (
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-purple-600/30 to-transparent" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-lg font-bold text-white mb-1">{g.name}</div>
                    <div className="text-sm text-white/80 line-clamp-2 mb-2">{g.description || t("home.noDescription") || "No description"}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/80 mb-3">
                      <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 inline-flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z" /></svg>
                        {g.qcount || 0} {t("home.questions") || "questions"}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 inline-flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        {g.plays ?? 0} {t("home.plays") || "plays"}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 inline-flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5h-1v6l5 3 .5-.866-4.5-2.634V7z" /></svg>
                        {g.updated_at ? new Date(g.updated_at).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); openGame(gid); }}
                      className="rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 px-3 py-1.5 text-white text-sm font-semibold shadow hover:shadow-lg active:scale-95 transition"
                    >
                      {t("home.startGame") || "Start game"}
                    </button>
                    {Array.isArray(g.tags) && g.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {g.tags.slice(0, 6).map(tag => (
                          <span key={tag.slug} className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 text-white border border-white/10">
                            {t('tags.' + tag.slug) || tag.name}
                          </span>
                        ))}
                        {g.tags.length > 6 && (
                          <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 text-white border border-white/10">+{g.tags.length - 6}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorPublic;

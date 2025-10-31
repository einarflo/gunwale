import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "../api";
import GlobalStyles from "../components/landing/GlobalStyles";
import Header from "../components/landing/Header";
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";
import { useI18n } from "../i18n/I18nProvider";
import GameCard from "./components/GameCard";
import { buildGameCardLabels } from "./utils/gameCardLabels";
import { toGameCardGame } from "./utils/toGameCardGame";

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

  const cardLabels = buildGameCardLabels(t);

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
            {games.map((g) => {
              const gid = String(g.uuid || g.id);
              const cardGame = toGameCardGame(g, {
                id: gid,
                description: g.description || t("home.noDescription") || "No description",
                questionCount: g.qcount ?? 0,
                playCount: g.plays ?? 0,
                favoriteCount: g.favCount ?? null,
                participantCount: g.participants ?? null,
                tags: Array.isArray(g.tags) ? g.tags : undefined,
                isPublic: (((g as any).isPublic ?? 0) === 1) || (g as any).isPublic === true,
                accentKey: `${gid}-${g.name || ''}`,
              });

              const actions = [
                {
                  label: t("home.startGame") || "Start game",
                  kind: "primary" as const,
                  onClick: (gameCard: any) => openGame(gameCard.id),
                },
              ];

              return (
                <GameCard
                  key={cardGame.id}
                  game={cardGame}
                  labels={cardLabels}
                  actions={actions}
                  className="group"
                  onClick={(gameCard) => openGame(gameCard.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorPublic;

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post, del } from '../api';
import GlobalStyles from '../components/landing/GlobalStyles';
import ParallaxOrbs from '../components/ParallaxOrbs';
import ParallaxScroll from '../components/ParallaxScroll';
import Header from '../components/landing/Header';
import Footer from '../components/Footer';
import { useI18n } from '../i18n/I18nProvider';
import Modal from 'react-modal';
import randomstring from 'randomstring';
import { useKeycloak } from '../auth/KeycloakProvider';
import type { Question } from '../tv/game';
import GameCard from './components/GameCard';
import DiscoverSearchFilters from './components/DiscoverSearchFilters';
import TopCreatorsSection from './components/TopCreatorsSection';
import { buildGameCardLabels } from './utils/gameCardLabels';
import { toGameCardGame } from './utils/toGameCardGame';

interface GameLite {
  uuid?: string;
  id?: string | number;
  name: string;
  description?: string | null;
  qcount?: number;
  plays?: number;
  favCount?: number;
  isPublic?: number;
  created_by_name?: string;
  created_by?: string | null;
  creator_username?: string | null;
  creator_profile?: {
    userId: string;
    username: string;
    level: number;
    xp: number;
    totalPoints: number;
    playedQuizzes: number;
    createdQuizzes: number;
    premiumSince?: string | null;
    isPremium?: boolean;
    premium?: boolean;
  } | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  tags?: Array<{ slug: string; name: string }>;
  cover_image_url?: string | null;
  coverImageUrl?: string | null;
  tagMatchCount?: number;
}

const PAGE_SIZE = 24;

const Discover = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { userId, isAuthenticated, login } = useKeycloak();
  const [term, setTerm] = useState('');
  const [appliedTerm, setAppliedTerm] = useState('');
  const [searchNonce, setSearchNonce] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GameLite[]>([]);
  const [currentPage, setCurrentPage] = useState(-1);
  const [hasMore, setHasMore] = useState(true);
  const requestSeq = useRef(0);
  const fetchingMoreRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [allTags, setAllTags] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tagModeAll, setTagModeAll] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'favourites' | 'questions'>('popular');
  const [topCreators, setTopCreators] = useState<
    Array<{ userId: string; username: string; heartCount: number; createdQuizCount: number; level?: number | null }>
  >([]);

  // Modal state for details + start
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [newGamePin, setNewGamePin] = useState('');
  const [creating, setCreating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const openCreatorProfile = (userId?: string | null) => {
    if (!userId) return;
    navigate(`/creator/${encodeURIComponent(userId)}`);
  };

  const fetchPage = useCallback(async (pageToLoad: number, opts?: { reset?: boolean }) => {
    const reset = opts?.reset ?? false;
    const seq = ++requestSeq.current;
    const slugs = Array.from(selected);
    const qval = appliedTerm.trim();
    const mode = tagModeAll ? 'all' : 'any';

    if (reset) {
      setLoading(true);
      setError(null);
      setHasMore(true);
      fetchingMoreRef.current = false;
      setFetchingMore(false);
    } else {
      if (fetchingMoreRef.current) return;
      fetchingMoreRef.current = true;
      setFetchingMore(true);
    }

    const params = new URLSearchParams();
    params.set('limit', String(PAGE_SIZE));
    params.set('page', String(pageToLoad));
    params.set('sort', sortBy);
    if (qval) params.set('q', qval);
    if (slugs.length) {
      params.set('tags', slugs.join(','));
      params.set('mode', mode);
    }

    try {
      const res = await get(`/games/public?${params.toString()}`);
      if (requestSeq.current !== seq) return;
      const payload = Array.isArray(res.data) ? res.data : [];
      setResults(prev => {
        if (reset) return payload;
        const seen = new Map(prev.map(g => [String(g.uuid || g.id), g]));
        const merged = [...prev];
        for (const item of payload) {
          const key = String(item.uuid || item.id);
          if (seen.has(key)) {
            const index = merged.findIndex(g => String(g.uuid || g.id) === key);
            if (index >= 0) merged[index] = item;
          } else {
            seen.set(key, item);
            merged.push(item);
          }
        }
        return merged;
      });
      setHasMore(payload.length === PAGE_SIZE);
      if (payload.length) {
        setCurrentPage(pageToLoad);
      } else if (reset) {
        setCurrentPage(-1);
      }
      setError(null);
    } catch (err) {
      if (requestSeq.current !== seq) return;
      setError('Failed to load');
      if (reset) {
        setResults([]);
        setCurrentPage(-1);
      } else {
        setHasMore(false);
      }
    } finally {
      if (reset) {
        if (requestSeq.current === seq) {
          setLoading(false);
        }
        fetchingMoreRef.current = false;
      } else {
        fetchingMoreRef.current = false;
        if (requestSeq.current === seq) {
          setFetchingMore(false);
        }
      }
    }
  }, [selected, appliedTerm, tagModeAll, sortBy]);

  useEffect(() => {
    get('/tags').then(res => setAllTags(Array.isArray(res.data) ? res.data : [])).catch(() => setAllTags([]));
    get('/users/top-creators?limit=5')
      .then(res => setTopCreators(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTopCreators([]));
    if (isAuthenticated) {
      get('/favorites/').then(res => { const ids: string[] = res.data?.gameIds || []; setFavorites(new Set(ids.map(String))); }).catch(() => { });
    } else {
      setFavorites(new Set());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPage(0, { reset: true });
  }, [fetchPage, searchNonce]);

  useEffect(() => {
    if (!hasMore || loading || fetchingMore || currentPage < 0) return;
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          fetchPage(currentPage + 1);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchingMore, currentPage, fetchPage]);

  const hasTagFilters = selected.size > 0;
  const filtered = useMemo(() => {
    const arr = [...results];
    const toTime = (value: unknown) => {
      if (!value) return 0;
      const time = new Date(value as any).getTime();
      return Number.isFinite(time) ? time : 0;
    };
    arr.sort((a, b) => {
      if (hasTagFilters) {
        const scoreA = Number((a as any).tagMatchCount ?? (a as any).match_count ?? 0);
        const scoreB = Number((b as any).tagMatchCount ?? (b as any).match_count ?? 0);
        if (scoreA !== scoreB) return scoreB - scoreA;
      }
      switch (sortBy) {
        case 'recent': {
          const timeA = toTime(a.updated_at || a.created_at);
          const timeB = toTime(b.updated_at || b.created_at);
          if (timeA !== timeB) return timeB - timeA;
          break;
        }
        case 'popular': {
          const playsA = Number(a.plays || 0);
          const playsB = Number(b.plays || 0);
          if (playsA !== playsB) return playsB - playsA;
          break;
        }
        case 'favourites': {
          const favA = Number(a.favCount || 0);
          const favB = Number(b.favCount || 0);
          if (favA !== favB) return favB - favA;
          break;
        }
        case 'questions': {
          const qA = Number(a.qcount || 0);
          const qB = Number(b.qcount || 0);
          if (qA !== qB) return qB - qA;
          break;
        }
      }
      const idA = String(a.uuid || a.id || '');
      const idB = String(b.uuid || b.id || '');
      return idA.localeCompare(idB);
    });
    return arr;
  }, [results, sortBy, hasTagFilters]);

  const executeSearch = () => {
    const trimmed = term.trim();
    if (trimmed === appliedTerm) {
      setSearchNonce(n => n + 1);
    } else {
      setAppliedTerm(trimmed);
    }
  };

  const clearSearch = () => {
    setTerm('');
    if (appliedTerm === '') {
      setSearchNonce(n => n + 1);
    } else {
      setAppliedTerm('');
    }
  };

  const toggleFavorite = async (gameId: string) => {
    if (!isAuthenticated) {
      try { login(); } catch (_) { }
      return;
    }
    const isFav = favorites.has(gameId);
    try {
      if (isFav) {
        await del(`/favorites/${encodeURIComponent(gameId)}`);
        const next = new Set(favorites);
        next.delete(gameId);
        setFavorites(next);
      } else {
        await post(`/favorites/${encodeURIComponent(gameId)}`);
        const next = new Set(favorites);
        next.add(gameId);
        setFavorites(next);
      }
    } catch (_) { }
  };

  const toggleTag = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const openDetails = (gameId: string) => {
    navigate(`/game/${encodeURIComponent(gameId)}`);
  };

  // Load question list when opening modal
  useEffect(() => {
    if (!modalIsOpen || !selectedGameId) return;
    setQuestions([]);
    get(`/game_question/${selectedGameId}/`)
      .then(res => setQuestions(Array.isArray(res.data) ? res.data : []))
      .catch(() => setQuestions([]));
  }, [modalIsOpen, selectedGameId]);

  const createNewGameInstance = (gameId: string, gamePin: string) => {
    setCreating(true);
    post(`/game_instance/`, {
      game_id: gameId,
      game_pin: gamePin,
      status: 'created',
      created_by: userId
    })
      .then(res => {
        setCreating(false);
        navigate(`/host/${gameId}/instance/${res.data}/pin/${gamePin}`);
      })
      .catch(() => {
        setCreating(false);
      });
  };

  const cardLabels = buildGameCardLabels(t);

  return (
    <>
      <div className="relative min-h-screen text-white overflow-hidden" style={{ fontFamily: 'Inter, \"Plus Jakarta Sans\", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>

        <GlobalStyles />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_28%,rgba(93,184,104,0.18)_0%,transparent_58%),radial-gradient(circle_at_82%_32%,rgba(249,116,116,0.18)_0%,transparent_58%),radial-gradient(circle_at_50%_12%,rgba(156,138,250,0.22)_0%,transparent_60%),linear-gradient(to_bottom_right,rgba(16,24,39,0.08),rgba(156,138,250,0.08),transparent)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(156,138,250,0.06)_0%,transparent_72%),radial-gradient(circle_at_70%_80%,rgba(93,184,104,0.12)_0%,transparent_60%)] animate-pulse-slow" />
        <ParallaxOrbs />
        <ParallaxScroll />
        <Header />
        <div className="mx-auto mt-20 max-w-6xl px-4 py-6 md:px-6 md:py-8 text-white">
          <div className="relative before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15),transparent_70%)] before:-z-10">


            <DiscoverSearchFilters
              term={term}
              onTermChange={setTerm}
              onExecuteSearch={executeSearch}
              onClearSearch={clearSearch}
              sortBy={sortBy}
              onSortChange={setSortBy}
              selected={selected}
              allTags={allTags}
              tagModeAll={tagModeAll}
              onToggleTagMode={() => setTagModeAll(prev => !prev)}
              onToggleTag={toggleTag}
              onClearTags={() => { setSelected(new Set()); setTagModeAll(false); }}
              t={t}
            />

            <div className="mt-4 mb-4">
              <TopCreatorsSection
                creators={topCreators}
                onCreatorClick={(creatorId) => openCreatorProfile(creatorId)}
                t={t}
              />
            </div>

            {loading && <div className="text-white/70">Loading…</div>}
            {error && <div className="text-red-300">{error}</div>}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
              <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-xl shadow-indigo-200/30">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)]" />
                <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover opacity-90" />
                <div className="relative">
                  <div className="text-3xl mb-2">😕</div>
                  <div className="text-white font-semibold mb-1">
                    {t("discover.empty.title") || "No quizzes matched your search"}
                  </div>
                  <div className="text-white/80 mb-4">
                    {t("discover.empty.subtitle") || "Try clearing some filters or create a new quiz!"}
                  </div>
                  <button
                    onClick={() => navigate('/home')}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#6A71FA] shadow-lg shadow-indigo-200/50 transition-colors hover:bg-[#6A71FA] hover:text-white"
                  >
                    {t("discover.empty.cta") || "Create new quiz"}
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((g) => {
                  const gid = String(g.uuid || g.id);
                  const cardGame = toGameCardGame(g, {
                    id: gid,
                    description: g.description || t('home.noDescription') || 'No description',
                    questionCount: g.qcount ?? 0,
                    playCount: g.plays ?? 0,
                    favoriteCount: g.favCount ?? null,
                    participantCount: (g as any).participants ?? null,
                    difficulty: (g as any).difficulty ?? null,
                    creatorName:
                      g.creator_profile?.username ||
                      g.creator_username ||
                      g.created_by_name ||
                      (t('discover.unknownCreator') || 'Unknown creator'),
                    creatorUserId: g.creator_profile?.userId || g.created_by || null,
                    creatorLevel:
                      g.creator_profile?.level ??
                      (g as any).creator_level ??
                      null,
                    creatorIsPremium:
                      g.creator_profile?.premiumSince
                        ? true
                        : g.creator_profile?.isPremium ??
                        g.creator_profile?.premium ??
                        ((g as any).creator_is_premium != null
                          ? Boolean((g as any).creator_is_premium)
                          : null),
                    tags: Array.isArray(g.tags) ? g.tags : undefined,
                    isFavorite: favorites.has(gid),
                    isPublic: (((g as any).isPublic ?? 0) === 1) || (g as any).isPublic === true,
                    accentKey:
                      (g.tags && g.tags.length ? g.tags[0].slug || g.tags[0].name : gid) || gid,
                    lastPlayedAt: (g as any).lastPlayedAt ?? null,
                  });

                  return (
                    <GameCard
                      key={cardGame.id}
                      game={cardGame}
                      labels={cardLabels}
                      className="group"
                      onClick={(gameCard) => openDetails(gameCard.id)}
                      onToggleFavorite={(gameCard) => toggleFavorite(gameCard.id)}
                      onCreatorClick={(gameCard) => {
                        if (gameCard.creatorUserId) {
                          openCreatorProfile(gameCard.creatorUserId);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}

            {filtered.length > 0 && (
              <>
                {fetchingMore && !loading && (
                  <div className="mt-6 text-center text-white/70">Loading more…</div>
                )}
                <div ref={loadMoreRef} className="h-12 w-full" />
              </>
            )}

            {/* Create new quiz CTA after grid */}
            {!loading && !error && filtered.length > 0 && (
              <div className="relative mt-10 overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-xl shadow-indigo-200/30">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)]" />
                <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover opacity-90" />
                <div className="relative">
                  <h3 className="text-lg text-white font-semibold mb-2">
                    {t("discover.cta.title") || "Not finding what you like?"}
                  </h3>
                  <p className="text-white/80 mb-4">
                    {t("discover.cta.subtitle") || "Create your own quiz and share it with friends!"}
                  </p>
                  <button
                    onClick={() => navigate('/home')}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#6A71FA] shadow-lg shadow-indigo-200/50 transition-colors hover:bg-[#6A71FA] hover:text-white"
                  >
                    {t("discover.cta.button") || "Create new quiz"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal with quiz details + question list */}
        <Footer />

        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={() => {
            setNewGamePin(randomstring.generate({ charset: ['numeric'], readable: true, length: 5 }));
          }}
          onRequestClose={() => setModalIsOpen(false)}
          style={{
            overlay: {
              position: 'fixed',
              top: 0 + '82px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.75)'
            },
            content: {
              top: '45%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '20px',
              border: 'none',
              color: 'white',
              fontFamily: 'Coll',
              background: 'linear-gradient(135deg, #93c5fd 0%, #c4b5fd 100%)',
              width: '92%',
              maxWidth: '860px',
              boxShadow: '0 8px 32px rgba(59,130,246,0.15)'
            }
          }}
          contentLabel="Quiz details"
        >
          {(() => {
            const g = results.find(x => String(x.uuid || x.id) === String(selectedGameId));
            if (!g) return null;
            const isPublic = (g.isPublic ?? 0) === 1;
            return (
              <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-2xl font-extrabold text-white drop-shadow" style={{ textShadow: '0 0 12px rgba(236,72,153,0.4)' }}>{g.name}</div>
                    <div className="text-white/90">
                      {t('home.by', {
                        name: g.creator_username || g.created_by_name || t('discover.unknownCreator') || 'Unknown',
                      }) || `By ${g.creator_username || g.created_by_name || 'Unknown'}`}
                    </div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{isPublic ? (t('home.public') || 'Public') : (t('home.private') || 'Private')}</span>
                </div>
                {g.description && <div className="text-white">{g.description}</div>}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z" /></svg>{g.qcount || questions.length} {t('home.questions') || 'questions'}</span>
                  {g.created_at && (<span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5h-1v6l5 3 .5-.866-4.5-2.634V7z" /></svg>{new Date(g.created_at).toLocaleDateString()}</span>)}
                </div>

                {/* Questions list */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10 max-h-64 overflow-auto">
                  <div className="text-base font-semibold text-white mb-2">{t('home.questions') || 'Questions'}</div>
                  {questions.length === 0 ? (
                    <div className="text-sm text-white/70">{t('common.loading') || 'Loading…'}</div>
                  ) : (
                    <ul className="space-y-2">
                      {questions.map((q, idx) => (
                        <li key={String(q.uuid || idx)} className="text-sm text-white/90 flex gap-2">
                          <span className="text-pink-300 font-semibold">{idx + 1}.</span>
                          <span className="truncate">{q.text || '—'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* PIN + Actions */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/80">{t('home.pin') || 'PIN'}</div>
                    <div className="text-3xl font-extrabold text-white">{newGamePin}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-white/10 border border-white/10 px-3 py-1 text-white text-sm font-semibold shadow hover:bg-white/20 transition" onClick={() => navigator.clipboard?.writeText(newGamePin)}>{t('home.copyPin') || 'Copy PIN'}</button>
                    <button className="rounded-lg bg-white/10 border border-white/10 px-3 py-1 text-white text-sm font-semibold shadow hover:bg-white/20 transition" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/join/${newGamePin}`)}>{t('home.copyLink') || 'Copy link'}</button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-3 text-lg font-bold text-white shadow-xl hover:shadow-2xl active:scale-95 transition disabled:opacity-60" onClick={() => createNewGameInstance(String(selectedGameId), newGamePin)} disabled={creating}>
                    {creating ? (t('home.starting') || 'Starting…') : (t('home.startGame') || 'Start game')}
                  </button>
                  <button className="rounded-xl bg-white/10 px-4 py-3 text-white font-semibold shadow border border-white/10 hover:bg-white/20 transition" onClick={() => setModalIsOpen(false)}>{t('common.close') || 'Close'}</button>
                </div>
              </div>
            );
          })()}
        </Modal>
      </div>
    </>
  );
};

export default Discover;

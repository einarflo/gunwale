import { useEffect, useMemo, useState } from 'react';
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
}

const Discover = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { userId, isAuthenticated, login } = useKeycloak();
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GameLite[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [allTags, setAllTags] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tagModeAll, setTagModeAll] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'favourites' | 'questions'>('popular');

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

  useEffect(() => {
    // Load initial lists
    refresh();
    get('/tags').then(res => setAllTags(Array.isArray(res.data) ? res.data : [])).catch(() => setAllTags([]));
    if (isAuthenticated) {
      get('/favorites/').then(res => { const ids: string[] = res.data?.gameIds || []; setFavorites(new Set(ids.map(String))); }).catch(() => {});
    } else {
      setFavorites(new Set());
    }
  }, [isAuthenticated]);

  const refresh = (opts?: { slugs?: string[]; q?: string; all?: boolean }) => {
    setLoading(true);
    const slugs = opts?.slugs ?? Array.from(selected);
    const qval = (opts?.q ?? term).trim();
    const all = opts?.all ?? tagModeAll;
    const params = new URLSearchParams();
    if (qval) params.set('q', qval);
    if (slugs.length) {
      params.set('tags', slugs.join(','));
      params.set('mode', all ? 'all' : 'any');
    }
    get(`/games/public?${params.toString()}`)
      .then(res => setResults(Array.isArray(res.data) ? res.data : []))
      .catch(() => { setError('Failed to load'); setResults([]); })
      .finally(() => setLoading(false));
  };

  // client-side sort for better UX (server already filters)
  const filtered = useMemo(() => {
    const arr = [...results];
    switch (sortBy) {
      case 'recent':
        arr.sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
        break;
      case 'popular':
        arr.sort((a, b) => (b.plays || 0) - (a.plays || 0));
        break;
      case 'favourites':
        arr.sort((a, b) => (b.favCount || 0) - (a.favCount || 0));
        break;
      case 'questions':
        arr.sort((a, b) => (b.qcount || 0) - (a.qcount || 0));
        break;
    }
    return arr;
  }, [results, sortBy]);

  const toggleFavorite = async (gameId: string) => {
    if (!isAuthenticated) {
      try { login(); } catch (_) {}
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
    } catch (_) {}
  };

  const toggleTag = (slug: string) => {
    const ns = new Set(selected);
    if (ns.has(slug)) ns.delete(slug); else ns.add(slug);
    setSelected(ns);
    // immediately refresh using the new set to avoid stale state on first click
    refresh({ slugs: Array.from(ns) });
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

  const gradientForTag = (slug: string) => {
    let h = 0;
    const key = slug || '';
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    const h1 = h % 360;
    const h2 = (h1 + 35) % 360;
    // Softer, glassy gradient with lower alpha
    return `linear-gradient(135deg, hsl(${h1} 80% 60% / 0.45) 0%, hsl(${h2} 78% 58% / 0.45) 100%)`;
  };

  return (
    <>
      <div className="relative min-h-screen bg-[#1e1b4b] text-white overflow-hidden" style={{ fontFamily: 'Inter, \"Plus Jakarta Sans\", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
        <GlobalStyles />
        {/* Background layers to match GamePublic/Landing */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.35)_0%,transparent_60%),linear-gradient(to_bottom_right,#4f46e5,#9333ea,#ec4899)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse-slow" />
        <ParallaxOrbs />
        <ParallaxScroll />
        <Header />
        <div className="mx-auto mt-20 max-w-6xl px-4 py-6 md:px-6 md:py-8 text-white">
        <div className="relative before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15),transparent_70%)] before:-z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-pink-100 drop-shadow" style={{ textShadow: '0 0 12px rgba(236,72,153,0.4)' }}>Discover</div>
              <div className="text-white/80">Search public quizzes and explore suggestions.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate('/home')} className="rounded-full bg-white/10 border border-white/10 px-3 py-2 text-white text-sm font-semibold hover:bg-white/20 transition">{t('common.back') || 'Back'}</button>
            </div>
          </div>

        {/* Search + sort */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-3 md:p-4 shadow-sm mb-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM10 16a6 6 0 110-12 6 6 0 010 12z"/></svg>
              </span>
              <input
                value={term}
                onChange={e => setTerm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') refresh(); }}
                placeholder={t('home.searchPlaceholder') || 'Search for quizzes...'}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-white/10 bg-white/10 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/30 text-sm md:text-base"
              />
              {!!term && (
                <button onClick={() => { setTerm(''); refresh({ q: '' }); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <label className="text-sm text-white/80">Sort</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="rounded-md border border-white/10 px-2 py-2 text-sm bg-white/10 text-white">
                <option value="popular">Most plays</option>
                <option value="recent">Recently updated</option>
                <option value="favourites">Most favourites</option>
                <option value="questions">Most questions</option>
              </select>
              <button onClick={() => refresh()} className="rounded-md bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold px-3 py-2 shadow hover:shadow-lg transition">Search</button>
            </div>
          </div>
          {/* Selected tags chips */}
          {selected.size > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {Array.from(selected).map(slug => {
                const name = allTags.find(tg => tg.slug === slug)?.name || slug;
                return (
                  <span key={slug} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-white/10 text-white border border-white/10">
                    {t('tags.' + slug) || name}
                    <button onClick={() => toggleTag(slug)} className="text-white/80 hover:text-white">×</button>
                  </span>
                );
              })}
              <button onClick={() => { setSelected(new Set()); refresh({ slugs: [] }); }} className="text-xs text-white/70 underline">Clear</button>
            </div>
          )}
        </div>

        {/* Tag filters as gradient cards row */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-3 md:p-4 shadow-sm mb-4">
          <div className="flex items-center justify-start mb-3">
            <div className="text-sm font-semibold text-white/80">Browse tags</div>
          </div>
          <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
            <div className="flex items-stretch gap-3 py-1">
              {allTags.map(tag => {
                const active = selected.has(tag.slug);
                return (
                  <button
                    key={tag.slug}
                    onClick={() => toggleTag(tag.slug)}
                    className={`relative min-w-[150px] h-[96px] rounded-2xl px-4 py-3 text-left text-white/95 backdrop-blur-xl border transition active:scale-95 shadow-[0_10px_40px_rgba(0,0,0,0.16)] hover:shadow-[0_16px_60px_rgba(0,0,0,0.22)] hover:brightness-[1.03] ${active ? 'ring-2 ring-white/60 border-white/30' : 'ring-0 border-white/20'}`}
                    style={{ backgroundImage: gradientForTag(tag.slug), backgroundColor: 'rgba(255,255,255,0.08)' }}
                    title={t('tags.' + tag.slug) || tag.name}
                  >
                    <div className="font-semibold drop-shadow-sm truncate">{t('tags.' + tag.slug) || tag.name}</div>
                    <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(120% 100% at 0% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)' }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading && <div className="text-white/70">Loading…</div>}
        {error && <div className="text-red-300">{error}</div>}

        {!loading && !error && (
          <div className="mb-2 text-sm text-white/70">{filtered.length} results</div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <div className="text-3xl mb-2">😕</div>
            <div className="text-white font-medium mb-1">Fant ingen quizer som matcher søket ditt</div>
            <div className="text-white/70 mb-4">Prøv å fjerne noen filtre eller opprett en ny quiz!</div>
            <button onClick={() => navigate('/home')} className="rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white text-sm font-semibold shadow hover:shadow-lg active:scale-95 transition">Lag ny quiz</button>
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

        {/* Create new quiz CTA after grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="rounded-2xl p-6 text-center bg-white/5 mt-10 border border-white/10">
            <h3 className="text-lg text-white font-medium mb-2">Ikke funnet noe du liker?</h3>
            <p className="text-white/60 mb-4">Lag din egen quiz og del den med venner!</p>
            <button onClick={() => navigate('/home')} className="rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white text-sm font-semibold shadow hover:shadow-lg active:scale-95 transition">Lag ny quiz</button>
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
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>{g.qcount || questions.length} {t('home.questions') || 'questions'}</span>
                {g.created_at && (<span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5h-1v6l5 3 .5-.866-4.5-2.634V7z"/></svg>{new Date(g.created_at).toLocaleDateString()}</span>)}
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

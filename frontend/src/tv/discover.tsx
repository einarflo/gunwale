import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post, del } from '../api';
import GlobalStyles from '../components/landing/GlobalStyles';
import AnimatedGradientBackground from '../components/landing/AnimatedGradientBackground';
import { useI18n } from '../i18n/I18nProvider';
import Modal from 'react-modal';
import randomstring from 'randomstring';
import { useKeycloak } from '../auth/KeycloakProvider';
import type { Question } from './game';

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
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  tags?: Array<{ slug: string; name: string }>;
}

const Discover = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { userId } = useKeycloak();
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GameLite[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [allTags, setAllTags] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tagModeAll, setTagModeAll] = useState(false);

  // Modal state for details + start
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [newGamePin, setNewGamePin] = useState('');
  const [creating, setCreating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Load initial lists
    refresh();
    get('/tags').then(res => setAllTags(Array.isArray(res.data) ? res.data : [])).catch(() => setAllTags([]));
    get('/favorites/').then(res => { const ids: string[] = res.data?.gameIds || []; setFavorites(new Set(ids.map(String))); }).catch(() => {});
  }, []);

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

  const filtered = results; // server-side filtered by q/tags

  const toggleFavorite = async (gameId: string) => {
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
    setSelectedGameId(gameId);
    setModalIsOpen(true);
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

  return (
    <>
      <GlobalStyles />
      <AnimatedGradientBackground />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-800">Discover</div>
          <button onClick={() => navigate('/home')} className="rounded-xl bg-white px-4 py-2 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">{t('common.back') || 'Back'}</button>
        </div>
        <div className="text-gray-600 mb-4">Search for public quizzes and explore suggestions.</div>

        <input
          value={term}
          onChange={e => { setTerm(e.target.value); }}
          placeholder={t('home.searchPlaceholder') || 'Search for quizzes...'}
          className="w-full mb-4 px-3 py-2 rounded-xl border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
        />

        {/* Tag filters */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const active = selected.has(tag.slug);
              return (
                <button key={tag.slug} onClick={() => toggleTag(tag.slug)} className={`px-3 py-1 rounded-full text-sm font-semibold border-2 transition ${active ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}>
                  {t('tags.' + tag.slug) || tag.name}
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={tagModeAll} onChange={e => { const v = e.target.checked; setTagModeAll(v); refresh({ slugs: Array.from(selected), all: v }); }} />
            Match all
          </label>
        </div>

        <div className="mb-4">
          <button onClick={() => refresh()} className="rounded-lg bg-white border-2 border-blue-300 px-3 py-1 text-blue-700 text-sm font-semibold shadow hover:bg-blue-50 transition">Search</button>
        </div>

        {loading && <div className="text-gray-600">Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g) => {
              const gid = String(g.uuid || g.id);
              const fav = favorites.has(gid);
              return (
              <div key={gid} className="rounded-xl border-2 border-blue-100 bg-white/90 hover:shadow transition cursor-pointer" onClick={() => openDetails(gid)}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-lg font-bold text-blue-700 truncate">{g.name}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(gid); }} className={`rounded-full border px-2 py-1 text-xs ${fav ? 'bg-yellow-300/60 border-yellow-400 text-yellow-900' : 'bg-white border-blue-200 text-blue-700'}`}>{fav ? '★' : '☆'}</button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2 mb-2">{g.description || (t('home.noDescription') || 'No description')}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>{g.qcount || 0} {t('home.questions') || 'questions'}</span>
                    {g.created_at && (
                      <span className="inline-flex items-center gap-1" title="Created">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5h-1v6l5 3 .5-.866-4.5-2.634V7z"/></svg>
                        {new Date(g.created_at).toLocaleDateString()}
                      </span>
                    )}
                    {g.updated_at && (
                      <span className="inline-flex items-center gap-1" title="Updated">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6v4l3 3 1-1-3-3V6z"/></svg>
                        {new Date(g.updated_at).toLocaleDateString()}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1" title="Plays">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      {g.plays ?? 0} {t('home.plays') || 'plays'}
                    </span>
                    <span className="inline-flex items-center gap-1" title="Participants">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                      {(g as any).participants ?? 0}
                    </span>
                    {(g as any).difficulty && (
                      <span className="inline-flex items-center gap-1" title="Difficulty">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12h18v2H3z"/></svg>
                        {String((g as any).difficulty)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1" title="Favorites">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      {g.favCount ?? 0}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openDetails(gid); }} className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1.5 text-white text-sm font-semibold shadow hover:scale-105 transition">{t('home.startGame') || 'Start game'}</button>
                </div>
                {Array.isArray(g.tags) && g.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {g.tags.slice(0, 6).map(tag => (
                      <span key={tag.slug} className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {t('tags.' + tag.slug) || tag.name}
                      </span>
                    ))}
                    {g.tags.length > 6 && (
                      <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-gray-50 text-gray-700 border border-gray-200">+{g.tags.length - 6}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );})}
          </div>
        )}
      </div>

      {/* Modal with quiz details + question list */}
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
                  <div className="text-2xl font-extrabold text-blue-900">{g.name}</div>
                  <div className="text-gray-700">{t('home.by', { name: g.created_by_name || '—' }) || `By ${g.created_by_name || '—'}`}</div>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{isPublic ? (t('home.public') || 'Public') : (t('home.private') || 'Private')}</span>
              </div>
              {g.description && <div className="text-gray-800">{g.description}</div>}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
                <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>{g.qcount || questions.length} {t('home.questions') || 'questions'}</span>
                {g.created_at && (
                  <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5h-1v6l5 3 .5-.866-4.5-2.634V7z"/></svg>{new Date(g.created_at).toLocaleDateString()}</span>
                )}
              </div>

              {/* Questions list */}
              <div className="rounded-2xl bg-white/85 p-4 border-2 border-blue-200 max-h-64 overflow-auto">
                <div className="text-base font-semibold text-blue-800 mb-2">{t('home.questions') || 'Questions'}</div>
                {questions.length === 0 ? (
                  <div className="text-sm text-gray-600">{t('common.loading') || 'Loading…'}</div>
                ) : (
                  <ul className="space-y-2">
                    {questions.map((q, idx) => (
                      <li key={String(q.uuid || idx)} className="text-sm text-gray-800 flex gap-2">
                        <span className="text-blue-600 font-semibold">{idx + 1}.</span>
                        <span className="truncate">{q.text || '—'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* PIN + Actions */}
              <div className="rounded-2xl bg-white/80 p-4 border-2 border-blue-200 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-700">{t('home.pin') || 'PIN'}</div>
                  <div className="text-3xl font-extrabold text-blue-700">{newGamePin}</div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-white border-2 border-blue-300 px-3 py-1 text-blue-700 text-sm font-semibold shadow hover:bg-blue-50 transition" onClick={() => navigator.clipboard?.writeText(newGamePin)}>{t('home.copyPin') || 'Copy PIN'}</button>
                  <button className="rounded-lg bg-white border-2 border-blue-300 px-3 py-1 text-blue-700 text-sm font-semibold shadow hover:bg-blue-50 transition" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/join/${newGamePin}`)}>{t('home.copyLink') || 'Copy link'}</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-lg font-bold text-white shadow-xl hover:scale-105 transition disabled:opacity-60" onClick={() => createNewGameInstance(String(selectedGameId), newGamePin)} disabled={creating}>
                  {creating ? (t('home.starting') || 'Starting…') : (t('home.startGame') || 'Start game')}
                </button>
                <button className="rounded-xl bg-white px-4 py-3 text-gray-700 font-semibold shadow border-2 border-gray-200 hover:bg-gray-50 transition" onClick={() => setModalIsOpen(false)}>{t('common.close') || 'Close'}</button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
};

export default Discover;

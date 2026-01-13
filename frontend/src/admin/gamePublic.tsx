import { useEffect, useMemo, useState } from 'react';
import randomstring from 'randomstring';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post } from '../api';
import Header from '../components/landing/Header';
import { useI18n } from '../i18n/I18nProvider';
import { useKeycloak } from '../auth/KeycloakProvider';
import ParallaxOrbs from '../components/ParallaxOrbs';
import ParallaxScroll from '../components/ParallaxScroll';
import GlobalStyles from '../components/landing/GlobalStyles';
import Footer from '../components/Footer';
import HomeGameModal from './home/components/HomeGameModal';
import mockup from '../images/tavl-placeholder.jpg';
import { ArrowLeft } from 'lucide-react';

export default function GamePublic() {
  const { gameId } = useParams<{ gameId: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated, login, userId } = useKeycloak();

  const [game, setGame] = useState<any>(null);
  const [tags, setTags] = useState<Array<{ slug: string; name: string }>>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newGamePin, setNewGamePin] = useState('');

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    Promise.all([
      get(`/games/${encodeURIComponent(gameId)}/`).then(r => r.data).catch(() => null),
      get(`/tags/game/${encodeURIComponent(gameId)}`).then(r => r.data).catch(() => []),
      get(`/game_question/${encodeURIComponent(gameId)}/`).then(r => r.data).catch(() => []),
    ]).then(([g, tg, qs]) => {
      if (!g) { setError(t('gamePublic.error.notFound')); setLoading(false); return; }
      setGame(g);
      setTags(Array.isArray(tg) ? tg : []);
      setQuestions(Array.isArray(qs) ? qs : []);
      setLoading(false);
    }).catch(() => { setError(t('gamePublic.error.failed')); setLoading(false); });
  }, [gameId, t]);

  const qcount = useMemo(() => questions.length, [questions]);

  const openStartModal = () => {
    if (!isAuthenticated) {
      const returnTo = window.location.pathname + window.location.search + window.location.hash;
      try { login(returnTo); } catch(_) {};
      return;
    }
    if (!game?.uuid) return;
    setNewGamePin(
      randomstring.generate({
        charset: ['numeric'],
        readable: true,
        length: 5,
      }),
    );
    setModalOpen(true);
  };

  const startGame = async () => {
    if (!isAuthenticated) {
      const returnTo = window.location.pathname + window.location.search + window.location.hash;
      setModalOpen(false);
      try { login(returnTo); } catch(_) {};
      return;
    }
    if (!game?.uuid) return;
    setStarting(true);
    try {
      const pin = newGamePin || String(Math.floor(10000 + Math.random() * 89999));
      const { data } = await post('/game_instance/', { game_id: game.uuid, game_pin: pin, status: 'created', created_by: userId });
      navigate(`/host/${game.uuid}/instance/${data}/pin/${pin}`);
    } catch (e) {
      setStarting(false);
    }
  };

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/game/${encodeURIComponent(String(gameId))}`;
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (_) {}
  };

  // Gradient tone for number chip by difficulty
  const diff = String(game?.difficulty || '').toLowerCase();
  const chipGradient = diff.includes('lett') || diff.includes('easy')
    ? 'from-emerald-500 to-teal-500'
    : diff.includes('medium') || diff.includes('middels')
    ? 'from-amber-500 to-orange-500'
    : diff.includes('hard') || diff.includes('vanskelig')
    ? 'from-rose-500 to-purple-500'
    : 'from-indigo-500 to-pink-500';

  return (
    <div className="relative min-h-screen bg-white text-slate-900 overflow-hidden" style={{ fontFamily: 'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <GlobalStyles />
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_24%,rgba(59,130,246,0.18)_0%,transparent_55%),radial-gradient(circle_at_78%_26%,rgba(99,102,241,0.2)_0%,transparent_60%),radial-gradient(circle_at_50%_10%,rgba(147,197,253,0.2)_0%,transparent_60%),linear-gradient(to_bottom_right,rgba(15,23,42,0.08),rgba(59,130,246,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(156,138,250,0.06)_0%,transparent_72%),radial-gradient(circle_at_70%_80%,rgba(93,184,104,0.12)_0%,transparent_60%)] animate-pulse-slow" />
      <ParallaxOrbs />
      <ParallaxScroll />
      <Header white />
      <div className="mx-auto max-w-5xl mt-20 px-4 py-6 md:px-6 md:py-8">
        {loading ? (
          <div className="text-slate-500">{t('common.loading') || 'Loading…'}</div>
        ) : error ? (
          <div className="text-rose-500">{error}</div>
        ) : (
          <div className="relative before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_70%)] before:-z-10">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-[0_18px_60px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Responsive media + content layout */}
            <div className="md:grid md:grid-cols-[minmax(260px,460px),1fr] md:gap-0">
              {/* Media */}
              <div className="md:flex md:flex-col">
                <div className="group relative aspect-[16/9] md:aspect-auto md:h-full md:min-h-[220px] md:max-h-[360px] overflow-hidden rounded-t-2xl md:rounded-none md:rounded-l-2xl">
                  {/* Overlay back button in image */}
                  <button
                    onClick={() => navigate('/discover')}
                    className="absolute top-3 left-3 z-10 p-2 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:bg-white transition"
                    aria-label="Tilbake"
                    title="Tilbake"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <img
                    loading="lazy"
                    src={game?.cover_image_url || game?.coverImageUrl || mockup}
                    alt={game?.name || 'Quiz cover'}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent md:hidden" />
                  {/* Tags on mobile (if any) */}
                  {Array.isArray(tags) && tags.length > 0 && (
                    <div className="absolute top-2 left-2 md:hidden flex flex-wrap gap-1">
                      {tags.slice(0, 3).map((tg) => (
                        <span key={`top-m-${tg.slug}`} className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-slate-700 border border-white/50">
                          {tg.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Title over image on small screens only */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:hidden">
                    <div className="text-2xl font-extrabold text-white drop-shadow-lg break-words" style={{ textShadow: '0 0 12px rgba(15,23,42,0.35)' }}>{game?.name}</div>
                  </div>
                </div>
                {/* Share toolbar under image on desktop */}
                <div className="hidden md:flex items-center gap-2 p-3 bg-gradient-to-r from-sky-50 via-indigo-50 to-blue-50 border-t border-slate-200">
                  <button title="Copy" onClick={copyLink} className="rounded-full p-2 border border-slate-200 text-slate-600 hover:bg-white" aria-label="Copy link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 8a5 5 0 015-5h3v2H8a3 3 0 000 6h3v2H8a5 5 0 01-5-5zm10-3h3a5 5 0 010 10h-3v-2h3a3 3 0 000-6h-3V5z"/></svg>
                  </button>
                  <button title="Share on X" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}/g/${encodeURIComponent(String(gameId))}`)}&text=${encodeURIComponent(game?.name || 'Quiz')}`,'_blank','noopener,noreferrer')} className="rounded-full p-2 border border-slate-200 text-slate-600 hover:bg-white" aria-label="Share on X">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3l8.5 9.5L3 21h2.5L13 13.5 19.5 21H21l-8.5-9.5L21 3h-2.5L11 10.5 4.5 3H3z"/></svg>
                  </button>
                  <button title="Share on Facebook" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/g/${encodeURIComponent(String(gameId))}`)}`,'_blank','noopener,noreferrer')} className="rounded-full p-2 border border-slate-200 text-slate-600 hover:bg-white" aria-label="Share on Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.6 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.4 3h-1.8v7A10 10 0 0022 12z"/></svg>
                  </button>
                  <button title="Share on LinkedIn" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/g/${encodeURIComponent(String(gameId))}`)}`,'_blank','noopener,noreferrer')} className="rounded-full p-2 border border-slate-200 text-slate-600 hover:bg-white" aria-label="Share on LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.1h.1c.5-1 1.7-2.1 3.6-2.1 3.9 0 4.6 2.6 4.6 6V23h-4v-6.6c0-1.6 0-3.6-2.2-3.6-2.3 0-2.7 1.7-2.7 3.5V23h-4V8z"/></svg>
                  </button>
                  {'share' in navigator && (
                    <button title="Share" onClick={() => navigator.share?.({ title: game?.name || 'Quiz', url: `${window.location.origin}/g/${encodeURIComponent(String(gameId))}` }).catch(() => {})} className="rounded-full p-2 border border-slate-200 text-slate-600 hover:bg-white" aria-label="Share">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8a3 3 0 10-2.83-4H15a3 3 0 102.83 4H18zM6 14a3 3 0 10-2.83 4H3a3 3 0 102.83-4H6zm12 0a3 3 0 10-2.83 4H15a3 3 0 102.83-4H18zM7.2 13.2l8.6-4.3-.9-1.8-8.6 4.3.9 1.8zm0 4.6l8.6-4.3-.9-1.8-8.6 4.3.9 1.8z"/></svg>
                    </button>
                  )}
                </div>
                {/* Details under image on desktop; stacked on mobile */}
                <div className="p-5 md:p-7">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0">
                      {/* Eyebrow tags on md+ */}
                      {Array.isArray(tags) && tags.length > 0 && (
                        <div className="hidden md:flex items-center gap-1 mb-1 flex-wrap">
                          {tags.slice(0, 4).map((tg) => (
                            <span key={`top-d-${tg.slug}`} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {tg.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="hidden md:block text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-700 to-sky-600 drop-shadow" style={{ textShadow: '0 0 12px rgba(59,130,246,0.18)' }}>{game?.name}</div>
                      {game?.description && <div className="text-slate-600 mt-3 md:text-lg leading-relaxed break-words">{game.description}</div>}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-700">
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-800 border border-blue-100 inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>{qcount} {t('home.questions') || 'questions'}</span>
                        {game?.difficulty && <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-800 border border-blue-100 inline-flex items-center gap-1">{String(game.difficulty)}</span>}
                        {typeof game?.plays === 'number' && <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-800 border border-blue-100 inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>{game.plays} {t('home.plays') || 'plays'}</span>}
                        {typeof game?.favCount === 'number' && <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-800 border border-blue-100 inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.5 2.09C12.09 5 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>{game.favCount}</span>}
                        {game?.created_at && <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-800 border border-blue-100 inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5h-1v6l5 3 .5-.866-4.5-2.634V7z"/></svg>{new Date(game.created_at).toLocaleDateString()}</span>}
                        {game?.created_by_name && <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-800 border border-blue-100 inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 110-10 5 5 0 010 10zm-7 9a7 7 0 1114 0H5z"/></svg>{game.created_by_name}</span>}
                      </div>
                      {Array.isArray(tags) && tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tags.slice(0, 10).map((tg) => (
                            <span key={tg.slug} className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{tg.name}</span>
                          ))}
                          {tags.length > 10 && <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">+{tags.length - 10}</span>}
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 items-stretch sm:items-center md:justify-end">
                      {/* Share toolbar (mobile) */}
                      <div className="flex items-center gap-2 flex-wrap md:hidden">
                        <button title="Copy" onClick={copyLink} className="rounded-full p-2 border border-slate-200 text-slate-600 hover:bg-white" aria-label="Copy link">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 8a5 5 0 015-5h3v2H8a3 3 0 000 6h3v2H8a5 5 0 01-5-5zm10-3h3a5 5 0 010 10h-3v-2h3a3 3 0 000-6h-3V5z"/></svg>
                        </button>
                        <button title="Share on X" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}/g/${encodeURIComponent(String(gameId))}`)}&text=${encodeURIComponent(game?.name || 'Quiz')}`,'_blank','noopener,noreferrer')} className="rounded-full p-2 border border-slate-200 text-slate-600 hover:bg-white" aria-label="Share on X">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3l8.5 9.5L3 21h2.5L13 13.5 19.5 21H21l-8.5-9.5L21 3h-2.5L11 10.5 4.5 3H3z"/></svg>
                        </button>
                        <button title="Share on Facebook" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/g/${encodeURIComponent(String(gameId))}`)}`,'_blank','noopener,noreferrer')} className="rounded-full p-2 border border-slate-200 text-slate-600 hover:bg-white" aria-label="Share on Facebook">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.6 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.4 3h-1.8v7A10 10 0 0022 12z"/></svg>
                        </button>
                        <button title="Share on LinkedIn" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/g/${encodeURIComponent(String(gameId))}`)}`,'_blank','noopener,noreferrer')} className="rounded-full p-2 border border-slate-200 text-slate-600 hover:bg-white" aria-label="Share on LinkedIn">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.1h.1c.5-1 1.7-2.1 3.6-2.1 3.9 0 4.6 2.6 4.6 6V23h-4v-6.6c0-1.6 0-3.6-2.2-3.6-2.3 0-2.7 1.7-2.7 3.5V23h-4V8z"/></svg>
                        </button>
                        {/* Native share if available */}
                        {'share' in navigator && (
                          <button title="Share" onClick={() => navigator.share?.({ title: game?.name || 'Quiz', url: `${window.location.origin}/g/${encodeURIComponent(String(gameId))}` }).catch(() => {})} className="rounded-full p-2 border border-slate-200 text-slate-600 hover:bg-white" aria-label="Share">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8a3 3 0 10-2.83-4H15a3 3 0 102.83 4H18zM6 14a3 3 0 10-2.83 4H3a3 3 0 102.83-4H6zm12 0a3 3 0 10-2.83 4H15a3 3 0 102.83-4H18zM7.2 13.2l8.6-4.3-.9-1.8-8.6 4.3.9 1.8zm0 4.6l8.6-4.3-.9-1.8-8.6 4.3.9 1.8z"/></svg>
                          </button>
                        )}
                      </div>
                      <button onClick={openStartModal} className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 px-4 py-2 text-white text-sm font-semibold shadow-lg hover:shadow-xl border border-blue-200/70 active:scale-95 transition" disabled={starting}>{starting ? (t('home.starting') || 'Starting…') : (t('home.startGame') || 'Start game')}</button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right column: questions on desktop */}
              <div className="hidden md:block border-t md:border-t-0 md:border-l border-slate-200 bg-gradient-to-b from-blue-50/60 via-white to-white">
                <div className="px-6 py-5">
                  <div className="text-base font-semibold text-slate-900 mb-2">{t('home.questions') || 'Questions'}</div>
                  {questions.length === 0 ? (
                    <div className="text-sm text-slate-500">{t('gamePublic.emptyQuestions')}</div>
                  ) : (
                    <ul className="space-y-3">
                      {questions.map((q, idx) => (
                        <li key={String(q.uuid || idx)} className={`flex items-start gap-3 rounded-xl bg-white border border-slate-200 px-4 py-3 hover:shadow-md transition-all duration-200`}>
                          <span className={`shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${chipGradient} text-white text-xs font-semibold`}>{idx + 1}</span>
                          <span className="text-sm text-slate-700 truncate">{q.text || t('gamePublic.emptyQuestionDash')}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            {/* Mobile: questions below */}
            <div className="md:hidden p-5 pt-0">
              <div className="text-base font-semibold text-slate-900 mb-2">{t('home.questions') || 'Questions'}</div>
              {questions.length === 0 ? (
                <div className="text-sm text-slate-500">{t('gamePublic.emptyQuestions')}</div>
              ) : (
                <ul className="space-y-3">
                  {questions.map((q, idx) => (
                    <li key={String(q.uuid || idx)} className={`flex items-start gap-3 rounded-xl bg-white border border-slate-200 px-4 py-3 hover:shadow-md transition-all duration-200`}>
                      <span className={`shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${chipGradient} text-white text-xs font-semibold`}>{idx + 1}</span>
                      <span className="text-sm text-slate-700 truncate">{q.text || t('gamePublic.emptyQuestionDash')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            </div>
            {/* Copied toast */}
            {copied && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900 text-white px-3 py-1.5 text-sm border border-slate-800 shadow-lg">
                {t('gamePublic.copied')}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
      <HomeGameModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedGame={game}
        newGamePin={newGamePin}
        isStarting={starting}
        onStartGame={startGame}
        onCopyPin={() => navigator.clipboard?.writeText(newGamePin)}
        onCopyLink={() =>
          navigator.clipboard?.writeText(`${window.location.origin}/join/${newGamePin}`)
        }
        showEditButton={false}
      />
    </div>
  );
}

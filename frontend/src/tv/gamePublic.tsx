import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post } from '../api';
import GlobalStyles from '../components/landing/GlobalStyles';
import AnimatedGradientBackground from '../components/landing/AnimatedGradientBackground';
import Header from '../components/landing/Header';
import { useI18n } from '../i18n/I18nProvider';
import { useKeycloak } from '../auth/KeycloakProvider';

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

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    Promise.all([
      get(`/games/${encodeURIComponent(gameId)}/`).then(r => r.data).catch(() => null),
      get(`/tags/game/${encodeURIComponent(gameId)}`).then(r => r.data).catch(() => []),
      get(`/game_question/${encodeURIComponent(gameId)}/`).then(r => r.data).catch(() => []),
    ]).then(([g, tg, qs]) => {
      if (!g) { setError('Game not found'); setLoading(false); return; }
      setGame(g);
      setTags(Array.isArray(tg) ? tg : []);
      setQuestions(Array.isArray(qs) ? qs : []);
      setLoading(false);
    }).catch(() => { setError('Failed to load'); setLoading(false); });
  }, [gameId]);

  const qcount = useMemo(() => questions.length, [questions]);

  const startGame = async () => {
    if (!isAuthenticated) { try { login(); } catch(_) {}; return; }
    if (!game?.uuid) return;
    setStarting(true);
    try {
      const pin = String(Math.floor(10000 + Math.random() * 89999));
      const { data } = await post('/game_instance/', { game_id: game.uuid, game_pin: pin, status: 'created', created_by: userId });
      navigate(`/host/${game.uuid}/instance/${data}/pin/${pin}`);
    } catch (e) {
      setStarting(false);
    }
  };

  const share = async () => {
    try {
      const url = `${window.location.origin}/game/${encodeURIComponent(String(gameId))}`;
      await navigator.clipboard?.writeText(url);
      alert('Link kopiert til utklippstavle');
    } catch (_) {}
  };

  return (
    <>
      <GlobalStyles />
      <AnimatedGradientBackground />
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-3">
          <button onClick={() => navigate('/discover')} className="rounded-lg bg-white border-2 border-blue-300 px-3 py-2 text-blue-700 text-sm font-semibold shadow hover:bg-blue-50 transition">← Tilbake</button>
        </div>
        {loading ? (
          <div className="text-gray-600">{t('common.loading') || 'Loading…'}</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="rounded-2xl bg-white/85 border-2 border-blue-200 shadow p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="min-w-0">
                <div className="text-2xl md:text-3xl font-extrabold text-blue-800 break-words">{game?.name}</div>
                {game?.description && <div className="text-gray-700 mt-1 break-words">{game.description}</div>}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>{qcount} {t('home.questions') || 'questions'}</span>
                  {game?.created_at && <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5h-1v6l5 3 .5-.866-4.5-2.634V7z"/></svg>{new Date(game.created_at).toLocaleDateString()}</span>}
                </div>
                {Array.isArray(tags) && tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tags.slice(0, 10).map((tg) => (
                      <span key={tg.slug} className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">{tg.name}</span>
                    ))}
                    {tags.length > 10 && <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-gray-50 text-gray-700 border border-gray-200">+{tags.length - 10}</span>}
                  </div>
                )}
              </div>
              <div className="w-full md:w-auto flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 items-stretch sm:items-center md:justify-end">
                {/* Share toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button title="Kopier" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/g/${encodeURIComponent(String(gameId))}`)} className="rounded-full p-2 border border-blue-200 text-blue-700 hover:bg-blue-50" aria-label="Copy link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 8a5 5 0 015-5h3v2H8a3 3 0 000 6h3v2H8a5 5 0 01-5-5zm10-3h3a5 5 0 010 10h-3v-2h3a3 3 0 000-6h-3V5z"/></svg>
                  </button>
                  <button title="Del på X" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}/g/${encodeURIComponent(String(gameId))}`)}&text=${encodeURIComponent(game?.name || 'Quiz')}`,'_blank','noopener,noreferrer')} className="rounded-full p-2 border border-blue-200 text-blue-700 hover:bg-blue-50" aria-label="Share on X">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3l8.5 9.5L3 21h2.5L13 13.5 19.5 21H21l-8.5-9.5L21 3h-2.5L11 10.5 4.5 3H3z"/></svg>
                  </button>
                  <button title="Del på Facebook" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/g/${encodeURIComponent(String(gameId))}`)}`,'_blank','noopener,noreferrer')} className="rounded-full p-2 border border-blue-200 text-blue-700 hover:bg-blue-50" aria-label="Share on Facebook">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.6 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.4 3h-1.8v7A10 10 0 0022 12z"/></svg>
                  </button>
                  <button title="Del på LinkedIn" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/g/${encodeURIComponent(String(gameId))}`)}`,'_blank','noopener,noreferrer')} className="rounded-full p-2 border border-blue-200 text-blue-700 hover:bg-blue-50" aria-label="Share on LinkedIn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.1h.1c.5-1 1.7-2.1 3.6-2.1 3.9 0 4.6 2.6 4.6 6V23h-4v-6.6c0-1.6 0-3.6-2.2-3.6-2.3 0-2.7 1.7-2.7 3.5V23h-4V8z"/></svg>
                  </button>
                  {/* Native share if available */}
                  {'share' in navigator && (
                    <button title="Del" onClick={() => navigator.share?.({ title: game?.name || 'Quiz', url: `${window.location.origin}/g/${encodeURIComponent(String(gameId))}` }).catch(() => {})} className="rounded-full p-2 border border-blue-200 text-blue-700 hover:bg-blue-50" aria-label="Share">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8a3 3 0 10-2.83-4H15a3 3 0 102.83 4H18zM6 14a3 3 0 10-2.83 4H3a3 3 0 102.83-4H6zm12 0a3 3 0 10-2.83 4H15a3 3 0 102.83-4H18zM7.2 13.2l8.6-4.3-.9-1.8-8.6 4.3.9 1.8zm0 4.6l8.6-4.3-.9-1.8-8.6 4.3.9 1.8z"/></svg>
                    </button>
                  )}
                </div>
                <button onClick={startGame} className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-white text-sm font-bold shadow hover:scale-105 transition" disabled={starting}>{starting ? (t('home.starting') || 'Starting…') : (t('home.startGame') || 'Start game')}</button>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-base font-semibold text-blue-800 mb-2">{t('home.questions') || 'Questions'}</div>
              {questions.length === 0 ? (
                <div className="text-sm text-gray-600">Ingen spørsmål enda.</div>
              ) : (
                <ul className="space-y-2">
                  {questions.map((q, idx) => (
                    <li key={String(q.uuid || idx)} className="text-sm text-gray-800 flex gap-2 min-w-0">
                      <span className="text-blue-600 font-semibold shrink-0">{idx + 1}.</span>
                      <span className="truncate">{q.text || '—'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

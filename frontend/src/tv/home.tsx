import { Game, Spinner } from "./selectGame";
import Modal from "react-modal";
import { useEffect, useState } from "react";
import styled from "styled-components";
import randomstring from 'randomstring';
import { get, post, put } from "../api";
import placeholderImg from "../images/tavl-placeholder.jpg";
import GlobalStyles from '../components/landing/GlobalStyles';
import ParallaxOrbs from '../components/ParallaxOrbs';
import ParallaxScroll from '../components/ParallaxScroll';
import Header from '../components/landing/Header';
import Footer from '../components/Footer';
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "../auth/KeycloakProvider";
import { upgrades } from "../data/upgrades";
import { useI18n } from "../i18n/I18nProvider";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const { username, userId, isPremium } = useKeycloak();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<String>();

  const [watingForCreateGame, setWaitingForCreateGame] = useState(false);
  const [newGamePin, setNewGamePin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [games, setGames] = useState<Array<Game>>()
  const [deletedGames, setDeletedGames] = useState<Array<Game>>([])
  const [showTrash, setShowTrash] = useState(false)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getCover = (g: any) => {
    const url = (g as any)?.cover_image_url;
    return url && typeof url === 'string' && url.length > 0 ? url : placeholderImg;
  };

  useEffect(() => {
    console.log('userId changed:', userId);
    if (userId) {
      getGamesForUserId(userId);
    }
  }, [userId]);

  const getGamesForUserId = (id: String) => {
    get(`/games/`)
      .then(res => {
        setLoading(false);
        if (res.data) {
          setGames(res.data);
        }
        else {
          setError(true);
        }
      })
      .catch(err => {
        console.log("Error when getting games for user");
        setLoading(false);
        setError(true);
      });
  }



  const createNewGameInstance = (gameId: String, gamePin: String) => {
    setWaitingForCreateGame(true);
    post(`/game_instance/`, {
      game_id: gameId,
      game_pin: gamePin,
      status: 'created',
      created_by: userId
    })
      .then(res => {
        console.log('gameInstanceId:', res.data);

        setWaitingForCreateGame(false);
        navigate(`/host/${gameId}/instance/${res.data}/pin/${gamePin}`);
      })
      .catch(err => {
        console.log("Something fishy is going on");
        //seterror(true);
        setWaitingForCreateGame(false);
      });

  }

  const loadDeletedGames = () => {
    get(`/games/trash`).then(res => setDeletedGames(res.data || [])).catch(() => setDeletedGames([]))
  }

  const restoreGame = (selector: String) => {
    put(`/games/${selector}/restore`).then(() => { loadDeletedGames(); getGamesForUserId(userId || ''); })
  }

  // Example: games with favorite/popular flags (replace with real data)
  const [favoriteGames, setFavoriteGames] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [playedGames, setPlayedGames] = useState<any[]>([]);
  const [playedLoading, setPlayedLoading] = useState(false);
  const popularGames = games?.filter(game => game.popular);
  const filteredGames = games?.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tabs state and derived datasets
  const [activeTab, setActiveTab] = useState<'mine' | 'favorites' | 'played' | 'trash'>('mine');
  const totalPlays = (games || []).reduce((acc: number, g: any) => acc + (g.plays ?? g.playthroughs ?? 0), 0);

  useEffect(() => {
    if (activeTab === 'trash') {
      loadDeletedGames();
    }
    if (activeTab === 'favorites' && userId) {
      setFavoritesLoading(true);
      get('/favorites/details')
        .then(res => {
          setFavoriteGames(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setFavoriteGames([]))
        .finally(() => setFavoritesLoading(false));
    }
    if (activeTab === 'played' && userId) {
      setPlayedLoading(true);
      get('/games/recent-played')
        .then(res => {
          setPlayedGames(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setPlayedGames([]))
        .finally(() => setPlayedLoading(false));
    }
  }, [activeTab, userId]);

  return (
    <>
      <div className="relative pt-20 min-h-screen bg-[#1e1b4b] text-white overflow-hidden" style={{ fontFamily: 'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
        <GlobalStyles />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.35)_0%,transparent_60%),linear-gradient(to_bottom_right,#4f46e5,#9333ea,#ec4899)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse-slow" />
        <ParallaxOrbs />
        <ParallaxScroll />
      
      {/* Profile + Quick Nav */}
      <div className="mx-auto max-w-6xl px-6 mt-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6">
            <div className="text-xl font-bold mb-1">{t('home.welcome', { username: username || '' }) || `Velkommen, ${username}!`}</div>
            <div className="text-white/80 mb-4">{isPremium ? 'Premium' : 'Standard'}</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-2xl font-extrabold">{games?.length ?? 0}</div>
                <div className="text-xs text-white/70">Quizer</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-2xl font-extrabold">{favoriteGames?.length ?? 0}</div>
                <div className="text-xs text-white/70">Favoritter</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-2xl font-extrabold">{totalPlays}</div>
                <div className="text-xs text-white/70">Spillinger</div>
              </div>
            </div>
            {!isPremium && (
              <button onClick={() => navigate('/purchase')} className="mt-4 w-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white font-semibold shadow hover:shadow-lg active:scale-95 transition">Oppgrader til Premium</button>
            )}
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6 md:col-span-2">
            <div className="text-sm font-semibold mb-3">Navigasjon</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button onClick={() => navigate('/home/create')} className="rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-sm text-white hover:bg-white/20 transition">Lag ny</button>
              <button onClick={() => navigate('/discover')} className="rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-sm text-white hover:bg-white/20 transition">Oppdag</button>
              <button onClick={() => navigate('/billing')} className="rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-sm text-white hover:bg-white/20 transition">Abonnement</button>
              <button onClick={() => setActiveTab('trash')} className="rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-sm text-white hover:bg-white/20 transition">Papirkurv</button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upsell Banner - only show if not premium */}
      {isPremium && (
        <div className="mx-auto max-w-6xl px-6 mt-8">
          <div className="relative w-full rounded-3xl bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.75)_12%,rgba(168,85,247,0.75)_28%,rgba(245,158,11,0.95)_50%,rgba(236,72,153,0.85)_72%,rgba(99,102,241,0.75)_88%,transparent_100%)] p-[2px] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle,rgba(245,158,11,0.25)_0%,rgba(236,72,153,0.2)_35%,rgba(99,102,241,0.2)_65%,transparent_85%)] blur-[28px] opacity-80 -z-10" />
            <div className="relative flex items-center justify-between gap-3 rounded-[2.25rem] bg-white/5 py-3 px-4 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 rounded-[2.25rem] bg-[radial-gradient(60%_60%_at_50%_100%,rgba(236,72,153,0.2),transparent_70%)] -z-10" />
              <div className="pointer-events-none absolute inset-x-4 -top-[1px] -z-20" aria-hidden>
                <div className="h-[2px] w-full bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.85)_12%,rgba(168,85,247,0.85)_28%,rgba(245,158,11,1)_50%,rgba(236,72,153,0.9)_72%,rgba(99,102,241,0.85)_88%,transparent_100%)]" />
                <div className="pointer-events-none absolute -top-3 left-0 right-0 h-10 bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.45)_12%,rgba(168,85,247,0.45)_28%,rgba(245,158,11,0.6)_50%,rgba(236,72,153,0.45)_72%,rgba(99,102,241,0.45)_88%,transparent)] blur-xl" />
              </div>
              <span className="relative text-sm sm:text-base font-semibold text-white/90">
                {t('home.premium.text') || 'Upgrade to Premium – no ads, exclusive upgrades and more features'}
              </span>
              <button
                onClick={() => navigate('/purchase')}
                className="relative ml-2 sm:ml-4 shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white font-bold text-sm shadow hover:shadow-lg active:scale-95 transition"
              >
                {t('profile.subscription.startPremium') || 'Start Premium'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl p-8 shadow-xl bg-white/10 backdrop-blur-md border border-white/10">
         
          {/* Search capsule + view toggle + tabs */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 sm:mb-4">
            <div className="relative flex items-center w-full max-w-3xl">
              <span className="pointer-events-none absolute left-5 text-white/60">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM10 16a6 6 0 110-12 6 6 0 010 12z"/></svg>
              </span>
              <div className="w-full rounded-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 focus-within:ring-4 focus-within:ring-pink-500/30 transition-all">
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={t('home.searchPlaceholder') || 'Finn quizer…'}
                  className="w-full bg-transparent text-white placeholder:text-white/50 outline-none"
                />
              </div>
            </div>
            <div className="inline-flex self-end md:self-auto rounded-xl border border-white/10 overflow-hidden bg-white/10">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-sm font-semibold ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/80'}`} aria-pressed={viewMode === 'grid'}>Cards</button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm font-semibold ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/80'}`} aria-pressed={viewMode === 'list'}>List</button>
            </div>
          </div>
          {/* Tabs */}
          <div className="mb-4 flex items-center gap-2">
            {(['mine','favorites','played','trash'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-3 py-1.5 text-sm border ${activeTab === tab ? 'bg-white/20 text-white border-white/10' : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/15'}`}>
                {tab === 'mine' ? 'Mine' : tab === 'favorites' ? 'Favoritter' : tab === 'played' ? 'Spilte' : 'Papirkurv'}
              </button>
            ))}
          </div>

      {activeTab === 'favorites' && favoritesLoading && (
        <div className="mt-6 flex items-center justify-center">
          <Spinner />
        </div>
      )}

      {activeTab === 'favorites' && !favoritesLoading && favoriteGames && favoriteGames.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
          <div className="text-3xl mb-2">⭐️</div>
          <div className="text-white font-medium mb-1">
            {t('home.favorites.emptyTitle') || 'No favorites yet'}
          </div>
          <div className="text-white/70 mb-4">
            {t('home.favorites.emptySubtitle') || 'Mark quizzes as favorites or browse Discover to find something new.'}
          </div>
          <button
            onClick={() => navigate('/discover')}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white text-sm font-semibold shadow hover:shadow-lg active:scale-95 transition"
          >
            {t('home.favorites.goDiscover') || 'Go to Discover'}
          </button>
        </div>
      )}

      {activeTab === 'favorites' && !favoritesLoading && favoriteGames && favoriteGames.length > 0 && (
            <>
              <div className="text-xl font-semibold text-white mb-2 mt-4">{t('home.favorites') || 'Favorites'}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {favoriteGames.map((game: any, idx: number) => {
                  const creatorProfile = game.creator_profile;
                  const creatorName = creatorProfile?.username || game.creator_username || game.created_by_name || (t('discover.unknownCreator') || 'Unknown');
                  const creatorUserId = creatorProfile?.userId || game.created_by || null;
                  return (
                    <div key={String(game.uuid)} className="rounded-xl p-0 shadow bg-white/10 backdrop-blur-md hover:bg-white/15 transition cursor-pointer border border-white/10 overflow-hidden anim-fadeUp" style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => { setSelectedGameId(game.uuid as any); setModalIsOpen(true) }}>
                    <div className="relative h-32">
                      <img src={getCover(game)} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).qcount || 0} {t('home.questions') || 'questions'}</span>
                        <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).plays ?? (game as any).playthroughs ?? 0} {t('home.plays') || 'plays'}</span>
                        <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).participants ?? 0} {t('home.participants') || 'participants'}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-lg font-bold text-white">{game.name}</div>
                        <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-white/10 text-white border border-white/10">{((game as any).isPublic ?? 0) === 1 ? (t('home.public') || 'Public') : (t('home.private') || 'Private')}</span>
                      </div>
                      <div className="text-sm text-white/80 line-clamp-2 mb-2">{(game as any).description || (t('home.noDescription') || 'No description')}</div>
                      <div className="flex items-center gap-3 text-xs text-white/80 mb-3">
                        <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z" /></svg>{(game as any).qcount || 0} {t('home.questions') || 'questions'}</span>
                        <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 5 0 100 10 5 5 0 000-10z" /></svg>{(game as any).plays ?? (game as any).playthroughs ?? 0} {t('home.plays') || 'plays'}</span>
                        <span className="inline-flex items-center gap-1" title="Participants"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z"/></svg>{(game as any).participants ?? 0}</span>
                        {(game as any).difficulty && (
                          <span className="inline-flex items-center gap-1" title="Difficulty">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12h18v2H3z"/></svg>
                            {String((game as any).difficulty)}
                          </span>
                        )}
                        {(game as any).status && <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17l-5 3 1.9-5.6L4 9h6l2-6 2 6h6l-4.9 5.4L17 20z" /></svg>{(game as any).status}</span>}
                      </div>
                      <div className="text-xs text-white/70 mb-3">
                        {t('home.by', { name: creatorName }) || `By ${creatorName}`}
                        {creatorUserId && (
                          <button
                            className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 bg-white/10 text-[10px] text-white/80 hover:bg-white/15 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/creator/${encodeURIComponent(creatorUserId)}`);
                            }}
                          >
                            {t('home.viewCreator') || 'View creator'}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3l7 7-7 7v-4H3v-6h11V3z"/></svg>
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 px-3 py-1.5 text-sm text-white font-semibold shadow hover:shadow-lg active:scale-95 transition md:px-3 md:py-1.5 md:text-sm" onClick={e => { e.stopPropagation(); setSelectedGameId(game.uuid as any); setModalIsOpen(true); }}>
                          {t('home.startGame') || 'Start game'}
                          <span className="pointer-events-none absolute inset-0 animate-shine" style={{ background: 'linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 100%' }} />
                        </button>
                        <button className="rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-white font-semibold shadow hover:bg-white/20 transition md:px-3 md:py-1.5 md:text-sm" onClick={e => { e.stopPropagation(); navigate('edit/' + (game.uuid as any)); }}>{t('home.edit') || 'Edit'}</button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </>
          )}
      {activeTab === 'played' && playedLoading && (
        <div className="mt-6 flex items-center justify-center">
          <Spinner />
        </div>
      )}

      {activeTab === 'played' && !playedLoading && playedGames && playedGames.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
          <div className="text-3xl mb-2">🕹️</div>
          <div className="text-white font-medium mb-1">{t('home.played.emptyTitle') || 'Ingen spilte quizer ennå'}</div>
          <div className="text-white/70 mb-4">{t('home.played.emptySubtitle') || 'Start et spill fra listen din eller oppdag nye quizer.'}</div>
          <button
            onClick={() => navigate('/discover')}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white text-sm font-semibold shadow hover:shadow-lg active:scale-95 transition"
          >
            {t('home.played.goDiscover') || 'Oppdag quizer'}
          </button>
        </div>
      )}

      {activeTab === 'played' && !playedLoading && playedGames && playedGames.length > 0 && (
            <>
              <div className="text-xl font-semibold text-white mb-2 mt-4">Spilte</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {playedGames.map((game: any, idx: number) => {
                  const creatorProfile = game.creator_profile;
                  const creatorName = creatorProfile?.username || game.creator_username || game.created_by_name || (t('discover.unknownCreator') || 'Unknown');
                  const creatorUserId = creatorProfile?.userId || game.created_by || null;
                  return (
                    <div key={String(game.uuid)} className="rounded-xl p-0 shadow bg-white/10 backdrop-blur-md hover:bg-white/15 transition cursor-pointer border border-white/10 overflow-hidden anim-fadeUp" style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => { setSelectedGameId(game.uuid as any); setModalIsOpen(true) }}>
                    <div className="relative h-32">
                      <img src={getCover(game)} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).qcount || 0} {t('home.questions') || 'questions'}</span>
                        <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).plays ?? (game as any).playthroughs ?? 0} {t('home.plays') || 'plays'}</span>
                        <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).participants ?? 0} {t('home.participants') || 'participants'}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-lg font-bold text-white">{game.name}</div>
                        <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-white/10 text-white border border-white/10">{((game as any).isPublic ?? 0) === 1 ? (t('home.public') || 'Public') : (t('home.private') || 'Private')}</span>
                      </div>
                      <div className="text-sm text-white/80 line-clamp-2 mb-2">{(game as any).description || (t('home.noDescription') || 'No description')}</div>
                      <div className="flex items-center gap-3 text-xs text-white/80 mb-3">
                        <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z" /></svg>{(game as any).qcount || 0} {t('home.questions') || 'questions'}</span>
                        <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 0 100 10 5 5 0 000-10z" /></svg>{(game as any).plays ?? (game as any).playthroughs ?? 0} {t('home.plays') || 'plays'}</span>
                        {game.lastPlayedAt && (
                          <span className="inline-flex items-center gap-1" title={t('home.played.lastPlayed') || 'Sist spilt'}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6v6l3 3 1-1-2.5-2.5V6z" /></svg>
                            {new Date(game.lastPlayedAt).toLocaleString()}
                          </span>
                        )}
                        {(game as any).status && <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17l-5 3 1.9-5.6L4 9h6l2-6 2 6h6l-4.9 5.4L17 20z" /></svg>{(game as any).status}</span>}
                      </div>
                      <div className="text-xs text-white/70 mb-3 flex items-center gap-2">
                        <span>{t('home.by', { name: creatorName }) || `By ${creatorName}`}</span>
                        {creatorUserId && (
                          <button
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 bg-white/10 text-[10px] text-white/80 hover:bg-white/15 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/creator/${encodeURIComponent(creatorUserId)}`);
                            }}
                          >
                            {t('home.viewCreator') || 'View creator'}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3l7 7-7 7v-4H3v-6h11V3z"/></svg>
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white font-semibold shadow hover:shadow-lg active:scale-95 transition text-sm md:px-3 md:py-1.5 md:text-sm" onClick={e => { e.stopPropagation(); setSelectedGameId(game.uuid as any); setModalIsOpen(true); }}>
                          {t('home.startGame') || 'Start game'}
                          <span className="pointer-events-none absolute inset-0 animate-shine" style={{ background: 'linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 100%' }} />
                        </button>
                        <button className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white font-semibold shadow hover:bg-white/20 transition text-sm md:px-3 md:py-1.5 md:text-sm" onClick={e => { e.stopPropagation(); navigate('edit/' + (game.uuid as any)); }}>{t('home.edit') || 'Edit'}</button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </>
      )}

      {activeTab === 'trash' && (
        <div className="rounded-2xl p-6 shadow-xl bg-white/10 backdrop-blur-md border border-white/10">
          <div className="text-xl font-semibold text-white mb-2">Papirkurv</div>
          {deletedGames.length === 0 ? (
            <div className="text-white/70">{t('home.trash.empty') || 'No deleted quizzes'}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deletedGames.map(g => (
                <div key={String((g as any).uuid || (g as any).id)} className="rounded-xl p-6 shadow bg-white/10 backdrop-blur-md border border-white/10">
                  <div className="text-lg font-bold text-white mb-2">{g.name}</div>
                  <div className="text-sm text-white/70 mb-3">{(g as any).qcount || 0} {t('home.questions') || 'questions'}</div>
                  <button className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white font-semibold shadow hover:shadow-lg active:scale-95 transition" onClick={() => restoreGame(((g as any).uuid as any) || (g as any).id)}>{t('home.trash.restore') || 'Restore'}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
          {activeTab === 'mine' && (
          <>
          <div className="text-xl font-semibold text-white mb-4">{t('home.yourGames') || 'Your games'}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center items-center h-32">
                <ListSpinner />
              </div>
            ) : error ? (
              <div className="text-red-500">{t('common.error') || 'An error occurred'}</div>
              ) : (!games || games.length === 0) ? (
              <div className="md:col-span-3">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6 sm:p-8 border border-white/10 text-center shadow">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-2">{t('home.noGames.title') || 'No games yet'}</div>
                  <div className="text-white/70 mb-4 sm:mb-6">{t('home.noGames.subtitle') || 'Create your first quiz or discover examples to get started.'}</div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => navigate('/home/create')} className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-sm text-white font-bold shadow hover:shadow-lg active:scale-95 transition md:px-3 md:py-1.5 md:text-sm">{t('home.create') || 'New quiz'}</button>
                    <button onClick={() => navigate('/discover')} className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white font-semibold shadow border border-white/10 hover:bg-white/20 transition md:px-3 md:py-1.5 md:text-sm">{t('home.discover') || 'Discover'}</button>
                  </div>
                </div>
              </div>
              ) : (filteredGames && filteredGames.length === 0) ? (
              <div className="md:col-span-3 text-center text-gray-600">{t('home.search.noMatches', { term: `«${searchTerm}»` }) || `No results for ${searchTerm}`}</div>
            ) : (
              viewMode === 'grid' ? (
              filteredGames?.map((game, idx) => (
                <div key={String(game.uuid)} className="rounded-xl p-0 shadow bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition cursor-pointer overflow-hidden anim-fadeUp" style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => { setSelectedGameId(game.uuid as any); setModalIsOpen(true) }}>
                  <div className="relative h-32">
                    <img src={getCover(game)} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).qcount || 0} {t('home.questions') || 'questions'}</span>
                      <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).plays ?? (game as any).playthroughs ?? 0} {t('home.plays') || 'plays'}</span>
                      <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).participants ?? 0} {t('home.participants') || 'participants'}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-lg font-bold text-white">{game.name}</div>
                      <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-white/10 text-white border border-white/10">{((game as any).isPublic ?? 0) === 1 ? (t('home.public') || 'Public') : (t('home.private') || 'Private')}</span>
                    </div>
                    <div className="text-sm text-white/80 line-clamp-2 mb-2">{(game as any).description || (t('home.noDescription') || 'No description')}</div>
                    <div className="flex items-center gap-3 text-xs text-white/80 mb-3">
                      <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z" /></svg>{(game as any).qcount || 0} {t('home.questions') || 'questions'}</span>
                      <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 0 100 10 5 5 0 000-10z" /></svg>{(game as any).plays ?? (game as any).playthroughs ?? 0} {t('home.plays') || 'plays'}</span>
                      {(game as any).status && <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17l-5 3 1.9-5.6L4 9h6l2-6 2 6h6l-4.9 5.4L17 20z" /></svg>{(game as any).status}</span>}
                    </div>
                      <div className="text-xs text-white/70 mb-3 flex items-center gap-2">
                        <span>{t('home.by', { name: (game as any).creatorName }) || `By ${(game as any).creatorName}`}</span>
                        {(game as any).creatorUserId && (
                          <button
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 bg-white/10 text-[10px] text-white/80 hover:bg-white/15 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/creator/${encodeURIComponent((game as any).creatorUserId)}`);
                            }}
                          >
                            {t('home.viewCreator') || 'View creator'}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3l7 7-7 7v-4H3v-6h11V3z"/></svg>
                          </button>
                        )}
                      </div>
                    <div className="flex gap-2">
                        <button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white font-semibold shadow hover:shadow-lg active:scale-95 transition text-sm md:px-3 md:py-1.5 md:text-sm" onClick={e => { e.stopPropagation(); setSelectedGameId(game.uuid as any); setModalIsOpen(true); }}>
                          {t('home.startGame') || 'Start game'}
                          <span className="pointer-events-none absolute inset-0 animate-shine" style={{ background: 'linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 100%' }} />
                        </button>
                        <button className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white font-semibold shadow hover:bg-white/20 transition text-sm md:px-3 md:py-1.5 md:text-sm" onClick={e => { e.stopPropagation(); navigate('edit/' + (game.uuid as any)); }}>{t('home.edit') || 'Edit'}</button>
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="md:col-span-3">
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/10 backdrop-blur-md">
                    <div className="divide-y divide-white/10">
                      {filteredGames?.map(game => (
                        <div key={String(game.uuid)} className="p-3 sm:p-4 hover:bg-white/10 transition">
                          <div className="flex items-start justify-between gap-2 sm:gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="text-sm sm:text-lg font-semibold text-white truncate">{game.name}</div>
                                <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-white/10 text-white border border-white/10">{((game as any).isPublic ?? 0) === 1 ? (t('home.public') || 'Public') : (t('home.private') || 'Private')}</span>
                              </div>
                              <div className="hidden sm:block text-xs sm:text-sm text-white/80 line-clamp-2">{(game as any).description || (t('home.noDescription') || 'No description')}</div>
                              <div className="hidden sm:flex mt-1 items-center gap-4 text-xs text-white/80">
                                <span className="inline-flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>{(game as any).qcount || 0} {t('home.questions') || 'questions'}</span>
                                <span className="inline-flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 5 0 100 10 5 5 0 000-10z"/></svg>{(game as any).plays ?? (game as any).playthroughs ?? 0} {t('home.plays') || 'plays'}</span>
                                {(game as any).status && <span className="inline-flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17l-5 3 1.9-5.6L4 9h6l2-6 2 6h6l-4.9 5.4L17 20z"/></svg>{(game as any).status}</span>}
                              </div>
                              <div className="hidden sm:block mt-1 text-xs text-white/70">{t('home.by', { name: (game as any).created_by_name }) || `By ${(game as any).created_by_name}`}</div>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              <button className="rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm text-white font-semibold shadow hover:shadow-lg active:scale-95 transition" onClick={() => { setSelectedGameId(game.uuid as any); setModalIsOpen(true); }}>{t('home.startGame') || 'Start game'}</button>
                              <button className="hidden sm:inline-flex rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-white text-sm font-semibold shadow hover:bg-white/20 transition" onClick={() => navigate('edit/' + (game.uuid as any))}>{t('home.edit') || 'Edit'}</button>
                            </div>
                          </div>
                        </div>
                ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
          </>
          )}
        </div>
      </div>
      {/* Modal for game options */}
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={() => {
          setNewGamePin(randomstring.generate({
            charset: ['numeric'],
            readable: true,
            length: 5
          }))
        }}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: {
            position: 'fixed',
            top: 0 + '82px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
          },
          content: {
            top: '45%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            fontFamily: "Coll",
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            width: '90%',
            maxWidth: '720px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
          },
        }}
        contentLabel="Game options"
      >
        {(() => {
          const g = games?.find(game => game.uuid === selectedGameId) as any;
          if (!g) return null;
          const isPublic = (g.isPublic ?? 0) === 1;
          return (
            <div className="flex flex-col gap-5">
              {/* Header / Cover */}
              <div className="relative h-40 rounded-xl overflow-hidden">
                <img src={getCover(g)} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{g.qcount || 0} {t('home.questions') || 'questions'}</span>
                  <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(g as any).plays ?? g.playthroughs ?? 0} {t('home.plays') || 'plays'}</span>
                </div>
              </div>

              {/* Essentials */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-2xl font-bold text-white">{g.name}</div>
                  <div className="text-white/80">{t('home.by', { name: g.created_by_name || '—' }) || `By ${g.created_by_name || '—'}`}</div>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-white/10 text-white border border-white/10`}>{isPublic ? (t('home.public') || 'Public') : (t('home.private') || 'Private')}</span>
              </div>
{g.description && <div className="text-white/90">{g.description}</div>}
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
                <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z" /></svg>{g.qcount || 0} {t('home.questions') || 'questions'}</span>
                <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 0 100 10 5 5 0 000-10z" /></svg>{(g as any).plays ?? g.playthroughs ?? 0} {t('home.plays') || 'plays'}</span>
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
                <button className="relative overflow-hidden flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-3 text-lg font-bold text-white shadow-xl hover:shadow-2xl active:scale-95 transition disabled:opacity-60 md:px-5 md:py-2.5 md:text-base" onClick={() => createNewGameInstance(selectedGameId || '0', newGamePin)} disabled={watingForCreateGame}>
                  {watingForCreateGame ? (t('home.starting') || 'Starting…') : (t('home.startGame') || 'Start game')}
                  <span className="pointer-events-none absolute inset-0 animate-shine" style={{ background: 'linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 100%' }} />
                </button>
                <button className="rounded-xl bg-white/10 px-4 py-3 text-white font-semibold shadow border border-white/10 hover:bg-white/20 transition md:px-3 md:py-2 md:text-sm" onClick={() => navigate('edit/' + selectedGameId)}>{t('home.edit') || 'Edit'}</button>
                <button className="rounded-xl bg-white/10 px-4 py-3 text-white font-semibold shadow border border-white/10 hover:bg-white/20 transition md:px-3 md:py-2 md:text-sm" onClick={() => setModalIsOpen(false)}>{t('common.close') || 'Close'}</button>
              </div>

              {/* Hint */}
              <div className="text-xs text-gray-700">{t('home.hint') || 'Upgrades are available in-game. Premium gives more options.'}</div>
            </div>
          );
        })()}
      </Modal>
      
      <Footer />
      </div>
    </>
  );
};

export default Home;

// Spinner variant for light backgrounds
const ListSpinner = styled(Spinner)`
  border: 3px solid rgba(59,130,246,.25);
  border-top-color: #3b82f6;
`;

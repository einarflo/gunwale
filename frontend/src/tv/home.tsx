import { Game, Spinner } from "./selectGame";
import Modal from "react-modal";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import randomstring from 'randomstring';
import { get, post, put } from "../api";
import GlobalStyles from '../components/landing/GlobalStyles';
import AnimatedGradientBackground from '../components/landing/AnimatedGradientBackground';
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "../auth/KeycloakProvider";
import { upgrades } from "../data/upgrades";

const Home = () => {
  const navigate = useNavigate();

  const { username, userId } = useKeycloak();

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

  const placeholderUrls = useMemo(
    () => [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80',
    ],
    []
  );
  const getPlaceholder = (g: any) => {
    const key = String(g?.uuid || g?.id || g?.name || '0');
    let sum = 0;
    for (let i = 0; i < key.length; i++) sum = (sum + key.charCodeAt(i)) % 997;
    return placeholderUrls[sum % placeholderUrls.length];
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
  const favoriteGames = games?.filter(game => game.favorite);
  const popularGames = games?.filter(game => game.popular);
  const filteredGames = games?.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

    return (
    <>
      <GlobalStyles />
      <AnimatedGradientBackground />
      {/* Premium Upsell Banner - now a full-width bar under header */}
      <div className="w-full sticky top-0 z-20">
        <div
          className="w-full flex items-center justify-center gap-4 py-3 px-4 bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 border-b-2 border-blue-400 shadow-lg relative cursor-pointer" >
          <span className="inline-block rounded-full  px-3 py-1 text-base font-bold text-white shadow mr-2 bg-gradient-to-r from-purple-500 to-pink-500 ">Premium</span>
          <span className="text-base font-semibold text-gray-900">Upgrade to Premium – no ads, exclusive upgrades and more features</span>
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="glass rounded-3xl p-8 shadow-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="text-3xl font-bold text-gray-800">Velkommen, {username}!</div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <button
                onClick={() => navigate("/home/create")}
                className="rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-3 text-lg text-white font-extrabold shadow-xl hover:scale-105 transition-all border-2 border-blue-400 focus:ring-4 focus:ring-blue-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                New quiz
              </button>
              <button
                onClick={() => navigate("/home/discover")}
                className="rounded-xl bg-gradient-to-r from-blue-400 via-pink-400 to-purple-500 px-6 py-3 text-lg text-white font-bold shadow-lg hover:scale-105 transition-all border-2 border-blue-400 focus:ring-4 focus:ring-purple-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Discover
              </button>
            </div>
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-4">Søk</div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Søk etter quiz..."
            className="w-full mb-6 px-4 py-2 rounded-xl border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          />
          {favoriteGames && favoriteGames.length > 0 && (
            <>
              <div className="text-xl font-semibold text-purple-700 mb-2 mt-4">Favoritter</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {favoriteGames.map(game => (
                  <div key={String(game.uuid)} className="glass rounded-xl p-0 shadow bg-purple-50 hover:shadow-lg transition cursor-pointer border-2 border-purple-300 overflow-hidden" onClick={() => {setSelectedGameId(game.uuid as any); setModalIsOpen(true)}}>
                    <div className="relative h-32">
                      <img src={getPlaceholder(game)} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).qcount || 0} spørsmål</span>
                        <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).playthroughs ?? 0} spillinger</span>
                      </div>
                    </div>
                    <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-lg font-bold text-purple-700">{game.name}</div>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${((game as any).isPublic ?? 0) === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{((game as any).isPublic ?? 0) === 1 ? 'Offentlig' : 'Privat'}</span>
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2 mb-2">{(game as any).description || 'Ingen beskrivelse'}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>{(game as any).qcount || 0} spørsmål</span>
                      <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 0 100 10 5 5 0 000-10z"/></svg>{(game as any).playthroughs ?? 0} spillinger</span>
                      {(game as any).status && <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17l-5 3 1.9-5.6L4 9h6l2-6 2 6h6l-4.9 5.4L17 20z"/></svg>{(game as any).status}</span>}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">Av {game.created_by_name}</div>
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-white font-semibold shadow hover:scale-105 transition" onClick={e => { e.stopPropagation(); setSelectedGameId(game.uuid as any); setModalIsOpen(true); }}>Start spill</button>
                      <button className="rounded-lg bg-white border-2 border-purple-300 px-4 py-2 text-purple-700 font-semibold shadow hover:bg-purple-50 transition" onClick={e => {e.stopPropagation(); navigate('edit/' + (game.uuid as any));}}>Rediger</button>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {popularGames && popularGames.length > 0 && (
            <>
              <div className="text-xl font-semibold text-yellow-700 mb-2 mt-4">Populære</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {popularGames.map(game => (
                  <div key={String(game.uuid)} className="glass rounded-xl p-0 shadow bg-yellow-50 hover:shadow-lg transition cursor-pointer border-2 border-yellow-300 overflow-hidden" onClick={() => {setSelectedGameId(game.uuid as any); setModalIsOpen(true)}}>
                    <div className="relative h-32">
                      <img src={getPlaceholder(game)} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/30 to-transparent" />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).qcount || 0} spørsmål</span>
                        <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).playthroughs ?? 0} spillinger</span>
                      </div>
                    </div>
                    <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-lg font-bold text-yellow-700">{game.name}</div>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${((game as any).isPublic ?? 0) === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{((game as any).isPublic ?? 0) === 1 ? 'Offentlig' : 'Privat'}</span>
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-2 mb-2">{(game as any).description || 'Ingen beskrivelse'}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>{(game as any).qcount || 0} spørsmål</span>
                      <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 0 100 10 5 5 0 000-10z"/></svg>{(game as any).playthroughs ?? 0} spillinger</span>
                      {(game as any).status && <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17l-5 3 1.9-5.6L4 9h6l2-6 2 6h6l-4.9 5.4L17 20z"/></svg>{(game as any).status}</span>}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">Av {game.created_by_name}</div>
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-gradient-to-r from-yellow-500 to-pink-500 px-4 py-2 text-white font-semibold shadow hover:scale-105 transition" onClick={e => { e.stopPropagation(); setSelectedGameId(game.uuid as any); setModalIsOpen(true); }}>Start spill</button>
                      <button className="rounded-lg bg-white border-2 border-yellow-300 px-4 py-2 text-yellow-700 font-semibold shadow hover:bg-yellow-50 transition" onClick={e => {e.stopPropagation(); navigate('edit/' + (game.uuid as any));}}>Rediger</button>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="text-xl font-semibold text-gray-700 mb-4">Dine spill</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center items-center h-32">
                <ListSpinner />
              </div>
            ) : error ? (
              <div className="text-red-500">En feil oppstod</div>
            ) : (!games || games.length === 0) ? (
              <div className="md:col-span-3">
                <div className="rounded-2xl bg-white/90 p-8 border-2 border-blue-200 text-center shadow">
                  <div className="text-2xl font-bold text-blue-800 mb-2">Ingen spill enda</div>
                  <div className="text-gray-600 mb-6">Lag din første quiz eller oppdag eksempler for å komme i gang.</div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => navigate('/home/create')} className="rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-3 text-white font-bold shadow hover:scale-105 transition">Opprett ny quiz</button>
                    <button onClick={() => navigate('/home/discover')} className="rounded-xl bg-white px-6 py-3 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">Oppdag quizer</button>
                  </div>
                </div>
              </div>
            ) : (filteredGames && filteredGames.length === 0) ? (
              <div className="md:col-span-3 text-center text-gray-600">Ingen treff for «{searchTerm}». Tøm søk eller opprett en ny quiz.</div>
            ) : (
              filteredGames?.map(game => (
                <div key={String(game.uuid)} className="glass rounded-xl p-0 shadow bg-white hover:shadow-lg transition cursor-pointer overflow-hidden" onClick={() => {setSelectedGameId(game.uuid as any); setModalIsOpen(true)}}>
                  <div className="relative h-32">
                    <img src={getPlaceholder(game)} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).qcount || 0} spørsmål</span>
                      <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{(game as any).playthroughs ?? 0} spillinger</span>
                    </div>
                  </div>
                  <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-lg font-bold text-blue-700">{game.name}</div>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${((game as any).isPublic ?? 0) === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{((game as any).isPublic ?? 0) === 1 ? 'Offentlig' : 'Privat'}</span>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2 mb-2">{(game as any).description || 'Ingen beskrivelse'}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                    <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>{(game as any).qcount || 0} spørsmål</span>
                    <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 0 100 10 5 5 0 000-10z"/></svg>{(game as any).playthroughs ?? 0} spillinger</span>
                    {(game as any).status && <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17l-5 3 1.9-5.6L4 9h6l2-6 2 6h6l-4.9 5.4L17 20z"/></svg>{(game as any).status}</span>}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">Av {game.created_by_name}</div>
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-white font-semibold shadow hover:scale-105 transition" onClick={e => { e.stopPropagation(); setSelectedGameId(game.uuid as any); setModalIsOpen(true); }}>Start spill</button>
                    <button className="rounded-lg bg-white border-2 border-blue-300 px-4 py-2 text-blue-700 font-semibold shadow hover:bg-blue-50 transition" onClick={e => {e.stopPropagation(); navigate('edit/' + (game.uuid as any));}}>Rediger</button>
                  </div>
                  </div>
                </div>
              ))
            )}
          </div>
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
            fontFamily: "Coll",
            background: 'linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%)',
            width: '90%',
            maxWidth: '720px',
            boxShadow: '0 8px 32px rgba(59,130,246,0.15)'
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
                <img src={getPlaceholder(g)} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{g.qcount || 0} spørsmål</span>
                  <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">{g.playthroughs ?? 0} spillinger</span>
                </div>
              </div>

              {/* Essentials */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-2xl font-bold text-blue-900">{g.name}</div>
                  <div className="text-gray-700">Av {g.created_by_name || '—'}</div>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{isPublic ? 'Offentlig' : 'Privat'}</span>
              </div>
              {g.description && <div className="text-gray-800">{g.description}</div>}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
                <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>{g.qcount || 0} spørsmål</span>
                <span className="inline-flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 0 100 10 5 5 0 000-10z"/></svg>{g.playthroughs ?? 0} spillinger</span>
              </div>

              {/* PIN + Actions */}
              <div className="rounded-2xl bg-white/80 p-4 border-2 border-purple-200 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-700">PIN</div>
                  <div className="text-3xl font-extrabold text-purple-700">{newGamePin}</div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-white border-2 border-purple-300 px-3 py-1 text-purple-700 text-sm font-semibold shadow hover:bg-purple-50 transition" onClick={() => navigator.clipboard?.writeText(newGamePin)}>Kopier PIN</button>
                  <button className="rounded-lg bg-white border-2 border-blue-300 px-3 py-1 text-blue-700 text-sm font-semibold shadow hover:bg-blue-50 transition" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/join/${newGamePin}`)}>Kopier lenke</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-lg font-bold text-white shadow-xl hover:scale-105 transition disabled:opacity-60" onClick={() => createNewGameInstance(selectedGameId || '0', newGamePin)} disabled={watingForCreateGame}>
                  {watingForCreateGame ? 'Starter…' : 'Start spill'}
                </button>
                <button className="rounded-xl bg-white px-4 py-3 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition" onClick={() => navigate('edit/' + selectedGameId)}>Rediger</button>
                <button className="rounded-xl bg-white px-4 py-3 text-gray-700 font-semibold shadow border-2 border-gray-200 hover:bg-gray-50 transition" onClick={() => setModalIsOpen(false)}>Lukk</button>
              </div>

              {/* Hint */}
              <div className="text-xs text-gray-700">Upgrades er tilgjengelige i spillet. Premium gir flere muligheter.</div>
            </div>
          );
        })()}
      </Modal>
      <div className="mx-auto max-w-6xl px-6 py-6">
        <button
          onClick={() => { const ns = !showTrash; setShowTrash(ns); if (ns) loadDeletedGames(); }}
          className="rounded-xl bg-white px-5 py-2 text-gray-700 font-semibold shadow border-2 border-gray-200 hover:bg-gray-50 transition"
        >
          {showTrash ? 'Skjul papirkurv' : 'Vis papirkurv'}
        </button>
        {showTrash && (
          <div className="mt-4">
            <div className="text-lg font-semibold text-gray-700 mb-2">Slettede quizer</div>
            {deletedGames.length === 0 ? (
              <div className="text-gray-500">Ingen slettede quizer</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deletedGames.map(g => (
                  <div key={String(g.uuid || g.id)} className="glass rounded-xl p-6 shadow bg-white border-2 border-gray-200">
                    <div className="text-lg font-bold text-blue-700 mb-2">{g.name}</div>
                    <div className="text-sm text-gray-500 mb-1">{(g as any).qcount || 0} spørsmål</div>
                    <button className="rounded-lg bg-green-600 px-4 py-2 text-white font-semibold shadow hover:scale-105 transition" onClick={() => restoreGame((g.uuid as any) || g.id)}>Gjenopprett</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

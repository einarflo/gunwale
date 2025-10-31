import { useEffect, useState } from 'react';
import { SocketProvider } from './context/SocketContext';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import GamePin from './signin/gamepin';
import Username from './signin/username';
import PhoneGameView from './phone/game';
import TVView from './tv/selectGame';
import { GameContext } from './GameContext';
import { useKeycloak } from './auth/KeycloakProvider';
import LandingPage from './landing-new';
import Authorizing from './components/Authorizing';
import Home from './admin/home';
import CreateGame from './admin/createGame';
import EditGame from './admin/editGame';
import EditQuestion from './admin/editQuestion';
import UpdateGame from './admin/updateGameName';
import Discover from './admin/discover';
import ProfilePage from './admin/profilePage';
import TVGamePlayView from './tv/game';
import UpgradesPage from './admin/upgradesPage';
import GamePublic from './admin/gamePublic';
import CreatorPublic from './admin/creatorPublic';
import { loadPhoneSession, clearPhoneSession } from './storage/session';
import { get } from './api';
import { connectSocket } from './api/socket';
import { useSocket } from './context/SocketContext';
import StripeReturn from './admin/stripeReturn';
import BillingSuccess from './admin/billingSuccess';
import BillingError from './admin/billingError';
import Purchase from './admin/purchase';

const appHeight = () => {
  const doc = document.documentElement
  doc.style.setProperty(' — app-height', `${window.innerHeight}px`)
 }
 window.addEventListener('resize', appHeight)
 appHeight()

const App = () => {
  const navigate = useNavigate();

  // Global state - used in GameContext
  const [nickname, setNickname] = useState<string | undefined>();
  const [gameInstancePlayerId, setGameInstancePlayerId] = useState<string | undefined>();
  const [gamePin, setGamePin] = useState<string | undefined>();
  const [gameId, setGameId] = useState<string | undefined>();
  const [gameInstanceId, setGameInstanceId] = useState<string | undefined>();

  const { keycloak, login, logout } = useKeycloak();
  const { socket } = useSocket();

  // Reconnect prompt state
  const [reconnectOffer, setReconnectOffer] = useState<null | {
    gamePin: string;
    gameId: string;
    gameInstanceId: string;
    username: string;
    points?: number;
    colour?: number;
  }>(null);

  // Minimal auth guard wrapper that triggers Keycloak login when needed
  const RequireAuth = ({ children }: { children: JSX.Element }) => {
    useEffect(() => {
      if (!keycloak?.authenticated) {
        login();
      }
    }, [keycloak?.authenticated]);
    if (!keycloak?.authenticated) {
      return <Authorizing />;
    }
    return children;
  };

  const exitGame = () => {
    setNickname(undefined);
    setGameInstancePlayerId(undefined);
    setGamePin(undefined);
    setGameId(undefined);
    setGameInstanceId(undefined);
    clearPhoneSession();
    navigate('/');
  };

  // Check for resumable session on app load
  useEffect(() => {
    const sess = loadPhoneSession();
    if (!sess) return;
    // Only offer if we don't already have an active phone context
    if (nickname || gameInstancePlayerId || gameId || gameInstanceId) return;
    // Verify game instance still active
    get(`/game_instance/${sess.gamePin}/`)
      .then(res => {
        const data = res.data || {};
        const status = String(data?.status || '');
        if (status && status !== 'finished') {
          setReconnectOffer({
            gamePin: sess.gamePin,
            gameId: sess.gameId,
            gameInstanceId: sess.gameInstanceId,
            username: sess.username,
            points: sess.points,
            colour: sess.colour,
          });
        } else {
          clearPhoneSession();
        }
      })
      .catch(() => {
        // could not validate; ignore
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acceptReconnect = () => {
    if (!reconnectOffer) return;
    const { gamePin: pin, gameId: gid, gameInstanceId: giid, username: uname, points: pts, colour } = reconnectOffer;
    // Seed context
    setGamePin(pin);
    setGameId(gid);
    setGameInstanceId(giid);
    setNickname(uname);
    // Ensure socket connection
    try { if (!socket.connected) connectSocket(); } catch (_) {}
    // Rejoin player in WS and restore score/colour
    socket.emit('join_player', { gameInstanceId: String(giid), gameId: String(gid), username: String(uname) }, (resp: any) => {
      if (resp?.ok && resp.playerId) {
        setGameInstancePlayerId(resp.playerId);
        socket.emit('join_game', String(giid));
        if (typeof colour === 'number') {
          socket.emit('color_update', { gameInstanceId: String(giid), colour });
        }
        if (typeof pts === 'number') {
          socket.emit('score_update', { gameInstanceId: String(giid), score: pts });
        }
        setReconnectOffer(null);
        // Navigate to play
        navigate('/play');
      } else {
        // Failed to rejoin; clear and send to join
        setReconnectOffer(null);
        clearPhoneSession();
        navigate('/join');
      }
    });
  };

  const declineReconnect = () => {
    setReconnectOffer(null);
    clearPhoneSession();
  };

  return (
    <SocketProvider>
    <GameContext.Provider
      value={{
        nickname,
        gameInstancePlayerId,
        gamePin,
        gameId,
        gameInstanceId,
        exitGame: exitGame as () => void
      }}
    >
    {/* Reconnect modal */}
    {reconnectOffer ? (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 380, boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>
          <div style={{ fontFamily: 'Coll', fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Fortsett spill?</div>
          <div style={{ color: '#374151', marginBottom: 16 }}>Vi fant et pågående spill ({reconnectOffer.gamePin}). Vil du fortsette som {reconnectOffer.username}?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={declineReconnect} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '2px solid #e5e7eb', background: '#fff', color: '#111827', cursor: 'pointer' }}>Nei takk</button>
            <button onClick={acceptReconnect} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', color: '#fff', cursor: 'pointer' }}>Fortsett</button>
          </div>
        </div>
      </div>
    ) : null}

    <Routes>
      <Route path="/authorizing" element={<Authorizing />} />
      <Route path="/stripe-return" element={<RequireAuth><StripeReturn /></RequireAuth>} />
      <Route path="/purchase" element={<Purchase />} />
      <Route
        path="/"
        element={
          <LandingPage
            signIn={() => {
              if (keycloak?.authenticated) {
                navigate('/home');
              } else {
                login();
              }
            }}
            playMode={() => navigate('/join')}
            setGamePin={() => {}}
          />
        }
      />
      {/* Public routes */}
      <Route path="/discover" element={<Discover />} />
      <Route path="/creator/:userId" element={<CreatorPublic />} />
      <Route path="/game/:gameId" element={<GamePublic />} />

      <Route path="/home" element={
        <RequireAuth>
          <TVView
            username={keycloak?.tokenParsed?.preferred_username || ''}
            logout={() => {
              logout();
              navigate('/');
            }}
          />
        </RequireAuth>
      }>
        <Route index element={<Home />} />
        <Route path="upgrades" element={<UpgradesPage />} />
        <Route path="create" element={<CreateGame />} />
        <Route path="edit/:gameId" element={<EditGame />} />
        <Route path="edit/:gameId/question/:questionId" element={<EditQuestion />} />
        <Route path="update/:gameId" element={<UpdateGame />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="billing/success" element={<BillingSuccess />} />
        <Route path="billing/error" element={<BillingError />} />
      </Route>
      <Route path="host/:gameId/instance/:gameInstanceId/pin/:gamePin" element={
        <RequireAuth>
          <TVGamePlayView stopGame={() => navigate('/home')}/>
        </RequireAuth>
      } />
      <Route
        path="/join/:gamePin?"
        element={
          <GamePin
            setGamePin={setGamePin}
            setGameId={setGameId}
            setGameInstanceId={setGameInstanceId}
          />
        }
      />
      <Route
        path="/username"
        element={
          gameId && gameInstanceId && gamePin ? (
            <Username
              setNickname={setNickname}
              setGameInstancePlayerId={setGameInstancePlayerId}
            />
          ) : (
            <Navigate to="/join" replace />
          )
        }
      />
      <Route
        path="/play"
        element={
          nickname && gameInstancePlayerId && gameId && gameInstanceId && gamePin ? (
              <PhoneGameView />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </GameContext.Provider>
    </SocketProvider>
  );
};

export default App;

export interface GameInstancePlayer {
  id: string;
  game_id: string;
  game_instance_id: string;
  username: string;
  score: string;
  colour: string;
  lottery: string;
  spending: string;
}

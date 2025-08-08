import { useEffect, useState } from 'react';
import { SocketProvider } from './context/SocketContext';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { get, post } from './api';
import Status from './components/Status';

import LandingPage from './landing';
import GamePin from './signin/gamepin';
import Username from './signin/username';
import PhoneGameView from './phone/game';
import TVView from './tv/selectGame';
import { UserContext } from './UserContext';
import Login from './auth/Login';
import { useKeycloak } from './auth/KeycloakProvider';

const appHeight = () => {
  const doc = document.documentElement
  doc.style.setProperty(' — app-height', `${window.innerHeight}px`)
 }
 window.addEventListener('resize', appHeight)
 appHeight()

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameid = params.get('gameid');
    if (gameid) {
      setGamePin(gameid);
      navigate('/game');
    }
  }, [navigate]);

  const [username, setUsername] = useState<string | undefined>();
  const [userId, setUserId] = useState<string | undefined>();
  const [gamePin, setGamePin] = useState<string | undefined>();
  const [gameId, setGameId] = useState<string | undefined>();
  const [gameInstanceId, setGameInstanceId] = useState<string | undefined>();

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { keycloak, login, logout } = useKeycloak();

  const setUser = (name: string, pin: string) => {
    setLoading(true);
    if (name && name.length > 1) {
      get(`/game_instance_players/${pin}/?checkUser=true`)
        .then(res => {
          if (res.data) {
            if (res.data.find((player: GameInstancePlayer) => player.username === name)) {
              setError(true);
              setLoading(false);
            } else {
              setError(false);
              insertPlayer(name);
            }
          }
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    } else {
      setError(true);
      setLoading(false);
    }
  };

  const insertPlayer = (name: string) => {
    post(
      `/game_instance_players/`,
      {
        game_id: gameId,
        game_instance_id: gameInstanceId,
        username: name,
        score: '0'
      },
      { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    )
      .then(res => {
        setUserId(res.data);
        setUsername(name);
        setLoading(false);
        navigate('/play');
      })
      .catch(() => {
        console.log('Something fishy is going on');
        setLoading(false);
      });
  };

  const setPin = (pin: string | undefined) => {
    if (pin && pin.length > 0 && pin !== '0') {
      setLoading(true);
      get(`/game_instance/${pin}/`)
        .then(res => {
          if (res.data && res.data['status'] === 'created') {
            setGameId(res.data['game_id']);
            setGameInstanceId(res.data['id']);
            setGamePin(pin);
            setError(false);
            setLoading(false);
            navigate('/username');
          } else {
            setError(true);
            setLoading(false);
          }
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    } else {
      setError(true);
    }
  };

  return (
    <SocketProvider>
    <Status loading={loading} error={error} />
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            toGameMode={() => navigate('/tv/login')}
            toEditMode={() => navigate('/game')}
          />
        }
      />
      <Route path="/tv/login" element={<Login />} />
      <Route
        path="/tv"
        element={
          keycloak?.authenticated && keycloak.hasRealmRole('premium') ? (
            <TVView
              username={keycloak.tokenParsed?.preferred_username || ''}
              logout={() => {
                logout();
                navigate('/');
              }}
            />
          ) : (
            <Navigate to="/tv/login" replace />
          )
        }
      />
      <Route
        path="/game"
        element={
          <GamePin
            error={error}
            loading={loading}
            setPin={setPin}
            toCreatorMode={() => navigate('/tv/login')}
          />
        }
      />
      <Route
        path="/username"
        element={
          gameId && gameInstanceId && gamePin ? (
            <Username
              error={error}
              loading={loading}
              setName={user => setUser(user || '', gamePin)}
            />
          ) : (
            <Navigate to="/game" replace />
          )
        }
      />
      <Route
        path="/play"
        element={
          username && userId && gameId && gameInstanceId && gamePin ? (
            <UserContext.Provider
              value={{
                username,
                userId,
                setUsername: setUsername as (name?: string) => void,
                setUserId: setUserId as (id?: string) => void
              }}
            >
              <PhoneGameView
                gameId={gameId}
                gamePin={gamePin}
                gameInstanceId={gameInstanceId}
                logout={() => {
                  setUsername(undefined);
                  setUserId(undefined);
                  setGamePin(undefined);
                  navigate('/');
                }}
              />
            </UserContext.Provider>
          ) : (
            <Navigate to="/game" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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


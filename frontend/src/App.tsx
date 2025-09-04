import { useState } from 'react';
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
import Home from './tv/home';
import CreateGame from './tv/createGame';
import EditGame from './tv/editGame';
import EditQuestion from './tv/editQuestion';
import UpdateGame from './tv/updateGameName';
import ProfilePage from './tv/profilePage';

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

  const exitGame = () => {
    setNickname(undefined);
    setGameInstancePlayerId(undefined);
    setGamePin(undefined);
    setGameId(undefined);
    setGameInstanceId(undefined);
    navigate('/');
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
    <Routes>
      <Route path="/authorizing" element={<Authorizing />} />
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
      <Route path="/home" element={
        keycloak?.authenticated ? (
          <TVView
            username={keycloak.tokenParsed?.preferred_username || ''}
            logout={() => {
              logout();
              navigate('/');
            }}
          />
        ) : (
          <Navigate to="/" replace />
        )
      }>
        <Route index element={<Home edit={() => {}} startGame={() => {}} />} />
        <Route path="create" element={<CreateGame />} />
        <Route path="edit/:gameId" element={<EditGame />} />
        <Route path="edit/:gameId/question/:questionId" element={<EditQuestion />} />
        <Route path="update/:gameId" element={<UpdateGame />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
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


import { useContext, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Question } from "../tv/game";
import Alts from "./alts";
import Result from "./result";
import whiteLogo from '../images/tavl-white.png';
import { Logo } from "../Splash";
import logo from '../images/tavl-logo.png';
import Waiting, { selectableColors, textColors, animatedColorIndices, MULTICOLOR_INDEX } from "./waiting";
import { MobileNav } from "../landing";
import TopRightPoints from "../components/TopRightPoints";
import { GameContext } from "../GameContext";
import { get } from "../api";
import { updatePhoneSession, loadPhoneSession } from "../storage/session";
//import Waiting from "./waiting";
import { useWakeLock } from 'react-screen-wake-lock';
import { useSocket } from "../context/SocketContext";
import { useI18n } from "../i18n/I18nProvider";
import { useNavigate } from "react-router-dom";

const PhoneGameView = () => {
  const { gameId, gamePin, gameInstanceId, gameInstancePlayerId, exitGame } = useContext(GameContext);
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { t } = useI18n();

  // Maybe get user from session storage? and some way to reset it
  const [points, setPoints] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [placement, setPlacement] = useState<{ rank: number; total: number } | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [answered, setAnswered] = useState(true);
  const [questions, setQuestions] = useState<Array<Question>>([]);
  //const [userId, setUserId] = useState('');

  const [fiftyfifty, setFiftyfifty] = useState(false);
  const [stop, setStoptime] = useState(false);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [eye, setEye] = useState(false);
  const [shield, setShield] = useState(false);
  const [slow, setSlow] = useState(false);
  const [endOpponent, setEndOpponent] = useState(false);
  const [nuke, setNuke] = useState(false);

  const [colorForUser, setColorForUser] = useState(0);

  const { request, release } = useWakeLock({

    // TODO: Some indication to the user?

    //onRequest: () => alert('Screen Wake Lock: requested!'),
    //onError: () => alert('An error happened 💥'),
    //onRelease: () => alert('Screen Wake Lock: released!'),

  });



  // Get all questions for the current game Id
  const getQuestionsForGameId = (id: String) => {
    get(`/game_question/${id}/`)
      .then(res => {
        if (res.data) {
          setQuestions(res.data);
      }})
      .catch(err => {
        console.log("Error when getting questions for game with id ", id);
    });
  }

  useEffect(() => {
    if (!gameId) return;
    getQuestionsForGameId(gameId);

    // request wake lock
    request();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Listen for finished status to end game and compute placement
  useEffect(() => {
    if (!gameInstanceId) return;
    const onStatus = (payload: { gameId?: string; status?: string }) => {
      if (payload?.gameId === String(gameInstanceId) && payload?.status === 'finished') {
        setGameEnded(true);
      }
    };
    socket.emit('join_game', String(gameInstanceId));
    socket.on('game_status', onStatus);
    return () => { socket.off('game_status', onStatus); };
  }, [socket, gameInstanceId]);

  // Compute placement by asking server for players when game ends
  useEffect(() => {
    if (!gameEnded) return;
    if (!gameInstanceId) return;
    try {
      socket.emit('join_game', String(gameInstanceId));
      socket.emit('get_players', { gameInstanceId: String(gameInstanceId) }, (resp: any) => {
        if (resp?.ok && Array.isArray(resp.players)) {
          const list = [...resp.players].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
          const idx = list.findIndex((p) => String(p?.id || '') === String(gameInstancePlayerId || ''));
          setPlacement({ rank: idx >= 0 ? idx + 1 : 0, total: list.length });
        }
      });
    } catch (_) {}
  }, [gameEnded, gameInstanceId, gameInstancePlayerId, socket]);

  // Initialize points from saved session (if any)
  useEffect(() => {
    try {
      const sess = loadPhoneSession();
      if (sess && typeof sess.points === 'number') setPoints(sess.points);
      if (sess && typeof sess.colour === 'number') setColorForUser(sess.colour);
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist dynamic session bits for reconnect (points/colour)
  useEffect(() => {
    try { updatePhoneSession({ points }); } catch (_) {}
  }, [points]);

  useEffect(() => {
    try { updatePhoneSession({ colour: colorForUser }); } catch (_) {}
  }, [colorForUser]);

  const setAnswer = () => {
    setAnswered(true);
    setCurrentQ(currentQ + 1)
  }


    /// Implementere 50 / 50 feature 

    // miste 90% poeng, men svare riktig

    // se hva andre har svart 

    // stopp tiden

    // sabotere (bytte rekkefølge, )

    // streak? Kanskje man kan unlocke sabotasje når man får høy streak- som på COD?

    // Bette poeng? eller Geare poenge? eller kjøpe flere poeng (f. eks 10% ekstra poeng)
    // KJøpe lotto, og ha trekning på skjermen: Tall mellom 1-15 kanskje 1000 poeng i premie 

    // second chance

    // stjele poeng fra en annen spiller

    // uno reverse 


    // Waiting for game to start
  if (!gameStarted) {
    return <Waiting points={points} setPoints={setPoints} gameStarted={() => setGameStarted(true)} gamepin={gamePin} colorForUser={colorForUser} setColorForUser={setColorForUser} />
  }

  // view score when timer ends

  // some background music


  // KJøpe lotte

  // Show the questions alternatives and if the answer is correct
  if (!answered && !gameEnded) {
    return <Alts
      question={questions[currentQ]}
      points={points}
      setPoints={(p) => setPoints(p)}
      answered={setAnswer}
      fif={fiftyfifty}
      buyfif={() => setFiftyfifty(false)}
      stop={stop}
      buyStop={() => setStoptime(false)}
      color={colorForUser}
      multiplier={multiplier}
      hasEye={eye}
      hasShield={shield}
      hasSlow={slow}
      hasEndOpponent={endOpponent}
      hasNuke={nuke}
    />
  }

  if (answered && !gameEnded) {
    const hasNext = currentQ < questions.length;
    return <Result
      nextQuestionStarted={() => setAnswered(false)}
      currentQ={currentQ}
      points={points}
      setPoints={(p) => setPoints(p)}
      gameFinished={() => {setGameEnded(true); release()}}
      fif={fiftyfifty}
      buyfif={() => setFiftyfifty(true)}
      stop={stop}
      buyStop={() => setStoptime(true)}
      color={colorForUser}
      hasNext={hasNext}
      hasMultiplier={multiplier > 1}
      hasEye={eye}
      hasShield={shield}
      hasSlow={slow}
      hasEndOpponent={endOpponent}
      hasNuke={nuke}
      buyMultiplier={() => setMultiplier(1.5)}
      buyEye={() => setEye(true)}
      buyShield={() => setShield(true)}
      buySlow={() => setSlow(true)}
      buyEndOpponent={() => setEndOpponent(true)}
      buyNuke={() => setNuke(true)}
    />
  }

  return(
    <GameWrapper>
      <MobileNav>
        <img alt="Tavl logo" className="h-10 mt-5 ml-4" src={logo} />
        <TopRightPoints points={points} color={selectableColors[colorForUser]} textColor={textColors[colorForUser]} animate={animatedColorIndices.has(colorForUser)} multicolor={colorForUser === MULTICOLOR_INDEX}/>
      </MobileNav>
      {gameEnded ? (
        <EndSection>
          { placement && placement.rank <= 3 && 
          <ConfettiLayer>
            {Array.from({ length: 28 }).map((_, i) => {
              const left = (i * (100 / 27));
              const colors = ['#ffffff', '#fde047', '#22d3ee', '#fb7185', '#a78bfa'];
              const size = (i % 3) === 0 ? 8 : 6;
              const delay = (i % 10) * 250;
              const duration = 3200 + (i % 7) * 450;
              return (
                <ConfettiPiece
                  key={`c-${i}`}
                  style={{ left: `${left}%`, background: colors[i % colors.length], width: `${size}px`, height: `${Math.round(size*1.6)}px`, animationDelay: `${delay}ms`, animationDuration: `${duration}ms` }}
                />
              );
            })}
          </ConfettiLayer>
          }
          <CelebrationTitle>
            {placement && placement.rank <= 3 ? (placement.rank === 1 ? '🥇' : placement.rank === 2 ? '🥈' : '🥉') : '🎉'}
            &nbsp;{t('game.over')}
          </CelebrationTitle>
          <PlacementBadge style={{ background: selectableColors[colorForUser], color: textColors[colorForUser] }}>
            {placement ? t('game.placement', { rank: placement.rank, total: placement.total }) : t('game.placement.pending')}
          </PlacementBadge>
          <ButtonRow>
            <ActionButton onClick={() => navigate('/join')}>{t('common.joinAnother')}</ActionButton>
            <GhostButton onClick={() => (exitGame ? exitGame() : navigate('/'))}>{t('common.exit')}</GhostButton>
          </ButtonRow>
          <BottomWatermark src={whiteLogo} alt="tavl" />
        </EndSection>
      ) : (
        <Logo src={whiteLogo}/>
      )}
    </GameWrapper>
  )
}

export const GameWrapper = styled.div.attrs((props: { hasShield?: boolean }) => props)`
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  ${(props) => props.hasShield ? `
    /* Stronger green background with high-contrast base */
    background:
      radial-gradient(circle at 50% 35%, rgba(16,185,129,0.35), transparent 52%),
      radial-gradient(circle at 20% 75%, rgba(16,185,129,0.22), transparent 58%),
      radial-gradient(circle at 82% 30%, rgba(16,185,129,0.20), transparent 62%),
      linear-gradient(180deg, #065f46 0%, #064e3b 100%);
  ` : `
    background: rgb(28,0,65);
    background-image: linear-gradient(180deg, #6A71FA 0%, #9C8AFA 100%);
  `}
`;

export const Header = styled.div`
  height: 90px;
  width: 100vw;
  background: #ffffff;
`;

export const Username = styled.div`
  background: #2d3870;
  margin: 20px;
  border-radius: 5px;
  padding: 10px;
  position: absolute;
  font-weight: bold;
  color: white;
`;

export const Points = styled.div`
  background: #2d3870;
  margin: 20px;
  border-radius: 5px;
  padding: 10px;
  position: absolute;
  font-weight: bold;
  right: 0;
  color: white;
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

export const MobileSpinner = styled.div`
width: 50px;
height: 50px;
margin-left: auto;
margin-right: auto;
left: 50%;
border: 3px solid rgba(255,255,255,.3);
border-radius: 50%;
border-top-color: #fff;
animation: spin 1s ease-in-out infinite;
-webkit-animation: ${rotate} 1s ease-in-out infinite;
`;

const ActionButton = styled.button`
  appearance: none;
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
`;

const GhostButton = styled.button`
  appearance: none;
  border-radius: 12px;
  padding: 10px 14px;
  background: transparent;
  color: #fff;
  font-weight: 800;
  border: 2px solid rgba(255,255,255,0.7);
  cursor: pointer;
`;

// Celebration UI for game end
const EndSection = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  text-align: center;
  min-height: calc(100dvh - 120px);
  padding: 12px 16px 90px;
`;

const CelebrationTitle = styled.div`
  font-family: 'Coll';
  font-weight: 900;
  font-size: 2.4rem;
  margin-bottom: 6px;
  color: #ffffff;
  text-shadow: 0 4px 18px rgba(0,0,0,0.35);
`;

const PlacementBadge = styled.div`
  display: inline-block;
  margin-top: 4px;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 900;
  letter-spacing: 0.3px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const confettiFall = keyframes`
  0% { transform: translateY(-8vh) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(95vh) rotate(540deg); opacity: 1; }
`;

const ConfettiLayer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
`;

const ConfettiPiece = styled.span`
  position: absolute;
  top: -8vh;
  width: 6px;
  height: 12px;
  border-radius: 2px;
  opacity: 0;
  animation-name: ${confettiFall};
  animation-timing-function: linear;
  animation-iteration-count: infinite;
`;

const BottomWatermark = styled.img`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  height: 56px;
  opacity: 0.25;
`;


export default PhoneGameView;

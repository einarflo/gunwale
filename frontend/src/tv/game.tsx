import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { get, put } from "../api";
import CurrentScores from "./currentScores";
import Alternatives from "./gameAlts";
import GamePlayers from "./gamePlayers";
import Podium from "./podium";
import QuestionText from "./questionText";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import GlobalStyles from "../components/landing/GlobalStyles";
import AnimatedGradientBackgroundLight from "../components/landing/AnimatedGradientBackground-light";
import Tutorial from "./tutorial";
import Countdown from "./countdown";
import { useTVGame } from "./TVGameContext";

interface TvViewProps {
  stopGame: () => void;
}

export interface Question {
  uuid: string;
  id?: string; // legacy numeric id; prefer uuid
  game_id: string;
  number_in_line?: string | null;
  alt1?: string | null;
  alt2?: string | null;
  alt3?: string | null;
  alt4?: string | null;
  text?: string | null;
  correct?: string | null;
  status?: string | null;
  score?: string | null;
  time?: string | number | null;
}

export interface Player {
  admin?: string | null;
  username: string;
  score: string; // numeric string
  colour?: string | null; // index to selectableColors
}

const TVGamePlayView = ({ stopGame }: TvViewProps) => {
  const { gamePin, gameInstanceId, gameId } = useParams<{ gamePin: string; gameInstanceId: string; gameId: string }>();
  const { socket } = useSocket();

  const { state, setState, clearState } = useTVGame();
  const { questions, currentQ, started, showScoreBoard, showTutorial, preCountdown, loading } = state;
  const [powerupBanners, setPowerupBanners] = useState<Array<{ id: string, text: string }>>([]);

  const setQuestions = (qs: Array<Question>) => setState(prev => ({ ...prev, questions: qs }));
  const setCurrentQ = (q: number) => setState(prev => ({ ...prev, currentQ: q }));
  const setStarted = (v: boolean) => setState(prev => ({ ...prev, started: v }));
  const setShowScoreBoard = (v: boolean) => setState(prev => ({ ...prev, showScoreBoard: v }));
  const setShowTutorial = (v: boolean) => setState(prev => ({ ...prev, showTutorial: v }));
  const setPreCountdown = (v: boolean) => setState(prev => ({ ...prev, preCountdown: v }));
  const setLoading = (v: boolean) => setState(prev => ({ ...prev, loading: v }));
    
  // Get all questions for the current game Id
  const getQuestionsForGameId = (id?: string) => {
    if (!id) return;
    get(`/game_question/${id}/`)
      .then(res => {
        if (res.data) {
          setQuestions(res.data);
      }})
      .catch(err => {
        console.log("Error when getting questions for game with id ", id);
      });
  }

  // Next question
  const next = () => {
    const nextQ = currentQ + 1;
    showQuestion(nextQ);
    setCurrentQ(nextQ);
    // set timestamp for next q start
    
    setShowScoreBoard(false);

    if (currentQ === questions.length) {
      setGameStatus("finished");
    }
  }

  // Show score board
  const showCurrentScores = () => {
    setShowScoreBoard(true)
  }

  // When start button is cliked -> show tutorial first
  const startGame = () => {
    setStarted(true);
    setShowTutorial(true);
    setGameStatus("started");
  }

  const beginAfterTutorial = () => {
    setShowTutorial(false);
    setGameQuestion(0, moment().add(3, 'seconds').format('HH:mm:ss'));
    showQuestion(0);
  }

  // End game
  const onStopGame = () => {
    setGameStatus("finished");
    setStarted(false);
    clearState();
    stopGame();
  }

  const setGameStatus = useCallback((status: string) => {
    if (!gameInstanceId) return;
    put(`/game_instance/${gameInstanceId}/`, {
      status: status,
      // currentquestion: "",
      starttime: "",
    })
    .then(res => {
      console.log(res);
      socket.emit('join_game', String(gameInstanceId));
      socket.emit('game_status', { gameId: String(gameInstanceId), status });
    })
    .catch(() => {
      console.log("Something fishy is going on");
    });
  },[gameInstanceId, socket])

  const setGameQuestion = (q: number, time: string) => {
    if (!gameInstanceId) return;
    put(`/game_instance/${gameInstanceId}/`, {
      currentquestion: q,
      starttime: time,
      status: "started"
    })
    .then(res => {
      console.log(res);
      socket.emit('join_game', String(gameInstanceId));
      socket.emit('game_status', { gameId: String(gameInstanceId), index: q, starttime: time, status: 'started' });
    })
    .catch(err => {
      console.log("Something fishy is going on");
    });
  }

  const showQuestion = (q: number) => {
    // Pre-countdown (3s) BEFORE starting question -> then question text (1s)
    setPreCountdown(true);

    if (questions.length > q) {
      // After 3s countdown, schedule starttime (+1s) and show question text for 1s
      const timer = setTimeout(() => {
        // Now we mark question as started in 1s to keep phones in sync
        setGameQuestion(q, moment().add(3, 'seconds').format('HH:mm:ss'))
        setPreCountdown(false);
        setLoading(true);
        const holla = setTimeout(() => {
          setLoading(false);
          clearTimeout(holla);
        }, 3000);
        clearTimeout(timer);
      }, 3000);
    }

   
  }

  useEffect(() => {
    if (gameInstanceId) socket.emit('join_game', String(gameInstanceId));
    getQuestionsForGameId(gameId);
    if (!started) {
      setGameStatus("created");
    }
  }, [gameId, gameInstanceId, setGameStatus, socket, started]);

  // Listen for powerups and show transient overlay
  useEffect(() => {
    if (!gameInstanceId) return;
    socket.emit('join_game', String(gameInstanceId));
    const onPower = (evt: any) => {
      try {
        const actor = evt?.actor?.username || `Player ${evt?.actor?.id || ''}`;
        const type = String(evt?.type || '').toUpperCase();
        const target = evt?.targetId ? ` → ${evt.targetId}` : '';
        const text = `${actor} used ${type}${target}`;
        const id = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
        setPowerupBanners(prev => [...prev, { id, text }]);
        setTimeout(() => setPowerupBanners(prev => prev.filter(b => b.id !== id)), 3500);
      } catch (_) {}
    };
    socket.on('powerup', onPower);
    return () => { socket.off('powerup', onPower); };
  }, [socket, gameInstanceId]);

  let content: JSX.Element;
  if (!started) {
    content = (<GamePlayers startGame={startGame} stopGame={onStopGame}  gameInstanceId={gameInstanceId} gamePin={gamePin} />);
  } else if (showTutorial) {
    content = (<Tutorial
      gamePin={gamePin}
      onContinue={beginAfterTutorial}
      onCancel={() => {
        setShowTutorial(false);
        setStarted(false);
        if (gameInstanceId) {
          socket.emit('join_game', String(gameInstanceId));
          socket.emit('game_status', { gameId: String(gameInstanceId), status: 'created' });
        }
      }}
    />);
  } else if (preCountdown) {
    content = (<Countdown />);
  } else if (loading && questions.length > currentQ) {
    content = (<QuestionText question={questions[currentQ]?.text} currentQuestionCount={`${currentQ+1}/${questions.length}`}/>);
  } else if (showScoreBoard && questions.length > currentQ+1) {
    content = (<CurrentScores gameInstanceId={gameInstanceId} next={next} stop={stopGame} currentQuestionCount={`${currentQ+1}/${questions.length}`}/>);
  } else if (!showScoreBoard && questions.length > currentQ) {
    content = (<Alternatives gameInstanceId={gameInstanceId} question={questions[currentQ]} stopGame={onStopGame} nextQuestion={showCurrentScores} currentQuestionCount={`${currentQ+1}/${questions.length}`}/>);
  } else {
    content = (<Podium finish={onStopGame} gameInstanceId={gameInstanceId}/>);
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <GlobalStyles />
      <AnimatedGradientBackgroundLight />
      {/* Powerup overlay banners */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {powerupBanners.map(b => (
          <div key={b.id} style={{ background: 'rgba(59,130,246,0.9)', color: 'white', borderRadius: 10, padding: '8px 12px', boxShadow: '0 6px 18px rgba(0,0,0,0.2)', fontWeight: 700 }}>
            {b.text}
          </div>
        ))}
      </div>
      {content}
    </div>
  );
}

export const Tvrapper = styled.div`
    height: 100vh;
    height: 100dvh;
    width: 100vw;
    background: transparent;
`;

export const Start = styled.div`
    position: absolute;
    bottom: 2%;
    right: 2%;
    font-size: 1rem;
    padding: 10px;
    background:  #6A71FA;
    border-radius: 10px;
    width: fit-content;
    cursor: pointer;
    font-weight: bold;
    color: white;
`;

export const CurrentQuestionCount = styled.div`
    position: absolute;
    top: 2%;
    right: 2%;
    font-size: 1.2rem;
    padding: 10px;
    background:  #6A71FA;
    border-radius: 10px;
    width: fit-content;
    cursor: pointer;
    font-weight: bold;
    color: white;
`;

export const Stop = styled.div`
    position: absolute;
    bottom: 2%;
    left: 2%;
    font-size: 1rem;
    padding: 10px;
    background:  #6A71FA;
    border-radius: 10px;
    width: fit-content;
    cursor: pointer;
    font-weight: bold;
    color:white;
    opacity: 35%;
`;

export const Logo = styled.img`
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 400px;
    min-width: 250px;
    padding-top: 20px;
`;

export default TVGamePlayView;

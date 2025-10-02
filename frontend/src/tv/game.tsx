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

  const [questions, setQuestions] = useState<Array<Question>>([]);
  const [currentQ, setCurrentQ] = useState(0); 
  
  const [loading, setLoading] = useState(false);
  
  const [started, setStarted] = useState(false);
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [preCountdown, setPreCountdown] = useState(false);
    
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
    showQuestion(currentQ +1);
    setCurrentQ(currentQ +1);
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
      setTimeout(() => {
        // Now we mark question as started in 1s to keep phones in sync
        setGameQuestion(q, moment().add(3, 'seconds').format('HH:mm:ss'))
        setPreCountdown(false);
        setLoading(true);
        const holla = setTimeout(() => {
          setLoading(false);
          clearTimeout(holla);
        }, 3000);
      }, 3000);
    }

   
  }

  useEffect(() => {
    if (gameInstanceId) socket.emit('join_game', String(gameInstanceId));
    getQuestionsForGameId(gameId);
    setGameStatus("created");
  }, [gameId, gameInstanceId, setGameStatus, socket]);

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

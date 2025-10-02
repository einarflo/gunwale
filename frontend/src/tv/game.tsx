import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { get, put } from "../api";
import CurrentScores from "./currentScores";
import Alternatives from "./gameAlts";
import GamePlayers from "./gamePlayers";
import Podium from "./podium";
import QuestionText from "./questionText";
import { useParams } from "react-router-dom";

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

  const { gamePin, gameInstanceId, gameId } = useParams<{ gamePin: string, gameInstanceId: string, gameId: string }>();

  const [questions, setQuestions] = useState<Array<Question>>([]);
  const [currentQ, setCurrentQ] = useState(0); 
  
  const [loading, setLoading] = useState(false);
  
  const [started, setStarted] = useState(false);
  const [showScoreBoard, setShowScoreBoard] = useState(false);
    
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

  // When start button is cliked
  const startGame = () => {
    setGameQuestion(0, moment().add(3, 'seconds').format('HH:mm:ss'));
    setStarted(true);
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
      currentquestion: "",
      starttime: "",
    })
    .then(res => {
      console.log(res);
    })
    .catch(() => {
      console.log("Something fishy is going on");
    });
  },[gameInstanceId])

  const setGameQuestion = (q: number, time: string) => {
    if (!gameInstanceId) return;
    put(`/game_instance/${gameInstanceId}/`, {
      currentquestion: q,
      starttime: time,
      status: "started"
    })
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log("Something fishy is going on");
    });
  }

  const showQuestion = (q: number) => {
    setLoading(true);

    // Do API call setting the current Q and time for start
    if (questions.length > q) {
      setGameQuestion(q, moment().add(4, 'seconds').format('HH:mm:ss'))
      
      const holla = setTimeout(() => {
        setLoading(false);
        clearTimeout(holla);
      }, 3000);
    }

   
  }

  useEffect(() => {
    getQuestionsForGameId(gameId);
    setGameStatus("created");
  }, [gameId, setGameStatus]);

  // Show list of players that have joined the game
  if (!started) {
    return <GamePlayers startGame={startGame} stopGame={onStopGame}  gameInstanceId={gameInstanceId} gamePin={gamePin} />
  }

  // Show the question with countdown bar
  if (loading && questions.length > currentQ) {
    return <QuestionText question={questions[currentQ]?.text} currentQuestionCount={`${currentQ+1}/${questions.length}`}/>
  }

  if (showScoreBoard && questions.length > currentQ+1) {
    return <CurrentScores gameInstanceId={gameInstanceId} next={next} stop={stopGame} currentQuestionCount={`${currentQ+1}/${questions.length}`}/>
  }

  if (!showScoreBoard && questions.length > currentQ) {
    return <Alternatives gameInstanceId={gameInstanceId} question={questions[currentQ]} stopGame={onStopGame} nextQuestion={showCurrentScores} currentQuestionCount={`${currentQ+1}/${questions.length}`}/>
  }

  return <Podium finish={onStopGame} gameInstanceId={gameInstanceId}/>
}

const backgroundAnimation = keyframes`
    0% {background-position: 0% 50%}
    50% {background-position: 100% 50%}
    100% {background-position: 0% 50%}
`;

export const Tvrapper = styled.div`
    height: 100vh;
    height: 100dvh;
    width: 100vw;
    background: white;
    //background: rgb(28,0,65);
    //background: linear-gradient(180deg, rgba(28,0,65,1) 0%, rgba(45,56,112,1) 0%, rgba(21,2,43,1) 100%);
    //background: linear-gradient(-45deg, rgba(28,0,65,1) 0%, rgba(45,56,112,1) 0%, rgba(21,2,43,1) 100%);
    //background: linear-gradient(-45deg, #EE7752, #E73C7E, #23A6D5, #23D5AB);
    //background: linear-gradient(-45deg, #203046 0%, #030006 100%);
    //background-size: 400% 400%;
    animation-name: ${backgroundAnimation};
    animation-duration: 15s;
    animation-iteration-count: infinite;
    animation-timing-function: ease;
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

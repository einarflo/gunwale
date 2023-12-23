import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Question } from "../tv/game";
import Alts from "./alts";
import Result from "./result";
import logo from '../images/gw-logo.png';
import { Logo } from "../Splash";
//import Waiting from "./waiting";

interface Game {
    username: String,
    gamepin: String,
    logout: () => void
}

const PhoneGameView = ({ username, gamepin, logout }: Game) => {

  // Maybe get user from session storage? and some way to reset it
  const [points, setPoints] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [answered, setAnswered] = useState(true);
  const [questions, setQuestions] = useState<Array<Question>>([]);
  const [userId, setUserId] = useState('');

  const [fiftyfifty, setFiftyfifty] = useState(false);
  //const [stopTime, setStoptime] = useState(false);



  // Get all questions for the current game Id
  const getQuestionsForGameId = (id: String) => {
    axios.get(`https://www.dogetek.no/api/api.php/game_question/${id}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        if (res.data) {
          setQuestions(res.data);
      }})
      .catch(err => {
        console.log("Error when getting questions for game with id ", id);
    });
  }

  const getUser = (username: String) => {
    if (username && username.length > 1) {
      axios.get(`https://www.dogetek.no/api/api.php/game_players/${username}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        if (res.data && (res.data[0]["name"] === username)) {
          setUserId(res.data[0]["id"]);
        }
      })
      .catch(err => {
        console.log(err);
      });
    }
  }

  useEffect(() => {
    getQuestionsForGameId(gamepin);
    getUser(username);
  }, [gamepin, username]);

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


    // Waiting for game to start
  //if (!gameStarted) {
    //return <Waiting points={points} username={username} gameStarted={() => setGameStarted(true)} gamepin={gamepin} />
  //}

  // view score when timer ends

  // some background music


  // KJøpe lotte

  // Show the questions alternatives and if the answer is correct
  if (!answered && !gameEnded) {
    return <Alts question={questions[currentQ]} points={points} username={username} userId={userId} setPoints={(p) => setPoints(p)} answered={setAnswer} gamepin={gamepin} fif={fiftyfifty} buyfif={() => setFiftyfifty(false)}/>
  }

  if (answered && !gameEnded) {
    return <Result nextQuestionStarted={() => setAnswered(false)} currentQ={currentQ} points={points} username={username} gamepin={gamepin} gameFinished={() => setGameEnded(true)} fif={fiftyfifty} buyfif={() => setFiftyfifty(true)} />
  }

  return(
    <GameWrapper onClick={() => setGameEnded(false)}>
        <Header>
            <Username>{username}</Username>
            <Points>{points}</Points>
            <Logo src={logo}/>
        </Header>
    </GameWrapper>
  )
}

export const GameWrapper = styled.div`
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  background: rgb(28,0,65);
  background: linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(45,56,112,1) 0%, rgba(21,2,43,1) 100%); 
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


export default PhoneGameView;
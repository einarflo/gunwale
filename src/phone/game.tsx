import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Question } from "../tv/game";
import Alts from "./alts";
import Result from "./result";
import whiteLogo from '../images/tavl-white.png';
import { Logo } from "../Splash";
import Waiting, { selectableColors } from "./waiting";
import { MobileNav } from "../landing";
import TopLeftLogo from "../components/TopLeftLogo";
import TopRightPoints from "../components/TopRightPoints";
//import Waiting from "./waiting";
import { useWakeLock } from 'react-screen-wake-lock';

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
  const [gameStarted, setGameStarted] = useState(false);
  const [answered, setAnswered] = useState(true);
  const [questions, setQuestions] = useState<Array<Question>>([]);
  const [userId, setUserId] = useState('');

  const [fiftyfifty, setFiftyfifty] = useState(false);
  const [stop, setStoptime] = useState(false);

  const [colorForUser, setColorForUser] = useState(0);

  const { isSupported, released, request, release } = useWakeLock({

    // TODO: Some indication to the user?

    //onRequest: () => alert('Screen Wake Lock: requested!'),
    //onError: () => alert('An error happened 💥'),
    //onRelease: () => alert('Screen Wake Lock: released!'),

  });



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

    // request wake lock
    request();
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
  if (!gameStarted) {
    return <Waiting points={points} userId={userId} username={username} gameStarted={() => setGameStarted(true)} gamepin={gamepin} colorForUser={colorForUser} setColorForUser={setColorForUser} />
  }

  // view score when timer ends

  // some background music


  // KJøpe lotte

  // Show the questions alternatives and if the answer is correct
  if (!answered && !gameEnded) {
    return <Alts question={questions[currentQ]} points={points} username={username} userId={userId} setPoints={(p) => setPoints(p)} answered={setAnswer} gamepin={gamepin} fif={fiftyfifty} buyfif={() => setFiftyfifty(false)} stop={stop} buyStop={() => setStoptime(false)} color={colorForUser}/>
  }

  if (answered && !gameEnded) {
    return <Result nextQuestionStarted={() => setAnswered(false)} currentQ={currentQ} points={points} setPoints={(p) => setPoints(p)} username={username} gamepin={gamepin} gameFinished={() => {setGameEnded(true); release()}} fif={fiftyfifty} buyfif={() => setFiftyfifty(true)} stop={stop} buyStop={() => setStoptime(true)} color={colorForUser}/>
  }

  return(
    <GameWrapper onClick={() => setGameEnded(false)}>
      <MobileNav>
        <TopLeftLogo />
        <TopRightPoints username={username} points={points} color={selectableColors[colorForUser]}/>
      </MobileNav>
      <Logo src={whiteLogo}/>
    </GameWrapper>
  )
}

export const GameWrapper = styled.div`
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  background: rgb(28,0,65);
  background-image: linear-gradient(180deg, #6A71FA 0%, #9C8AFA 100%);
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
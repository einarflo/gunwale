/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import styled, { keyframes } from "styled-components"
import { Question } from "../tv/game"
import { GameWrapper, Header, Points, Username, MobileSpinner } from "./game"
import OptionButton from "./option"
import { Text } from "./result"
import { MobileNav } from "../landing"
import TopLeftLogo from "../components/TopLeftLogo"
import TopRightPoints from "../components/TopRightPoints"
import { selectableColors } from "./waiting"
import one from '../images/upgrades/1.png';
import two from '../images/upgrades/2.png';
import three from '../images/upgrades/3.png';
import four from '../images/upgrades/4.png';
import five from '../images/upgrades/5.png';
import six from '../images/upgrades/6.png';
import seven from '../images/upgrades/7.png';
import eight from '../images/upgrades/8.png';

interface AltsProps {
  userId: String
  username: String
  points: number
  setPoints: (points: number) => void
  answered: () => void
  gamepin: String,
  question: Question
  fif: boolean;
  buyfif: () => void
  stop: boolean;
  buyStop: () => void
  color: number;
}

const Alts = ({ userId, username, points, setPoints, answered, gamepin, question, fif, buyfif, stop, buyStop, color }: AltsProps) => {
  const [roundPoints, setRoundPoints] = useState(0);
  const [score, setScore] = useState(1000);

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const roundPointsRef = useRef(roundPoints);
  roundPointsRef.current = roundPoints;

  const [answerSelected, setAnswerSelected] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

  const answerSelectedRef = useRef(answerSelected);
  answerSelectedRef.current = answerSelected;

  const [hide, setHide] = useState<String[]>([]);
  const [stopTime, setStopTime] = useState(false);


  // POST points to server 
  const setUserPoints = (points: number) => {
    axios.put(`https://www.dogetek.no/api/api.php/game_players/${userId}/`, {
      score: points.toString(),
    }, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log("Error when updating user points");
    });
  }

  // Points counter
  useEffect(() => {
    // Maks 1000 poeng - fordelt på antall sekunder - delt opp i 100 (pga. 10 ms)
    const subtract = 1000 / question.time / 100
    const countdown = setInterval(() => {
      // Minimum score 115
      if (score > 115 && !stopTime) {
        setScore(scoreRef.current - subtract)
      }
    }, (10));

    return () => clearInterval(countdown)
  }, [score])

  useEffect(() =>{
    setTimeout(() => {
      // COMMENT OUT FOR DEBUG
      questionTimeEnd();
    }, (question.time * 1000))
  }, [])

  const questionTimeEnd = () => {
    if (!answerSelectedRef.current) {
      selectOption('0');
    }

    // show correct answer
    setShowCorrect(true);

    // move on after 3 sec
    setTimeout(() => {
      // Set points in app
      setPoints(points + roundPointsRef.current);
      answered();
    }, 5000)
  }

  const usStop = () => {
    if (stop) {
      buyStop();
      setStopTime(true);
    }
  }

  const usfif = () => {
    if (fif) {
      buyfif();
      const opt = getRadomOption();
      setHide(options.filter(option => !(option === question?.correct || option === opt)))
    }
  }

  const getRadomOption = () => {
    return options.filter(option => !(option === question?.correct))[Number((Math.random() * 3).toFixed(0))];
  }

  const options = ["1", "2", "3", "4"];
  
  // User clicks alternative
  const selectOption = (answer: string) => {
    // Show loader while waiting for timeout
    setAnswerSelected(true);

    setAnsweredCorrectly(answer === question?.correct);

    // If it is correct 
    if (answer === question?.correct) {
      // POST new point score to server
      setUserPoints(points + score);
      // Set the state
      setRoundPoints(score)
    }
  }

  // Waiting for result to be revealed 
  if (answerSelected && !showCorrect) {
    return (
    <GameWrapper>
        <MobileNav>
          <TopLeftLogo />
          <TopRightPoints username={username} points={points} color={selectableColors[color]}/>
        </MobileNav>
        <Text>Waiting for your score...</Text>
        <MobileSpinner/>
    </GameWrapper>);
  }

  // Showing the result for 3 seconds
  if (answerSelected && showCorrect) {
    return (
    <GameWrapper style={{ background: answeredCorrectly ? 'linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(0,164,67,1) 0%, rgba(34,214,135,1) 100%)' : 'linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(255,39,39,1) 0%, rgba(247,89,89,1) 100%)' }}>
        <MobileNav>
          <TopLeftLogo />
          <TopRightPoints username={username} points={points} color={selectableColors[color]}/>
        </MobileNav>
        <Text>{answeredCorrectly ? 'Correct' : 'Nope!'}</Text>
        <Text>You got {answeredCorrectly ? roundPoints : 0} points</Text>
    </GameWrapper>);

  }

  // Showing alternatives
  return(
    <GameWrapper>
      <MobileNav>
        <TopLeftLogo />
        <TopRightPoints username={username} points={points} color={selectableColors[color]}/>
      </MobileNav>
      
      <PowerUpContainer>
        <PowerUpIcon src={one} has={fif} onClick={() => usfif()}/>
        <PowerUpIcon src={two} has={stop} onClick={() => usStop()}/>
        <PowerUpIcon src={four} has={false} onClick={() => {}}/>
      </PowerUpContainer>
      <TimeBar time={(question.time).toString()} stop={stopTime}/>
      <AltsContainer>
      <Top>
        <OptionButton hide={hide.includes("1")} description={question?.alt1} select={() => selectOption('1')} colour={selectableColors[0]} />
        <OptionButton hide={hide.includes("2")} description={question?.alt2} select={() => selectOption('2')} colour={selectableColors[1]} />
      </Top>
      <Bot>
        <OptionButton hide={hide.includes("3")} description={question?.alt3} select={() => selectOption('3')} colour={selectableColors[2]} />
        <OptionButton hide={hide.includes("4")} description={question?.alt4} select={() => selectOption('4')} colour={selectableColors[3]} />
        </Bot>
      </AltsContainer>

    </GameWrapper>
  )
}

export const PowerUpIcon = styled.img.attrs((props: {has: boolean}) => props)`
  width: 20%;
  margin: 20px;
  padding: 10px;
  right: 0;
  cursor: pointer;
  opacity: ${props => props.has ? '100%' : '30%'};
`;

export const PowerUp = styled.div.attrs((props: {has: boolean}) => props)`
  background: white;
  width: 20%;
  margin: 20px;
  border-radius: 5px;
  padding: 10px;
  font-weight: bold;
  right: 0;
  color: black;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.has ? '100%' : '30%'};
`;

export const PowerUpContainer = styled.div`
 display: flex;
 background: white;
 margin: 10px;
 border-radius: 15px;
 
 justify-content: center;
`;

const AltsContainer = styled.div`
  background: white;
  margin: 10px;
  border-radius: 15px;
`;

export const Top = styled.div`
 display: flex;
`;

export const Bot = styled.div`
 display: flex;
`;

const progressbar = keyframes`
    100% { width: 0; }
    0% { width: calc(100vw - 40px); }
`;

const TimeBar = styled.div.attrs((props: {time: string, stop: boolean}) => props)`
  background: #ffffff;
  padding: 10px;
  margin: 10px;
  border-radius: 15px;
  left: 50%;
  height: 3px;
  animation: ${progressbar} ${props => props.time}s linear;
  animation-fill-mode:both;
  -webkit-animation: ${progressbar} ${props => props.time}s linear;
  opacity: ${props => props.stop ? '0%' : '100%'}
`;

export default Alts;
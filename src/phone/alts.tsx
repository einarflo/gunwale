/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import styled, { keyframes } from "styled-components"
import { Question } from "../tv/game"
import { GameWrapper, Header, Points, Username, MobileSpinner } from "./game"
import OptionButton from "./option"
import { Text } from "./result"

interface AltsProps {
  userId: String
  username: String
  points: number
  setPoints: (points: number) => void
  answered: () => void
  gamepin: String,
  question: Question
}

const Alts = ({ userId, username, points, setPoints, answered, gamepin, question }: AltsProps) => {
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
      if (score > 115) {
        setScore(scoreRef.current - subtract)
      }
    }, (10));

    return () => clearInterval(countdown)
  }, [score])

  useEffect(() =>{
    setTimeout(() => {
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
        <Header>
            <Username>{username}</Username>
            <Points>{points}</Points>
        </Header>
        <Text>Fingers crossed</Text>
        <MobileSpinner/>
    </GameWrapper>);
  }

  // Showing the result for 3 seconds
  if (answerSelected && showCorrect) {
    return (
    <GameWrapper>
        <Header>
            <Username>{username}</Username>
            <Points>{points + roundPoints}</Points>
        </Header>
        <Text>{answeredCorrectly ? 'Correct' : 'Nope!'}</Text>
        <Text>You got {answeredCorrectly ? roundPoints : 0} points</Text>
    </GameWrapper>);

  }

  // Showing alternatives
  return(
    <GameWrapper>
      <Header>
        <Username>{username}</Username>
        <Points>{points}</Points>
      </Header>
      <TimeBar time={(question.time).toString()}/>
      <PowerUpContainer>
        <PowerUp>50/50</PowerUp>
        <PowerUp>Stop time</PowerUp>
        <PowerUp>Cut losses</PowerUp>
      </PowerUpContainer>
      <div>
        <OptionButton description={question?.alt1} select={() => selectOption('1')} colour="green" />
        <OptionButton description={question?.alt2} select={() => selectOption('2')} colour="blue" />
        <OptionButton description={question?.alt3} select={() => selectOption('3')} colour="red" />
        <OptionButton description={question?.alt4} select={() => selectOption('4')} colour="purple" />
      </div>

    </GameWrapper>
  )
}

export const PowerUp = styled.div`
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
`;

export const PowerUpContainer = styled.div`
 display: flex;
 opacity: 30%;
`;

const progressbar = keyframes`
    100% { width: 0; }
    0% { width: 100vw; }
`;

const TimeBar = styled.div.attrs((props: {time: string}) => props)`
  background: #ffffff60;
  padding: 10px;
  left: 50%;
  height: 3px;
  animation: ${progressbar} ${props => props.time}s linear;
  animation-fill-mode:both;
  -webkit-animation: ${progressbar} ${props => props.time}s linear;
`;

export default Alts;
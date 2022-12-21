/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios"
import { useEffect, useState } from "react"
import styled, { keyframes } from "styled-components"
import { Question } from "../tv/game"
import { GameWrapper, Header, Points, Username } from "./game"
import OptionButton from "./option"

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
  const [roundPoints, setRoundPoints] = useState(points);
  const [score, setScore] = useState(1000);

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

  useEffect(() => {
    const countdown = setInterval(() => {
      // Minimum score 15
      if (score > 115) {
        setScore(score - 1)
      }
    }, (10));

    return () => clearInterval(countdown)
  }, [score])

  let timeout: NodeJS.Timer;

  useEffect(() => {
    let secondsPassed = 0;
    timeout = setInterval(() => {
      console.log('secondsPassed >= question.time', secondsPassed, question.time, secondsPassed >= question.time)

      if (!isNaN(question.time) && secondsPassed >= (question.time - 1)) {
        // end round by answering wrong
        selectOption('0');
      }
      secondsPassed = secondsPassed + 1;
    }, (1000));

    return () => clearInterval(timeout)
  }, [])


  useEffect(() => {
    setRoundPoints(points);
  }, [points])

  const selectOption = (answer: string) => {
    // stop timer with question time timeout
    clearInterval(timeout)

    if (answer === question?.correct) {
      setPoints(roundPoints + score);
      setUserPoints(roundPoints + score);
    }
    else {
      setPoints(roundPoints);
      setUserPoints(roundPoints);

    }
    answered();
  }
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
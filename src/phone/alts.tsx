import axios from "axios"
import { useEffect, useState } from "react"
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
      if (score > 100) {
        setScore(score - 100)
      }
    }, (1000));

    return () => clearInterval(countdown)
  }, [score])


  useEffect(() => {
    setRoundPoints(points);
  }, [points])

  const selectOption = (answer: string) => {
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
      <div>
        <OptionButton description={question.alt1} select={() => selectOption('1')} colour="green" />
        <OptionButton description={question.alt2} select={() => selectOption('2')} colour="blue" />
        <OptionButton description={question.alt3} select={() => selectOption('3')} colour="red" />
        <OptionButton description={question.alt4} select={() => selectOption('4')} colour="yellow" />
      </div>
    </GameWrapper>
  )
}

export default Alts;
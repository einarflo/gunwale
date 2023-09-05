import axios, { AxiosRequestConfig } from "axios";
import moment from "moment";
import { useCallback, useEffect } from "react";
import styled from "styled-components";
import { GameWrapper, Header, MobileSpinner, Points, Username } from "./game";

interface ResultProps {
  username: String
  currentQ: number
  points: number
  nextQuestionStarted: () => void
  gameFinished: () => void
  gamepin: String
}

const Result = ({ currentQ, username, points, nextQuestionStarted, gamepin, gameFinished }: ResultProps) => {
  
  const countdown = useCallback((startTime: string) => {
    const countdownTimer = setInterval(() => {
      if (!moment(startTime, "HH:mm:ss").isAfter(moment(), 'second')) {
        nextQuestionStarted();
        clearInterval(countdownTimer)
      }
    }, (500));
  }, [nextQuestionStarted])


  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`https://www.dogetek.no/api/api.php/game/${gamepin}/?hash=${Math.random() * 21991919393914999419}`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        if (res.data["status"] === 'started') {
          if (res.data["currentquestion"] === currentQ.toString()) {

            // Start countdown to next question
            countdown(res.data["starttime"])
            
            clearInterval(interval)
            
            
          }
        }
        if (res.data["status"] === 'finished'){
          gameFinished()
        }
      })
      .catch(err => {
        console.log("Error when getting game status");
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, currentQ, gameFinished, gamepin]);




  
  return(
    <GameWrapper>
        <Header>
            <Username>{username}</Username>
            <Points>{points}</Points>
        </Header>
        <Text>{getQuote()}</Text>
        <MobileSpinner/>
    </GameWrapper>
  );
    
}

export const getQuote = () => {
  return quotes[Number((Math.random() * 3).toFixed(0))];
}

  // return a random quote
const quotes = [
  'The best is yet to come.',
  'No pressure, no diamonds.',
  'And so the adventure begins.',
  'When nothing goes right, go left.'
]

export const Text = styled.div`
  height: 200px;
  position: relative;
  margin: 20px;
  font-size: 2rem;
  color: white;
  text-align: center;
  font-family: "Soopafresh";
`;

export default Result;
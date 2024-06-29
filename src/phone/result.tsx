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
  fif: boolean;
  buyfif: () => void
  setPoints: (points: number) => void
  stop: boolean;
  buyStop: () => void
}

const Result = ({ currentQ, username, points, nextQuestionStarted, gamepin, gameFinished, fif, buyfif, setPoints, buyStop, stop }: ResultProps) => {
  
  const countdown = useCallback((startTime: string) => {
    const countdownTimer = setInterval(() => {
      if (!moment(startTime, "HH:mm:ss").isAfter(moment(), 'second')) {
        nextQuestionStarted();
        clearInterval(countdownTimer)
      }
    }, (500));
  }, [nextQuestionStarted])

  const purchaseFifityFifty = () => {
    if (!fif) {
      setPoints(points-250);
      buyfif();
    }
  }

  const purchaseStopTime = () => {
    if (!stop) {
      setPoints(points-200);
      buyStop();
    }
  }

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
        <BuyTop>
          <PowerUp onClick={purchaseFifityFifty}>
            <Desc>50/50</Desc>
            { fif ?
              <Has>Unlocked</Has>
              : 
              <Price>250</Price>
            }
            
          </PowerUp>
          <PowerUp onClick={purchaseStopTime}>
            <Desc>Full score</Desc>
            { stop ?
              <Has>Unlocked</Has>
              : 
              <Price>200</Price>
            }
            
          </PowerUp>
        </BuyTop>
        <MobileSpinner/>
    </GameWrapper>
  );
    
}

export const getQuote = () => {
  return quotes[Number((Math.random() * 3).toFixed(0))];
}

const PowerUp = styled.div`
  height: 55px;
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  margin: 10px;
  padding: 10px;
  color: black;
  
  line-height: 1;
  overflow: hidden;
  
  font-family: "Coll";
  text-align: center;
  display: flex;
  justify-content: center;
 align-items: center;
 flex-direction: column;
`;//white-space: nowrap;background-color: ${props => (props.color)};

export const Desc = styled.div`
 display: flex;
 font-size: 1.5em;
`;

export const Price = styled.div`
 display: flex;
 margin-top: 5px;
 background: #000000;
  border-radius: 20px;
  color: white;
  padding: 5px;
  font-size: 1em;
  width: 100%;
  text-align: center;
  justify-content: center;
`;

export const Has = styled.div`
 display: flex;
 margin-top: 5px;
 background: #0aab15;
  border-radius: 20px;
  color: black;
  padding: 5px;
  font-size: 1em;
  width: 100%;
  text-align: center;
  justify-content: center;
`;

export const BuyTop = styled.div`
 display: flex;
`;

  // return a random quote
const quotes = [
  'The best is yet to come.',
  'No pressure, no diamonds.',
  'And so the adventure begins.',
  'When nothing goes right, go left.'
  // Waiting on game master
  // Buy some upgrades?
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
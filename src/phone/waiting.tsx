import axios, { AxiosRequestConfig } from "axios";
import { useEffect } from "react";
import styled from "styled-components";
import { GameWrapper, Header, MobileSpinner, Points, Username } from "./game";

interface WaitingProps {
  username: String
  points: number
  gameStarted: () => void
  gamepin: String
}

const Waiting = ({ username, points, gameStarted, gamepin }: WaitingProps) => {
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`https://www.dogetek.no/api/api.php/game/${gamepin}/?hash=${Math.random() * 21991919393914999419}`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        if (res.data["status"] === "started") {
          gameStarted();
        }
      })
      .catch(err => {
        console.log("Error when getting game status");
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gamepin]);

    // return a random quote
  const quotes = [
    'The best is yet to come.',
    'No pressure, no diamonds.',
    'And so the adventure begins.',
    'When nothing goes right, go left.'
  ]
  
  return(
    <GameWrapper>
        <Header>
            <Username>{username}</Username>
            <Points>{points}</Points>
        </Header>
        <Text>{quotes[Number((Math.random() * 3).toFixed(0))]}</Text>
        <MobileSpinner/>
    </GameWrapper>
  );
    
}
const Text = styled.div`
  height: 200px;
  position: relative;
  margin: 20px;
  font-size: 2rem;
  color: white;
  text-align: center;
`;

export default Waiting;
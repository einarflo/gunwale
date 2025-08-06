import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { get } from "../api";
import { Player } from "./game";
import QRCode from "react-qr-code";
import whiteLogo from '../images/tavl-white.png';
import { selectableColors } from "../phone/waiting";

interface GamePlayersProps {
  gameInstanceId: String;
  gamePin: String;
  stopGame: () => void;
  startGame: () => void;
}

const GamePlayers = ({ gameInstanceId, startGame, gamePin, stopGame}: GamePlayersProps) => {
  const [players, setPlayers] = useState<Array<Player>>([]);

  useEffect(() => {
    const refreshPlayerListInterval = setInterval(() => {
      get(`/game_instance_players_id/${gameInstanceId}/?hash=${Math.random() * 21991919393914999419}`)
        .then(res => {
          if (res.data) {
            setPlayers(res.data);
        }})
        .catch(err => {
          console.log("Error when getting player list");
        });
    }, 3000);
    return () => clearInterval(refreshPlayerListInterval);
  }, [gameInstanceId])


  return (
    <Wrapper>
      <LeftSide>
          <ContentLeft>
            <TavlLogoWhite src={whiteLogo} />
            <QR>
            <QRCode 
              size={512} 
              style={{ height: "auto", maxWidth: "200px", width: "200px", border: '6px solid white', borderRadius: '4px' }}
              value={'https://www.dogetek.no/tavl/?gameid='+ gamePin}
              viewBox={`0 0 512 512`}
            />
            </QR>
            <Footer>or join game at tavl.no</Footer>
          </ContentLeft>
        </LeftSide>
        <RightSide>
          <Pin>Game pin: {gamePin}</Pin>
          <ContentRight>

            <ContentPlayers>
        
              { players?.length === 0 ? 
                <PlayerName>Waiting for players ...</PlayerName>
              : 
                players?.map(player => <PlayerName hex={selectableColors[Number(player.colour) || 0]}>{player.username}</PlayerName>)}
            </ContentPlayers>
            

          </ContentRight>

        </RightSide>
      <StartGame onClick={startGame}>Start</StartGame>
      <StopGame onClick={stopGame}>Stop</StopGame>
    </Wrapper>
  )
}

const StartGame = styled.div`
    position: absolute;
    bottom: 2%;
    right: 2%;
    font-size: 1rem;
    padding: 10px;
    background:  #9C8AFA;;
    border-radius: 10px;
    width: fit-content;
    cursor: pointer;
    font-weight: bold;
    color: white;
    opacity: 80%;
`;

const StopGame = styled.div`
    position: absolute;
    bottom: 2%;
    left: 2%;
    font-size: 1rem;
    padding: 10px;
    background:  #ffffff;
    border-radius: 10px;
    width: fit-content;
    cursor: pointer;
    font-weight: bold;
    color: #9C8AFA;
`;

const pulse = keyframes`
  0% {
    opacity: 20%;
  }
  50% {
    opacity: 100%;
  }
  100% {
    opacity: 20%;
  }
`;

const TavlLogoWhite = styled.img`
max-width: 400px;
min-width: 250px;
padding-bottom: 20px;
`;

const QR = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`;

const Wrapper = styled.div`
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  background: #ffffff;
    display: flex;
`;

const ContentLeft = styled.div`
    position: absolute;
    top: 50%;
    left: 25%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
`;

const ContentRight = styled.div`
    position: absolute;
    top: 50%;
    left: 75%;
    transform: translate(-50%, -50%);
    min-width: 500px;
    max-width: 80vw;
`;

const LeftSide = styled.div`
  width: 50%;
  background-image: linear-gradient(180deg, #6A71FA 0%, #9C8AFA 100%);
`;

const RightSide = styled.div`
  width: 50%;
  
`;

const ContentPlayers = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
`;

const Footer = styled.div`
    color: white;
    font-size: 1.5rem;
    text-align: center;
    padding-top: 20px;
`;

const Pin = styled.div`
    padding: 10px;
    color: #9C8AFA;
    border-radius: 10px;
    width: fit-content;
    font-size: 3rem;
    font-weight: bold;
    text-align: center;
    left: 50%;
    margin: auto;
    margin-bottom: 30px;
    font-family: "Coll";
    animation: ${pulse} 2s ease-in;
    animation-iteration-count: infinite;
`;

const PlayerName = styled.div.attrs((props: {hex: any}) => props)`
    padding: 10px;
    margin: 10px;
    background-color: ${props => (props.hex || " #9C8AFA")};
    color: white;
    border-radius: 10px;
    width: fit-content;
    display: inline-box;
    font-size: 1.5rem;
    font-weight: bold;
    font-family: "Coll";
`;

export default GamePlayers;
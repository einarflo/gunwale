import { useEffect, useState } from "react";
import styled, { css, keyframes } from "styled-components";
// Use WS as the source of truth for players
import { useSocket } from "../context/SocketContext";
import { Player } from "./game";
import QRCode from "react-qr-code";
import whiteLogo from '../images/tavl-white.png';
import { selectableColors, textColors, animatedColorIndices, MULTICOLOR_INDEX } from "../phone/waiting";

interface GamePlayersProps {
  gameInstanceId?: string;
  gamePin?: string;
  stopGame: () => void;
  startGame: () => void;
}

const GamePlayers = ({ gameInstanceId, startGame, gamePin, stopGame}: GamePlayersProps) => {
  const [players, setPlayers] = useState<Array<Player>>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!gameInstanceId) return;
    const fetchPlayers = () => {
      socket.emit('get_players', { gameInstanceId: String(gameInstanceId) }, (resp: any) => {
        if (resp?.ok && Array.isArray(resp.players)) setPlayers(resp.players);
      });
    };
    fetchPlayers();
    socket.emit('join_game', String(gameInstanceId));
    const onPlayerUpdate = (data: any) => {
      if (data?.gameId === String(gameInstanceId)) fetchPlayers();
    };
    socket.on('player_update', onPlayerUpdate);
    return () => {
      socket.off('player_update', onPlayerUpdate);
    }
  }, [socket, gameInstanceId])


  return (
    <Wrapper>
      <LeftSide>
          <ContentLeft>
            <TavlLogoWhite src={whiteLogo} />
            <QR>
            <QRCode 
              size={512} 
              style={{ height: "auto", maxWidth: "200px", width: "200px", border: '6px solid white', borderRadius: '4px' }}
              value={'https://ovh.tavl.no/join/' + (gamePin || '')}
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
                players?.map(player => {
                  const idx = Number(player.colour) || 0;
                  return <PlayerName hex={selectableColors[idx]} text={textColors[idx]} animated={animatedColorIndices.has(idx)} multicolor={idx === MULTICOLOR_INDEX}>{player.username}</PlayerName>
                })}
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

const MoveBackgroundPosition = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const MultiColorScroll = keyframes`
  0% { background-position: 50% 0%; }
  50% { background-position: 50% 100%; }
  100% { background-position: 50% 0%; }
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

const PlayerName = styled.div.attrs((props: {hex: any, text?: string, animated?: boolean, multicolor?: boolean}) => props)<{hex: any, text?: string, animated?: boolean, multicolor?: boolean}>`
    padding: 10px;
    margin: 10px;
    background: ${props => (props.hex || " #9C8AFA")};
    ${props => props.animated && props.multicolor && css`
      background-size: 100% 1000%;
      animation: ${MultiColorScroll} 17.5s linear infinite;
    `}
    ${props => props.animated && !props.multicolor && css`
      background-size: 150%;
      animation: ${MoveBackgroundPosition} 6s ease-in-out infinite;
      filter: drop-shadow(0 0 1px rgba(255, 200, 0, .3));
    `}
    color: ${props => props.text || 'white'};
    border-radius: 10px;
    width: fit-content;
    display: inline-box;
    font-size: 1.5rem;
    font-weight: bold;
    font-family: "Coll";
`;

export default GamePlayers;

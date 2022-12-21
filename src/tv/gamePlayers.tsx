import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import logo from '../images/gunwale-logo-white.png';
import { Logo, Player, Start, Stop, Tvrapper } from "./game";
import QRCode from "react-qr-code";

interface GamePlayersProps {
  id: String;
  stopGame: () => void
  startGame: () => void
}

const GamePlayers = ({ id, startGame, stopGame}: GamePlayersProps) => {
  const [players, setPlayers] = useState<Array<Player>>([]);

  useEffect(() => {
    const refreshPlayerListInterval = setInterval(() => {
      axios.get(`https://www.dogetek.no/api/api.php/game_players_id/${id}/?hash=${Math.random() * 21991919393914999419}`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
        .then(res => {
          if (res.data) {
            setPlayers(res.data);
        }})
        .catch(err => {
          console.log("Error when getting player list");
        });
    }, 3000);
    return () => clearInterval(refreshPlayerListInterval);
  }, [id])


  return (
    <Tvrapper>
      <Logo src={logo}/>
      <ContentPlayers>
        <Pin>GAME PIN: {id}</Pin>
        { players?.length === 0 ? 
            <PlayerName>Waiting for players ...</PlayerName>
          : 
            players?.map(player => <PlayerName>{player.name}</PlayerName>)}
      </ContentPlayers>
      <Footer>
        <QRCode
        size={256}
        style={{ height: "auto", maxWidth: "100px", width: "100px", border: '6px solid white', borderRadius: '4px' }}
        value={'https://gunwale.dogetek.no/?gameid='+id}
        viewBox={`0 0 256 256`}
        />
      </Footer>
      <Footer>Join game at gunwale.dogetek.no</Footer>
      <Start onClick={startGame}>Start</Start>
      <Stop onClick={stopGame}>Stop</Stop>
    </Tvrapper>
  )
}

const ContentPlayers = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
`;

const Footer = styled.div`
    position: absolute;
    bottom: 2%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
    color: white;
    font-size: 1rem;
    text-align: center;
`;

const Pin = styled.div`
    padding: 10px;
    color: #ffffff60;
    border-radius: 10px;
    width: fit-content;
    font-size: 3rem;
    font-weight: bold;
    text-align: center;
    left: 50%;
    margin: auto;
    margin-bottom: 30px;
`;

const PlayerName = styled.div`
    padding: 10px;
    margin: 10px;
    background: white;
    border-radius: 10px;
    width: fit-content;
    display: inline-box;
    font-size: 1.5rem;
    font-weight: bold;
`;

export default GamePlayers;
import { CurrentQuestionCount, Logo, Player, Start, Stop, Tvrapper } from "./game";
import logo from '../images/tavl-white.png';
import styled, { css, keyframes } from "styled-components";
import { useEffect, useState } from "react";
import { Spinner } from "./selectGame";
import TopLeftLogo from "../components/TopLeftLogo";
import { selectableColors, textColors, animatedColorIndices, MULTICOLOR_INDEX } from "../phone/waiting";
// Use WebSocket as source of truth for players
import { useSocket } from "../context/SocketContext";

interface CurrentScoresProps {
  gameInstanceId?: string;
  currentQuestionCount: string;
  next: () => void;
  stop: () => void;
}

const CurrentScores = ({ gameInstanceId, next, stop, currentQuestionCount }: CurrentScoresProps) => {
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();


  useEffect(() => {
    if (!gameInstanceId) return;
    const fetchPlayers = () => {
      socket.emit('get_players', { gameInstanceId: String(gameInstanceId) }, (resp: any) => {
        if (resp?.ok && Array.isArray(resp.players)) setPlayers(resp.players);
        setLoading(false);
      });
    };
    setLoading(true);
    fetchPlayers();
    socket.emit('join_game', String(gameInstanceId));
    const onPlayerUpdate = (data: any) => { if (data?.gameId === String(gameInstanceId)) fetchPlayers(); };
    socket.on('player_update', onPlayerUpdate);
    return () => { socket.off('player_update', onPlayerUpdate); };
  }, [socket, gameInstanceId])

  if (loading) {
    <Tvrapper>
      <TopLeftLogo/>
      <ContentPlayers>
        <Spinner/> 
      </ContentPlayers>
      <Start onClick={next}>Next</Start>
      <Stop onClick={stop}>Stop</Stop>
    </Tvrapper>
    
  }

  // Leader should cover sreen with banner from side to side
  // Should display what question were currently at

  return (
    <Tvrapper>
      <TopLeftLogo/>
      <CurrentQuestionCount>{currentQuestionCount}</CurrentQuestionCount>
      <ContentPlayers>
        <Header>Scoreboard</Header>
        { players?.length === 0 ? 
            <div>No players ...</div>
          : 
            players?.sort((a: Player, b: Player) => Number(b.score) - Number(a.score)).slice(0,5).map(player => {
              const idx = Number(player.colour) || 0;
              return <ScoreEntry hex={selectableColors[idx]} text={textColors[idx]} animated={animatedColorIndices.has(idx)} multicolor={idx === MULTICOLOR_INDEX}><Name>{player.username}</Name><Score>{player.score}</Score></ScoreEntry>
            })}
      </ContentPlayers>
      <Start onClick={next}>Next</Start>
      <Stop onClick={stop}>Stop</Stop>
    </Tvrapper>
  )
}

const Name = styled.div`
  padding: 5px;
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
`;

const Score = styled.div`
padding: 5px;
`;

const ContentPlayers = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
    font-family: "Coll";
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

const ScoreEntry = styled.div.attrs((props: {hex: any, text?: string, animated?: boolean, multicolor?: boolean}) => props)<{hex: any, text?: string, animated?: boolean, multicolor?: boolean}>`
  height: 50px;
  margin: 20px;
  font-size: 2rem;
  color: #000000;
  text-align: center;
  background: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  max-width: 500px;
  margin-right: auto;
  margin-left: auto;
  left: 50%;
  font-family: "Coll";
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
  padding: 5px;
  display: flex;
  justify-content: space-between;
`;

const Header = styled.div`
    padding: 10px;
    color: black;
    border-radius: 10px;
    width: fit-content;
    font-size: 3rem;
    font-weight: bold;
    text-align: center;
    left: 50%;
    margin: auto;
    margin-bottom: 30px;
    font-family: "Coll";
    letter-spacing: 2px;
`;

export default CurrentScores;

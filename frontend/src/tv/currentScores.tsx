import { CurrentQuestionCount, Player, Start, Stop, Tvrapper } from "./game";
import styled, { css, keyframes } from "styled-components";
import { useEffect, useRef, useState } from "react";
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

type LivePlayer = Player & { id?: string };

const CurrentScores = ({ gameInstanceId, next, stop, currentQuestionCount }: CurrentScoresProps) => {
  const [players, setPlayers] = useState<Array<LivePlayer>>([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const prevOrderRef = useRef<string[]>([]);
  const [rankChange, setRankChange] = useState<Record<string, 'up' | 'down'>>({});


  useEffect(() => {
    if (!gameInstanceId) return;
    const fetchPlayers = () => {
      socket.emit('get_players', { gameInstanceId: String(gameInstanceId) }, (resp: any) => {
        if (resp?.ok && Array.isArray(resp.players)) {
          const sortedTop: LivePlayer[] = [...resp.players]
            .sort((a: LivePlayer, b: LivePlayer) => Number(b.score) - Number(a.score))
            .slice(0, 5);
          setPlayers(sortedTop);
          // Detect rank changes
          try {
            const newOrder = sortedTop.map(p => String((p as any).id || p.username));
            const prevOrder = prevOrderRef.current;
            const changes: Record<string, 'up' | 'down'> = {};
            newOrder.forEach((key, idx) => {
              const prevIdx = prevOrder.indexOf(key);
              if (prevIdx >= 0) {
                if (prevIdx > idx) changes[key] = 'up';
                else if (prevIdx < idx) changes[key] = 'down';
              }
            });
            prevOrderRef.current = newOrder;
            if (Object.keys(changes).length > 0) {
              setRankChange(changes);
              setTimeout(() => setRankChange({}), 1800);
            }
          } catch {}
        }
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

  const leader = players[0];
  const others = players.slice(1);

  return (
    <Tvrapper>
      <TopLeftLogo/>
      <CurrentQuestionCount>{currentQuestionCount}</CurrentQuestionCount>
      <ContentPlayers>
        <Header><span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Scoreboard</span></Header>
        { players?.length === 0 ? 
            <div>No players ...</div>
          : 
            <>
            {(() => {
              const total = (leader ? 1 : 0) + others.length;
              const rows: JSX.Element[] = [];
              if (leader) {
                const leaderIdx = Number(leader.colour) || 0;
                const hex = selectableColors[leaderIdx];
                const text = textColors[leaderIdx] || '#111827';
                const animated = animatedColorIndices.has(leaderIdx);
                const multicolor = leaderIdx === MULTICOLOR_INDEX;
                const delayMs = Math.max(0, (total - 1 - 0) * 700);
                rows.push(
                  <Reveal key={'leader'} delayMs={delayMs}>
                    <LeaderBanner hex={hex} text={text} animated={animated} multicolor={multicolor}>
                      <LeaderCrown>👑</LeaderCrown>
                      <LeaderName text={text} title={leader.username}>{leader.username}</LeaderName>
                      <LeaderScore text={text}>{leader.score}</LeaderScore>
                    </LeaderBanner>
                  </Reveal>
                );
              }
              others.forEach((player, i) => {
                const idxColour = Number(player.colour) || 0;
                const key = String((player as any).id || player.username);
                const change = rankChange[key];
                const indexFromTop = i + 1; // rows under leader
                const delayMs = Math.max(0, (total - 1 - indexFromTop) * 700);
                rows.push(
                  <Reveal key={`row-${key}`} delayMs={delayMs}>
                    <ScoreEntry
                      hex={selectableColors[idxColour]}
                      text={textColors[idxColour]}
                      animated={animatedColorIndices.has(idxColour)}
                      multicolor={idxColour === MULTICOLOR_INDEX}
                      promoted={change === 'up'}
                      demoted={change === 'down'}
                    >
                      <Left>
                        <RankBadge rank={i+2}>{i+2}</RankBadge>
                        <Name title={player.username}>{player.username}</Name>
                      </Left>
                      <Right>
                        {change === 'up' && <DeltaUp>▲</DeltaUp>}
                        {change === 'down' && <DeltaDown>▼</DeltaDown>}
                        <Score>{player.score}</Score>
                      </Right>
                    </ScoreEntry>
                  </Reveal>
                );
              });
              return rows;
            })()}
            </>
          }
      </ContentPlayers>
      <Start onClick={next}>Next</Start>
      <Stop onClick={stop}>Stop</Stop>
      {/* Rows reveal with stagger; no blocking overlay */}
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
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 60vw;
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

const ScoreEntry = styled.div.attrs((props: {hex: any, text?: string, animated?: boolean, multicolor?: boolean, promoted?: boolean, demoted?: boolean}) => props)<{hex: any, text?: string, animated?: boolean, multicolor?: boolean, promoted?: boolean, demoted?: boolean}>`
  height: 50px;
  margin: 20px;
  font-size: 2rem;
  color: #000000;
  text-align: center;
  background: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  max-width: 800px;
  margin-right: auto;
  margin-left: auto;
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
  align-items: center;
  position: relative;
  overflow: hidden;
  ${props => props.promoted && css`animation: ${RankUp} 0.6s ease;`}
  ${props => props.demoted && css`animation: ${RankDown} 0.6s ease;`}
`;

const Header = styled.div`
    padding: 10px;
    color: black;
    border-radius: 10px;
    width: fit-content;
    font-size: 4rem;
    font-weight: bold;
    text-align: center;
    left: 50%;
    margin: auto;
    margin-bottom: 30px;
    font-family: "Coll";
    letter-spacing: 2px;
`;

// Grand leader banner
const LeaderBanner = styled.div.attrs((props: {hex: any, text?: string, animated?: boolean, multicolor?: boolean}) => props)<{hex: any, text?: string, animated?: boolean, multicolor?: boolean}>`
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  margin: 8px 0 18px;
  border-radius: 14px;
  background: ${props => (props.hex || 'linear-gradient(90deg, #6A71FA 0%, #9C8AFA 100%)')};
  ${props => props.animated && props.multicolor && css`
      background-size: 100% 1000%;
      animation: ${MultiColorScroll} 17.5s linear infinite;
  `}
  ${props => props.animated && !props.multicolor && css`
      background-size: 150%;
      animation: ${MoveBackgroundPosition} 6s ease-in-out infinite;
  `}
  overflow: visible;
  /* Simplified glow that plays nice with confetti */
  box-shadow:
    0 16px 40px rgba(0,0,0,0.12),
    0 0 0 4px rgba(255,255,255,0.75),
    0 0 32px rgba(147,51,234,0.18),
    0 0 28px rgba(59,130,246,0.18);
`;

const LeaderCrown = styled.div`
  font-size: 2.2rem;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.25));
`;

const LeaderName = styled.div.attrs((props: { text?: string }) => props)<{ text?: string }>`
  font-family: "Coll";
  font-weight: 900;
  font-size: 3rem;
  color: ${props => props.text || '#111827'};
  text-shadow: 0 2px 0 rgba(255,255,255,0.4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LeaderScore = styled.div.attrs((props: { text?: string }) => props)<{ text?: string }>`
  font-weight: 900;
  font-size: 2rem;
  color: ${props => props.text || '#111827'};
`;


// Layout helpers and effects
const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RankBadge = styled.div.attrs((props: {rank: number}) => props)<{rank: number}>`
  min-width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(255,255,255,0.85);
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.95rem;
  border: 2px solid rgba(255,255,255,0.9);
`;

const DeltaUp = styled.span`
  color: #10b981;
  font-weight: 900;
  filter: drop-shadow(0 0 6px rgba(16,185,129,0.5));
`;

const DeltaDown = styled.span`
  color: #ef4444;
  font-weight: 900;
  filter: drop-shadow(0 0 6px rgba(239,68,68,0.5));
`;

const RankUp = keyframes`
  0% { transform: translateY(0); }
  25% { transform: translateY(-4px); }
  100% { transform: translateY(0); }
`;

const RankDown = keyframes`
  0% { transform: translateY(0); }
  25% { transform: translateY(4px); }
  100% { transform: translateY(0); }
`;

// Staggered fade-up for suspense reveal
const fadeUp = keyframes`
  0% { opacity: 0; transform: translateY(14px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Reveal = styled.div.attrs((props: { delayMs: number }) => props)<{ delayMs: number }>`
  opacity: 0;
  animation: ${fadeUp} 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${props => Math.max(0, props.delayMs)}ms;
`;

export default CurrentScores;

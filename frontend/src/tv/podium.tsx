import { Player, Start, Tvrapper } from "./game";
import styled, { css, keyframes } from "styled-components";
import logo from '../images/tavl-logo.png';
import { useEffect, useState } from "react";
import { put } from "../api";
import { Spinner } from "./selectGame";
import TopLeftLogo from "../components/TopLeftLogo";
import { useI18n } from "../i18n/I18nProvider";
import { selectableColors, textColors, animatedColorIndices, MULTICOLOR_INDEX } from "../phone/waiting";
// Use WebSocket as source of truth for players
import { useSocket } from "../context/SocketContext";


interface PodiumProps {
  gameInstanceId?: string;
  finish: () => void;
}

const Podium = ({ gameInstanceId, finish }: PodiumProps) => {
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const { t } = useI18n();


  useEffect(() => {
    if (!gameInstanceId) return;
    setLoading(true);
    socket.emit('get_players', { gameInstanceId: String(gameInstanceId) }, (resp: any) => {
      if (resp?.ok && Array.isArray(resp.players)) setPlayers(resp.players);
      setLoading(false);
    });
    socket.emit('join_game', String(gameInstanceId));
  }, [socket, gameInstanceId])

  // Announce game finished when podium opens
  useEffect(() => {
    if (!gameInstanceId) return;
    // Best-effort API update + WS broadcast so all clients know it's over
    put(`/game_instance/${gameInstanceId}/`, { status: 'finished', starttime: '' })
      .catch(() => { /* ignore */ })
      .finally(() => {
        socket.emit('join_game', String(gameInstanceId));
        socket.emit('game_status', { gameId: String(gameInstanceId), status: 'finished' });
      });
  }, [gameInstanceId, socket]);

  // Do a call to set game over

  if (loading) {
    <Tvrapper>
      <TopLeftLogo />
      <ContentPlayers>
        <Spinner/> 
      </ContentPlayers>
      <Start onClick={finish}>Next</Start>
    </Tvrapper>
    
  }

  // Sort players by score descending (safe for <3 players)
  const sorted = [...players].sort((a: Player, b: Player) => Number(b.score || 0) - Number(a.score || 0));

  return (
    <Tvrapper>
      <ConfettiScreenLayer>
        {Array.from({ length: 36 }).map((_, i) => {
          const left = (i * (100 / 35));
          const colors = ['#ffffff', '#fde047', '#22d3ee', '#fb7185', '#a78bfa'];
          const color = colors[i % colors.length];
          const delay = (i % 12) * 380;
          const duration = 4200 + (i % 7) * 700;
          const size = (i % 3) === 0 ? 9 : 7;
          return (
            <ScreenConfettiPiece
              key={`sc-${i}`}
              style={{ left: `${left}%`, background: color, width: `${size}px`, height: `${Math.round(size*1.6)}px`, animationDelay: `${delay}ms`, animationDuration: `${duration}ms` }}
            />
          );
        })}
      </ConfettiScreenLayer>
      
      <ContentPlayers>
        <Header><span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">{t('tv.podium.title') || 'Winners!'}</span></Header>
        { players?.length === 0 ? (
            <div>No players ...</div>
          ) : (
            (() => {
              const topFive = sorted.slice(0,5);
              const rows: JSX.Element[] = [];
              // Reveal bottom -> top with 600ms steps
              const delayForPos = (posFromTop: number) => (Math.max(0, (topFive.length - 1 - posFromTop)) * 600);
              if (topFive[0]) {
                const p = topFive[0];
                const idx = Number(p.colour)||0;
                const hex = selectableColors[idx];
                const text = textColors[idx]||'#111827';
                const animated = animatedColorIndices.has(idx);
                const multicolor = idx===MULTICOLOR_INDEX;
                rows.push(
                  <Reveal key={'w'} delayMs={delayForPos(0)}>
                    <WinnerBanner hex={hex} text={text} animated={animated} multicolor={multicolor}>
                      <WinnerCrown>🏆</WinnerCrown>
                      <WinnerName text={text}>{p.username}</WinnerName>
                      <WinnerScore text={text}>{p.score}</WinnerScore>
                    </WinnerBanner>
                  </Reveal>
                );
              }
              for (let i=1; i<topFive.length; i++) {
                const p = topFive[i];
                const idx = Number(p.colour)||0;
                rows.push(
                  <Reveal key={`r-${i}`} delayMs={delayForPos(i)}>
                    <ScoreEntry
                      hex={selectableColors[idx]}
                      text={textColors[idx]}
                      animated={animatedColorIndices.has(idx)}
                      multicolor={idx===MULTICOLOR_INDEX}
                      idx={idx}
                    >
                      <Name>{i+1}. {p.username}</Name>
                      <Score>{p.score}</Score>
                    </ScoreEntry>
                  </Reveal>
                );
              }
              return rows;
            })()
          )}
      </ContentPlayers>
      <Start onClick={finish}>{t('common.finish') || 'Finish'}</Start>
      <BottomLogo src={logo} alt="Tavl" />
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
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 60vw;
    max-width: 85vw;
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

const ScoreEntry = styled.div.attrs((props: {hex: any, text?: string, animated?: boolean, multicolor?: boolean, idx?: number}) => props)<{hex: any, text?: string, animated?: boolean, multicolor?: boolean, idx?: number}>`
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
  left: 50%;
  font-family: "Coll";
  background: ${props => (props.hex || 'linear-gradient(90deg, #6A71FA 0%, #9C8AFA 100%)')};
    ${props => props.animated && props.multicolor && css`
        background-size: 100% 1000%;
        animation: ${MultiColorScroll} 17.5s linear infinite;
    `}
    ${props => props.animated && !props.multicolor && css`
        background-size: 150%;
        animation: ${MoveBackgroundPosition} 6s ease-in-out infinite;
    `}
  color: ${props => props.text || 'white'};
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-left: 14px;
  padding-right: 14px;
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
`;

export default Podium;
 
// Animations and overlays
const fadeUp = keyframes`
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
`;
const Reveal = styled.div.attrs((props: { delayMs: number }) => props)<{ delayMs: number }>`
  opacity: 0;
  animation: ${fadeUp} 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${props => Math.max(0, props.delayMs)}ms;
`;

const confettiFall = keyframes`
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(110vh) rotate(540deg); opacity: 1; }
`;

const ConfettiScreenLayer = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
`;

const ScreenConfettiPiece = styled.span`
  position: absolute;
  top: -10vh;
  width: 6px;
  height: 12px;
  border-radius: 2px;
  opacity: 0;
  animation-name: ${confettiFall};
  animation-timing-function: linear;
  animation-iteration-count: infinite;
`;

// Bottom-centered Tavl logo
const BottomLogo = styled.img`
  position: fixed;
  left: 3%;
  top: 3%;
  height: 34px;
  pointer-events: none;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));
`;

// Extra animations (declare before usage)
const Spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const HueRotate = keyframes`
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
`;

const ShimmerDiag = keyframes`
  0% { background-position: 0% 0%; }
  50% { background-position: 150% 150%; }
  100% { background-position: 0% 0%; }
`;

const StripesScroll = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 200px 200px; }
`;
const pulseGlow = keyframes`
  0% { box-shadow: 0 16px 40px rgba(0,0,0,0.12), 0 0 0 4px rgba(255,255,255,0.75), 0 0 32px rgba(147,51,234,0.18), 0 0 28px rgba(59,130,246,0.18); }
  50% { box-shadow: 0 20px 52px rgba(0,0,0,0.14), 0 0 0 6px rgba(255,255,255,0.85), 0 0 48px rgba(147,51,234,0.28), 0 0 44px rgba(59,130,246,0.28); }
  100% { box-shadow: 0 16px 40px rgba(0,0,0,0.12), 0 0 0 4px rgba(255,255,255,0.75), 0 0 32px rgba(147,51,234,0.18), 0 0 28px rgba(59,130,246,0.18); }
`;

const crownBounce = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  30% { transform: translateY(-6px) rotate(-4deg); }
  60% { transform: translateY(0) rotate(2deg); }
`;

// Winner banner
const WinnerBanner = styled.div.attrs((props: {hex: any, text?: string, animated?: boolean, multicolor?: boolean}) => props)<{hex: any, text?: string, animated?: boolean, multicolor?: boolean}>`
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 20px 28px;
  margin: 12px 0 6px;
  border-radius: 16px;
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
  box-shadow:
    0 16px 40px rgba(0,0,0,0.12),
    0 0 0 4px rgba(255,255,255,0.75),
    0 0 32px rgba(147,51,234,0.18),
    0 0 28px rgba(59,130,246,0.18);
  animation: ${pulseGlow} 1600ms ease-in-out 2 600ms;
`;

const WinnerCrown = styled.div`
  font-size: 2.6rem;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.25));
  animation: ${crownBounce} 1600ms ease-in-out infinite;
`;

const WinnerName = styled.div.attrs((props: { text?: string }) => props)<{ text?: string }>`
  font-family: "Coll";
  font-weight: 900;
  font-size: 3.2rem;
  color: ${props => props.text || '#111827'};
  text-shadow: 0 2px 0 rgba(255,255,255,0.4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const WinnerScore = styled.div.attrs((props: { text?: string }) => props)<{ text?: string }>`
  font-weight: 900;
  font-size: 2.2rem;
  color: ${props => props.text || '#111827'};
`;

import { useContext, useEffect } from "react";
import styled, { css, keyframes } from "styled-components";
import TopLeftLogo from "../components/TopLeftLogo";
import TopRightPoints from "../components/TopRightPoints";
import { HeaderMobile, MobileHeader, MobileNav } from "../landing";
import { GameContext } from "../GameContext";
import { useSocket } from "../context/SocketContext";

interface WaitingProps {
  points: number;
  setPoints: (n: number) => void;
  gameStarted: () => void;
  gamepin: string | undefined;
  setColorForUser: (no: number) => void;
  colorForUser: number;
}

export const selectableColors = [
  '#9C8AFA',          // lavender
  '#5DB868',          // green
  '#F87474',          // red
  '#111827',          // near-black
  'linear-gradient(90deg, #3b82f6, #8b5cf6)', // blue→purple (premium)
  'linear-gradient(90deg, #10b981, #06b6d4)', // emerald→cyan (premium)
  'linear-gradient(90deg, #ec4899, #f59e0b)', // pink→amber (premium)
  // Animated gold (premium+): shimmering repeating gradient
  'repeating-linear-gradient(to right, #a2682a 0%, #be8c3c 8%, #be8c3c 18%, #d3b15f 27%, #faf0a0 35%, #ffffc2 40%, #faf0a0 50%, #d3b15f 58%, #be8c3c 67%, #b17b32 77%, #bb8332 83%, #d4a245 88%, #e1b453 93%, #a4692a 100%)',
  // Multicolor animated gradient (kayac-inspired)
  'linear-gradient(180deg, #655bef 0%, #fa28bf 20%, #ff4665 40%, #fbde4e 60%, #00fbea 80%, #555def 100%)'
]

// Text colors matching indices in selectableColors
export const textColors: string[] = [
  '#FFFFFF', // lavender -> white text
  '#FFFFFF', // green -> white text
  '#FFFFFF', // red -> white text
  '#FFFFFF', // near-black -> white text
  '#FFFFFF', // blue→purple gradient -> white text
  '#FFFFFF', // emerald→cyan gradient -> white text
  '#FFFFFF', // pink→amber gradient -> white text
  '#111827', // gold gradient -> black text
  '#111827', // multicolor gradient -> black text
];

// Indices that should animate in UI (gold + multicolor)
export const animatedColorIndices = new Set<number>([7, 8]);
export const MULTICOLOR_INDEX = 8;

const colorCosts: Record<number, number> = {
  4: 50,
  5: 50,
  6: 50,
  7: 100,
  8: 100,
};

const Waiting = ({ points, setPoints, gameStarted, gamepin, colorForUser, setColorForUser }: WaitingProps) => {
  const { gameInstancePlayerId, gameInstanceId } = useContext(GameContext);
  const { socket, connected } = useSocket();

  useEffect(() => {
    // Prefer WebSocket event for status changes
    if (gameInstanceId) {
      socket.emit('join_game', String(gameInstanceId));
      const onStatus = (payload: { gameId?: string; status?: string }) => {
        if (payload?.gameId === String(gameInstanceId) && payload?.status && payload.status !== 'created') {
          gameStarted();
        }
      };
      socket.on('game_status', onStatus);
      return () => {
        socket.off('game_status', onStatus);
      };
    }
  }, [socket, gameInstanceId, gameStarted]);


  const setColor = (number: number) => {
    const cost = colorCosts[number] || 0;
    const targetScore = cost > 0 ? -cost : 0;
    setColorForUser(number);
    if (!gameInstanceId) return;
    // Set absolute score based on selected color cost to avoid repeated charges
    setPoints(targetScore);
    socket.emit('score_update', { gameInstanceId: String(gameInstanceId), score: targetScore });
    socket.emit('color_update', { gameInstanceId: String(gameInstanceId), colour: number }, (resp: any) => {
      if (!resp?.ok) {
        console.log('WS color_update failed', resp?.error);
      }
    });
  }

    //select color - maybe 5 circles?
    // diffent power ups for each color, maybe some sort of name?
  
    // Should be an upgrade getting black with gold letters
  
  return(
    <MobileGameWrapper>
      <MobileNav>
      <TopLeftLogo />
      <TopRightPoints points={points} color={selectableColors[colorForUser]} textColor={textColors[colorForUser]} animate={animatedColorIndices.has(colorForUser)} multicolor={colorForUser === MULTICOLOR_INDEX}/>
      </MobileNav>
      <BlueWrapper>
        <MobileHeader>Waiting for game to begin...</MobileHeader>
        
      </BlueWrapper>
      <HeaderMobile>Select your color</HeaderMobile>
      <ColorPicker>
        {selectableColors.map((c, i) => (
          <Color key={i} hex={c} animated={animatedColorIndices.has(i)} multicolor={i === MULTICOLOR_INDEX} onClick={() => setColor(i)}>
            {colorCosts[i] ? <CostBadge>{colorCosts[i]}</CostBadge> : null}
          </Color>
        ))}
      </ColorPicker>

    </MobileGameWrapper>
  );
    
}

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

const Color = styled.div.attrs((props: {hex: any, animated?: boolean, multicolor?: boolean}) => props)<{hex: any, animated?: boolean, multicolor?: boolean}>`
  width: calc(100% - 60px);
  display: block;
  margin-bottom: 20px;
  margin-left: auto;
  margin-right: auto;
  background: ${props => (props.hex)};
  ${props => props.multicolor && css`
    background-size: 100% 1000%;
    animation: ${MultiColorScroll} 17.5s linear infinite;
  `}
  ${props => props.animated && !props.multicolor && css`
    background-size: 150%;
    animation: ${MoveBackgroundPosition} 6s ease-in-out infinite;
    filter: drop-shadow(0 0 1px rgba(255, 200, 0, .3));
  `}
  height: 60px;
  border-radius: 15px;
  position: relative;
`;

const CostBadge = styled.div`
  position: absolute;
  right: 8px;
  top: 8px;
  background: rgba(255,255,255,0.9);
  color: #111827;
  border: 2px solid #dbeafe;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
`;

const ColorPicker = styled.div`
  width: 100%;
  display: block;
`;

export const MobileGameWrapper = styled.div`
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: block;
  position: absolute;
`;

export const BlueWrapper = styled.div`
  background-image: linear-gradient(180deg, #6A71FA 0%, #9C8AFA 100%);
  width: 100%;
`;


export default Waiting;

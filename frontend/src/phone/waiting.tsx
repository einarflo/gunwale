import { useContext, useEffect, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import logo from '../images/tavl-logo.png';
import TopRightPoints from "../components/TopRightPoints";
import { HeaderMobile, MobileHeader, MobileNav } from "../landing";
import { useI18n } from "../i18n/I18nProvider";
import { GameContext } from "../GameContext";
import { useSocket } from "../context/SocketContext";
import upgrades from "../data/upgrades";

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
  'linear-gradient(180deg, #655bef 0%, #fa28bf 20%, #ff4665 40%, #fbde4e 60%, #00fbea 80%, #555def 100%)',
  // Extra spicy options
  'linear-gradient(135deg, #34d399, #3b82f6, #a78bfa)',
  'conic-gradient(from 0deg, #ff6b6b, #feca57, #54a0ff, #5f27cd, #ff6b6b)',
  'radial-gradient(circle at 30% 30%, #f472b6, #3b82f6 60%, #10b981)',
  'repeating-linear-gradient(45deg, #0f172a, #0f172a 10px, #1e293b 10px, #1e293b 20px)',
  'linear-gradient(90deg, #ff9a9e, #fad0c4, #ff9a9e)',
  'linear-gradient(270deg, #00DBDE, #FC00FF)',
  'linear-gradient(90deg, #f7971e, #ffd200)',
  'linear-gradient(90deg, #43cea2, #185a9d)',
  'linear-gradient(90deg, #8E2DE2, #4A00E0)',
  'linear-gradient(90deg, #ff9966, #ff5e62)'
  ,
  // Extra repeating-linear stripes (spicy)
  'repeating-linear-gradient(135deg, #ff00667c 0 8px, #ffd500b6 8px 16px)',
  'repeating-linear-gradient(60deg, #00f5d4 0 10px, #d3b5f7ff 10px 20px)',
  'repeating-linear-gradient(25deg, #f15bb5 0 6px, #2ec4b6 6px 12px, #f15bb5 12px 18px)',
  'repeating-linear-gradient(90deg, #ff7f50 0 12px, #1e3a8a 12px 24px)',
  'repeating-linear-gradient(45deg, #14b8a6 0 10px, #f59e0b 10px 20px, #ef4444 20px 30px)'
  ,
  // Extra solid colors
  '#2563eb', // blue-600
  '#f59e0b', // amber-500
  '#0ea5e9', // sky-500
  '#a855f7', // violet-500
  '#f97316', // orange-500
  '#22c55e', // green-500
  '#e11d48'  // rose-600
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
  '#FFFFFF', // extra 1
  '#FFFFFF', // conic
  '#FFFFFF', // radial
  '#FFFFFF', // dark stripes
  '#111827', // light pink
  '#FFFFFF', // cyan-magenta
  '#111827', // gold-ish
  '#FFFFFF', // teal-blue
  '#FFFFFF', // purple
  '#FFFFFF', // orange-red
  '#ffffffff', // stripes neon pink/yellow
  '#111827', // stripes teal/purple
  '#111827', // stripes pink/teal
  '#FFFFFF', // stripes coral/navy
  '#FFFFFF', // stripes teal/amber/red
  '#FFFFFF', // blue-600
  '#111827', // amber-500
  '#FFFFFF', // sky-500
  '#FFFFFF', // violet-500
  '#FFFFFF', // orange-500
  '#FFFFFF', // green-500
  '#FFFFFF', // rose-600
];

// Indices that should animate in UI (gold + multicolor)
// Mark indices that should animate (in addition to gold + multicolor)
// Animate premium/multicolor, special gradients, and all stripe variants
export const animatedColorIndices = new Set<number>([7, 8, 10, 11, 12, 14, 17, 18, 19, 20, 21, 22, 23]);
export const MULTICOLOR_INDEX = 8;

// Pricing: base gradients (4-6) cost 50, premium/animated cost 100.
// Extended palette (9-18): animated = 100, others = 50.
const colorCosts: Record<number, number> = {
  4: 50,
  5: 50,
  6: 50,
  7: 100,
  8: 100,
  9: 50,
  10: 100,
  11: 100,
  12: 100,
  13: 50,
  14: 100,
  15: 50,
  16: 50,
  17: 100,
  18: 100,
  19: 100,
  20: 100,
  21: 100,
  22: 100,
  23: 100,
};

const Waiting = ({ points, setPoints, gameStarted, gamepin, colorForUser, setColorForUser }: WaitingProps) => {
  const { gameInstancePlayerId, gameInstanceId } = useContext(GameContext);
  const { socket, connected } = useSocket();
  const { t } = useI18n();
  const [tick, setTick] = useState(0);

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

  // Rotate available upgrades while waiting
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % upgrades.length), 3500);
    return () => clearInterval(id);
  }, []);


  const setColor = (number: number) => {
    const cost = colorCosts[number] || 0;
    console.log('Setting color', number, 'cost', cost, 'current points', points);
    setColorForUser(number);
    if (!gameInstanceId) return;
    // Set absolute points to negative cost to avoid double-charging
    const targetScore = cost > 0 ? -cost : 0;
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
        <img alt="Tavl logo" className="h-10 mt-5 ml-4" src={logo} />
        <TopRightPoints points={points} color={selectableColors[colorForUser]} textColor={textColors[colorForUser]} animate={animatedColorIndices.has(colorForUser)} multicolor={colorForUser === MULTICOLOR_INDEX}/>
      </MobileNav>
      <BlueWrapper>
        <Ticker>
          <TickImage src={upgrades[tick].image} alt={upgrades[tick].header} />
          <TickText>
            <TickTitle>{upgrades[tick].header}</TickTitle>
            <TickDesc>{upgrades[tick].description}</TickDesc>
            <TickPrice>{upgrades[tick].price}</TickPrice>
          </TickText>
        </Ticker>
      </BlueWrapper>
      <HeaderMobile>{t('waiting.selectColor')}</HeaderMobile>
      <ColorGrid>
        {(() => {
          const order = selectableColors.map((_, i) => i).sort((a, b) => ((colorCosts[a] || 0) - (colorCosts[b] || 0)) || (a - b));
          return order.map((i) => (
          <ColorCircle
            key={i}
            hex={selectableColors[i]}
            animated={animatedColorIndices.has(i)}
            multicolor={i === MULTICOLOR_INDEX}
            idx={i}
            selected={i === colorForUser}
            onClick={() => setColor(i)}
            aria-label={`Color ${i+1}`}
          >
            {colorCosts[i] ? <CostBadge>{colorCosts[i]}</CostBadge> : null}
          </ColorCircle>
          ));
        })()}
      </ColorGrid>
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

// Extra fancy animations
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

const PulseGlow = keyframes`
  0%,100% { box-shadow: inset 0 0 0 3px rgba(255,255,255,0.85), 0 6px 16px rgba(0,0,0,0.2); }
  50% { box-shadow: inset 0 0 0 3px rgba(255,255,255,1), 0 10px 24px rgba(0,0,0,0.3), 0 0 24px rgba(255,255,255,0.25); }
`;

const ColorCircle = styled.button.attrs((props: {hex: any, animated?: boolean, multicolor?: boolean, idx?: number, selected?: boolean}) => props)<{hex: any, animated?: boolean, multicolor?: boolean, idx?: number, selected?: boolean}>`
  appearance: none;
  border: none;
  width: 56px;
  height: 56px;
  border-radius: 9999px;
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
  position: relative;
  box-shadow: inset 0 0 0 3px rgba(255,255,255,0.85), 0 6px 16px rgba(0,0,0,0.2);
  cursor: pointer;
  ${props => props.selected && css`
    box-shadow:
      0 0 0 3px #fff,
      0 0 0 6px rgba(59,130,246,0.85),
      inset 0 0 0 3px rgba(255,255,255,0.9),
      0 10px 24px rgba(0,0,0,0.3);
    /* extra visible ring without touching transform (keeps animations intact) */
    &::after {
      content: '';
      position: absolute;
      inset: -6px;
      border-radius: 9999px;
      border: 3px solid rgba(255,255,255,0.9);
      box-shadow: 0 0 0 4px rgba(59,130,246,0.65);
      pointer-events: none;
    }
  `}
  ${props => props.idx === 11 && css`
    /* radial pulse shimmer */
    background-size: 120% 120%;
    animation: ${ShimmerDiag} 7s ease-in-out infinite;
  `}
  ${props => (props.idx === 17) && css`
    /* hue rotate subtle */
    animation: ${HueRotate} 10s linear infinite;
  `}
  ${props => (props.idx === 18 || props.idx === 15) && css`
    /* glow pulse */
    animation: ${PulseGlow} 2.2s ease-in-out infinite;
  `}
`;

const CostBadge = styled.div`
  position: absolute;
  right: -6px;
  top: -6px;
  background: rgba(255,255,255,0.9);
  color: #111827;
  border: 2px solid #dbeafe;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
`;

const ColorGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  padding: 0 20px;
  justify-items: center;
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

const Ticker = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
`;

const TickImage = styled.img`
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.25));
`;

const TickText = styled.div`
  color: #ffffff;
  font-family: 'Coll';
`;

const TickTitle = styled.div`
  font-weight: 900;
  font-size: 1.1rem;
  margin-bottom: 2px;
`;

const TickDesc = styled.div`
  opacity: 0.9;
  font-size: 0.9rem;
`;

const TickPrice = styled.div`
  display: inline-block;
  margin-top: 6px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 900;
  padding: 2px 8px;
`;


export default Waiting;

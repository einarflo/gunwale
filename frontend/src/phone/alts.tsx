/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useRef, useState } from "react"
import styled, { keyframes } from "styled-components"
import { Question } from "../tv/game"
import { GameWrapper, MobileSpinner } from "./game"
import OptionButton from "./option"
import { Text } from "./result"
import { MobileNav } from "../landing"
import TopRightPoints from "../components/TopRightPoints"
import { selectableColors, textColors, animatedColorIndices, MULTICOLOR_INDEX } from "./waiting"
import { GameContext } from "../GameContext"
import { useSocket } from "../context/SocketContext";
import one from '../images/upgrades/1.png';
import two from '../images/upgrades/2.png';
import three from '../images/upgrades/3.png';
import four from '../images/upgrades/4.png';
import five from '../images/upgrades/5.png';
import six from '../images/upgrades/6.png';
import seven from '../images/upgrades/7.png';
import eight from '../images/upgrades/8.png';
import logo from '../images/tavl-logo.png';
// All interactions moved to WebSocket

interface AltsProps {
  points: number;
  setPoints: (points: number) => void;
  answered: () => void;
  question: Question;
  fif: boolean;
  buyfif: () => void;
  stop: boolean;
  buyStop: () => void;
  color: number;
  multiplier?: number;
  hasEye?: boolean;
  hasShield?: boolean;
  hasSlow?: boolean;
  hasEndOpponent?: boolean;
  hasNuke?: boolean;
}

const Alts = ({ points, setPoints, answered, question, fif, buyfif, stop, buyStop, color, multiplier = 1, hasEye = false, hasShield = false, hasSlow = false, hasEndOpponent = false, hasNuke = false }: AltsProps) => {
  const { gameInstancePlayerId, gameInstanceId, gameId, nickname } = useContext(GameContext);
  const { socket } = useSocket();

  const [roundPoints, setRoundPoints] = useState(0);
  const [score, setScore] = useState(1000);

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const roundPointsRef = useRef(roundPoints);
  roundPointsRef.current = roundPoints;

  const [answerSelected, setAnswerSelected] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

  const answerSelectedRef = useRef(answerSelected);
  answerSelectedRef.current = answerSelected;

  const [hide, setHide] = useState<string[]>([]);
  const [stopTime, setStopTime] = useState(false);
  const [eyeSummary, setEyeSummary] = useState<{ counts: Record<'1'|'2'|'3'|'4', number>, totalPlayers: number, totalResponded: number } | null>(null);
  const [eyeActive, setEyeActive] = useState(false);


  // Score update via WebSocket (server persists and broadcasts)
  const setUserPoints = (points: number) => {
    if (!gameInstanceId) return;
    socket.emit('score_update', { gameInstanceId: String(gameInstanceId), score: points }, (resp: any) => {
      if (!resp?.ok) console.log('WS score_update failed', resp?.error);
    });
  }

  const pushAnswer = (points: number, answer: string, correct: boolean) => {
    if (!gameInstanceId || !gameInstancePlayerId || !gameId) return;
    socket.emit('answer_submit', {
      gameInstanceId: String(gameInstanceId),
      playerId: String(gameInstancePlayerId),
      gameId: String(gameId),
      gameQuestionId: String(question.uuid),
      points: String(points),
      alternative: answer,
      correct: correct ? '1' : '0',
    }, (resp: any) => {
      if (!resp?.ok) console.log('WS answer_submit failed', resp?.error);
    });
  }

  // Points counter
  useEffect(() => {
    // Maks 1000 poeng - fordelt på antall sekunder - delt opp i 100 (pga. 10 ms)
    const timeSec = Math.max(1, Number(question.time ?? 20));
    const subtract = 1000 / timeSec / 100;
    const countdown = setInterval(() => {
      // Minimum score 115
      if (score > 115 && !stopTime) {
        setScore(scoreRef.current - subtract)
      }
    }, (10));

    return () => clearInterval(countdown)
  }, [score])

  useEffect(() =>{
    setTimeout(() => {
      // COMMENT OUT FOR DEBUG
      questionTimeEnd();
    }, (Math.max(1, Number(question.time ?? 20)) * 1000))
  }, [])

  // Eye polling: fetch live distribution while Eye is active and until question ends
  useEffect(() => {
    if (!eyeActive) { setEyeSummary(null); return; }
    if (!gameInstanceId || !question?.uuid) return;
    let alive = true;
    const poll = () => {
      socket.emit('get_answer_counts', { gameInstanceId: String(gameInstanceId), gameQuestionId: String(question.uuid) }, (resp: any) => {
        if (!alive) return;
        if (resp?.ok && resp.counts) {
          setEyeSummary({ counts: resp.counts, totalPlayers: Number(resp.totalPlayers||0), totalResponded: Number(resp.totalResponded||0) });
        }
      });
    };
    const iv = setInterval(poll, 1000);
    poll();
    return () => { alive = false; clearInterval(iv); };
  }, [eyeActive, gameInstanceId, question?.uuid, socket]);

  // Allow host to end question early via WS broadcast
  useEffect(() => {
    if (!gameInstanceId) return;
    socket.emit('join_game', String(gameInstanceId));
    const onEnd = (payload: any) => {
      if (payload?.gameId === String(gameInstanceId)) {
        questionTimeEnd();
      }
    };
    socket.on('question_end', onEnd);
    return () => { socket.off('question_end', onEnd); };
  }, [socket, gameInstanceId]);

  const questionTimeEnd = () => {
    if (!answerSelectedRef.current) {
      selectOption('0');
    }

    // show correct answer
    setShowCorrect(true);

    // move on after 3 sec
    setTimeout(() => {
      // Set points in app
      setPoints(points + roundPointsRef.current);
      answered();
    }, 5000)
  }

  const usStop = () => {
    if (stop) {
      buyStop();
      setStopTime(true);
    }
  }

  const usfif = () => {
    if (fif) {
      buyfif();
      const opt = getRadomOption();
      setHide(options.filter(option => !(option === question?.correct || option === opt)))
    }
  }

  const getRadomOption = () => {
    return options.filter(option => !(option === question?.correct))[Number((Math.random() * 3).toFixed(0))];
  }

  const options = ["1", "2", "3", "4"];
  
  // User clicks alternative
  const selectOption = (answer: string) => {
    // Show loader while waiting for timeout
    setAnswerSelected(true);

    setAnsweredCorrectly(answer === question?.correct);

    // push to server
    pushAnswer(score, answer, answer === question?.correct)

    // If it is correct 
    if (answer === question?.correct) {
      // POST new point score to server
      const earned = Math.round(score * (multiplier || 1));
      setUserPoints(points + earned);
      // server broadcasts player_update on score_update
      // Set the state
      setRoundPoints(earned)
    }
  }

  // Waiting for result to be revealed 
  if (answerSelected && !showCorrect) {
    return (
    <GameWrapper hasShield={hasShield}>
        <MobileNav>
          <img alt="Tavl logo" className="h-10 mt-5 ml-4" src={logo} />
          <TopRightPoints points={points} color={selectableColors[color]} textColor={textColors[color]} animate={animatedColorIndices.has(color)} multicolor={color === MULTICOLOR_INDEX}/>
        </MobileNav>
        <Text>Waiting for your score...</Text>
        <MobileSpinner/>
    </GameWrapper>);
  }

  // Showing the result for 3 seconds
  if (answerSelected && showCorrect) {
    return (
    <GameWrapper hasShield={hasShield} style={{ background: answeredCorrectly ? 'linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(0,164,67,1) 0%, rgba(34,214,135,1) 100%)' : 'linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(255,39,39,1) 0%, rgba(247,89,89,1) 100%)' }}>
        <MobileNav>
          <img alt="Tavl logo" className="h-10 mt-5 ml-4" src={logo} />
          <TopRightPoints points={points} color={selectableColors[color]} textColor={textColors[color]} animate={animatedColorIndices.has(color)} multicolor={color === MULTICOLOR_INDEX}/>
        </MobileNav>
        <Text>{answeredCorrectly ? 'Correct' : 'Nope!'}</Text>
        <Text>You got {answeredCorrectly ? roundPoints : 0} points</Text>
    </GameWrapper>);

  }

  // Showing alternatives
  return(
    <GameWrapper hasShield={hasShield}>
      <MobileNav>
        <img alt="Tavl logo" className="h-10 mt-5 ml-4" src={logo} />
        <TopRightPoints points={points} color={selectableColors[color]} textColor={textColors[color]} animate={animatedColorIndices.has(color)} multicolor={color === MULTICOLOR_INDEX}/>
      </MobileNav>
      {eyeSummary && (
        <EyeOverlay>
          <div className="title">Live answers</div>
          <Bars>
            {(['1','2','3','4'] as const).map((k, idx) => {
              const c = eyeSummary.counts[k] || 0;
              const total = Math.max(eyeSummary.totalPlayers, 1);
              const pct = Math.round((c / total) * 100);
              const label = idx === 0 ? 'A' : idx === 1 ? 'B' : idx === 2 ? 'C' : 'D';
              const color = selectableColors[idx];
              return (
                <BarRow key={k}>
                  <span className="lbl">{label}</span>
                  <div className="bar"><div className="fill" style={{ width: `${pct}%`, background: color }} /></div>
                  <span className="val">{c}</span>
                </BarRow>
              );
            })}
          </Bars>
          <div className="foot">{eyeSummary.totalResponded}/{eyeSummary.totalPlayers} responded</div>
        </EyeOverlay>
      )}
      
      <PowerUpContainer>
        <PowerUpIcon src={one} has={fif} onClick={() => usfif()}/>
        <PowerUpIcon src={two} has={stop} onClick={() => usStop()}/>
        <PowerUpIcon src={three} has={multiplier > 1} checked={multiplier > 1} onClick={() => {}}/>
        <PowerUpIcon
          src={four}
          has={hasEye}
          checked={eyeActive}
          onClick={() => {
            if (!hasEye) return;
            const next = !eyeActive;
            setEyeActive(next);
            if (next) {
              socket.emit('powerup', { gameInstanceId: String(gameInstanceId), type: 'eye' });
            }
          }}
        />
        <PowerUpIcon src={five} has={hasShield} checked={hasShield} onClick={() => {}}/>
        <PowerUpIcon src={six} has={hasSlow} onClick={() => {}}/>
        <PowerUpIcon src={seven} has={hasEndOpponent} onClick={() => {}}/>
        <PowerUpIcon src={eight} has={hasNuke} onClick={() => {}}/>
      </PowerUpContainer>
      <TimeBar time={String(Math.max(1, Number(question.time ?? 20)))} stop={stopTime}/>
      <AltsContainer>
      <Top>
        <OptionButton hide={hide.includes("1")} description={(question?.alt1 ?? '') as string} select={() => selectOption('1')} colour={selectableColors[0]} />
        <OptionButton hide={hide.includes("2")} description={(question?.alt2 ?? '') as string} select={() => selectOption('2')} colour={selectableColors[1]} />
      </Top>
      <Bot>
        <OptionButton hide={hide.includes("3")} description={(question?.alt3 ?? '') as string} select={() => selectOption('3')} colour={selectableColors[2]} />
        <OptionButton hide={hide.includes("4")} description={(question?.alt4 ?? '') as string} select={() => selectOption('4')} colour={selectableColors[3]} />
        </Bot>
      </AltsContainer>

    </GameWrapper>
  )
}

type PowerUpIconProps = { has: boolean; checked?: boolean; src: string };

export const PowerUpIcon = styled.div<PowerUpIconProps>`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  background-color: #ffffff;
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-position: center;
  background-size: 75%;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  cursor: pointer;
  opacity: ${props => props.has ? '100%' : '35%'};
  touch-action: manipulation;

  &::after {
    content: '✓';
    position: absolute;
    inset: 4px;
    display: ${props => props.checked ? 'flex' : 'none'};
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(34,197,94,0.9);
    color: #fff;
    font-weight: 900;
    font-size: 18px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.2);
  }
`;

export const PowerUp = styled.div.attrs((props: {has: boolean}) => props)`
  background: white;
  width: 20%;
  margin: 20px;
  border-radius: 10px;
  padding: 12px;
  font-weight: bold;
  right: 0;
  color: black;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.has ? '100%' : '30%'};
  touch-action: manipulation;
`;

export const PowerUpContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  background: white;
  margin: 10px;
  padding: 8px;
  border-radius: 15px;
  width: calc(100% - 20px);
  max-width: 520px;
  align-self: center;
`;

const AltsContainer = styled.div`
  background: white;
  margin: 10px;
  border-radius: 15px;
`;

export const Top = styled.div`
 display: flex;
`;

export const Bot = styled.div`
 display: flex;
`;

const progressbar = keyframes`
    100% { width: 0; }
    0% { width: calc(100vw - 40px); }
`;

const TimeBar = styled.div.attrs((props: {time: string, stop: boolean}) => props)`
  background: #ffffff;
  padding: 10px;
  margin: 10px;
  border-radius: 15px;
  left: 50%;
  height: 3px;
  animation: ${progressbar} ${props => props.time}s linear;
  animation-fill-mode:both;
  -webkit-animation: ${progressbar} ${props => props.time}s linear;
  opacity: ${props => props.stop ? '0%' : '100%'}
`;

export default Alts;

// Shield aura badge
const ShieldBadge = styled.div`
  position: fixed;
  top: 58px;
  right: 12px;
  z-index: 30;
  background: #ecfccb;
  color: #166534;
  border: 2px solid #bbf7d0;
  border-radius: 9999px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
  font-weight: 800;
  padding: 6px 10px;
  font-size: 12px;
`;

// Pulsing spherical green gradient overlay when shield active
const ShieldAura = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 40%, rgba(34,197,94,0.18), transparent 55%),
              radial-gradient(circle at 20% 70%, rgba(34,197,94,0.12), transparent 60%),
              radial-gradient(circle at 80% 30%, rgba(34,197,94,0.10), transparent 65%);
  animation: shieldPulse 4.5s ease-in-out infinite;
  @keyframes shieldPulse {
    0%, 100% { opacity: 0.25; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(1.03); }
  }
`;

// Status bar chips for active effects
const StatusBar = styled.div`
  position: fixed;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
  display: flex;
  gap: 6px;
  padding: 4px 6px;
  background: rgba(255,255,255,0.85);
  border: 2px solid #e5e7eb;
  border-radius: 9999px;
  backdrop-filter: blur(6px);
`;
const StatusChip = styled.div`
  border-radius: 9999px;
  border: 2px solid transparent;
  padding: 4px 8px;
  font-weight: 800;
  font-size: 11px;
`;

// Eye overlay styles
const EyeOverlay = styled.div`
  position: fixed;
  top: 56px;
  left: 8px;
  z-index: 30;
  width: min(88vw, 280px);
  background: #ffffff;
  border: 2px solid #bfdbfe;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.15);
  padding: 10px;
  .title { font-weight: 800; font-size: 13px; color: #1f2937; margin-bottom: 6px; }
  .foot { font-size: 11px; color: #475569; margin-top: 4px; }
`;
const Bars = styled.div`
  display: flex;
  gap: 6px;
  flex-direction: column;
`;
const BarRow = styled.div`
  display: grid;
  grid-template-columns: 20px 1fr 28px;
  gap: 6px;
  align-items: center;
  .lbl { font-weight: 800; color: #334155; }
  .bar { height: 10px; background: #f1f5f9; border-radius: 9999px; overflow: hidden; border: 1px solid #e5e7eb; }
  .fill { height: 100%; border-radius: 9999px; }
  .val { font-size: 12px; color: #334155; text-align: right; }
`;

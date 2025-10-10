import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { GameWrapper, MobileSpinner } from "./game";
import { ItemImage, ItemImageMobile, MobileNav } from "../landing";
import TopRightPoints from "../components/TopRightPoints";
import { selectableColors, textColors, animatedColorIndices, MULTICOLOR_INDEX } from "./waiting";
import { GameContext } from "../GameContext";
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

interface ResultProps {
  currentQ: number
  points: number
  nextQuestionStarted: () => void
  gameFinished: () => void
  fif: boolean;
  buyfif: () => void
  setPoints: (points: number) => void
  stop: boolean;
  buyStop: () => void
  color: number;
  hasNext?: boolean;
  buyMultiplier?: () => void;
  buyEye?: () => void;
  buyShield?: () => void;
  buySlow?: () => void;
  buyEndOpponent?: () => void;
  buyNuke?: () => void;
  hasMultiplier?: boolean;
  hasEye?: boolean;
  hasShield?: boolean;
  hasSlow?: boolean;
  hasEndOpponent?: boolean;
  hasNuke?: boolean;
}

const Result = ({ currentQ, points, nextQuestionStarted, gameFinished, fif, buyfif, setPoints, buyStop, stop, color, hasNext, buyMultiplier, buyEye, buyShield, buySlow, buyEndOpponent, buyNuke, hasMultiplier, hasEye, hasShield, hasSlow, hasEndOpponent, hasNuke }: ResultProps) => {
  const { gamePin, gameInstanceId, gameInstancePlayerId } = useContext(GameContext);
  const { socket } = useSocket();
  
  const [getReady, setGetReady] = useState(false);

  const countdown = useCallback((startTime: string) => {
    const countdownTimer = setInterval(() => {
      if (!moment(startTime, "HH:mm:ss").isAfter(moment(), 'second')) {
        setGetReady(false);
        nextQuestionStarted();
        clearInterval(countdownTimer)
      }
    }, (500));
  }, [nextQuestionStarted])

  const purchaseFifityFifty = () => {
    if (!fif) {
      setPoints(points-250);
      buyfif();
    }
  }

  const purchaseStopTime = () => {
    if (!stop) {
      setPoints(points-200);
      buyStop();
    }
  }

  // Emit helper (server may ignore if unsupported)
  const emitPowerup = (type: string, payload: any = {}) => {
    try {
      if (!gameInstanceId) return;
      socket.emit('powerup', { gameInstanceId: String(gameInstanceId), type, ...payload }, () => {});
    } catch(_) {}
  }

  // Implement purchase flows for remaining upgrades
  const purchaseScoreMultiplier = () => {
    if (buyMultiplier && !hasMultiplier && points >= 100) {
      setPoints(points - 100);
      buyMultiplier();
    }
  }
  const purchaseEyeInTheSky = () => {
    if (buyEye && !hasEye && points >= 300) {
      setPoints(points - 300);
      buyEye();
    }
  }
  const purchaseShield = () => {
    if (buyShield && !hasShield && points >= 500) {
      setPoints(points - 500);
      buyShield();
      emitPowerup('shield');
    }
  }
  // Target picker for slow / end_one
  const [selectingType, setSelectingType] = useState<null | 'slow' | 'end_one'>(null);
  const [players, setPlayers] = useState<Array<{ id: string; username: string; score: string }>>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [loadingTargets, setLoadingTargets] = useState(false);

  const openTargetPicker = (type: 'slow' | 'end_one') => {
    if (!gameInstanceId) return;
    setLoadingTargets(true);
    setSelectedTarget(null);
    setSelectingType(type);
    socket.emit('join_game', String(gameInstanceId));
    socket.emit('get_players', { gameInstanceId: String(gameInstanceId) }, (resp: any) => {
      setLoadingTargets(false);
      if (resp?.ok && Array.isArray(resp.players)) {
        const list = resp.players
          .filter((p: any) => String(p?.id || '') !== String(gameInstancePlayerId || ''))
          .sort((a: any, b: any) => Number(b.score || 0) - Number(a.score || 0));
        setPlayers(list);
      } else {
        setPlayers([]);
      }
    });
  };

  const confirmTarget = () => {
    if (!selectingType || !selectedTarget) return;
    if (selectingType === 'slow') {
      if (buySlow && !hasSlow && points >= 1000) {
        setPoints(points - 1000);
        buySlow();
        emitPowerup('slow', { targetId: selectedTarget });
      }
    } else if (selectingType === 'end_one') {
      if (buyEndOpponent && !hasEndOpponent && points >= 2000) {
        setPoints(points - 2000);
        buyEndOpponent();
        emitPowerup('end_one', { targetId: selectedTarget });
      }
    }
    setSelectingType(null);
  };

  const purchaseSlowDown = () => {
    if (buySlow && !hasSlow && points >= 1000) {
      openTargetPicker('slow');
    }
  }
  const purchaseEndOpponent = () => {
    if (buyEndOpponent && !hasEndOpponent && points >= 2000) {
      openTargetPicker('end_one');
    }
  }
  const purchaseNuke = () => {
    if (buyNuke && !hasNuke && points >= 10000) {
      setPoints(points - 10000);
      buyNuke();
      emitPowerup('nuke');
    }
  }

  useEffect(() => {
    if (!gameInstanceId) return;
    socket.emit('join_game', String(gameInstanceId));
    const onStatus = (payload: { gameId?: string; status?: string; index?: number; starttime?: string }) => {
      if (payload?.gameId !== String(gameInstanceId)) return;
      if (payload?.status === 'started' && String(payload?.index ?? '') === String(currentQ)) {
        if (payload?.starttime) {
          countdown(payload.starttime);
          setGetReady(true);
        }
      }
      if (payload?.status === 'finished') {
        gameFinished();
      }
    };
    socket.on('game_status', onStatus);
    return () => {
      socket.off('game_status', onStatus);
    };
  }, [socket, gameInstanceId, currentQ, countdown, gameFinished]);



  const upgrades = [
    {
      image: <ItemImage src={one}/>,
      imageMobile: <ItemImageMobile src={one}/>,
      header: "Remove false answers",
      description: "Removes at least two false alternatives."
    },
    {
      image: <ItemImage src={two}/>,
      imageMobile: <ItemImageMobile src={two}/>,
      header: "Full point score",
      description: "Get full score when choosing the correct alternative, like the clock was back to start."
    },
    {
      image: <ItemImage src={three}/>,
      imageMobile: <ItemImageMobile src={three}/>,
      header: "Gear up your score",
      description: "Score multiplyer that increases the amount of points you earn per question."
    },
    {
      image: <ItemImage src={four}/>,
      imageMobile: <ItemImageMobile src={four}/>,
      header: "Eye in the sky",
      description: "See what your oppontents are answrering in real time."
    },
    {
      image: <ItemImage src={five}/>,
      imageMobile: <ItemImageMobile src={five}/>,
      header: "Shield protection",
      description: "Protects you from sabotage from other players."
    },
    {
      image: <ItemImage src={six}/>,
      imageMobile: <ItemImageMobile src={six}/>,
      header: "Slow down",
      description: "Sabotages your opponents by slowing down their games."
    },
    {
      image: <ItemImage src={seven}/>,
      imageMobile: <ItemImageMobile src={seven}/>,
      header: "End an opponent",
      description: "Sabotage one opponent by taking away their entire score."
    },
    {
      image: <ItemImage src={eight}/>,
      imageMobile: <ItemImageMobile src={eight}/>,
      header: "Nuke",
      description: "Sabotage the entire game by taking away everyones score!"
    },
  ]

  if(getReady) {
    return (
      <GameWrapper>
          <MobileNav>
          <img alt="Tavl logo" className="h-10 mt-5 ml-4" src={logo} />
          <TopRightPoints points={points} color={selectableColors[color]} textColor={textColors[color]} animate={animatedColorIndices.has(color)} multicolor={color === MULTICOLOR_INDEX}/>
          </MobileNav>
          <Text>Get ready!</Text>
          <MobileSpinner/>
      </GameWrapper>);
  }

  
  return(
    <GameWrapper>
      <MobileNav>
        <img alt="Tavl logo" className="h-10 mt-5 ml-4" src={logo} />
        <TopRightPoints points={points} color={selectableColors[color]} textColor={textColors[color]} animate={animatedColorIndices.has(color)} multicolor={color === MULTICOLOR_INDEX}/>
      </MobileNav>
      {selectingType && (
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>{selectingType === 'slow' ? 'Choose a player to slow' : 'Choose a player to end'}</ModalTitle>
            {loadingTargets ? (
              <div style={{ padding: 12, color: '#475569' }}>Loading players…</div>
            ) : players.length === 0 ? (
              <div style={{ padding: 12, color: '#475569' }}>No other players available</div>
            ) : (
              <div>
                {players.map((p) => (
                  <PlayerRow key={p.id} selected={selectedTarget === String(p.id)} onClick={() => setSelectedTarget(String(p.id))}>
                    <div style={{ fontWeight: 700 }}>{p.username || `Player ${p.id}`}</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>{p.score} pts</div>
                  </PlayerRow>
                ))}
              </div>
            )}
            <ModalActions>
              <CancelBtn onClick={() => setSelectingType(null)}>Cancel</CancelBtn>
              <ConfirmBtn disabled={!selectedTarget} onClick={confirmTarget}>Confirm</ConfirmBtn>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
        {hasNext !== false && (
        <UpgradeContainer>
          <PowerUp disabled={!(points >= 250 && !fif)} onClick={purchaseFifityFifty}>
            <Top>
              <UpgradeImage src={one}/>
              <TextInfo>
                <Title>Remove false answers</Title>
                <Description>Removes at least two false alternatives.</Description>
              </TextInfo>
            </Top>
            
            
            { fif ?
              <Has>Unlocked</Has>
              : 
              <Price>250</Price>
            }
            
          </PowerUp>
          <PowerUp disabled={!(points >= 200 && !stop)} onClick={purchaseStopTime}>
            <Top>
          <UpgradeImage src={two}/>
            <TextInfo>
            <Title>Full point score</Title>
            <Description>Get full score when choosing the correct alternative, like the clock was back to start.</Description>
            
            </TextInfo>
            </Top>
            { stop ?
              <Has>Unlocked</Has>
              : 
              <Price>200</Price>
            }
            
          </PowerUp>
          <PowerUp disabled={!(points >= 100 && !hasMultiplier)} onClick={purchaseScoreMultiplier}>
            <Top>
              <UpgradeImage src={three}/>
              <TextInfo>
                <Title>Gear up your score</Title>
                <Description>Score multiplier that increases points per question.</Description>
              </TextInfo>
            </Top>
            { hasMultiplier ? <Has>Unlocked</Has> : <Price>100</Price> }
          </PowerUp>
          <PowerUp disabled={!(points >= 300 && !hasEye)} onClick={purchaseEyeInTheSky}>
            <Top>
              <UpgradeImage src={four}/>
              <TextInfo>
                <Title>Eye in the sky</Title>
                <Description>See what your opponents answer in real time.</Description>
              </TextInfo>
            </Top>
            { hasEye ? <Has>Unlocked</Has> : <Price>300</Price> }
          </PowerUp>
          <PowerUp disabled={!(points >= 500 && !hasShield)} onClick={purchaseShield}>
            <Top>
              <UpgradeImage src={five}/>
              <TextInfo>
                <Title>Shield protection</Title>
                <Description>Protects you from sabotage from other players.</Description>
              </TextInfo>
            </Top>
            { hasShield ? <Has>Unlocked</Has> : <Price>500</Price> }
          </PowerUp>
          <PowerUp disabled={!(points >= 1000 && !hasSlow)} onClick={purchaseSlowDown}>
            <Top>
              <UpgradeImage src={six}/>
              <TextInfo>
                <Title>Slow down</Title>
                <Description>Sabotage opponents by slowing their game.</Description>
              </TextInfo>
            </Top>
            { hasSlow ? <Has>Unlocked</Has> : <Price>1000</Price> }
          </PowerUp>
          <PowerUp disabled={!(points >= 2000 && !hasEndOpponent)} onClick={purchaseEndOpponent}>
            <Top>
              <UpgradeImage src={seven}/>
              <TextInfo>
                <Title>End an opponent</Title>
                <Description>Remove all points from one opponent.</Description>
              </TextInfo>
            </Top>
            { hasEndOpponent ? <Has>Unlocked</Has> : <Price>2000</Price> }
          </PowerUp>
          <PowerUp disabled={!(points >= 10000 && !hasNuke)} onClick={purchaseNuke}>
            <Top>
              <UpgradeImage src={eight}/>
              <TextInfo>
                <Title>Nuke</Title>
                <Description>Remove everyone’s score at once.</Description>
              </TextInfo>
            </Top>
            { hasNuke ? <Has>Unlocked</Has> : <Price>10000</Price> }
          </PowerUp>
        </UpgradeContainer>
        )}
    </GameWrapper>
  );
    
}

export const getQuote = () => {
  return quotes[Number((Math.random() * 3).toFixed(0))];
}

const Top = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const TextInfo = styled.div`
  display: block;
`;

export const UpgradeImage = styled.img`
    display: block;
    padding-bottom: 6px;
    height: 44px;
    padding-right: 0px;
`;

const UpgradeContainer = styled.div`
  margin: 10px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

const PowerUp = styled.div.attrs((props: { disabled?: boolean }) => props)`
  background: #ffffff;
  border-radius: 12px;
  padding: 10px;
  color: black;
  line-height: 1.1;
  overflow: hidden;
  font-family: "Coll";
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  touch-action: manipulation;
  opacity: ${props => props.disabled ? 0.55 : 1};
  filter: ${props => props.disabled ? 'saturate(0.8)' : 'none'};
`;//white-space: nowrap;background-color: ${props => (props.color)};

export const Description = styled.div`
    display: none;
`;

export const Title = styled.div`
    color: black;
    font-size: 0.95rem;
    font-family: "Coll";
    padding-top: 4px;
`;

export const Price = styled.div`
 display: flex;
 margin-top: 6px;
 background: #000000;
  border-radius: 16px;
  color: white;
  padding: 5px 8px;
  font-size: 0.85em;
  text-align: center;
  justify-content: center;
`;

export const Has = styled.div`
 display: flex;
 margin-top: 6px;
 background: #0aab15;
  border-radius: 16px;
  color: black;
  padding: 5px 8px;
  font-size: 0.85em;
  text-align: center;
  justify-content: center;
`;

// Target Picker UI
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;
const ModalCard = styled.div`
  width: min(92vw, 440px);
  background: #ffffff;
  border-radius: 16px;
  border: 2px solid #bfdbfe;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  padding: 16px;
`;
const ModalTitle = styled.div`
  font-weight: 800;
  font-size: 1.25rem;
  color: #1f2937;
  margin-bottom: 8px;
`;
const PlayerRow = styled.div.attrs((props: { selected?: boolean }) => props)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  margin: 8px 0;
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#60a5fa' : '#e5e7eb'};
  background: ${props => props.selected ? '#eff6ff' : 'white'};
`;
const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
`;
const BtnBase = styled.button`
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  border: 2px solid transparent;
`;
const CancelBtn = styled(BtnBase)`
  background: #f3f4f6;
  color: #374151;
  border-color: #e5e7eb;
`;
const ConfirmBtn = styled(BtnBase).attrs((props: { disabled?: boolean }) => props)`
  background: ${props => props.disabled ? '#93c5fd' : '#3b82f6'};
  color: white;
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

// Premium and BadgeRow removed for compact mobile layout

export const BuyTop = styled.div`
 display: flex;
`;

  // return a random quote
const quotes = [
  'The best is yet to come.',
  'No pressure, no diamonds.',
  'And so the adventure begins.',
  'When nothing goes right, go left.'
  // Waiting on game master
  // Buy some upgrades?
]

export const Text = styled.div`
  height: 200px;
  position: relative;
  margin: 20px;
  color: white;
  color: white;
    font-size: 3rem;
    font-family: "Coll";
    padding: 30px;
`;

export default Result;

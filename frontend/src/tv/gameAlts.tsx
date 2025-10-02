import { CurrentQuestionCount, Question, Start, Stop, Tvrapper } from "./game";
import styled, { css, keyframes } from "styled-components";
import { useEffect, useState } from "react";
import TopLeftLogo from "../components/TopLeftLogo";
import { selectableColors } from "../phone/waiting";
import { useSocket } from "../context/SocketContext";

interface AlternativesProps {
  question: Question;
  currentQuestionCount: string;
  nextQuestion: () => void;
  stopGame: () => void;
  gameInstanceId?: string;
}

interface Answer { alternative: string; game_question_id: string }
type AnswerCounts = { [key: string]: number };

const Alternatives = ({ question, currentQuestionCount, nextQuestion, stopGame, gameInstanceId }: AlternativesProps) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [answers, setAnswers] = useState<Array<Answer>>();
  const [counts, setCounts] = useState<AnswerCounts>({ '1': 0, '2': 0, '3': 0, '4': 0 });
  const [altTimeLeft, setAltTimeLeft] = useState(20); 
  const [showDistribution, setShowDistribution] = useState(false);
  const { socket } = useSocket();
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const answeredSetRef = (function(){ const s = new Set<string>(); return { current: s } })() as { current: Set<string> };

  const option = (text: string | null | undefined, number: number, color: string, correct: boolean) => {
    return(
      <Option onClick={() => {}} style={{ opacity: !showAnswers ? '100%' : correct ? '100%' : '30%' }}>
          <QText color={color}>{text}</QText>
      </Option>
    )
  }

  // Fetch answers via WS (in-memory on server)
  const getAnswersForGameInstanceId = () => {
    if (!gameInstanceId) { setShowDistribution(true); return; }
    socket.emit('get_answer_counts', { gameInstanceId: String(gameInstanceId), gameQuestionId: String(question.uuid) }, (resp: any) => {
      if (resp?.ok) {
        setCounts(resp.counts || { '1':0,'2':0,'3':0,'4':0 });
        setAnsweredCount(Number(resp.totalResponded || 0));
        setTotalPlayers(Number(resp.totalPlayers || 0));
      }
      setShowDistribution(true);
    });
  }

  const next = () => {
    if (showDistribution) {
      nextQuestion();
    } else {
      if (showAnswers) {
        // get answers and show
        getAnswersForGameInstanceId()
      } else {
        setShowAnswers(true);
        setAltTimeLeft(0);
        // Notify players to end question early
        if (gameInstanceId) {
          socket.emit('question_end', { gameInstanceId: String(gameInstanceId), gameQuestionId: String(question.uuid) });
        }
      }
    }
  }

  useEffect(() => {
    setAltTimeLeft(Number(question?.time ?? 20));
  }, [question?.time])

  useEffect(() => {
    const countdown = setInterval(() => {
      setAltTimeLeft((prev) => {
        if (showAnswers || prev <= 0) return 0;
        const next = prev - 1;
        if (next <= 0) {
          setShowAnswers(true);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(countdown)
  }, [question?.time, showAnswers])
  
  // Reset answers when question changes
  useEffect(() => {
    setAnswers([]);
    setShowDistribution(false);
    setShowAnswers(false);
    answeredSetRef.current.clear();
    setAnsweredCount(0);
  }, [question?.uuid])

  // Subscribe to incremental answer updates via WS
  useEffect(() => {
    if (!gameInstanceId) return;
    socket.emit('join_game', String(gameInstanceId));
    // initial total players
    const fetchPlayers = () => {
      socket.emit('get_players', { gameInstanceId: String(gameInstanceId) }, (resp: any) => {
        if (resp?.ok && Array.isArray(resp.players)) setTotalPlayers(resp.players.length);
      });
    };
    fetchPlayers();
    const onAnswerUpdate = (data: any) => {
      if (data?.gameId !== String(gameInstanceId)) return;
      if (String(data?.gameQuestionId || '') !== String(question.uuid)) return;
      setAnswers((prev) => ([...(prev || []), { alternative: String(data.alternative), game_question_id: String(question.uuid) }]));
      const pid = data?.playerId ? String(data.playerId) : undefined;
      if (pid && !answeredSetRef.current.has(pid)) {
        answeredSetRef.current.add(pid);
        setAnsweredCount((c) => c + 1);
      } else if (!pid) {
        setAnsweredCount((c) => c + 1);
      }
      if (totalPlayers > 0 && answeredSetRef.current.size >= totalPlayers) {
        setShowAnswers(true);
        setAltTimeLeft(0);
      }
    };
    const onAnswerCounts = (data: any) => {
      if (data?.gameId !== String(gameInstanceId)) return;
      if (String(data?.gameQuestionId || '') !== String(question.uuid)) return;
      if (data?.counts) setCounts(data.counts);
      if (typeof data?.totalResponded === 'number') setAnsweredCount(data.totalResponded);
      if (typeof data?.totalPlayers === 'number') setTotalPlayers(data.totalPlayers);
    };
    const onPlayerUpdate = (data: any) => {
      if (data?.gameId === String(gameInstanceId)) fetchPlayers();
    };
    socket.on('answer_update', onAnswerUpdate);
    socket.on('answer_counts', onAnswerCounts);
    socket.on('player_update', onPlayerUpdate);
    const onQuestionEnd = (payload: any) => {
      if (payload?.gameId === String(gameInstanceId)) {
        setShowAnswers(true);
        setAltTimeLeft(0);
      }
    };
    socket.on('question_end', onQuestionEnd);
    return () => {
      socket.off('answer_update', onAnswerUpdate);
      socket.off('answer_counts', onAnswerCounts);
      socket.off('player_update', onPlayerUpdate);
      socket.off('question_end', onQuestionEnd);
    };
  }, [socket, gameInstanceId, question?.uuid, totalPlayers])
  
  return (
    <Tvrapper>
      <TopLeftLogo/>
      <CurrentQuestionCount>{currentQuestionCount}</CurrentQuestionCount>
      {
        !showDistribution ?
          <ContentQuestions>
            <ContentQuestionText>{question?.text}</ContentQuestionText>
          </ContentQuestions>
          :
          <Distribution>
            <Column height={(((counts['1']||0)/Math.max(1, answeredCount))*100) + '%'} color={selectableColors[0]}>{ counts['1']||0 }</Column>
            <Column height={(((counts['2']||0)/Math.max(1, answeredCount))*100) + '%'} color={selectableColors[1]}>{ counts['2']||0 }</Column>
            <Column height={(((counts['3']||0)/Math.max(1, answeredCount))*100) + '%'} color={selectableColors[2]}>{ counts['3']||0 }</Column>
            <Column height={(((counts['4']||0)/Math.max(1, answeredCount))*100) + '%'} color={selectableColors[3]}>{ counts['4']||0 }</Column>
          </Distribution>
      }
      
      { !showDistribution && altTimeLeft > 0 && (<Timer>{altTimeLeft}</Timer>) }
      { !showDistribution && (
        <AnswersBubble title="Answers received">{answeredCount}/{totalPlayers}</AnswersBubble>
      ) }
      <Alts>
        <AltsContainer>
        <Top>
          <Q>{option(question?.alt1, 1, selectableColors[0], showAnswers && question?.correct === '1')}</Q>
          <Q>{option(question?.alt2, 2, selectableColors[1], showAnswers && question?.correct === '2')}</Q>
        </Top>
        <Bot>
          <Q>{option(question?.alt3, 3, selectableColors[2], showAnswers && question?.correct === '3')}</Q>
          <Q>{option(question?.alt4, 4, selectableColors[3], showAnswers && question?.correct === '4')}</Q>
        </Bot>
        </AltsContainer>
      </Alts>
      <Start onClick={next}>Next</Start>
      <Stop onClick={stopGame}>Stop</Stop>
    </Tvrapper>
  )
}

const Column = styled.div.attrs((props: {height: any}) => props)`
  color: white;
  display: flex;
  background: ${props => (props.color)};
  width: 25%;
  justify-content: center;
  margin: 10px;
  border-radius: 15px;
  font-size: 1.5em;
  font-family: "Coll";
  height: ${props => (props.height)};
  min-height: 30px;
  line-height: 2rem;
  align-items: end;
`;

const Distribution = styled.div`
  display: flex;
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75vw;
  height: 25%;
  align-items: end;
`;

const AltsContainer = styled.div`
 
`;

export const Top = styled.div`
 display: flex;
`;

export const Bot = styled.div`
 display: flex;
`;

const AnswersBubble = styled.div`
  background: #9C8AFA;
  padding: 15px;
  border-radius: 15px;
  left: 2%;
  bottom: 55%;
  font-size: 1.2em;
  position: absolute;
  color: white;
  text-align: center;
`;

const Q = styled.div`
overflow: hidden;
  
font-family: "Coll";
text-align: center;
display: flex;
justify-content: center;
align-items: center;
width: 100%;
`;

const Timer = styled.div`
  background: #9C8AFA;
  padding: 15px;
  border-radius: 15px;
  left: 2%;
  bottom: 65%;
  width: fit-content;
  font-size: 2em;
  position: absolute;
  color: white;
  text-align: center;
`;

const MoveBackgroundPosition = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const QText = styled.div`
  padding:20px;
  margin: 5px;
  background: ${props => (props.color)};
  ${props => typeof props.color === 'string' && props.color.includes('repeating-linear-gradient') && css`
    background-size: 150%;
    animation: ${MoveBackgroundPosition} 6s ease-in-out infinite;
    filter: drop-shadow(0 0 1px rgba(255, 200, 0, .3));
  `}
  border-radius: 20px;
  height: 100%;
  color: white;
  font-size: 2.5em;
  line-height: 2;
`;

const Option = styled.div`
  height: 120px;
  width: 100%;
  float:left;
`;

const ContentQuestions = styled.div`
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75vw;
  background: #6A71FA;
  border-radius: 15px;
  align-items: center;
`;

const ContentQuestionText = styled.div`
  display: flex;
  justify-content: center;
  height: 200px;
  position: relative;
  font-size: 3rem;
  color: white;
  text-align: center;
  align-items: center;
  font-family: "Coll";
`;

const Alts = styled.div`
    position: absolute;
    bottom: 0%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    display: block;
`;

export default Alternatives;

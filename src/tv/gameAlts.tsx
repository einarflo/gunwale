import { CurrentQuestionCount, Logo, Question, Start, Stop, Tvrapper } from "./game";
import logo from '../images/tavl-white.png';
import styled from "styled-components";
import { useEffect, useState } from "react";
import TopLeftLogo from "../components/TopLeftLogo";
import { selectableColors } from "../phone/waiting";
import axios, { AxiosRequestConfig } from "axios";

interface AlternativesProps {
  question: Question;
  currentQuestionCount: string;
  nextQuestion: () => void;
  stopGame: () => void;
  gameInstanceId: String;
}

interface Answer {
  alternative: String;
  game_question_id: String;
}

const Alternatives = ({ question, currentQuestionCount, nextQuestion, stopGame, gameInstanceId }: AlternativesProps) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [answers, setAnswers] = useState<Array<Answer>>();
  const [altTimeLeft, setAltTimeLeft] = useState(20); 
  const [showDistribution, setShowDistribution] = useState(false);

  const option = (text: String, number: number, color: string, correct: boolean) => {
    return(
      <Option onClick={() => {}} style={{ opacity: !showAnswers ? '100%' : correct ? '100%' : '30%' }}>
          <QText color={color}>{text}</QText>
      </Option>
    )
  }

  // Get all questions for the current game Id
  const getAnswersForGameInstanceId = () => {
    axios.get(`https://www.dogetek.no/api/api.php/game_instance_answers/${gameInstanceId}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        if (res.data) {
          setAnswers(res.data.filter((a: Answer) => a.game_question_id == question.id));
        } 
        setShowDistribution(true);
      })
      .catch(err => {
        setShowDistribution(true);
        console.log("Error when getting answers for game instance with id ", gameInstanceId);
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
      }
    }
  }

  useEffect(() => {
    setAltTimeLeft(question?.time || 20);
  }, [question?.time])

  useEffect(() => {
    const countdown = setInterval(() => {
      setAltTimeLeft(altTimeLeft - 1)
      
      console.log(altTimeLeft)
      if (altTimeLeft < 2) {
        setShowAnswers(true);
        // Do something so players can see if it is correct
      }
    }, (1000));

    return () => clearInterval(countdown)
  }, [altTimeLeft, question?.time])
  
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
            <Column height={((answers?.filter(a => a.alternative == '1' ).length || 0)/(answers?.length || 1)*100) + '%'} color={selectableColors[0]}>{ answers?.filter(a => a.alternative == '1' ).length }</Column>
            <Column height={((answers?.filter(a => a.alternative == '2' ).length || 0)/(answers?.length || 1)*100) + '%'} color={selectableColors[1]}>{ answers?.filter(a => a.alternative == '2' ).length }</Column>
            <Column height={((answers?.filter(a => a.alternative == '3' ).length || 0)/(answers?.length || 1)*100) + '%'} color={selectableColors[2]}>{ answers?.filter(a => a.alternative == '3' ).length }</Column>
            <Column height={((answers?.filter(a => a.alternative == '4' ).length || 0)/(answers?.length || 1)*100) + '%'} color={selectableColors[3]}>{ answers?.filter(a => a.alternative == '4' ).length }</Column>
          </Distribution>
      }
      
      { altTimeLeft > 0 && <Timer>{altTimeLeft}</Timer> }
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
  background-color: ${props => (props.color)};
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
  height: 250%;
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
  border-radius: 40px;
  left: 2%;
  bottom: 55%;
  width: fit-content;
  font-size: 2em;
  position: absolute;
  color: white;
  width: 40px;
  text-align: center;
`;

const QText = styled.div`
  padding:20px;
  margin: 5px;
  background-color: ${props => (props.color)};
  border-radius: 20px;
  height: 70px;
  color: white;
  font-size: 2em;
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
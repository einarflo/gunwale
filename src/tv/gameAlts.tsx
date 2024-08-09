import { CurrentQuestionCount, Logo, Question, Start, Stop, Tvrapper } from "./game";
import logo from '../images/tavl-white.png';
import styled from "styled-components";
import { useEffect, useState } from "react";
import TopLeftLogo from "../components/TopLeftLogo";
import { selectableColors } from "../phone/waiting";

interface AlternativesProps {
  question: Question,
  currentQuestionCount: string,
  nextQuestion: () => void,
  stopGame: () => void
}

const Alternatives = ({ question, currentQuestionCount, nextQuestion, stopGame }: AlternativesProps) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [altTimeLeft, setAltTimeLeft] = useState(20); 

  const option = (text: String, number: number, color: string, correct: boolean) => {
    return(
      <Option onClick={() => {}} style={{ opacity: !showAnswers ? '100%' : correct ? '100%' : '30%' }}>
          <QText color={color}>{text}</QText>
      </Option>
    )
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
      <ContentQuestions>
        <ContentQuestionText>{question?.text}</ContentQuestionText>
      </ContentQuestions>
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
      <Start onClick={nextQuestion}>Next</Start>
      <Stop onClick={stopGame}>Stop</Stop>
    </Tvrapper>
  )
}

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
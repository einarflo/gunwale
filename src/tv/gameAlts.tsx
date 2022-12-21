import { CurrentQuestionCount, Logo, Question, Start, Stop, Tvrapper } from "./game";
import logo from '../images/gunwale-logo-white.png';
import styled from "styled-components";
import { useEffect, useState } from "react";

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
      <Logo src={logo}/>
      <CurrentQuestionCount>{currentQuestionCount}</CurrentQuestionCount>
      <ContentQuestions>
        <ContentQuestionText>{question?.text}</ContentQuestionText>
      </ContentQuestions>
      { altTimeLeft > 0 && <Timer>{altTimeLeft}</Timer> }
      <Alts>
        {option(question?.alt1, 1, "green", showAnswers && question?.correct === '1')}
        {option(question?.alt2, 2, "blue", showAnswers && question?.correct === '2')}
        {option(question?.alt3, 3, "red", showAnswers && question?.correct === '3')}
        {option(question?.alt4, 4, "purple", showAnswers && question?.correct === '4')}
      </Alts>
      <Start onClick={nextQuestion}>Next</Start>
      <Stop onClick={stopGame}>Stop</Stop>
    </Tvrapper>
  )
}

const Timer = styled.div`
  background: #ffffff;
  padding: 15px;
  border-radius: 40px;
  left: 2%;
  bottom: 55%;
  width: fit-content;
  font-size: 2em;
  position: absolute;
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
  width: 50%;
  float:left;
`;

const ContentQuestions = styled.div`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 300px;
  max-width: 80vw;
`;

const ContentQuestionText = styled.div`
  height: 200px;
  position: relative;
  font-size: 3rem;
  color: white;
  text-align: center;
`;

const Alts = styled.div`
    position: absolute;
    bottom: 0%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
`;

export default Alternatives;
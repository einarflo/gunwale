import { CurrentQuestionCount, Logo, Tvrapper } from "./game";
import logo from '../images/tavl-white.png';
import styled, { keyframes } from "styled-components";
import TopLeftLogo from "../components/TopLeftLogo";

interface QuestionTextProps {
  question: String | undefined,
  currentQuestionCount: string,
}

const QuestionText = ({ question, currentQuestionCount }: QuestionTextProps) => {
  return (
    <Tvrapper>
      <TopLeftLogo />
      <CurrentQuestionCount>{currentQuestionCount}</CurrentQuestionCount>
      <QuestionTextWrapper>
        <Question>{question}</Question>
        <LoadingBar/>
      </QuestionTextWrapper>
    </Tvrapper>
  );
}

const progressbar = keyframes`
    0% { width: 0; }
    100% { width: 90vw; }
`;

const LoadingBar = styled.div`
  background: #9C8AFA;
  padding: 10px;
  border-radius: 20px;
  left: 50%;
  height: 5px;
  animation: ${progressbar} 3s ease-in-out;
  animation-fill-mode:both;
  -webkit-animation: ${progressbar} 3s ease-in-out;
`;

const QuestionTextWrapper = styled.div`
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
`;

const Question = styled.div`
  position: relative;
  font-size: 4rem;
  text-align: center;
  background: #9C8AFA;
  color: white;
  padding: 28px;
  border-radius: 20px;
  width: fit-content;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: "Coll";
`;

export default QuestionText;
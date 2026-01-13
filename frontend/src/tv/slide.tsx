import styled from "styled-components";
import TopLeftLogo from "../components/TopLeftLogo";
import { Question, Start, Stop, Tvrapper } from "./game";

interface SlideProps {
  question: Question | undefined;
  next: () => void;
  stopGame: () => void;
}

const Slide = ({ question, next, stopGame }: SlideProps) => {
  return (
    <Tvrapper>
      <TopLeftLogo />
      <SlideCard>
        <SlideTitle>{question?.text || 'Slide'}</SlideTitle>
        {question?.description && (
          <SlideBody>{question.description}</SlideBody>
        )}
      </SlideCard>
      <Start onClick={next}>Next</Start>
      <Stop onClick={stopGame}>Stop</Stop>
    </Tvrapper>
  );
};

const SlideCard = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(80vw, 900px);
  transform: translate(-50%, -50%);
  background: rgba(106, 113, 250, 0.95);
  border-radius: 20px;
  padding: 48px 56px;
  text-align: center;
  color: #fff;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
`;

const SlideTitle = styled.div`
  font-family: "Coll";
  font-size: clamp(2.4rem, 4vw, 4rem);
  font-weight: 700;
  line-height: 1.2;
`;

const SlideBody = styled.div`
  margin-top: 16px;
  font-size: clamp(1.2rem, 2vw, 1.7rem);
  line-height: 1.6;
  opacity: 0.9;
`;

export default Slide;

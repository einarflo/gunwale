// LoadingCard.tsx
import React from "react";
import styled, { keyframes } from "styled-components";

const spin4991 = keyframes`
  10% { transform: translateY(-102%); }
  25% { transform: translateY(-100%); }
  35% { transform: translateY(-202%); }
  50% { transform: translateY(-200%); }
  60% { transform: translateY(-302%); }
  75% { transform: translateY(-300%); }
  85% { transform: translateY(-402%); }
  100% { transform: translateY(-400%); }
`;

const Card = styled.div`
  padding: 1rem 2rem;
  border-radius: 1.25rem;
  background: transparent;
`;

const Loader = styled.div`
  color: rgb(124, 124, 124);
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  font-size: 25px;
  box-sizing: content-box;
  height: 40px;
  padding: 10px 10px;
  display: flex;
  border-radius: 8px;
  background: transparent;
  justify-content: flex-start;
`;

const Words = styled.div`
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      transparent 10%,
      transparent 30%,
      transparent 70%,
      transparent 90%
    );
    z-index: 20;
  }
`;

const Word = styled.span`
  display: block;
  height: 100%;
  padding-left: 6px;
  color: #956afa;
  animation: ${spin4991} 8s infinite;
`;

const words = ["buttons", "forms", "switches", "cards", "buttons"];

export const LoadingCard: React.FC = () => {
  return (
    <Card>
      <Loader>
        <p>loading</p>
        <Words>
          {words.map((w, i) => (
            <Word key={i}>{w}</Word>
          ))}
        </Words>
      </Loader>
    </Card>
  );
};

import styled, { keyframes } from "styled-components";

interface CountdownProps {
  // Approx total duration ~1s (3 frames * 333ms)
  onDone?: () => void;
}

const Countdown = ({ onDone }: CountdownProps) => {
  return (
    <Overlay>
      <Number className="n3">3</Number>
      <Number className="n2">2</Number>
      <Number className="n1">1</Number>
      <Go className="go">GO!</Go>
      {/* Trigger unmount callback slightly after animation ends */}
      <TimeoutSetter onDone={onDone} />
    </Overlay>
  );
};

const TimeoutSetter = ({ onDone }: { onDone?: () => void }) => {
  if (onDone) setTimeout(onDone, 3050);
  return null;
};

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const pop = keyframes`
  0% { opacity: 0; transform: scale(.6); }
  10% { opacity: 1; transform: scale(1); }
  80% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(.6); }
`;

const Number = styled.div`
  position: absolute;
  font-family: 'Coll';
  font-size: 14rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 10px 30px rgba(0,0,0,.25);
  -webkit-text-stroke: 6px rgba(59,130,246,.6);
  opacity: 0;
  &.n3 { animation: ${pop} 0.75s ease-in-out .00s both; }
  &.n2 { animation: ${pop} 0.75s ease-in-out .75s both; }
  &.n1 { animation: ${pop} 0.75s ease-in-out 1.50s both; }
`;

const Go = styled.div`
  position: absolute;
  font-family: 'Coll';
  font-size: 6rem;
  font-weight: 900;
  color: #22c55e;
  text-shadow: 0 10px 30px rgba(0,0,0,.25);
  opacity: 0;
  animation: ${pop} 0.75s ease-in-out 2.25s both;
`;

export default Countdown;

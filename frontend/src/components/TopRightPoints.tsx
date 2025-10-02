import styled, { css, keyframes } from 'styled-components';
import { useContext } from 'react';
import { GameContext } from '../GameContext';

interface TopRightProps {
    points: number;
    color: string;
    textColor?: string;
    animate?: boolean;
    multicolor?: boolean;
}

const TopRightPoints = ({ points, color, textColor, animate, multicolor }: TopRightProps) => {
    const { nickname } = useContext(GameContext);
    return (
        <Wrapper hex={color} animate={animate} multicolor={multicolor}>
            <Username text={textColor}>{nickname}</Username>
            <Points hex={color}>{points}</Points>
        </Wrapper>
    );
};

export default TopRightPoints;

const MoveBackgroundPosition = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const MultiColorScroll = keyframes`
  0% { background-position: 50% 0%; }
  50% { background-position: 50% 100%; }
  100% { background-position: 50% 0%; }
`;

const Points = styled.div.attrs((props: {hex: any}) => props)`
  color: #6A71FA;
  background: white;
  font-family: "Coll";
  text-align: center;
  border-radius: 10px;
  margin: 5px;
`;

const Username = styled.div.attrs((props: {text?: string}) => props)<{text?: string}>`
  color: ${props => props.text || 'white'};
  font-family: "Coll";
  text-align: center;
  font-size: 1.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Wrapper = styled.div.attrs((props: {hex: any, animate?: boolean, multicolor?: boolean}) => props)<{hex: any, animate?: boolean, multicolor?: boolean}>`
  margin-top: 15px;
  padding-right: 30px;
  padding-left: 30px;
  height 55px;
  margin-bottom: 15px;
  margin-right: 20px;
  position: absolute;
  right: 0;
  background: #6A71FA;
  background: ${props => (props.hex)};
  ${props => props.animate && props.multicolor && css`
      background-size: 100% 1000%;
      animation: ${MultiColorScroll} 17.5s linear infinite;
  `}
  ${props => props.animate && !props.multicolor && css`
      background-size: 150%;
      animation: ${MoveBackgroundPosition} 6s ease-in-out infinite;
      filter: drop-shadow(0 0 1px rgba(255, 200, 0, .3));
  `}
  border-radius: 10px;
  max-width: 140px;
`;

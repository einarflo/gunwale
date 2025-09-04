import styled from 'styled-components';
import { useContext } from 'react';
import { GameContext } from '../GameContext';

interface TopRightProps {
    points: number;
    color: string;
}

const TopRightPoints = ({ points, color }: TopRightProps) => {
    const { nickname } = useContext(GameContext);
    return (
        <Wrapper hex={color}>
            <Username>{nickname}</Username>
            <Points hex={color}>{points}</Points>
        </Wrapper>
    );
};

export default TopRightPoints;

const Points = styled.div.attrs((props: {hex: any}) => props)`
  color: ${props => (props.hex)};
  background: white;
  font-family: "Coll";
  text-align: center;
  border-radius: 10px;
  margin: 5px;
`;

const Username = styled.div`
  color: white;
  font-family: "Coll";
  text-align: center;
  font-size: 1.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Wrapper = styled.div.attrs((props: {hex: any}) => props)`
  margin-top: 15px;
  padding-right: 30px;
  padding-left: 30px;
  height 55px;
  margin-bottom: 15px;
  margin-right: 20px;
  position: absolute;
  right: 0;
  background: #6A71FA;
  background-color: ${props => (props.hex)};
  border-radius: 10px;
  max-width: 140px;
`;
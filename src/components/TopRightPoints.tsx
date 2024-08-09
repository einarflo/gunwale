import styled from 'styled-components';

interface TopRightProps {
    username: String;
    points: number;
    color: String;
}

const TopRightPoints = ({ username, points, color }: TopRightProps) => {
    return (
        <Wrapper hex={color}>
            <Username>{username}</Username>
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
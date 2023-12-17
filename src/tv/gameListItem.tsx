import styled from "styled-components";
import { Game } from "./selectGame";


interface GameListItemProps {
    game: Game;
    onClick: () => void;
    edit: (id: String) => void;
}

const GameListItem = ({game, onClick, edit}: GameListItemProps) => {
    return (
        <GameInst >
            <Top>
                <GameName>{game.name}</GameName>
                <Count>{game.qcount} question{ game.qcount !== '1' && 's' }</Count>
            </Top>
            <Bottom>
                <GameDesc>{game.description}</GameDesc>
                <Buttons>
                    
                    <Edit onClick={() => edit(game.id)}>Edit</Edit>
                    <Start onClick={onClick}>Start</Start>
                </Buttons>
            </Bottom>
        </GameInst>
    );
}; //<Edit onClick={onClick}>Edit</Edit>

const Buttons = styled.div`
    font-size: 1rem;
    display: flex;
    margin-left: auto;
    padding: 20px;
`;

const Start = styled.div`
  background: #2d3870;
  margin: 0px;
  border-radius: 5px;
  padding: 8px;
  width: 40px;
  height: 20px;
  font-weight: bold;
  margin-left: auto;
cursor: pointer;
  color: white;
  border: 2px solid #ffffff;
`;


const Edit = styled.div`
  background: #ffffff;
  border: 2px solid #2d3870;
  margin: 0px;
  border-radius: 5px;
  padding: 8px;
  width: 30px;
  height: 20px;
  font-weight: bold;
  cursor: pointer;
  color: #2d3870;
  margin-right: 10px;
`;

const GameName = styled.div`
    font-size: 2rem;
    font-family: sans-serif;
    font-family: "Coll";
    padding: 20px;
    padding-bottom: 5px;
`;

const Count = styled.div`
    font-size: 1rem;
    font-weight: bold;
    padding: 20px;
    padding-top: 0px;
    padding-bottom: 20px;
    color: #2d387070;
    font-family: "Coll";
`;

const GameDesc = styled.div`
    font-size: 1rem;
    padding: 20px;
    color: White;
    font-family: "Coll";
`;

const Top = styled.div`
    font-size: 1rem;
`;
const Bottom = styled.div`
    font-size: 1rem;
    background: #2d3870;
    height: 100%;
`;
const GameInst = styled.div`
  margin: 25px;
  /* display: flex; */
  color: #000000;
  text-align: left;
  margin-left: 25px;
  background: #ffffff;
  border-radius: 10px;
  border: 2px solid #2d387050;
  width: 300px;
  left: 50%;
  align-items: center;
  overflow: hidden;
`;

export default GameListItem;
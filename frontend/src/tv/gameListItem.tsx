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
            <Top onClick={() => {onClick()}}>
                <GameName>{game.name}</GameName>
                <Username>by {game.username}</Username>
                <GameDesc>{game.description}</GameDesc>
                <Info>{game.qcount} question{ game.qcount !== '1' && 's' }</Info>
                <Info>{game.plays} play{ game.plays !== '1' && 's' }</Info>
            </Top>
            <Bottom>
                
            </Bottom>
        </GameInst>
    );
}; //<Edit onClick={onClick}>Edit</Edit>


const GameName = styled.div`
    font-size: 2rem;
    font-family: sans-serif;
    font-family: "Coll";
    padding: 20px;
    padding-bottom: 5px;
`;

const Info = styled.div`
    font-size: 1rem;
    font-weight: bold;
    padding-left: 20px;
    padding-top: 0px;
    color: white;
    font-family: "Coll";
`;

const Username = styled.div`
    font-size: 1rem;
    font-weight: bold;
    padding: 20px;
    padding-top: 0px;
    color: #ffffff90;
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
    cursor: pointer;
    padding-bottom: 20px;
`;
const Bottom = styled.div`
    font-size: 1rem;
    background: #9C8AFA;
    height: 100%;
`;
const GameInst = styled.div`
  margin: 25px;
  /* display: flex; */
  color: #ffffff;
  text-align: left;
  margin-left: 25px;
  background: #9C8AFA;
  border-radius: 10px;
  width: 300px;
  left: 50%;
  align-items: center;
  overflow: hidden;
`;

export default GameListItem;
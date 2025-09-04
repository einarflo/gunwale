import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { get } from "../api";
import Status from "../components/Status";
import Header from '../components/landing/Header';
import TVGamePlayView from "./game";

interface CreateViewProps {
    username: String;
    logout: () => void;
}

export interface Game {
    favorite?: String;
    popular?: String;
    id: String;
    name: String;
    description: String;
    qcount: String;
    plays: String;
    username: String;
}

const TVView = ({ username, logout }: CreateViewProps) => {

  const [gamePin, setGamePin] = useState<String | undefined>()
  const [gameId, setGameId] = useState<String | undefined>()
  const [gameInstanceId, setGameInstanceId] = useState<String | undefined>()
  const [userId, setUserId] = useState(25);
  const [editId, setEditId] = useState<String | undefined>(undefined);
  const [questionId, setQuestionId] = useState<String | undefined>(undefined);


  const startGame = (_gameId: String, _gameInstanceId: String, _gamePin: String) => {
    setGameId(_gameId);
    setGameInstanceId(_gameInstanceId);
    setGamePin(_gamePin);
  }

  const stopGame = () => {
    setGameId(undefined);
    setGameInstanceId(undefined);
  }



    


  // Game selected: 
  if (gameId && gameInstanceId && gamePin) {
    return <TVGamePlayView gameId={gameId} gameInstanceId={gameInstanceId} gamePin={gamePin} stopGame={stopGame}/>
  }


  return(
    <GameSelectionWrapper>
      <Header />
      <Content>
        <Outlet />
      </Content>
    </GameSelectionWrapper>)
}


const GameSelectionWrapper = styled.div`
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  
  #background: rgb(28,0,65);
  #background: linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(45,56,112,1) 0%, rgba(21,2,43,1) 100%); 
  display: block;
`;

const Content = styled.div`
  overflow: scroll;
`;


const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div`
width: 50px;
height: 50px;
margin-left: auto;
margin-right: auto;
left: 50%;
border: 3px solid rgba(255,255,255,.3);
border-radius: 50%;
border-top-color: #fff;
animation: spin 1s ease-in-out infinite;
-webkit-animation: ${rotate} 1s ease-in-out infinite;
`;




export default TVView;
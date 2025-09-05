import { Outlet } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Header from '../components/landing/Header';

interface CreateViewProps {
    username: String;
    logout: () => void;
}

export interface Game {
    created_by_name: String;
    favorite?: String;
    popular?: String;
    id: String;
    uuid?: String;
    name: String;
    description: String;
    qcount: String;
    plays: String;
    username: String;
}

const TVView = ({ username, logout }: CreateViewProps) => {
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

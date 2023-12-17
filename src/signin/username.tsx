import { useState } from "react";
import styled, { keyframes } from "styled-components";
import logo from '../images/gw-logo.png';
import { GamepinFormInput, GamepinLogginButton } from "./gamepin";

interface UsernameProps {
    error: boolean,
    loading: boolean,
    setName: (name: String | undefined) => void
}

const Username = ({ setName, loading, error }: UsernameProps) => {
    const [username, setUsername] = useState<String | undefined>("");
    return(
    <GamePinWrapper>
        <Content>
            <Logo src={logo} />
            {
                loading ? <Spinner/> :
                <>
                    {error && <Error>Allready taken. Try another pls?</Error>}
                    <GamepinFormInput placeholder="USERNAME" onChange={(e: { target: { value: String; }; }) => setUsername(e.target.value)} />
                    <GamepinLogginButton onClick={() => setName(username)}>GO!</GamepinLogginButton>
                </>
            }
            
        </Content>
    </GamePinWrapper>)
}

const GamePinWrapper = styled.div`
    height: 100vh;
    height: 100dvh;
    width: 100vw;
    background: #ffffff;
    background-image: linear-gradient(180deg, #203046 0%, #030006 100%);
`;

const Logo = styled.img`
    max-width: 400px;
    width: -webkit-fill-available;
    padding-bottom: 40px;

`;

const Content = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
`;

const Error = styled.div`
    text-align: center;
    padding-bottom: 20px;
    padding-top: 20px;
    color: #ffffff;
    margin-left: auto;
    margin-right: auto;
    max-width: 25vw;
    min-width: 300px;
    width: -webkit-fill-available;
    font-family : 'Soopafresh';
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
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
export default Username;


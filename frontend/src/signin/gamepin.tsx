import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import TopLeftLogo from "../components/TopLeftLogo";
import logo from '../images/tavl-logo.png';

interface GamePinProps {
    error: boolean,
    loading: boolean,
    setPin: (pin: string | undefined) => void,
    toCreatorMode: () => void
}

const GamePin = ({ setPin, error, loading, toCreatorMode }: GamePinProps) => {
    const [gamePin, setGamePin] = useState<string>("");

    useEffect(() => {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] === 'gameid'){
                setGamePin(pair[1])
            }
        }
    }, [])

    return(
    <GamePinWrapper>
        <TopLeftLogo />
        <Content>
            
            <Logo src={logo}/>
            {
                loading ? <Spinner /> :
                <>
                    {error && <ErrorText>Wrong game pin. Try another pls?</ErrorText>}
                    <TextInputField autoFocus={false} tabIndex={0} placeholder="Game pin" type={"number"} value={gamePin} onChange={(e: { target: { value: String; }; }) => setGamePin(e.target.value.toString())} onKeyPress={(e: any)  => {
                        if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
                            setPin(gamePin)
                        }
                    }}/>
                    <PrimaryButtonLocal onClick={() => setPin(gamePin)}>PLAY</PrimaryButtonLocal>
                    <Footer>or create a new game&nbsp;<div onClick={toCreatorMode} style={{ color: "#9084FA", textDecoration: "underline", fontFamily: "Coll", cursor: "pointer" }}>here</div>.</Footer>
                </>
            }
            
        </Content>
        
    </GamePinWrapper>)
}

const GamePinWrapper = styled.div`
    height: 100vh;
    width: 100vw;
    height: 100dvh;
`;


export const Logo = styled.img`
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 40px;
    height: 100px;
`;



const Content = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
`;

export const ErrorText = styled.div`
    text-align: center;
    padding-bottom: 20px;
    padding-top: 20px;
    color: #F13333;
    margin-left: auto;
    margin-right: auto;
    max-width: 25vw;
    min-width: 300px;
    width: -webkit-fill-available;
    font-family : 'Coll';
`;

export const TextInputField = styled.input`
    font-family : 'Coll';
    text-align: center;
    display: block;
    width: 100%;
    padding: .375rem .75rem;
    font-size: 1.5rem;
    line-height: 1.5;
    background-clip: padding-box;
    
        
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    max-width: 500px;
    margin: auto;
    border: 0px solid rgb(28,0,65);
    border-bottom: 1px solid #9F9F9F;
    color: #9F9F9F;
    margin-bottom: 20px;
    margin-top: 50px;
    border-radius: 3px;
    width: -webkit-fill-available;
`;

export const PrimaryButtonLocal = styled.div`
    font-family : 'Coll';
    text-align: center;
    display: block;
    width: 80%;
    padding: .375rem .75rem;
    font-size: 1.2rem;
    line-height: 1.5;
    color: white;
    background-clip: padding-box;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    max-width: 500px;
    margin: auto;
    margin-bottom: 30px;
    margin-top: 40px;
      
    background: #9C8AFA;
       
    cursor: pointer;
    border-radius: 15px;
`;

export const Footer = styled.div`
    display: flex;
    justify-content: center;
    color: black;
    font-size: 1.2rem;
    text-align: center;
    font-family: "Coll";
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

export default GamePin;


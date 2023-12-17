import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import logo from '../images/gw-logo.png';

interface GamePinProps {
    error: boolean,
    loading: boolean,
    setPin: (pin: String | undefined) => void,
    toCreatorMode: () => void
}

interface InputProps {
    value?: string,
    disabled?: true
}



const GamePin = ({ setPin, error, loading, toCreatorMode }: GamePinProps) => {
    const [gamePin, setGamePin] = useState<String | undefined>("");
    const [inputProps, setinputProps] = useState<InputProps>({});


    useEffect(() => {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] === 'gameid'){
                setGamePin(pair[1])
                setinputProps({
                    disabled: true,
                    value: pair[1]
                })
            }
        }
    }, [])

    

    return(
    <GamePinWrapper>
        <Background />
        <Content>
            <Logo src={logo} onClick={()  => window.location.replace('http://gunwale.dogetek.no/')}/>
            {
                loading ? <Spinner /> :
                <>
                    {error && <Error>Wrong game pin. Try another pls?</Error>}
                    <GamepinFormInput placeholder="GAME PIN" type={"number"} {...inputProps} onChange={(e: { target: { value: String; }; }) => setGamePin(e.target.value)} />
                    <GamepinLogginButton onClick={() => setPin(gamePin)}>PLAY!</GamepinLogginButton>
                </>
            }
        </Content>
        <Footer>... or create your own Gunwale&nbsp;<div onClick={toCreatorMode} style={{ color: "#1c0041", textDecoration: "underline", fontFamily: "Coll", cursor: "pointer" }}>here</div></Footer>
    </GamePinWrapper>)
}

const GamePinWrapper = styled.div`
    height: 100vh;
    width: 100vw;
    min-height: 100vh;
    min-height: -webkit-fill-available;
`;

const Background = styled.div`
    height: 100vh;
    width: 100vw;
    background-image: linear-gradient(180deg, #203046 0%, #030006 100%);
    transform: skewY(-5deg) translate(0%, -13%);
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

export const GamepinFormInput = styled.input`
    font-family : 'Soopafresh';
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
    margin-bottom: 20px;
    border-radius: 3px;
    width: -webkit-fill-available;
`;

export const GamepinLogginButton = styled.div`
    font-family : 'Soopafresh';
    text-align: center;
    display: block;
    width: 100%;
    padding: .375rem .75rem;
    font-size: 1.5rem;
    line-height: 1.5;
    color: white;
    background-clip: padding-box;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    max-width: 500px;
    margin: auto;
    margin-bottom: 30px;
      
    background: #B45151;
       
    cursor: pointer;
    width: -webkit-fill-available;
`;

const Footer = styled.div`
    display: block;
    justify-content: center;
    position: relative;
    bottom: 5vh;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
    color: black;
    font-size: 1.5rem;
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


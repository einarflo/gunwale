import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import logo from '../images/gunwale-logo.png';

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
        <Content>
            <Logo src={logo} onClick={()  => window.location.replace('http://gunwale.dogetek.no/')}/>
            {
                loading ? <Spinner /> :
                <>
                    {error && <Error>Wrong game pin. Try another pls?</Error>}
                    <FormInput placeholder="Game pin" type={"number"} {...inputProps} onChange={(e: { target: { value: String; }; }) => setGamePin(e.target.value)} />
                    <LogginButton onClick={() => setPin(gamePin)}>Start</LogginButton>
                </>
            }
        </Content>
        <Footer>Make your own Gunwale <div onClick={toCreatorMode} style={{ color: "#1c0041", textDecoration: "underline"}}>here</div>.</Footer>
    </GamePinWrapper>)
}

const GamePinWrapper = styled.div`
    height: 100vh;
    width: 100vw;
    background: #ffffff;
`;

const Logo = styled.img`
    max-width: 400px;
    width: -webkit-fill-available;
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
    color: #000000;
    margin-left: auto;
    margin-right: auto;
    max-width: 25vw;
    min-width: 300px;
    width: -webkit-fill-available;
`;

const FormInput = styled.input`
    font-family : 'Avenir';
    text-align: center;
    display: block;
    width: 100%;
    padding: .375rem .75rem;
    font-size: 1.2rem;
    line-height: 1.5;
    background-clip: padding-box;
        
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    max-width: 500px;
    margin: auto;
    border: 3px solid rgb(28,0,65);
    margin-bottom: 20px;
    border-radius: 8px;
    width: -webkit-fill-available;
`;

const LogginButton = styled.div`
    text-align: center;
    display: block;
    width: 100%;
    padding: .375rem .75rem;
    font-size: 1.2rem;
    font-weight: bold;
    line-height: 1.5;
    color: white;
    background-clip: padding-box;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    max-width: 500px;
    margin: auto;
    margin-bottom: 30px;
      
    background: rgb(28,0,65);
    background: linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(45,56,112,1) 0%, rgba(21,2,43,1) 100%);
    box-shadow: 0 4px 8px 1px rgba(0, 0, 0, 0.4);
       
    border-radius: 8px;
      
    font-family : 'Avenir';
    cursor: pointer;
    width: -webkit-fill-available;
`;

const Footer = styled.div`
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
    color: black;
    font-size: 1rem;
    text-align: center;
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


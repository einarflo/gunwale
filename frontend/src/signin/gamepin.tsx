import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import TopLeftLogo from "../components/TopLeftLogo";
import logo from '../images/tavl-logo.png';
import { useNavigate, useParams } from "react-router-dom";
import { get } from "../api";

interface GamePinProps {
  setGameId: (id: string) => void;
  setGameInstanceId: (id: string) => void;
  setGamePin: (pin: string) => void;
}

const GamePin = ({ setGameId, setGameInstanceId, setGamePin }: GamePinProps) => {
    // get gamePin from url params
    const { gamePin } = useParams<{ gamePin: string }>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (gamePin) {
            setEnteredGamePin(gamePin);
        }
    }, [gamePin]);

  const setPin = (pin: string | undefined) => {
    if (pin && pin.length > 0 && pin !== '0') {
      setLoading(true);
      get(`/game_instance/${pin}/`)
        .then(res => {
          if (res.data && res.data['status'] === 'created') {
            setGameId(res.data['game_id']);
            setGameInstanceId(res.data['id']);
            setGamePin(pin);
            setError(false);
            setLoading(false);
            navigate('/username');
          } else {
            setError(true);
            setLoading(false);
          }
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    } else {
      setError(true);
    }
  };

    const [enteredGamePin, setEnteredGamePin] = useState<string>("");

    const navigate = useNavigate();

    return (
        <GamePinWrapper>
            <BackgroundLayer />
            <GlowLeft />
            <GlowRight />
            <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
                <TopLeftLogo />
                <button
                    style={{
                        position: "absolute",
                        left: 32,
                        top: 32,
                        background: "none",
                        border: "none",
                        color: "#3b82f6",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        zIndex: 20
                    }}
                    onClick={() => navigate('/')}
                >
                    ← Back
                </button>
                <Content>

                        <Logo src={logo}/>
                        {loading ? <Spinner /> : (
                            <>
                                {error && <ErrorText>Wrong game pin. Try another pls?</ErrorText>}
                                <TextInputField autoFocus={false} tabIndex={0} placeholder="Game pin" type={"number"} value={enteredGamePin} onChange={(e: { target: { value: String; }; }) => setEnteredGamePin(e.target.value.toString())} onKeyPress={(e: any)  => {
                                    if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
                                      setPin(enteredGamePin)
                                    }
                                }}/>
                                <PrimaryButtonLocal onClick={() => setPin(enteredGamePin)}>PLAY</PrimaryButtonLocal>
                                <Footer>or create a new game&nbsp;<div onClick={() => navigate('/home/login')} style={{ color: "#3b82f6", textDecoration: "underline", fontFamily: "Coll", cursor: "pointer" }}>here</div>.</Footer>
                            </>
                        )}
                </Content>
            </div>
        </GamePinWrapper>
    );
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
    background: #ffffff;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s, transform .15s ease-in-out;
    max-width: 500px;
    margin: auto;
    border: 2px solid #e5e7eb;
    color: #374151;
    margin-bottom: 20px;
    margin-top: 50px;
    border-radius: 14px;
    width: -webkit-fill-available;
    &:focus {
        outline: none;
        border-color: #93c5fd;
        box-shadow: 0 0 0 6px rgba(147, 197, 253, 0.25);
        transform: translateY(-1px);
    }
`;

export const PrimaryButtonLocal = styled.div`
    font-family : 'Coll';
    text-align: center;
    display: block;
    width: 80%;
    padding: .375rem .75rem;
    font-size: 1.1rem;
    line-height: 1.5;
    color: #ffffff;
    background-clip: padding-box;
    transition: transform .15s ease-in-out, box-shadow .15s ease-in-out, background .2s ease-in-out;
    max-width: 500px;
    margin: auto;
    margin-bottom: 30px;
    margin-top: 40px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    cursor: pointer;
    border-radius: 14px;
    box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25);
    &:hover {
        transform: translateY(-1px) scale(1.01);
        box-shadow: 0 16px 32px rgba(59, 130, 246, 0.3);
    }
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
border: 3px solid rgba(59,130,246,.25);
border-radius: 50%;
border-top-color: #3b82f6;
animation: spin 1s ease-in-out infinite;
-webkit-animation: ${rotate} 1s ease-in-out infinite;
`;

const BackgroundLayer = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #ffffff, #f5f7ff);
`;

const GlowLeft = styled.div`
    position: absolute;
    top: -20%;
    left: -10%;
    width: 60vw;
    height: 60vw;
    border-radius: 50%;
    filter: blur(70px);
    opacity: 0.7;
    background: radial-gradient(circle, rgba(59,130,246,0.25), transparent 60%);
    pointer-events: none;
`;

const GlowRight = styled.div`
    position: absolute;
    bottom: -15%;
    right: -10%;
    width: 55vw;
    height: 55vw;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
    background: radial-gradient(circle, rgba(236,72,153,0.22), transparent 60%);
    pointer-events: none;
`;

export default GamePin;


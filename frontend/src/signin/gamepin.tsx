import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import TopLeftLogo from "../components/TopLeftLogo";
import logo from '../images/tavl-logo.png';
import { useNavigate } from "react-router-dom";

interface GamePinProps {
    error: boolean,
    loading: boolean,
    setPin: (pin: string | undefined) => void,
    toCreatorMode: () => void
}

const GamePin = ({ setPin, error, loading, toCreatorMode }: GamePinProps) => {
    const [gamePin, setGamePin] = useState<string>("");
    const [exiting, setExiting] = useState<boolean>(false);
    const [nextPin, setNextPin] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    useEffect(() => {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] === 'gameid'){
                setGamePin(pair[1]);
            }
        }
    }, []);

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
                    onClick={() => navigate(-1)}
                >
                    ← Tilbake
                </button>
                <Content>
                    <AnimatedPanel
                        initial={{ opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: exiting ? 0 : 1, y: exiting ? -12 : 0, scale: exiting ? 0.98 : 1 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        onAnimationComplete={() => {
                            if (exiting && nextPin !== undefined) {
                                setPin(nextPin);
                            }
                        }}
                    >
                        <Logo src={logo}/>
                        {loading ? <Spinner /> : (
                            <>
                                {error && <ErrorText>Wrong game pin. Try another pls?</ErrorText>}
                                <TextInputField autoFocus={false} tabIndex={0} placeholder="Game pin" type={"number"} value={gamePin} onChange={(e: { target: { value: String; }; }) => setGamePin(e.target.value.toString())} onKeyPress={(e: any)  => {
                                    if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined) && !exiting) {
                                        setNextPin(gamePin);
                                        setExiting(true);
                                    }
                                }}/>
                                <PrimaryButtonLocal onClick={() => { if (!exiting) { setNextPin(gamePin); setExiting(true); }}}>PLAY</PrimaryButtonLocal>
                                <Footer>or create a new game&nbsp;<div onClick={toCreatorMode} style={{ color: "#3b82f6", textDecoration: "underline", fontFamily: "Coll", cursor: "pointer" }}>here</div>.</Footer>
                            </>
                        )}
                    </AnimatedPanel>
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

const AnimatedPanel = styled(motion.div)`
    background: rgba(255,255,255,0.9);
    border: 2px solid rgba(59,130,246,0.2);
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.12);
    border-radius: 20px;
    padding: 30px 24px;
`;

export default GamePin;


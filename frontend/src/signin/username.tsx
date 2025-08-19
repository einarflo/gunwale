import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import logo from '../images/tavl-logo.png';
import { ErrorText, TextInputField, PrimaryButtonLocal as PrimaryButton, Logo } from "./gamepin";
import TopLeftLogo from "../components/TopLeftLogo";
import { useNavigate } from "react-router-dom";

interface UsernameProps {
    error: boolean,
    loading: boolean,
    setName: (name: string | undefined) => void
}

const Username = ({ setName, loading, error }: UsernameProps) => {
    const [username, setUsername] = useState<string | undefined>("");
    const [validationError, setValidationError] = useState<string | undefined>("");
    const navigate = useNavigate();

    const validateName = (input: any) => {
            // Sjekk lengden på strengen
    if (input && input.length > 50) {
        setValidationError("Username too long!");
        return false;
    }

    /*

    // Sjekk om strengen kun inneholder bokstaver og tall
    const regex = /^[a-zA-Z0-9]*$/;
    if (input && !regex.test(input)) {
        setValidationError("Username contains special characters");
        return false;
    }

    */

    return true;
    }

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
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Logo src={logo} />
                        {loading ? <Spinner/> : (
                            <>
                                {error && <ErrorText>Already taken. Try another pls?</ErrorText>}
                                {validationError && <ErrorText>{validationError}</ErrorText>}
                                <TextInputField placeholder="Username" onChange={(e: { target: { value: String; }; }) => setUsername(e.target.value.toString())} onKeyPress={(e: any)  => {
                                    if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
                                        setValidationError("");
                                        if (validateName(username)) {
                                            setName(username)
                                        }
                                    }
                                }}/>
                                <PrimaryButton onClick={() => {
                                    setValidationError("");
                                    if (validateName(username)) {
                                        setName(username)
                                    }
                                }}>PLAY</PrimaryButton>
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
    height: 100dvh;
    width: 100vw;
    background: linear-gradient(135deg, #ffffff, #f5f7ff);
`;

const Content = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
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
export default Username;


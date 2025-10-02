import { useContext, useState } from "react";
import styled, { keyframes } from "styled-components";
import logo from '../images/tavl-logo.png';
import { ErrorText, TextInputField, PrimaryButtonLocal as PrimaryButton, Logo } from "./gamepin";
import TopLeftLogo from "../components/TopLeftLogo";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../api/socket";
import { GameContext } from "../GameContext";
import { useSocket } from "../context/SocketContext";

interface UsernameProps {
  setNickname: (name: string | undefined) => void;
  setGameInstancePlayerId: (id: string | undefined) => void;
}

const Username = ({ setNickname, setGameInstancePlayerId }: UsernameProps) => {
    const { gameId, gameInstanceId, gamePin } = useContext(GameContext);
    const { socket } = useSocket();
    
    const [username, setUsername] = useState<string | undefined>("");
    const [validationError, setValidationError] = useState<string | undefined>("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const navigate = useNavigate();

    const validateName = (input: any) => {
      // Sjekk lengden på strengen
      if (input && input.length > 50) {
        setValidationError("Username too long!");
        return false;
      }
      return true;
    }

  const checkAndSetNickName = (enteredNickname: string | undefined) => {
    // Join via WebSocket; server enforces username uniqueness and persists to API.
    setLoading(true);
    if (enteredNickname && enteredNickname.length > 1 && gameInstanceId && gameId) {
      try {
        if (!socket.connected) connectSocket();
        socket.emit(
          'join_player',
          { gameInstanceId: String(gameInstanceId), gameId: String(gameId), username: enteredNickname },
          (resp: { ok?: boolean; playerId?: string; error?: string }) => {
            if (resp?.ok && resp.playerId) {
              setError(false);
              // Successfully added player (via WS server)
              setNickname(enteredNickname);
              setGameInstancePlayerId(resp.playerId);
              socket.emit('join_game', String(gameInstanceId || ''));
              socket.emit('player_update', { gameId: String(gameInstanceId || ''), event: 'join_ack', player: { id: resp.playerId, username: enteredNickname, score: '0' } });
              setLoading(false);
              navigate('/play');
            } else {
              setError(true);
              setLoading(false);
            }
          }
        );
      } catch (err) {
        console.log(err);
        setError(true);
        setLoading(false);
      }
    } else {
      setError(true);
      setLoading(false);
    }
  };

  // insertGameInstancePlayer no longer used; handled by WS 'join_player'

    /*

    // Sjekk om strengen kun inneholder bokstaver og tall
    const regex = /^[a-zA-Z0-9]*$/;
    if (input && !regex.test(input)) {
        setValidationError("Username contains special characters");
        return false;
    }

    */



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
                    onClick={() => navigate('/join/' + gamePin)}
                >
                    ← Back
                </button>
                <Content>
                        <Logo src={logo} />
                        {loading ? <Spinner/> : (
                            <>
                                {error && <ErrorText>Already taken. Try another pls?</ErrorText>}
                                {validationError && <ErrorText>{validationError}</ErrorText>}
                                <TextInputField placeholder="Username" onChange={(e: { target: { value: String; }; }) => setUsername(e.target.value.toString())} onKeyPress={(e: any)  => {
                                    if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
                                        setValidationError("");
                                        if (validateName(username)) {
                                            checkAndSetNickName(username)
                                        }
                                    }
                                }}/>
                                <PrimaryButton onClick={() => {
                                    setValidationError("");
                                    if (validateName(username)) {
                                        checkAndSetNickName(username)
                                    }
                                }}>PLAY</PrimaryButton>
                            </>
                        )}
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
    bottom: 5%;
    right: 0%;
    width: 55vw;
    height: 55vw;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
    background: radial-gradient(circle, rgba(236,72,153,0.22), transparent 60%);
    pointer-events: none;
`;

export default Username;

import { useContext, useState } from "react";
import styled, { keyframes } from "styled-components";
import logo from '../images/tavl-logo.png';
import { ErrorText, TextInputField, PrimaryButtonLocal as PrimaryButton, Logo } from "./gamepin";
import TopLeftLogo from "../components/TopLeftLogo";
import { useNavigate } from "react-router-dom";
import { get, post } from "../api";
import { GameInstancePlayer } from "../App";
import { GameContext } from "../GameContext";

interface UsernameProps {
  setNickname: (name: string | undefined) => void;
  setGameInstancePlayerId: (id: string | undefined) => void;
}

const Username = ({ setNickname, setGameInstancePlayerId }: UsernameProps) => {
    const { gameId, gameInstanceId, gamePin } = useContext(GameContext);
    
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
    // Check if nickname is already taken
    setLoading(true);
    if (enteredNickname && enteredNickname.length > 1) {
      get(`/game_instance_players/${gameInstanceId}/?checkUser=true`)
        .then(res => {
          if (res.data) {
            console.log(res.data);
            if (res.data.find((player: GameInstancePlayer) => player.username === enteredNickname)) {
              // Nickname already taken
              setError(true);
              setLoading(false);
            } else {
              // Nickname available
              setError(false);
              insertGameInstancePlayer(enteredNickname);
            }
          }
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    } else {
      setError(true);
      setLoading(false);
    }
  };

  const insertGameInstancePlayer = (name: string) => {
    post(
      `/game_instance_players/`,
      JSON.stringify({
        game_id: gameId,
        game_instance_id: gameInstanceId,
        username: name,
        score: '0'
      }),
      { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    )
      .then(res => {
        // Successfully added player
        setNickname(name);
        setGameInstancePlayerId(res.data);

        setLoading(false);
        navigate('/play');
      })
      .catch(() => {
        console.log('Something fishy is going on');
        setLoading(false);
      });
  };

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

export default Username;


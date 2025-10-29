import { useContext, useState } from "react";
import styled, { keyframes } from "styled-components";
import logo from '../images/tavl-logo.png';
import { BackgroundLayers, Card, ErrorText, TextInputField, PrimaryButtonLocal as PrimaryButton, Logo, Viewport } from "./gamepin";
import TopLeftLogo from "../components/TopLeftLogo";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../api/socket";
import { GameContext } from "../GameContext";
import { useSocket } from "../context/SocketContext";
import { useI18n } from "../i18n/I18nProvider";
import { savePhoneSession } from "../storage/session";

interface UsernameProps {
  setNickname: (name: string | undefined) => void;
  setGameInstancePlayerId: (id: string | undefined) => void;
}

const Username = ({ setNickname, setGameInstancePlayerId }: UsernameProps) => {
    const { gameId, gameInstanceId, gamePin } = useContext(GameContext);
    const { socket } = useSocket();
    
    const [username, setUsername] = useState<string | undefined>("");
    const [validationError, setValidationError] = useState<string | undefined>("");
    const { t } = useI18n();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const navigate = useNavigate();

    const validateName = (input: any) => {
      // Sjekk lengden på strengen
      if (input && input.length > 50) {
        setValidationError(t('username.tooLong'));
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
              // Persist minimal session for reconnect
              try {
                if (gamePin && gameId && gameInstanceId && enteredNickname) {
                  savePhoneSession({
                    v: 1,
                    gamePin: String(gamePin),
                    gameId: String(gameId),
                    gameInstanceId: String(gameInstanceId),
                    username: String(enteredNickname),
                    points: 0,
                    colour: 0,
                    savedAt: Date.now(),
                  });
                }
              } catch (_) {}
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
            <BackgroundLayers />
            <Viewport>
                <TopLeftLogo />
                <button
                  style={{ position:'absolute', left:24, top:24, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', borderRadius:9999, padding:'8px 12px', cursor:'pointer', zIndex:20 }}
                  onClick={() => navigate('/join/' + gamePin)}
                >← {t('common.back')}</button>
                <Content>
                        <Card>
                        <Logo src={logo} />
                        {loading ? <Spinner/> : (
                            <>
                                {error && <ErrorText>{t('username.errorTaken')}</ErrorText>}
                                {validationError && <ErrorText>{validationError}</ErrorText>}
                                <TextInputField placeholder={t('username.label') || 'Username'} onChange={(e: { target: { value: String; }; }) => setUsername(e.target.value.toString())} onKeyPress={(e: any)  => {
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
                                }}>{t('join.play') || 'PLAY'}</PrimaryButton>
                            </>
                        )}
                        </Card>
                </Content>
            </Viewport>
        </GamePinWrapper>
    );
}

const GamePinWrapper = styled.div`
  position: relative; height: 100dvh; width: 100vw; overflow: hidden; background: #1e1b4b;
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

export default Username;

import { useContext, useState } from "react";
import styled from "styled-components";
import { Card, ErrorText } from "./gamepin";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../api/socket";
import { GameContext } from "../GameContext";
import { useSocket } from "../context/SocketContext";
import { useI18n } from "../i18n/I18nProvider";
import { savePhoneSession } from "../storage/session";
import Header from "../components/landing/Header";
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";

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
              } catch (_) { }
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
      <Header />
      {/* Layered gradients and subtle glow (Tailwind only) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(121,127,252,0.2)_0%,transparent_55%),radial-gradient(circle_at_80%_70%,rgba(107,113,250,0.18)_0%,transparent_55%),linear-gradient(to_bottom_right,rgba(121,127,252,0.12),rgba(107,113,250,0.1),transparent)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(121,127,252,0.05)_0%,transparent_70%)] animate-pulse-slow" />
      {/* Parallax orbs reacting to mouse movement */}
      <ParallaxOrbs />
      {/* Parallax layers that follow scroll */}
      <ParallaxScroll />
      <Backdrop>
        <Content>
          <Card className="relative rounded-3xl border border-slate-200/80 bg-white/60 shadow-xl shadow-indigo-200/40 overflow-hidden p-5 sm:p-6">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
            <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
            <div className="relative space-y-3">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-2">
                  <div className="text-2xl sm:text-2xl font-bold text-white">Got a game pin?</div>
                  <p className="text-sm text-white/80 max-w-sm">
                    Enter your game PIN to join a quiz and start playing!
                  </p>
                </div>
              </div>
              {validationError && <ErrorText>{validationError}</ErrorText>}
              <div className="flex justify-center">
                <input
                  id="username-input"
                  onChange={(e: { target: { value: String; }; }) => setUsername(e.target.value.toString())}
                  onKeyPress={(e: any) => {
                    if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
                      setValidationError("");
                      if (validateName(username)) {
                        checkAndSetNickName(username)
                      }
                    }
                  }}

                  autoFocus={true}
                  tabIndex={0}
                  placeholder={"Enter username"}
                  className="text-center bg-white/5 rounded-full border border-white  px-4 py-3 text-lg font-bold text-white shadow-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-base mt-6 mb-6"
                />
              </div>
              <button
                onClick={() => {
                  setValidationError("");
                  if (validateName(username)) {
                    checkAndSetNickName(username)
                  }
                }}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#6A71FA] px-5 py-3 text-sm font-semibold hover:bg-[#6A71FA] hover:text-white transition-colors shadow-lg shadow-indigo-200/50"
              >
                Play Tavl
                <span aria-hidden className="text-lg leading-none">→</span>
              </button>
            </div>

          </Card>
          <CreateFooter>
            {t("join.orCreate") || "or create a new game"}&nbsp;
            <InlineLink onClick={() => navigate("/home")}>
              {t("join.here") || "here"}
            </InlineLink>
            .
          </CreateFooter>
        </Content>
      </Backdrop>
    </GamePinWrapper>
  );
}

const GamePinWrapper = styled.div`
  position: relative;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
  background: radial-gradient(circle at 18% 18%, rgba(99,102,241,0.12), transparent 34%),
              radial-gradient(circle at 80% 82%, rgba(236,72,153,0.12), transparent 34%),
              #ffffff;
`;

const Backdrop = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px 28px;
`;

const Content = styled.div`
    position: relative;
    z-index: 1;
    min-width: 300px;
    max-width: 440px;
    width: 100%;
    display: grid;
    gap: 12px;
`;


const InlineLink = styled.span`
  color: #4f46e5;
  text-decoration: underline;
  cursor: pointer;
`;

const CreateFooter = styled.div`
  text-align: center;
  color: rgba(15,23,42,0.75);
  font-family: 'Coll';
  font-size: 1.05rem;
`;

export default Username;

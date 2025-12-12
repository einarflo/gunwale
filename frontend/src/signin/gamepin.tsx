import { useEffect, useState, ChangeEvent, KeyboardEvent } from "react";
import styled, { keyframes } from "styled-components";
import logo from "../images/tavl-logo.png";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "../api";
import { useI18n } from "../i18n/I18nProvider";
import Header from "../components/landing/Header";
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";

interface GamePinProps {
  setGameId: (id: string) => void;
  setGameInstanceId: (id: string) => void;
  setGamePin: (pin: string) => void;
}

const GamePin = ({ setGameId, setGameInstanceId, setGamePin }: GamePinProps) => {
  // get gamePin from url params
  const { gamePin } = useParams<{ gamePin: string }>();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (gamePin) {
      setEnteredGamePin(gamePin);
    }
  }, [gamePin]);

  const [enteredGamePin, setEnteredGamePin] = useState<string>("");

  const navigate = useNavigate();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEnteredGamePin(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPin(enteredGamePin);
    }
  };

  const setPin = (pin: string | undefined) => {
    const trimmedPin = pin?.trim();
    if (!trimmedPin) {
      setErrorMessage(t("join.errorMissing"));
      return;
    }

    if (trimmedPin === "0") {
      setErrorMessage(t("join.errorInvalid"));
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    get(`/game_instance/${trimmedPin}/`)
      .then((res) => {
        if (res.data && res.data["status"] === "created") {
          setGameId(res.data["game_id"]);
          setGameInstanceId(res.data["id"]);
          setGamePin(trimmedPin);
          navigate("/username");
        } else {
          setErrorMessage(t("join.errorInvalid"));
        }
      })
      .catch((err) => {
        console.log(err);
        setErrorMessage(t("join.errorNetwork"));
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
                {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
                <div className="flex justify-center">
                  <input
                    id="game-pin-input"
                    autoFocus={false}
                    tabIndex={0}
                    inputMode="numeric"
                    type={"number"}
                    value={enteredGamePin}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder={"Enter game PIN"}
                    className="text-center bg-white/5 rounded-full border border-white  px-4 py-3 text-lg font-bold text-white shadow-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-base mt-6 mb-6"
                  />
                </div>
                <button
                  onClick={() => setPin(enteredGamePin)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#6A71FA] px-5 py-3 text-sm font-semibold hover:bg-[#6A71FA] hover:text-white transition-colors shadow-lg shadow-indigo-200/50"
                >
                  Play Tavl
                  <span aria-hidden className="text-lg leading-none">→</span>
                </button>
              </div>

          </Card>
          <div className="text-center font-bold text-black/60">
            {t("join.orCreate") || "or create a new game"}&nbsp;
            <InlineLink onClick={() => navigate("/home")}>
              {t("join.here") || "here"}
            </InlineLink>
            .
          </div>
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

export const Logo = styled.img`
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 28px;
    height: 84px;
`;



const Content = styled.div`
    position: relative;
    z-index: 1;
    min-width: 300px;
    max-width: 440px;
    width: 100%;
    display: grid;
    gap: 16px;
`;

export const Card = styled.div`
  background: #ffffff;
  border: 1px solid rgba(15,23,42,0.08);
  border-radius: 20px;
  padding: 38px 30px;
  box-shadow: 0 16px 50px rgba(15,23,42,0.08);
`;

export const ErrorText = styled.div`
    text-align: center;
    padding: 14px 12px;
    color: #ffffffff;
    margin: 0 auto 14px;
    width: 100%;
    border-radius: 12px;
    background: rgba(255, 0, 0, 0.35);
    border: 1px solid rgba(239,68,68,0.22);
    font-size: 0.8rem;
    font-weight: 600;
`;

export const Heading = styled.h1`
  color: #0f172a;
  text-align: center;
  font-size: 1.7rem;
  margin: 0 0 10px;
  letter-spacing: -0.01em;
  font-family: 'Coll';
`;

export const Subheading = styled.p`
  color: rgba(15,23,42,0.72);
  text-align: center;
  margin: 0 0 14px;
  font-size: 1.05rem;
  font-family: 'Coll';
`;

export const InputLabel = styled.label`
  display: block;
  color: rgba(15,23,42,0.9);
  font-size: 0.95rem;
  margin: 10px auto 6px;
  width: 100%;
  font-family: 'Coll';
`;

export const TextInputField = styled.input`
    font-family : 'Coll';
    text-align: center;
    display: block;
    width: 100%;
    padding: 16px 18px;
    font-size: 1.8rem;
    letter-spacing: 0.14em;
    line-height: 1.5;
    background-clip: padding-box;
    background: rgba(255,255,255,0.9);
    color: #0f172a;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s, transform .15s ease-in-out, background .15s;
    max-width: 500px;
    margin: 2px auto 16px;
    border: 1px solid rgba(15,23,42,0.12);
    border-radius: 14px;
    width: -webkit-fill-available;
    &::placeholder { color: rgba(15,23,42,0.45); }
    &:focus {
        outline: none;
        border-color: rgba(99,102,241,0.45);
        box-shadow: 0 14px 40px rgba(99,102,241,0.16);
        transform: translateY(-1px);
        background: #ffffff;
    }
`;

export const PrimaryButtonLocal = styled.div`
    font-family : 'Coll';
    text-align: center;
    display: block;
    width: 100%;
    padding: 0.9rem 1rem;
    font-size: 1.15rem;
    line-height: 1.5;
    background-clip: padding-box;
    position: relative;
    overflow: hidden;
    transition: transform .15s ease-in-out, box-shadow .15s ease-in-out, background .2s ease-in-out;
    max-width: 500px;
    margin: auto;
    margin-bottom: 18px;
    margin-top: 14px;
    cursor: pointer;
    box-shadow: 0 12px 24px rgba(0,0,0,0.3);

    &::after {
      content: '';
      position: absolute; inset: 0; background: linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%);
      background-size: 200% 100%;
      animation: shine 1.6s linear infinite;
      pointer-events: none;
    }
`;

const InlineLink = styled.span`
  color: #4f46e5;
  text-decoration: underline;
  cursor: pointer;
`;

export default GamePin;

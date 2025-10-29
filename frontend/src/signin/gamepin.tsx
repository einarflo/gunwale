import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import TopLeftLogo from "../components/TopLeftLogo";
import logo from '../images/tavl-logo.png';
import { useNavigate, useParams } from "react-router-dom";
import { get } from "../api";
import { useI18n } from "../i18n/I18nProvider";
import GlobalStyles from "../components/landing/GlobalStyles";
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
    const [error, setError] = useState(false);
    const { t } = useI18n();

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
            <BackgroundLayers />
            <Viewport>
                <TopLeftLogo />
                <button
                  style={{
                    position: 'absolute', left: 24, top: 24,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', borderRadius: 9999,
                    padding: '8px 12px', cursor: 'pointer', zIndex: 20
                  }}
                  onClick={() => navigate('/')}
                >← {t('common.back')}</button>
                <Content>
                        <Card>
                        <Logo src={logo}/>
                        {loading ? <Spinner /> : (
                            <>
                                {error && <ErrorText>{t('join.errorInvalid')}</ErrorText>}
                                <TextInputField autoFocus={false} tabIndex={0} placeholder={t('join.label')} type={"number"} value={enteredGamePin} onChange={(e: { target: { value: String; }; }) => setEnteredGamePin(e.target.value.toString())} onKeyPress={(e: any)  => {
                                    if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
                                      setPin(enteredGamePin)
                                    }
                                }}/>
                                <PrimaryButtonLocal onClick={() => setPin(enteredGamePin)}>{t('join.play') || 'PLAY'}</PrimaryButtonLocal>
                                <Footer>{t('join.orCreate') || 'or create a new game'}&nbsp;<div onClick={() => navigate('/home')} style={{ color: '#fff', textDecoration: 'underline', fontFamily: 'Coll', cursor: 'pointer' }}>{t('join.here') || 'here'}</div>.</Footer>
                            </>
                        )}
                        </Card>
                </Content>
            </Viewport>
        </GamePinWrapper>
    );
}

const GamePinWrapper = styled.div`
    position: relative;
    height: 100dvh;
    width: 100vw;
    overflow: hidden;
    background: #1e1b4b;
`;

export const Viewport = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
    z-index: 1;
`;

export const Logo = styled.img`
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 28px;
    height: 84px;
`;



const Content = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
`;

export const Card = styled.div`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 28px 22px;
  min-width: 320px;
`;

export const ErrorText = styled.div`
    text-align: center;
    padding-bottom: 20px;
    padding-top: 20px;
    color: #fecaca;
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
    background: rgba(255,255,255,0.08);
    color: #fff;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s, transform .15s ease-in-out, background .15s;
    max-width: 500px;
    margin: auto;
    border: 1px solid rgba(255,255,255,0.15);
    margin-bottom: 20px;
    margin-top: 18px;
    border-radius: 14px;
    width: -webkit-fill-available;
    &::placeholder { color: rgba(255,255,255,0.6); }
    &:focus {
        outline: none;
        border-color: rgba(255,255,255,0.3);
        box-shadow: 0 0 0 6px rgba(236,72,153,0.18);
        transform: translateY(-1px);
    }
`;

export const PrimaryButtonLocal = styled.div`
    font-family : 'Coll';
    text-align: center;
    display: block;
    width: 85%;
    padding: .375rem .75rem;
    font-size: 1.1rem;
    line-height: 1.5;
    color: #ffffff;
    background-clip: padding-box;
    position: relative;
    overflow: hidden;
    transition: transform .15s ease-in-out, box-shadow .15s ease-in-out, background .2s ease-in-out;
    max-width: 500px;
    margin: auto;
    margin-bottom: 30px;
    margin-top: 16px;
    background: linear-gradient(90deg, #6366f1, #ec4899);
    cursor: pointer;
    border-radius: 14px;
    box-shadow: 0 12px 24px rgba(0,0,0,0.3);
    &:hover {
        transform: translateY(-1px) scale(1.01);
        box-shadow: 0 16px 36px rgba(0,0,0,0.35);
    }
    &::after {
      content: '';
      position: absolute; inset: 0; background: linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%);
      background-size: 200% 100%;
      animation: shine 1.6s linear infinite;
      pointer-events: none;
    }
`;

export const Footer = styled.div`
    display: flex;
    justify-content: center;
    color: rgba(255,255,255,0.85);
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

function BackgroundLayers() {
  return (
    <>
      <GlobalStyles />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.35)_0%,transparent_60%),linear-gradient(to_bottom_right,#4f46e5,#9333ea,#ec4899)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse-slow" />
      <ParallaxOrbs />
      <ParallaxScroll />
    </>
  );
}

export { BackgroundLayers };

export default GamePin;

import { useState } from "react";
import styled, { keyframes } from "styled-components";
import TopLeftLogo from "../components/TopLeftLogo";
import { upgrades } from "../data/upgrades";
import { useI18n } from "../i18n/I18nProvider";

interface TutorialProps {
  gamePin?: string;
  onContinue: () => void;
  onCancel?: () => void;
}

const Tutorial = ({ gamePin, onContinue, onCancel }: TutorialProps) => {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);

  const steps = [
    {
      key: 'answer',
      title: 'Answer Fast, Score More',
      body: (
        <FadeIn>
          <PhoneMock>
            <QuestionBar />
            <Options>
              <Opt className="one">A</Opt>
              <Opt className="two">B</Opt>
              <Opt className="three">C</Opt>
              <Opt className="four">D</Opt>
            </Options>
            <TimerWrap>
              <TimerRing />
              <TimerDot />
            </TimerWrap>
          </PhoneMock>
          <Lead>Tap one of the four alternatives before time runs out. Faster correct answers give more points.</Lead>
        </FadeIn>
      )
    },
    {
      key: 'upgrades',
      title: 'Use Points to Buy Upgrades',
      body: (
        <FadeIn>
          <Lead>Spend the points you earn during the countdown to boost yourself — or sabotage opponents.</Lead>
          <Grid>
            {upgrades.map((u, i) => (
              <Card key={i}>
                <Icon src={u.image} alt={u.header} />
                <Title>{u.header}</Title>
                <Desc>{u.description}</Desc>
                <Meta>
                  <Badge>{u.price}</Badge>
                  {u.premium && <Tag>Premium</Tag>}
                </Meta>
              </Card>
            ))}
          </Grid>
        </FadeIn>
      )
    },
  ] as const;

  return (
    <Wrapper>
      <TopLeftLogo />
      <Header>{steps[idx].title}</Header>
      <Sub>{steps[idx].body}</Sub>

      <Dots>
        {steps.map((s, i) => <Dot key={s.key} active={i === idx} />)}
      </Dots>

      {/* Corner-aligned actions like the rest of TV views */}
      {(onCancel || idx > 0) && (
        <CornerLeft onClick={onCancel ? onCancel : () => setIdx(i => Math.max(0, i - 1))}>
          {onCancel ? t('tutorial.backToLobby') : t('common.back')}
        </CornerLeft>
      )}
      {idx < steps.length - 1 ? (
        <CornerRight onClick={() => setIdx(i => Math.min(steps.length - 1, i + 1))}>{t('common.next')}</CornerRight>
      ) : (
        <CornerRight onClick={onContinue}>{t('common.begin')}</CornerRight>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px 40px;
`;

const Header = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin-top: 20px;
`;

const Sub = styled.div`
  margin-top: 10px;
  color: #334155;
  text-align: center;
  max-width: 1100px;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const Grid = styled.div`
  margin: 30px auto 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  width: min(1100px, 90vw);
  justify-items: center;
  @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
`;

const Card = styled.div`
  background: rgba(255,255,255,0.9);
  border: 2px solid #bfdbfe;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 6px 16px rgba(59,130,246,0.15);
  text-align: center;
  width: 100%;
`;

const Icon = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.div`
  margin-top: 8px;
  font-weight: 700;
  color: #0f172a;
`;

const Desc = styled.div`
  font-size: 0.95rem;
  color: #334155;
  margin-top: 4px;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
`;

const Badge = styled.span`
  background: #eff6ff;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
`;

const Tag = styled.span`
  background: #f3e8ff;
  color: #7e22ce;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.75rem;
`;

const CornerRight = styled.button`
  position: absolute;
  bottom: 2%;
  right: 2%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: 800;
  border: none;
  border-radius: 14px;
  padding: 12px 22px;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25);
`;

const CornerLeft = styled.button`
  position: absolute;
  bottom: 2%;
  left: 2%;
  background: white;
  color: #1f2937;
  font-weight: 700;
  border: 2px solid #dbeafe;
  border-radius: 14px;
  padding: 12px 18px;
  cursor: pointer;
  opacity: 0.9;
`;

const FadeIn = styled.div`
  animation: fadeIn .45s ease both;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px) }
    to { opacity: 1; transform: translateY(0) }
  }
`;


const Lead = styled.div`
  font-size: 1.05rem;
  color: #334155;
  max-width: 900px;
  margin: 8px auto 0;
`;



const PhoneMock = styled.div`
  position: relative; margin: 12px auto 16px; width: 280px; height: 520px; border-radius: 28px; background: white; border: 2px solid #dbeafe; box-shadow: 0 12px 24px rgba(59,130,246,.15);
`;
const QuestionBar = styled.div`
  height: 80px; background: linear-gradient(90deg, #60a5fa, #a78bfa); border-radius: 26px 26px 12px 12px;
`;
const Options = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px;
`;
const Opt = styled.div`
  height: 88px; border-radius: 12px; display:flex; align-items:center; justify-content:center; font-weight: 900; color: white; font-size: 1.5rem;
  &.one{ background:#60a5fa } &.two{ background:#34d399 } &.three{ background:#fb7185 } &.four{ background:#8b5cf6 }
`;
const TimerWrap = styled.div`
  position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
`;
const spin = keyframes` 0%{ transform: rotate(0deg) } 100%{ transform: rotate(360deg) } `;
const TimerRing = styled.div`
  width: 64px; height: 64px; border: 6px solid rgba(59,130,246,.15); border-top-color: #3b82f6; border-radius: 999px; animation: ${spin} 2s linear infinite;
`;
const TimerDot = styled.div`
  position: absolute; inset: 0; margin: auto; width: 10px; height: 10px; border-radius: 50%; background: #3b82f6;
`;

const Dots = styled.div` display:flex; justify-content:center; gap:8px; margin-top:14px;`;
const Dot = styled.div<{active:boolean}>`
  width:8px; height:8px; border-radius:50%; background: ${p=>p.active?'#3b82f6':'#bfdbfe'};
`;

export default Tutorial;

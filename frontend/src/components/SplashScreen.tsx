import ParallaxOrbs from "./ParallaxOrbs";
import ParallaxScroll from "./ParallaxScroll";
import tavlLogo from "../images/tavl-logo.png";
import styled, { keyframes } from "styled-components";
import { LoadingCard } from "./utils/LoadingTexts";
import LogoLoader from "./utils/LogoLoader";

type SplashScreenProps = {
  title: string;
  subtitle?: string;
  hint?: string;
};

const SplashScreen = ({ title, subtitle, hint }: SplashScreenProps) => {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <ParallaxOrbs />
      <ParallaxScroll />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="relative w-full max-w-lg rounded-3xl p-10 text-center ">
          <div className="relative flex flex-col items-center gap-6">
            <LogoLoader />
            <h1 className="text-2xl font-bold text-[#9C8AFA]">{title}</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;


/*

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[#9C8AFA]">{title}</h1>
              </div>
          </div>
<Loader>
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
              <Card />
            </Loader>

            */

const loading90 = keyframes`
  0% {
    background: #ffffff00;
  }
  50% {
    background: #9C8AFA;
  }
  100% {
    background: #ffffff00;
  }
`;

const Card = styled.div`
  width: 20px;
  height: 20px;
  border-top-left-radius: 5px;
  background: rgba(255, 255, 255, 0.0);
  transition: 0.4s ease-in-out, 0.2s background-color;
  backdrop-filter: blur(5px);
  margin: 0.2em;
  border-radius: 5px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ${loading90} 2s infinite;

  &:nth-child(2),
  &:nth-child(4),
  &:nth-child(6),
  &:nth-child(8),
  &:nth-child(10),
  &:nth-child(12),
  &:nth-child(14) {
    animation-delay: 1s;
  }
`;

const Loader = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 9em;
  align-items: center;
  justify-content: center;
`;

/*

              {subtitle && <p className="text-sm text-white/75">{subtitle}</p>}
            </div>
            {hint && <p className="text-xs uppercase tracking-[0.3em] text-white">{hint}</p>}
*/
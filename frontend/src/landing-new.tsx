/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";
import GlobalStyles from "./components/landing/GlobalStyles";
import AnimatedGradientBackground from "./components/landing/AnimatedGradientBackground";
import Header from "./components/landing/Header";
import Hero from "./components/landing/Hero";
import GamePinInput from "./components/landing/GamePinInput";
import UpgradesSection from "./components/landing/UpgradesSection";
import FeatureGrid from "./components/landing/FeatureGrid";
import ProductSticky from "./components/landing/ProductSticky";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";
import { upgrades } from "./data/upgrades";

interface LandingPageProps {
    signIn: () => void
    playMode: () => void
    setGamePin: (pin: string) => void
}

export default function LandingPage({ signIn, playMode, setGamePin }: LandingPageProps) {
  const [selectedUpgrade, setSelectedUpgrade] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setSelectedUpgrade((prev) => (prev === 7 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800 selection:bg-blue-400/30 overflow-x-hidden">
      <GlobalStyles />
      <AnimatedGradientBackground />
      <Header signIn={signIn} playMode={playMode} />
      {/* Mobile: GamePin banner flush under header */}
      <div className="md:hidden">
        <GamePinInput playMode={playMode} setGamePin={setGamePin} />
      </div>
      <Hero signIn={signIn} playMode={playMode} setGamePin={setGamePin} />
      <UpgradesSection upgrades={upgrades} selectedUpgrade={selectedUpgrade} setSelectedUpgrade={setSelectedUpgrade} setAutoPlay={setAutoPlay} autoPlay={autoPlay} />
      <FeatureGrid />
      <ProductSticky />
      <CTA />
      <Footer />
    </div>
  );
}

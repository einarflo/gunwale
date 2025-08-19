/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";
import GlobalStyles from "./components/landing/GlobalStyles";
import AnimatedGradientBackground from "./components/landing/AnimatedGradientBackground";
import Header from "./components/landing/Header";
import Hero from "./components/landing/Hero";
import UpgradesSection from "./components/landing/UpgradesSection";
import FeatureGrid from "./components/landing/FeatureGrid";
import ProductSticky from "./components/landing/ProductSticky";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";
import one from './images/upgrades/1.png';
import two from './images/upgrades/2.png';
import three from './images/upgrades/3.png';
import four from './images/upgrades/4.png';
import five from './images/upgrades/5.png';
import six from './images/upgrades/6.png';
import seven from './images/upgrades/7.png';
import eight from './images/upgrades/8.png';

interface LandingPageProps {
    signIn: () => void
    playMode: () => void
}

export default function TavlLanding({ signIn, playMode }: LandingPageProps) {
  const [selectedUpgrade, setSelectedUpgrade] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const upgrades = [
    {
      image: one,
      header: "Remove false answers",
      description: "Removes at least two false alternatives.",
      icon: null,
      color: "from-blue-500/20 to-cyan-500/20",
      price: "200 points",
      premium: false
    },
    {
      image: two,
      header: "Full point score",
      description: "Get full score when choosing the correct alternative, like a clock reset.",
      icon: null,
      color: "from-yellow-500/20 to-orange-500/20",
      price: "250 points",
      premium: false
    },
    {
      image: three,
      header: "Gear up your score",
      description: "Score multiplier that increases the amount of points you earn per question.",
      icon: null,
      color: "from-purple-500/20 to-pink-500/20",
      price: "100 points",
      premium: false
    },
    {
      image: four,
      header: "Eye in the sky",
      description: "See what your opponents are answering in real time.",
      icon: null,
      color: "from-green-500/20 to-emerald-500/20",
      price: "300 points",
      premium: false
    },
    {
      image: five,
      header: "Shield protection",
      description: "Protects you from sabotage from other players.",
      icon: null,
      color: "from-indigo-500/20 to-blue-500/20",
      price: "500 points",
      premium: true
    },
    {
      image: six,
      header: "Slow down",
      description: "Sabotages your opponents by slowing down their games.",
      icon: null,
      color: "from-red-500/20 to-pink-500/20",
      price: "1 000 points",
      premium: true
    },
    {
      image: seven,
      header: "End an opponent",
      description: "Sabotage one opponent by taking away their entire score.",
      icon: null,
      color: "from-purple-500/20 to-red-500/20",
      price: "2 000 points",
      premium: true
    },
    {
      image: eight,
      header: "Nuke",
      description: "Sabotage the entire game by taking away everyone's score!",
      icon: null,
      color: "from-red-500/20 to-orange-500/20",
      price: "10 000 points",
      premium: true
    },
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setSelectedUpgrade((prev) => (prev === 7 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800 selection:bg-blue-400/30">
      <GlobalStyles />
      <AnimatedGradientBackground />
      <Header signIn={signIn} playMode={playMode} />
      <Hero signIn={signIn} playMode={playMode} />
      <UpgradesSection upgrades={upgrades} selectedUpgrade={selectedUpgrade} setSelectedUpgrade={setSelectedUpgrade} setAutoPlay={setAutoPlay} autoPlay={autoPlay} />
      <FeatureGrid />
      <ProductSticky />
      <CTA signIn={signIn} playMode={playMode} />
      <Footer />
    </div>
  );
}
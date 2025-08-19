import { ArrowRight, Sparkles, Users, Trophy, Zap } from "lucide-react";
import GamePinInput from "./GamePinInput";

interface HeroProps {
  signIn: () => void;
  playMode: () => void;
}

export default function Hero({ signIn, playMode }: HeroProps) {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-28 sm:pt-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Venstre: tekst og logo */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-300 bg-blue-50 px-4 py-2 text-sm text-blue-600 font-medium mb-4">
            <Sparkles className="h-4 w-4" /> Free to play · Unlimited participants
          </div>
          <h1 className="mt-4 text-balance text-6xl font-bold tracking-tight sm:text-7xl text-gray-800">
            Use your points <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">upgrades</span>
          </h1>
          <p className="mt-6 text-pretty text-xl text-gray-600 leading-relaxed">
            Tavl offers a unique blend of real-time competition and strategic upgrades, Tavl transforms traditional quizzing into an interactive experience that keeps players coming back for more.
          </p>
          <button 
                onClick={playMode}
                className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-2 text-lg font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl shadow-blue-500/30 hover:scale-105 mt-6"
              >
                Start now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
        </div>
        {/* Høyre: CTA-boks */}
         <GamePinInput playMode={playMode} />
      </div>
      {/* Floating feature cards */}
      <div className="pointer-events-none relative mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-3">
        <FloatingCard 
          icon={<Users className="h-6 w-6" />}
          title="Sanntids-konkurranse" 
          subtitle="Spill mot andre i live" 
          delay={0.1} 
        />
        <FloatingCard 
          icon={<Trophy className="h-6 w-6" />}
          title="Spennende oppgraderinger" 
          subtitle="Unlock nye muligheter" 
          delay={0.2} 
        />
        <FloatingCard 
          icon={<Zap className="h-6 w-6" />}
          title="Hurtig og responsivt" 
          subtitle="Ingen ventetid" 
          delay={0.3} 
        />
      </div>
    </section>
  );
}

function FloatingCard({ icon, title, subtitle, delay = 0 }: any) {
  return (
    <div className="glass relative rounded-2xl p-6 shadow-2xl shadow-blue-200/50 ring-1 ring-blue-200/50" style={{ animation: "floatSoft 6s ease-in-out infinite" }}>
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-blue-100/50 to-transparent opacity-60" />
      <div className="relative">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-600">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}

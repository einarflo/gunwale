/* eslint-disable jsx-a11y/anchor-is-valid */
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Users, Trophy, Zap, Shield } from "lucide-react";
import logo from './images/tavl-logo.png';

interface LandingPageProps {
    signIn: () => void
    playMode: () => void
}

export default function TavlLanding({ signIn, playMode }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800 selection:bg-blue-400/30">
      <GlobalStyles />
      <AnimatedGradientBackground />
      <Header signIn={signIn} playMode={playMode} />
      <Hero signIn={signIn} playMode={playMode} />
      <FeatureGrid />
      <ProductSticky />
      <CTA signIn={signIn} playMode={playMode} />
      <Footer />
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      :root {
        --g1: 59,130,246;   /* blue-500 */
        --g2: 236,72,153;   /* pink-500 */
        --g3: 16,185,129;   /* emerald-500 */
        --g4: 245,158,11;   /* amber-500 */
        --g5: 239,68,68;    /* red-500 */
        --grid: rgba(59,130,246,0.08);
      }

      @keyframes meshShift {
        0%, 100% { transform: translate3d(0,0,0) scale(1); filter: hue-rotate(0deg); }
        33% { transform: translate3d(-2%, 1%, 0) scale(1.02); filter: hue-rotate(20deg); }
        66% { transform: translate3d(2%, -1%, 0) scale(1.03); filter: hue-rotate(-20deg); }
      }

      @keyframes floatSoft {
        0%,100% { transform: translateY(0px); }
        50%     { transform: translateY(-8px); }
      }

      @keyframes glowPulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.8; }
      }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .glass {
        backdrop-filter: blur(16px);
        background: linear-gradient(
          135deg,
          rgba(255,255,255,0.9),
          rgba(255,255,255,0.7)
        );
        border: 2px solid rgba(59,130,246,0.2);
        box-shadow: 0 8px 32px rgba(59,130,246,0.1);
      }

      .grid-overlay::before {
        content: "";
        position: absolute; inset: 0;
        background-image:
          linear-gradient(to right, var(--grid) 1px, transparent 1px),
          linear-gradient(to bottom, var(--grid) 1px, transparent 1px);
        background-size: 40px 40px;
        mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
        pointer-events: none;
      }
    `}</style>
  );
}

function AnimatedGradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Playful animated gradient blobs */}
      <div
        className="absolute -top-40 -left-40 h-[70vw] w-[70vw] rounded-full blur-3xl opacity-40"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g1),0.4), transparent 70%)",
          animation: "glowPulse 6s ease-in-out infinite"
        }}
      />
      <div
        className="absolute -top-20 right-[-15%] h-[60vw] w-[60vw] rounded-full blur-3xl opacity-35"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g2),0.3), transparent 65%)",
          animation: "glowPulse 8s ease-in-out infinite 1s"
        }}
      />
      <div
        className="absolute bottom-[-20%] left-1/4 h-[75vw] w-[75vw] rounded-full blur-3xl opacity-40"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g3),0.3), transparent 60%)",
          animation: "glowPulse 10s ease-in-out infinite 2s"
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[50vw] w-[50vw] rounded-full blur-3xl opacity-30"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g4),0.25), transparent 55%)",
          animation: "glowPulse 12s ease-in-out infinite 3s"
        }}
      />
      <div
        className="absolute top-1/4 right-1/4 h-[40vw] w-[40vw] rounded-full blur-3xl opacity-35"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g5),0.3), transparent 50%)",
          animation: "glowPulse 7s ease-in-out infinite 4s"
        }}
      />

      {/* Animated mesh layer */}
      <div
        className="absolute inset-0 mix-blend-multiply opacity-50"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 20%, rgba(59,130,246,0.08), transparent 70%), " +
            "radial-gradient(50% 50% at 80% 30%, rgba(236,72,153,0.06), transparent 70%)",
          animation: "meshShift 25s ease-in-out infinite",
        }}
      />

      {/* Decorative grid */}
      <div className="absolute inset-0 grid-overlay" />
    </div>
  );
}

function Header({ signIn, playMode }: { signIn: () => void; playMode: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-blue-200 bg-white/90 backdrop-blur-xl shadow-lg shadow-blue-100/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tavl" className="h-8 w-8" />
        </div>
        <nav className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
          <a href="#features" className="hover:text-blue-600 transition-colors font-medium">Funksjoner</a>
          <a href="#game" className="hover:text-blue-600 transition-colors font-medium">Spill</a>
          <a href="#upgrades" className="hover:text-blue-600 transition-colors font-medium">Oppgraderinger</a>
          <a href="#about" className="hover:text-blue-600 transition-colors font-medium">Om oss</a>
        </nav>
        <div className="flex items-center gap-3">
          <button 
            onClick={signIn}
            className="rounded-xl border-2 border-blue-300 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-all font-medium"
          >
            Logg inn
          </button>
          <button 
            onClick={playMode}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
          >
            Start spill <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ signIn, playMode }: { signIn: () => void; playMode: () => void }) {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-28 sm:pt-32">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-300 bg-blue-50 px-4 py-2 text-sm text-blue-600 font-medium">
          <Sparkles className="h-4 w-4" /> Nytt quiz-spill · Gratis å spille
        </div>
        <h1 className="mt-8 text-balance text-6xl font-bold tracking-tight sm:text-7xl text-gray-800">
          Quiz som føles <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">magisk</span>
        </h1>
        <p className="mt-6 text-pretty text-xl text-gray-600 leading-relaxed">
          Tavl er det nyeste quiz-spillet i byen. Gratis å spille, med spennende oppgraderinger, 
          sanntids-konkurranse og en helt ny måte å teste kunnskapen din på.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button 
            onClick={playMode}
            className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-lg font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
          >
            Start gratis spill
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button 
            onClick={signIn}
            className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg text-gray-700 hover:bg-gray-50 transition-all shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/50"
          >
            Opprett konto
          </button>
        </div>
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
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass relative rounded-2xl p-6 shadow-2xl shadow-blue-200/50 ring-1 ring-blue-200/50"
      style={{ animation: "floatSoft 6s ease-in-out infinite" }}
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-blue-100/50 to-transparent opacity-60" />
      <div className="relative">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-600">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
      </div>
    </motion.div>
  );
}

function FeatureGrid() {
  const items = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Falske svar fjernes",
      text: "Fjern minst to feil alternativer for å gjøre spillet enklere.",
      color: "from-blue-500/20 to-cyan-500/20",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Full poengsum",
      text: "Få full poeng når du velger riktig alternativ, som om klokken var tilbake til start.",
      color: "from-yellow-500/20 to-orange-500/20",
      bgColor: "from-yellow-50 to-orange-50"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Poeng multiplikator",
      text: "Score multiplikator som øker mengden poeng du tjener per spørsmål.",
      color: "from-purple-500/20 to-pink-500/20",
      bgColor: "from-purple-50 to-pink-50"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Øye i himmelen",
      text: "Se hva dine motstandere svarer i sanntid.",
      color: "from-green-500/20 to-emerald-500/20",
      bgColor: "from-green-50 to-emerald-50"
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">Maktige oppgraderinger</h2>
        <p className="text-xl text-gray-600">Unlock nye muligheter og bli den ultimate quiz-mesteren</p>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, idx) => (
          <FeatureCard key={idx} {...it} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, text, color, bgColor }: any) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 hover:bg-gradient-to-br hover:from-white hover:to-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-200/50">
      <div className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
           style={{background: "radial-gradient(600px 200px at var(--x,50%) var(--y,50%), rgba(59,130,246,0.1), transparent 40%)"}}/>
      <div className={`relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}>
        {icon}
      </div>
      <h3 className="relative text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="relative text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

function ProductSticky() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1.05]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 3]);
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section id="game" className="relative mt-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-300 bg-blue-50 px-4 py-2 text-sm text-blue-600 font-medium">
            Spillopplevelse
          </div>
          <h2 className="mt-4 text-4xl font-bold sm:text-5xl text-gray-800">
            Sanntids quiz med oppgraderinger
          </h2>
          <p className="mt-4 text-xl text-gray-600 leading-relaxed">
            Spill mot andre spillere i sanntid, bruk oppgraderinger for å få fordel, 
            og se hvem som kan svare raskest og riktigst. Hver runde er unik og spennende!
          </p>
          <ul className="mt-8 space-y-3 text-lg text-gray-700">
            <li className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-blue-400 animate-bounce"></div>
              Sanntids konkurranse mot andre spillere
            </li>
            <li className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-purple-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              8 unike oppgraderinger å låse opp
            </li>
            <li className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-pink-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
              Responsivt design for alle enheter
            </li>
          </ul>
        </div>
        <div className="relative h-[500px] md:h-[600px]" ref={ref}>
          <motion.div
            style={{ scale, rotate, y }}
            className="glass sticky top-28 mx-auto h-[400px] w-full max-w-[500px] rounded-3xl p-6 shadow-2xl shadow-blue-200/50"
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-blue-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30" />
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="font-mono">tavl-game.tsx</span>
                  <span>● ● ●</span>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-2/3"></div>
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400 animate-pulse"></div>
                  <div className="h-3 w-3 rounded-full bg-purple-400 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="h-3 w-3 rounded-full bg-pink-400 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTA({ signIn, playMode }: { signIn: () => void; playMode: () => void }) {
  return (
    <section id="upgrades" className="relative mx-auto max-w-7xl px-6 pb-24">
      <div className="glass relative overflow-hidden rounded-3xl p-10">
        <div className="absolute -inset-1 opacity-60" style={{background:"radial-gradient(800px 200px at 10% 10%, rgba(59,130,246,0.15), transparent 40%)"}} />
        <div className="relative text-center">
          <h3 className="text-4xl font-bold mb-4 text-gray-800">Klar til å spille?</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Bli med i det mest spennende quiz-spillet i byen. Gratis å spille, 
            med mulighet for å låse opp maktige oppgraderinger.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button 
              onClick={playMode}
              className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-lg font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl shadow-blue-500/30 hover:scale-105"
            >
              Start gratis spill
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={signIn}
              className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg text-gray-700 hover:bg-gray-50 transition-all shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/50"
            >
              Opprett konto
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-gray-200 py-12 bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-gray-600 md:flex-row">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tavl" className="h-6 w-6" />
          <p>© {new Date().getFullYear()} Tavl. Alle rettigheter forbeholdt.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-blue-600 transition-colors">Personvern</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Vilkår</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Kontakt</a>
        </div>
      </div>
    </footer>
  );
}
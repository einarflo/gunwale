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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white selection:bg-purple-500/30">
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
        --g1: 147,51,234;   /* purple-600 */
        --g2: 236,72,153;   /* pink-500 */
        --g3: 59,130,246;   /* blue-500 */
        --g4: 16,185,129;   /* emerald-500 */
        --grid: rgba(255,255,255,0.08);
      }

      @keyframes meshShift {
        0%, 100% { transform: translate3d(0,0,0) scale(1); filter: hue-rotate(0deg); }
        33% { transform: translate3d(-2%, 1%, 0) scale(1.02); filter: hue-rotate(15deg); }
        66% { transform: translate3d(2%, -1%, 0) scale(1.03); filter: hue-rotate(-15deg); }
      }

      @keyframes floatSoft {
        0%,100% { transform: translateY(0px); }
        50%     { transform: translateY(-8px); }
      }

      @keyframes glowPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }

      .glass {
        backdrop-filter: blur(16px);
        background: linear-gradient(
          135deg,
          rgba(255,255,255,0.15),
          rgba(255,255,255,0.05)
        );
        border: 1px solid rgba(255,255,255,0.2);
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
      {/* Animated gradient blobs */}
      <div
        className="absolute -top-40 -left-40 h-[70vw] w-[70vw] rounded-full blur-3xl opacity-50"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g1),0.6), transparent 70%)",
          animation: "glowPulse 8s ease-in-out infinite"
        }}
      />
      <div
        className="absolute -top-20 right-[-15%] h-[60vw] w-[60vw] rounded-full blur-3xl opacity-40"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g2),0.5), transparent 65%)",
          animation: "glowPulse 10s ease-in-out infinite 2s"
        }}
      />
      <div
        className="absolute bottom-[-20%] left-1/4 h-[75vw] w-[75vw] rounded-full blur-3xl opacity-45"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g3),0.5), transparent 60%)",
          animation: "glowPulse 12s ease-in-out infinite 4s"
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[50vw] w-[50vw] rounded-full blur-3xl opacity-35"
        style={{ 
          background: "radial-gradient(circle, rgba(var(--g4),0.4), transparent 55%)",
          animation: "glowPulse 15s ease-in-out infinite 6s"
        }}
      />

      {/* Animated mesh layer */}
      <div
        className="absolute inset-0 mix-blend-screen opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 20%, rgba(255,255,255,0.1), transparent 70%), " +
            "radial-gradient(50% 50% at 80% 30%, rgba(255,255,255,0.08), transparent 70%)",
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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tavl" className="h-8 w-8" />
        </div>
        <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
          <a href="#features" className="hover:text-purple-300 transition-colors">Funksjoner</a>
          <a href="#game" className="hover:text-purple-300 transition-colors">Spill</a>
          <a href="#upgrades" className="hover:text-purple-300 transition-colors">Oppgraderinger</a>
          <a href="#about" className="hover:text-purple-300 transition-colors">Om oss</a>
        </nav>
        <div className="flex items-center gap-3">
          <button 
            onClick={signIn}
            className="rounded-xl border border-purple-500/30 px-4 py-2 text-sm text-purple-300 hover:bg-purple-500/20 transition-all"
          >
            Logg inn
          </button>
          <button 
            onClick={playMode}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
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
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
          <Sparkles className="h-4 w-4" /> Nytt quiz-spill · Gratis å spille
        </div>
        <h1 className="mt-8 text-balance text-6xl font-bold tracking-tight sm:text-7xl">
          Quiz som føles <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">magisk</span>
        </h1>
        <p className="mt-6 text-pretty text-xl text-white/80 leading-relaxed">
          Tavl er det nyeste quiz-spillet i byen. Gratis å spille, med spennende oppgraderinger, 
          sanntids-konkurranse og en helt ny måte å teste kunnskapen din på.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button 
            onClick={playMode}
            className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-semibold text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40"
          >
            Start gratis spill
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button 
            onClick={signIn}
            className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-lg text-white/90 hover:bg-white/20 transition-all backdrop-blur-sm"
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
      className="glass relative rounded-2xl p-6 shadow-2xl shadow-purple-900/20 ring-1 ring-white/20"
      style={{ animation: "floatSoft 6s ease-in-out infinite" }}
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/15 to-transparent opacity-60" />
      <div className="relative">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>
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
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Full poengsum",
      text: "Få full poeng når du velger riktig alternativ, som om klokken var tilbake til start.",
      color: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Poeng multiplikator",
      text: "Score multiplikator som øker mengden poeng du tjener per spørsmål.",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Øye i himmelen",
      text: "Se hva dine motstandere svarer i sanntid.",
      color: "from-green-500/20 to-emerald-500/20"
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Maktige oppgraderinger</h2>
        <p className="text-xl text-white/70">Unlock nye muligheter og bli den ultimate quiz-mesteren</p>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, idx) => (
          <FeatureCard key={idx} {...it} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, text, color }: any) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300">
      <div className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
           style={{background: "radial-gradient(600px 200px at var(--x,50%) var(--y,50%), rgba(147,51,234,0.15), transparent 40%)"}}/>
      <div className={`relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}>
        {icon}
      </div>
      <h3 className="relative text-lg font-semibold mb-2">{title}</h3>
      <p className="relative text-sm text-white/70 leading-relaxed">{text}</p>
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
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            Spillopplevelse
          </div>
          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
            Sanntids quiz med oppgraderinger
          </h2>
          <p className="mt-4 text-xl text-white/70 leading-relaxed">
            Spill mot andre spillere i sanntid, bruk oppgraderinger for å få fordel, 
            og se hvem som kan svare raskest og riktigst. Hver runde er unik og spennende!
          </p>
          <ul className="mt-8 space-y-3 text-lg text-white/80">
            <li className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              Sanntids konkurranse mot andre spillere
            </li>
            <li className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-pink-400"></div>
              8 unike oppgraderinger å låse opp
            </li>
            <li className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              Responsivt design for alle enheter
            </li>
          </ul>
        </div>
        <div className="relative h-[500px] md:h-[600px]" ref={ref}>
          <motion.div
            style={{ scale, rotate, y }}
            className="glass sticky top-28 mx-auto h-[400px] w-full max-w-[500px] rounded-3xl p-6 shadow-2xl shadow-purple-900/40"
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10" />
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                  <span className="font-mono">tavl-game.tsx</span>
                  <span>● ● ●</span>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg"></div>
                  <div className="h-6 bg-white/10 rounded-lg w-3/4"></div>
                  <div className="h-6 bg-white/10 rounded-lg w-1/2"></div>
                  <div className="h-6 bg-white/10 rounded-lg w-2/3"></div>
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-400"></div>
                  <div className="h-3 w-3 rounded-full bg-pink-400"></div>
                  <div className="h-3 w-3 rounded-full bg-blue-400"></div>
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
        <div className="absolute -inset-1 opacity-60" style={{background:"radial-gradient(800px 200px at 10% 10%, rgba(147,51,234,0.2), transparent 40%)"}} />
        <div className="relative text-center">
          <h3 className="text-4xl font-bold mb-4">Klar til å spille?</h3>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Bli med i det mest spennende quiz-spillet i byen. Gratis å spille, 
            med mulighet for å låse opp maktige oppgraderinger.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button 
              onClick={playMode}
              className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-semibold text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-xl shadow-purple-500/30"
            >
              Start gratis spill
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={signIn}
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-lg text-white/90 hover:bg-white/20 transition-all backdrop-blur-sm"
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
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-white/60 md:flex-row">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tavl" className="h-6 w-6" />
          <p>© {new Date().getFullYear()} Tavl. Alle rettigheter forbeholdt.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-purple-300 transition-colors">Personvern</a>
          <a href="#" className="hover:text-purple-300 transition-colors">Vilkår</a>
          <a href="#" className="hover:text-purple-300 transition-colors">Kontakt</a>
        </div>
      </div>
    </footer>
  );
}
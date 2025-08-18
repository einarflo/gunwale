/* eslint-disable jsx-a11y/anchor-is-valid */
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * Stripe-inspirert landingsside i én React-fil
 * ---------------------------------------------------------
 * Mål: gi deg de samme "vibbene" (glød, glassmorphism,
 * smooth scroll-animasjoner, flytende gradienter,
 * parallax/sticky seksjoner og fokus på produktkort),
 * uten å kopiere Stripe sin eksakte layout/innhold.
 *
 * Teknikkmix:
 * - Tailwind CSS (klasser direkte i JSX)
 * - Framer Motion (scroll- og hover-animasjoner)
 * - CSS-variabler + keyframes for levende gradient-mesh
 * - Glassmorphism-kort med interaktiv tilt (via hover)
 * - Marquee av logoer (ren CSS)
 * - Sticky "produktshot" som skalerer/roterer ved scroll
 *
 * Tips:
 * - Bytt ut tekster, farger og ikoner for ditt brand.
 * - Legg inn egne skjermbilder/gifs i ProductShot.
 */

interface LandingPageProps {
    signIn: () => void
    playMode: () => void
}

export default function StripeInspiredLanding({ signIn, playMode }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0B0B10] text-white selection:bg-indigo-500/30">
      <GlobalStyles />
      <AnimatedGradientBackground />
      <Header />
      <Hero />
      <LogoMarquee />
      <FeatureGrid />
      <ProductSticky />
      <CTA />
      <Footer />
    </div>
  );
}

function GlobalStyles() {
  // CSS for gradient mesh + marquee + utilities
  return (
    <style>{`
      :root {
        --g1: 99,102,241;   /* indigo-500 */
        --g2: 236,72,153;   /* pink-500   */
        --g3: 16,185,129;   /* emerald-500*/
        --grid: rgba(255,255,255,0.06);
      }

      @keyframes meshShift {
        0%, 100% { transform: translate3d(0,0,0) scale(1); filter: hue-rotate(0deg); }
        33% { transform: translate3d(-2%, 1%, 0) scale(1.02); filter: hue-rotate(20deg); }
        66% { transform: translate3d(2%, -1%, 0) scale(1.03); filter: hue-rotate(-20deg); }
      }

      @keyframes floatSoft {
        0%,100% { transform: translateY(0px); }
        50%     { transform: translateY(-6px); }
      }

      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }

      .marquee-track {
        animation: marquee 20s linear infinite;
      }

      .glass {
        backdrop-filter: blur(10px);
        background: linear-gradient(
          180deg,
          rgba(255,255,255,0.10),
          rgba(255,255,255,0.05)
        );
        border: 1px solid rgba(255,255,255,0.1);
      }

      .grid-overlay::before {
        content: "";
        position: absolute; inset: 0;
        background-image:
          linear-gradient(to right, var(--grid) 1px, transparent 1px),
          linear-gradient(to bottom, var(--grid) 1px, transparent 1px);
        background-size: 36px 36px;
        mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 70%);
        pointer-events: none;
      }
    `}</style>
  );
}

function AnimatedGradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Soft radial blobs */}
      <div
        className="absolute -top-40 -left-40 h-[60vw] w-[60vw] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, rgba(var(--g1),0.55), transparent 60%)" }}
      />
      <div
        className="absolute -top-20 right-[-10%] h-[55vw] w-[55vw] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, rgba(var(--g2),0.45), transparent 60%)" }}
      />
      <div
        className="absolute bottom-[-15%] left-1/3 h-[65vw] w-[65vw] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, rgba(var(--g3),0.45), transparent 60%)" }}
      />

      {/* Subtle animated layer */}
      <div
        className="absolute inset-0 mix-blend-screen opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 20%, rgba(255,255,255,0.08), transparent 70%), " +
            "radial-gradient(50% 50% at 80% 30%, rgba(255,255,255,0.06), transparent 70%)",
          animation: "meshShift 20s ease-in-out infinite",
        }}
      />

      {/* Decorative grid */}
      <div className="absolute inset-0 grid-overlay" />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0B0B10]/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-400 to-emerald-400" />
          <span className="font-semibold tracking-tight">Vibb</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm/6 text-white/80 md:flex">
          <a href="#features" className="hover:text-white">Funksjoner</a>
          <a href="#product" className="hover:text-white">Produkt</a>
          <a href="#pricing" className="hover:text-white">Priser</a>
          <a href="#docs" className="hover:text-white">Dokumentasjon</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/90 hover:bg-white/5">Logg inn</button>
          <button className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">
            Kom i gang <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          <Sparkles className="h-3.5 w-3.5" /> Nytt API · 10× raskere integrasjoner
        </div>
        <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Betalinger som føles <span className="bg-gradient-to-r from-indigo-300 via-emerald-300 to-pink-300 bg-clip-text text-transparent">sømløse</span>
        </h1>
        <p className="mt-5 text-pretty text-lg text-white/70">
          En Stripe-inspirert opplevelse bygget i React — moderne animasjoner,
          glassmorphism og sticky produktseksjoner du kan forme til din merkevare.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black hover:bg-white/90">
            Prøv demoen
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/90 hover:bg-white/10">
            Se koden
          </button>
        </div>
      </div>

      {/* Floating cards */}
      <div className="pointer-events-none relative mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
        <FloatingCard title="Umiddelbare utbetalinger" subtitle="Trekk ned T+0 med ett klikk" />
        <FloatingCard title="Smart antifraud" subtitle="ML-beskyttelse på edge" delay={0.2} />
      </div>
    </section>
  );
}

function FloatingCard({ title, subtitle, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass relative rounded-2xl p-6 shadow-2xl shadow-indigo-900/10 ring-1 ring-white/10"
      style={{ animation: "floatSoft 6s ease-in-out infinite" }}
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-60" />
      <div className="relative">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        <div className="mt-4 h-28 rounded-xl border border-white/10 bg-white/5" />
      </div>
    </motion.div>
  );
}

function LogoMarquee() {
  const logos = [
    "Acme", "QuickPay", "Northwind", "Globex", "Initech", "Umbrella", "Soylent", "Stark", "Wayne", "Wonka",
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="relative overflow-hidden">
          <div className="marquee-track flex min-w-[200%] items-center gap-10 opacity-70">
            {[...logos, ...logos].map((name, i) => (
              <div
                key={i}
                className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-wide"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const items = [
    {
      title: "Global støtte",
      text: "Over 135 valutaer og lokale betalingsmåter.",
    },
    {
      title: "Utviklervennlig",
      text: "Type-safe SDKer, webhooks og førsteklasses docs.",
    },
    {
      title: "Skalerbar sikkerhet",
      text: "Tokenisering, kryptering og avanserte policyer.",
    },
    {
      title: "Innebygde rapporter",
      text: "Realtime dashboard og eksport til datalake.",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, idx) => (
          <FeatureCard key={idx} {...it} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ title, text }: any) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
           style={{background: "radial-gradient(600px 200px at var(--x,50%) var(--y,50%), rgba(99,102,241,0.2), transparent 40%)"}}/>
      <h3 className="relative text-base font-medium">{title}</h3>
      <p className="relative mt-1 text-sm text-white/70">{text}</p>
      <div className="relative mt-4 h-24 rounded-xl border border-white/10 bg-white/5" />
    </div>
  );
}

function ProductSticky() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1.08]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="product" className="relative mt-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-24 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            Produkt
          </div>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Sticky seksjon med scroll-effekter
          </h2>
          <p className="mt-3 text-white/70">
            En klassisk Stripe-følelse er at elementer holder seg "sticky" mens innholdet
            skifter. Her lar vi et mockup-kort skalere, rotere og bevege seg subtilt etter scroll.
          </p>
          <ul className="mt-6 space-y-3 text-white/80">
            <li>• Sticky container + Framer Motion useScroll</li>
            <li>• Glassmorphism, skygger og glød</li>
            <li>• Perfekt til skjermbilder eller 3D-illustrasjoner</li>
          </ul>
        </div>
        <div className="relative h-[420px] md:h-[520px]" ref={ref}>
          <motion.div
            style={{ scale, rotate, y }}
            className="glass sticky top-28 mx-auto h-[360px] w-full max-w-[520px] rounded-3xl p-4 shadow-2xl shadow-black/40"
          >
            {/* Bytt ut dette med et ekte skjermbilde / video av produktet ditt */}
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10">
              <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_30%,rgba(99,102,241,.15),transparent_60%),radial-gradient(50%_50%_at_80%_60%,rgba(236,72,153,.15),transparent_60%)]" />
              <div className="relative z-10 p-5">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>dashboard.tsx</span>
                  <span>● ● ●</span>
                </div>
                <pre className="mt-3 overflow-auto rounded-lg bg-black/40 p-4 text-[11px] leading-relaxed">
{`export const handler = async (req) => {\n  const session = await createCheckoutSession({\n    lineItems: cart.items,\n    customer: req.user.id,\n  })\n  return redirect(session.url)\n}`}                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="pricing" className="relative mx-auto max-w-7xl px-6 pb-24">
      <div className="glass relative overflow-hidden rounded-3xl p-8">
        <div className="absolute -inset-1 opacity-60" style={{background:"radial-gradient(800px 200px at 10% 10%, rgba(99,102,241,.15), transparent 40%)"}} />
        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold">Bygg noe som føles premium</h3>
            <p className="mt-2 text-white/70">
              Start med gratis plan, skaler etter behov. Koden i denne filen gir deg
              strukturen — du fyller på med eget innhold og brand.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black hover:bg-white/90">
                Opprett konto
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/90 hover:bg-white/10">
                Se dokumentasjon
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-3xl font-semibold">0,9%</div>
              <div className="mt-1 text-sm text-white/70">+ 1 kr per transaksjon</div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>• Ingen oppstartskostnader</li>
                <li>• Volumrabatter</li>
                <li>• Avtaler for enterprise</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-3xl font-semibold">99 kr</div>
              <div className="mt-1 text-sm text-white/70">per måned (Pro)</div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>• Webhooks + retries</li>
                <li>• Datarapporter</li>
                <li>• Prioritert support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-white/60 md:flex-row">
        <p>© {new Date().getFullYear()} Vibb, Inc.</p>
        <div className="flex items-center gap-4">
          <a href="#">Personvern</a>
          <a href="#">Vilkår</a>
          <a href="#">Kontakt</a>
        </div>
      </div>
    </footer>
  );
}
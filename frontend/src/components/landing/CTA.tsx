import React, { useState } from "react";
import { Sparkles } from "lucide-react";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [buttonAnim, setButtonAnim] = useState(false);

  const handleSubscribe = () => {
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setError("Skriv inn en gyldig e-postadresse");
      return;
    }
    setError("");
    setSubmitted(true);
    setButtonAnim(true);
    setTimeout(() => setButtonAnim(false), 600);
    // TODO: Send email to backend or service
  };

  return (
    <section id="updates" className="relative mx-auto max-w-7xl px-6 pb-24">
      {/* Animated glow behind CTA box */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        <div className="animate-glowCTA rounded-3xl" style={{
          width: '520px', height: '320px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(236,72,153,0.18) 40%, rgba(59,130,246,0.12) 80%, transparent 100%)',
          filter: 'blur(32px)',
        }} />
      </div>
      <style>{`
        @keyframes glowCTA {
          0%,100% { filter: blur(32px) brightness(1); opacity: 0.7; }
          50% { filter: blur(40px) brightness(1.2); opacity: 1; }
        }
        .animate-glowCTA {
          animation: glowCTA 4s ease-in-out infinite;
        }
      `}</style>
      <div className="relative overflow-hidden rounded-3xl p-10 shadow-2xl shadow-purple-400/50 border-0 border-purple-400 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 z-10">
        <div className="relative text-center mt-8">
          <h3 className="text-4xl font-extrabold mb-4 text-white drop-shadow-lg">Hold deg oppdatert!</h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-medium">
            Meld din interesse for Tavl og få beskjed når vi lanserer nye funksjoner, quizzer og abonnement.<br />
            <span className="inline-block mt-2 text-pink-200 font-semibold">Bli med i fellesskapet før alle andre!</span>
          </p>
          {submitted ? (
            <div className="text-green-300 text-lg font-semibold py-6 animate__animated animate__fadeIn">Takk! Du er nå på listen for oppdateringer.</div>
          ) : (
            <form className="flex flex-col items-center gap-4 sm:flex-row justify-center" onSubmit={e => {e.preventDefault(); handleSubscribe();}}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Din e-postadresse..."
                className="w-full max-w-xs rounded-xl border-2 border-pink-300 px-4 py-3 text-lg text-gray-800 focus:outline-none focus:border-purple-400 bg-white shadow-lg"
                required
              />
              <button
                type="submit"
                className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-8 py-3 text-lg font-bold text-white hover:from-purple-600 hover:to-blue-600 transition-all shadow-xl shadow-pink-500/30 hover:scale-105 animate__animated animate__pulse animate__infinite ${buttonAnim ? 'animate__animated animate__tada' : ''}`}
              >
                Meld interesse
              </button>
            </form>
          )}
          {error && <div className="text-red-300 text-sm mt-2">{error}</div>}
        </div>
      </div>
    </section>
  );
}

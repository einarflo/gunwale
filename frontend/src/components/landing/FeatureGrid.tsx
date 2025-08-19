import React from "react";
import { Shield, Trophy, Zap, Users } from "lucide-react";

export default function FeatureGrid() {
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

import React from "react";
import { ArrowRight } from "lucide-react";

interface CTAProps {
  signIn: () => void;
  playMode: () => void;
}

export default function CTA({ signIn, playMode }: CTAProps) {
  return (
    <section id="upgrades" className="relative mx-auto max-w-7xl px-6 pb-24">
      <div className="glass relative overflow-hidden rounded-3xl p-10">
        <div className="absolute -inset-1 opacity-60" style={{background:"radial-gradient(800px 200px at 10% 10%, rgba(59,130,246,0.15), transparent 40%)"}} />
        <div className="relative text-center">
          <h3 className="text-4xl font-bold mb-4 text-gray-800">Are you a teacher?</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Reach out to us for a free license of Tavl Gold in your classroom.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button 
              onClick={playMode}
              className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-lg font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl shadow-blue-500/30 hover:scale-105"
            >
              Reach out
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={signIn}
              className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg text-gray-700 hover:bg-gray-50 transition-all shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/50"
            >
              See plans
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

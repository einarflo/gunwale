import React from "react";
import logo from '../../images/tavl-logo.png';
import { ArrowRight } from "lucide-react";

interface HeaderProps {
  signIn: () => void;
  playMode: () => void;
}

export default function Header({ signIn, playMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-blue-200 bg-white/90 backdrop-blur-xl shadow-lg shadow-blue-100/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tavl" className="h-8" />
        </div>
        <nav className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
          <a href="#features" className="hover:text-blue-600 transition-colors font-medium">Featured</a>
          <a href="#game" className="hover:text-blue-600 transition-colors font-medium">About</a>
          <a href="#upgrades" className="hover:text-blue-600 transition-colors font-medium">Upgarades</a>
          <a href="#about" className="hover:text-blue-600 transition-colors font-medium">Pricing</a>
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

import React from 'react';
import { Link } from 'react-router-dom';

const BottomCta: React.FC = () => {
  return (
    <section className="container mx-auto px-8 my-28 text-slate-900">
      {/* Centered, bold CTA like the mockup (no glass card) */}
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          Ready to host your first quiz?
        </h2>
        <p className="mt-4 text-slate-600 text-lg md:text-xl">
          Spin up a live game in seconds. Earn points, unlock upgrades, and get everyone smiling.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/home"
            aria-label="Log in to Tavl"
            className="px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Log in to Tavl
          </Link>
          <Link
            to="/join"
            aria-label="Join a game"
            className="px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-white text-rose-700 font-semibold border border-rose-100 hover:bg-rose-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Join a game
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BottomCta;

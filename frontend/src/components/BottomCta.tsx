import React from 'react';
import { Link } from 'react-router-dom';

const BottomCta: React.FC = () => {
  return (
    <section className="container mx-auto px-8 my-28 text-white">
      {/* Centered, bold CTA like the mockup (no glass card) */}
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
          Ready to host your first quiz?
        </h2>
        <p className="mt-4 text-white/80 text-lg md:text-xl">
          Spin up a live game in seconds. Earn points, unlock upgrades, and get everyone smiling.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/discover"
            aria-label="Try Tavl for free"
            className="px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          >
            Try Tavl for free
          </Link>
          <Link
            to="/join"
            aria-label="Join a game"
            className="px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          >
            Join a game
          </Link>
        </div>
      </div>
      <p className="mt-8 text-center text-white/70">Trusted by quiz nights, classrooms and teams</p>
    </section>
  );
};

export default BottomCta;

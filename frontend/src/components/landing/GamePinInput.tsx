import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface GamePinInputProps {
    playMode: () => void;
    setGamePin: (pin: string) => void;
}

export default function GamePinInput({ playMode, setGamePin }: GamePinInputProps) {
  const [gamePin, _setGamePin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (!gamePin.trim()) {
      setError("Skriv inn en gamepin");
      return;
    }
    setError("");
    navigate('/join/' + gamePin);
  };

  return (
    <>
      {/* Mobile banner style (compact, one line) */}
      <div className="md:hidden w-full">
        {/* Force full viewport width */}
        <div className="w-screen relative left-1/2 -translate-x-1/2 flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 border-b-2 border-blue-500 shadow-lg">
          <label htmlFor="mobile-gamepin" className="sr-only">Game pin</label>
          <input
            id="mobile-gamepin"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={gamePin}
            onChange={e => _setGamePin(e.target.value.replace(/\D+/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleStart(); }}
            placeholder="Gamepin ..."
            aria-label="Game pin"
            className="flex-1 min-w-0 rounded-lg border-2 border-white/70 bg-white/95 px-3 py-2 text-base text-gray-800 placeholder-gray-500 focus:outline-none focus:border-white shadow"
          />
          <button
            onClick={handleStart}
            className="rounded-lg bg-white text-blue-700 font-bold px-3 py-1.5 shadow hover:bg-blue-50 border-2 border-white "
          >
            Join
          </button>
        </div>
        {error && <div className="px-3 text-red-700 text-sm mt-1">{error}</div>}
      </div>

      {/* Desktop/Tablet card style */}
      <div className="hidden md:flex justify-center md:justify-end">
        <div className="glass relative overflow-hidden rounded-3xl p-10 w-full max-w-md shadow-xl">
          <h3 className="text-3xl font-bold mb-4 text-gray-800 text-center">Got a game pin?</h3>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Enter your game pin to join an existing game.
          </p>
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              value={gamePin}
              onChange={e => _setGamePin(e.target.value)}
              placeholder="Gamepin..."
              className="w-full max-w-xs rounded-xl border-2 border-blue-200 px-4 py-3 text-lg text-gray-800 focus:outline-none focus:border-blue-400 bg-white shadow"
            />
            {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
          </div>
          <div className="flex flex-col items-center justify-center gap-4 mt-6">
            <button
              onClick={handleStart}
              className="rounded-xl border-2 border-blue-300 px-4 py-2 text-lg text-blue-600 hover:bg-blue-50 transition-all font-medium"
            >
              Join game
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

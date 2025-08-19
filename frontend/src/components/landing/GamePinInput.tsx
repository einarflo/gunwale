import React, { useState } from "react";

export default function GamePinInput({ playMode }: { playMode: () => void }) {
    const [gamePin, setGamePin] = useState("");
    const [error, setError] = useState("");

    const handleStart = () => {
        if (!gamePin.trim()) {
            setError("Skriv inn en gamepin");
            return;
        }
        setError("");
        // TODO: Implement navigation to game with pin
        // For now, just call playMode
        playMode();
    };

    return (

        <div className="flex justify-center md:justify-end">
            <div className="glass relative overflow-hidden rounded-3xl p-10 w-full max-w-md shadow-xl">
                <h3 className="text-3xl font-bold mb-4 text-gray-800 text-center">Got a game pin?</h3>
                <p className="text-lg text-gray-600 mb-8 text-center">

                    Enter your game pin to join an existing game. 
                </p>
                <div className="flex flex-col items-center gap-2">
                    <input
                        type="text"
                        value={gamePin}
                        onChange={e => setGamePin(e.target.value)}
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

    );
}

import React from "react";

interface UpgradesSectionProps {
  upgrades: any[];
  selectedUpgrade: number;
  setSelectedUpgrade: (idx: number) => void;
  setAutoPlay: (val: boolean) => void;
  autoPlay: boolean;
}

export default function UpgradesSection({ upgrades, selectedUpgrade, setSelectedUpgrade, setAutoPlay, autoPlay }: UpgradesSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-6 pb-20">
      <div className="text-center mb-16">
        <h2 className="text-6xl font-bold mb-4 text-gray-800">Strategic <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"> upgrades</span></h2>
        <p className="text-xl text-gray-600 mb-8">
            Unlock powerful upgrades to get ahead the competition
        </p>
      </div>
      {/* Main Upgrade Display */}
      <div className="mb-12">
        <div className="glass relative overflow-hidden rounded-3xl p-8 max-w-4xl mx-auto">
          <div className="absolute -inset-1 opacity-60" style={{background:"radial-gradient(800px 200px at 10% 10%, rgba(59,130,246,0.15), transparent 40%)"}} />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <img 
                src={upgrades[selectedUpgrade].image} 
                alt={upgrades[selectedUpgrade].header}
                className="h-32 w-32 object-contain drop-shadow-lg"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold text-white mb-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mr-2`}>
                { upgrades[selectedUpgrade].price }
              </div>
              
              { upgrades[selectedUpgrade].premium && (
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold text-black mb-3 bg-gradient-to-r from-red-500/20 to-pink-500/20`}>
                    Premium
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{upgrades[selectedUpgrade].header}</h3>
              <p className="text-lg text-gray-600 leading-relaxed">{upgrades[selectedUpgrade].description}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Upgrade Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {upgrades.map((upgrade: any, index: number) => (
          <button
            key={index}
            onClick={() => {
              setSelectedUpgrade(index);
              setAutoPlay(false);
            }}
            className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              selectedUpgrade === index 
                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-200/50' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="p-4 text-center">
              <img 
                src={upgrade.image} 
                alt={upgrade.header}
                className={`h-16 w-16 mx-auto mb-3 object-contain transition-all duration-300 ${
                  selectedUpgrade === index ? 'scale-110' : 'group-hover:scale-105'
                }`}
              />
              <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">{upgrade.header}</h4>
            </div>
          </button>
        ))}
      </div>
      {/* Auto-play toggle */}
      <div className="text-center mt-8">
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            autoPlay 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {autoPlay ? 'Toggle auto-play' : 'Toggle auto-play'}
        </button>
      </div>
    </section>
  );
}

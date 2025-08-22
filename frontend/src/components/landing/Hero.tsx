import { ArrowRight, Sparkles } from "lucide-react";
import GamePinInput from "./GamePinInput";

interface HeroProps {
  signIn: () => void;
  playMode: () => void;
  setGamePin: (pin: string) => void
}

export default function Hero({ signIn, playMode, setGamePin }: HeroProps) {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-28 sm:pt-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Venstre: tekst og logo */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-300 bg-blue-50 px-4 py-2 text-sm text-blue-600 font-medium mb-4">
            <Sparkles className="h-4 w-4" /> Free to play · Unlimited participants
          </div>
          <h1 className="mt-4 text-balance text-6xl font-bold tracking-tight sm:text-7xl text-gray-800">
            Use your points for <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">upgrades</span>
          </h1>
          <p className="mt-6 text-pretty text-xl text-gray-600 leading-relaxed">
            Tavl offers a unique blend of real-time competition and strategic upgrades, Tavl transforms traditional quizzing into an interactive experience that keeps players coming back for more.
          </p>
          <button 
                onClick={signIn}
                className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-2 text-lg font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl shadow-blue-500/30 hover:scale-105 mt-6"
              >
                Start now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
        </div>
        {/* Høyre: CTA-boks */}
         <GamePinInput playMode={playMode} setGamePin={setGamePin} />
      </div>

      {/* Featured quizzes section */}
      <div className="mx-auto mt-24 max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured quizzes</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
          {featuredQuizzes.map((quiz, idx) => (
            <FloatingCard
              key={idx}
              title={quiz.title}
              subtitle={quiz.subtitle}
              image={quiz.image}
              participants={quiz.participants}
              difficulty={quiz.difficulty}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const featuredQuizzes = [
  {
    title: "Norsk geografi",
    subtitle: "Test kunnskapen om Norges byer og natur",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    participants: 120,
    difficulty: "Medium"
  },
  {
    title: "Fotballlegender",
    subtitle: "Hvor mye kan du om verdens beste spillere?",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80",
    participants: 98,
    difficulty: "Hard"
  },
  {
    title: "Popkultur 2025",
    subtitle: "Film, musikk og trender fra året som gikk",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    participants: 210,
    difficulty: "Easy"
  },
  {
    title: "Mat & drikke",
    subtitle: "Quiz om matretter og drikke fra hele verden",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    participants: 75,
    difficulty: "Medium"
  },
  {
    title: "Historiske hendelser",
    subtitle: "Kan du årstallene og detaljene?",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    participants: 60,
    difficulty: "Hard"
  }
];

function FloatingCard({ title, subtitle, image, participants, difficulty }: any) {
  return (
    <div className="glass min-w-[260px] max-w-xs rounded-2xl p-5 shadow-2xl shadow-blue-200/50 ring-1 ring-blue-200/50 flex flex-col">
      <div className="relative mb-4 h-32 w-full rounded-xl overflow-hidden">
        <img src={image} alt={title} className="object-cover h-full w-full" />
        <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow">{difficulty}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
      <div className="flex items-center gap-2 mt-auto">
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">{participants} play throughs</span>
      </div>
    </div>
  );
}

// Add hide-scrollbar utility style

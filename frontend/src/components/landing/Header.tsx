/* eslint-disable jsx-a11y/anchor-is-valid */
import logo from '../../images/tavl-logo.png';
import { ArrowRight, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "../../auth/KeycloakProvider";

interface HeaderProps {
  signIn?: () => void;
  playMode?: () => void;
}

export default function Header({ signIn, playMode }: HeaderProps) {
  const navigate = useNavigate();
  const { logout, username, isAuthenticated, login } = useKeycloak();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-blue-200 bg-white/90 backdrop-blur-xl shadow-lg shadow-blue-100/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tavl" className="h-8 cursor-pointer" onClick={() => navigate(isAuthenticated ? '/home' : '')} />
        </div>
        {/* Desktop nav */}
        {username ? (
          <nav className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
          <div onClick={() => navigate("/home")}  className="hover:text-blue-600 transition-colors font-medium cursor-pointer">Library</div>
          <div onClick={() => navigate("/home/profile")}  className="hover:text-blue-600 transition-colors font-medium cursor-pointer">Profile</div>
          <div onClick={() => navigate("/tv")}  className="hover:text-blue-600 transition-colors font-medium cursor-pointer">Upgrades</div>
        </nav>
        ) : (
        <nav className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
          <a href="#features" className="hover:text-blue-600 transition-colors font-medium">Featured</a>
          <a href="#game" className="hover:text-blue-600 transition-colors font-medium">About</a>
          <a href="#upgrades" className="hover:text-blue-600 transition-colors font-medium">Upgrades</a>
          <a href="#about" className="hover:text-blue-600 transition-colors font-medium">Pricing</a>
        </nav>
        )}
        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated && username && (
            <span className="ml-2 text-sm text-gray-700 font-semibold truncate max-w-[120px]">{username}</span>
          )}
            <button 
              onClick={() => navigate('/join')}
              className="rounded-xl border-2 border-blue-300 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-all font-medium"
            >
              Join game
            </button>
          {!isAuthenticated && (
            <button 
              onClick={login}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
            >
              Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
          {isAuthenticated && (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all font-medium"
            >
              Sign out <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Mobile hamburger */}
        <button
          className="sm:hidden inline-flex items-center justify-center rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(v => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="sm:hidden border-t border-blue-200 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="text-sm text-gray-700 font-semibold mb-1">{username}</div>
                <button onClick={() => { navigate('/home'); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 hover:bg-blue-50 text-gray-700">Library</button>
                <button onClick={() => { navigate('/home/profile'); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 hover:bg-blue-50 text-gray-700">Profile</button>
                <button onClick={() => { navigate('/tv'); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 hover:bg-blue-50 text-gray-700">Upgrades</button>
                <div className="h-px bg-blue-100 my-1" />
                <button onClick={() => { navigate('/join'); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 hover:bg-blue-50 text-blue-700">Join game</button>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 hover:bg-red-50 text-red-600">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 hover:bg-blue-50 text-gray-700">Featured</button>
                <button onClick={() => { document.getElementById('game')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 hover:bg-blue-50 text-gray-700">About</button>
                <button onClick={() => { document.getElementById('upgrades')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 hover:bg-blue-50 text-gray-700">Upgrades</button>
                <button onClick={() => { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 hover:bg-blue-50 text-gray-700">Pricing</button>
                <div className="h-px bg-blue-100 my-1" />
                <button onClick={() => { navigate('/join'); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 hover:bg-blue-50 text-blue-700">Join game</button>
                <button onClick={() => { login(); setMenuOpen(false); }} className="text-left rounded-lg px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">Sign in</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

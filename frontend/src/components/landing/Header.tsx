/* eslint-disable jsx-a11y/anchor-is-valid */
import logo from '../../images/tavl-logo.png';
import { ArrowRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "../../auth/KeycloakProvider";

interface HeaderProps {
  signIn?: () => void;
  playMode?: () => void;
}

export default function Header({ signIn, playMode }: HeaderProps) {
  const navigate = useNavigate();
  const { logout, username, isAuthenticated, login } = useKeycloak();

  return (
    <header className="sticky top-0 z-30 border-b-2 border-blue-200 bg-white/90 backdrop-blur-xl shadow-lg shadow-blue-100/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tavl" className="h-8 cursor-pointer" onClick={() => navigate(isAuthenticated ? '/home' : '')} />
          
        </div>
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
        <div className="flex items-center gap-3">
          {isAuthenticated && username && (
            <span className="ml-4 text-sm text-gray-700 font-semibold">{username}</span>
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
      </div>
    </header>
  );
}

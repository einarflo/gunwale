/* eslint-disable jsx-a11y/anchor-is-valid */
import { ArrowRight, LogOut, User } from "lucide-react";
import tavlWhite from "../../images/tavl-white.png";
import tavlLogo from "../../images/tavl-logo.png";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "../../auth/KeycloakProvider";
import LanguageSwitcher from "../LanguageSwitcher";
import { useI18n } from "../../i18n/I18nProvider";

interface HeaderProps {
  white?: boolean;
}

export default function Header({ white }: HeaderProps) {
  const navigate = useNavigate();
  const { logout, username, isAuthenticated, login } = useKeycloak();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useI18n();

  const userMenuRefDesktop = useRef<HTMLDivElement>(null);
  const userMenuRefMobile = useRef<HTMLDivElement>(null);
  const guestMenuRefMobile = useRef<HTMLDivElement>(null);
  const headerBoxRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      const insideDesktop = userMenuRefDesktop.current?.contains(t);
      const insideMobile = userMenuRefMobile.current?.contains(t);
      const insideGuest = guestMenuRefMobile.current?.contains(t);
      if (!insideDesktop && !insideMobile && !insideGuest) setUserMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setUserMenuOpen(false); };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    const measure = () => {
      const el = headerBoxRef.current;
      if (!el) { setHeaderHeight(0); return; }
      const mt = parseFloat(window.getComputedStyle(el).marginTop || '0');
      setHeaderHeight(el.offsetHeight + mt);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, []);
  useEffect(() => {
    const el = headerBoxRef.current;
    if (!el) return;
    const mt = parseFloat(window.getComputedStyle(el).marginTop || '0');
    setHeaderHeight(el.offsetHeight + mt);
  }, [menuOpen]);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={[
          "transition-all duration-200 mx-3 sm:mx-6 mt-3 rounded-2xl relative  bg-cover shadow-sm shadow-white/50",
          white
            ? (scrolled ? "bg-white" : "bg-white")
            : "bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)]"
        ].join(' ')}
        ref={headerBoxRef}
      >
      <div className="container mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between relative z-10">
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate('/')}
        >
          <img
            src={white ? tavlLogo : tavlWhite}
            alt="tavl"
            className="h-7 sm:h-8 opacity-100 transition-opacity duration-200"
          />
        </div>
        {/* Desktop nav */}
        <nav className={["hidden md:flex items-center gap-2 text-sm rounded-full border px-2 py-1", white ? " bg-[#6A71FA]" : "border-white/10 bg-white/5"].join(' ')}>
          <button
            onClick={() => navigate('/home')}
            className={["relative group transition-colors duration-200 font-bold rounded-full px-4 py-2 ", white ? "text-white hover:text-[#6A71FA] hover:bg-white/90" : "text-white/90 hover:text-white hover:bg-white/10"].join(' ')}
          >
            {t('header.library')}
          </button>
          <button
            onClick={() => navigate('/discover')}
            className={["relative group transition-colors duration-200 font-bold rounded-full px-4 py-2", white ? "text-white hover:text-[#6A71FA]  hover:bg-white/90" : "text-white/90 hover:text-white hover:bg-white/10"].join(' ')}
          >
            {t('home.discover')}
          </button>
          <button
            onClick={() => navigate('/home/upgrades')}
            className={["relative group transition-colors duration-200 font-bold rounded-full px-4 py-2", white ? "text-white hover:text-[#6A71FA]  hover:bg-white/90" : "text-white/90 hover:text-white hover:bg-white/10"].join(' ')}
          >
            {t('header.upgrades')}
          </button>
        </nav>
        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/join')}
            className={["hidden lg:inline-flex rounded-full px-5 py-2 text-sm transition-colors duration-200 font-semibold shadow-sm", white ? "bg-[#6A71FA] text-white hover:text-[#6A71FA]  hover:bg-white/90" : "bg-white hover:bg-indigo-50 text-indigo-600"].join(' ')}
          >
            {t('header.join')}
          </button>
          {!isAuthenticated && (
            <button
              onClick={login}
              className={["inline-flex items-center gap-3 rounded-full px-5 py-2 text-sm transition-colors duration-200", white ? "bg-white border border-[#6A71FA] text-[#6A71FA] hover:bg-[#6A71FA] hover:text-white" : "bg-white/10 border border-white/10 text-white hover:bg-white/20 "].join(' ')}
              aria-label={t('header.signin')}
            >
              <span className="font-bold">{t('header.signin')}</span>
              <ArrowRight className="h-4 w-4 opacity-80" />
            </button>
          )}
          {isAuthenticated && (
            <div className="relative" ref={userMenuRefDesktop}>
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className={["inline-flex items-center gap-3 rounded-full px-4 py-1 text-sm transition-colors duration-200", white ? "bg-white border border-[#6A71FA] text-[#6A71FA] hover:bg-[#6A71FA] hover:text-white" : "bg-white/10 border border-white/10 text-white hover:bg-white/20 "].join(' ')}
                title={username || ''}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white">
                  <User className="h-4 w-4" />
                </span>
                <span className="hidden lg:block max-w-[160px] truncate font-bold">{username}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80"><path d="M7 10l5 5 5-5z"/></svg>
              </button>
              {userMenuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-60 rounded-2xl bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover shadow-xl shadow-black/30 p-2 z-40 text-sm font-bold hover:bg-indigo-50">
                  <button onClick={() => { navigate('/home/profile'); setUserMenuOpen(false); }} className="w-full mb-1 text-left rounded-lg px-3 py-2 hover:bg-white hover:text-indigo-600 bg-white/10 text-white">
                    {t('header.profile')}
                  </button>
                  {/*
                  <button onClick={() => { navigate('/home/achievements'); setUserMenuOpen(false); }} className="w-full mb-1 text-left rounded-lg px-3 py-2 hover:bg-white hover:text-indigo-600 bg-white/10 text-white">
                    Achievements
                  </button>
                  <button onClick={() => { navigate('/home/settings'); setUserMenuOpen(false); }} className="w-full mb-1 text-left rounded-lg px-3 py-2 hover:bg-white hover:text-indigo-600  bg-white/10 text-white">
                    Settings
                  </button>
                  */}
                  <button onClick={() => { setUserMenuOpen(false); logout(); }} className="w-full mb-1 inline-flex items-center gap-2 rounded-lg px-3 py-2  hover:bg-white hover:text-indigo-600  bg-white/10 text-white">
                    {t('header.signout')} <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Mobile actions */}
        {!isAuthenticated ? (
          <div className="md:hidden" ref={guestMenuRefMobile}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              className={["inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors duration-200", white ? "bg-white border border-[#6A71FA] text-[#6A71FA] hover:bg-[#6A71FA] hover:text-white" : "bg-white/10 border border-white/10 text-white hover:bg-white/20 "].join(' ')}
              title={t('header.menu')}
            >
              <span className="max-w-[140px] truncate font-bold">{t('header.menu')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80"><path d="M7 10l5 5 5-5z"/></svg>
            </button>
            {userMenuOpen && (
              <div role="menu" className="absolute right-4 mt-2 w-60 rounded-2xl border bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover shadow-xl shadow-black/30 p-2 z-40 text-white/90">
                <button onClick={() => { navigate('/join'); setUserMenuOpen(false); }} className="w-full text-left font-bold rounded-lg px-3 py-2 hover:bg-white/10">{t('header.join')}</button>
                <button onClick={() => { navigate('/discover'); setUserMenuOpen(false); }} className="w-full text-left font-bold rounded-lg px-3 py-2 hover:bg-white/10">{t('home.discover')}</button>
                <button onClick={() => { navigate('/home/upgrades'); setUserMenuOpen(false); }} className="w-full text-left font-bold rounded-lg px-3 py-2 hover:bg-white/10">{t('header.upgrades')}</button>
                <button onClick={() => { setUserMenuOpen(false); login(); }} className="w-full inline-flex items-center justify-between font-bold rounded-lg px-3 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white">
                  {t('header.signin')} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="md:hidden" ref={userMenuRefMobile}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              className={["inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font transition-colors duration-200", white ? "bg-white border border-[#6A71FA] text-[#6A71FA] hover:bg-[#6A71FA] hover:text-white" : "bg-white/10 border border-white/10 text-white hover:bg-white/20 "].join(' ')}
              title={username || ''}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white">
                <User className="h-4 w-4" />
              </span>
              <span className="max-w-[140px] truncate font-bold">{username}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80"><path d="M7 10l5 5 5-5z"/></svg>
            </button>
            {userMenuOpen && (
              <div role="menu" className="absolute right-4 mt-2 w-60 rounded-2xl border bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover shadow-xl shadow-black/30 p-2 z-40 text-white/90 font-bold text-sm">
                {/* Primary navigation (visible here on mobile since header links are hidden) */}
                <button onClick={() => { navigate('/home'); setUserMenuOpen(false); }} className="w-full text-left rounded-lg px-3 py-2 hover:bg-white hover:text-indigo-600 bg-white/10 text-white">{t('header.library')}</button>
                <button onClick={() => { navigate('/discover'); setUserMenuOpen(false); }} className="w-full text-left rounded-lg px-3 py-2 hover:bg-white hover:text-indigo-600 bg-white/10 text-white">{t('home.discover')}</button>
                <button onClick={() => { navigate('/home/upgrades'); setUserMenuOpen(false); }} className="w-full text-left rounded-lg px-3 py-2 hover:bg-white hover:text-indigo-600 bg-white/10 text-white">{t('header.upgrades')}</button>
                <button onClick={() => { navigate('/home/profile'); setUserMenuOpen(false); }} className="w-full text-left rounded-lg px-3 py-2 hover:bg-white hover:text-indigo-600 bg-white/10 text-white">{t('header.profile')}</button>
                {/*
                <button onClick={() => { navigate('/home/achievements'); setUserMenuOpen(false); }} className="w-full text-left rounded-lg px-3 py-2 hover:bg-white hover:text-indigo-600 bg-white/10 text-white">Achievements</button>
                <button onClick={() => { navigate('/home/settings'); setUserMenuOpen(false); }} className="w-full text-left rounded-lg px-3 py-2 hover:bg-white hover:text-indigo-600 bg-white/10 text-white">Settings</button>
                */}
                <button onClick={() => { setUserMenuOpen(false); logout(); }} className="w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white hover:text-indigo-600 bg-white/10 text-white text-red-300">
                  {t('header.signout')} <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </header>
    </>
  );
}

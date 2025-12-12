import React from 'react';
import tavlWhite from '../images/tavl-logo.png';
import { Twitter, Github, MessageCircle } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 text-slate-600">
      <div className="relative">
        {/* 2px line with gradient emphasis and fade-out edges */}
        <div className="h-[2px] w-full bg-[linear-gradient(90deg,transparent_0%,rgba(106,113,250,0.85)_14%,rgba(156,138,250,0.95)_34%,rgba(106,113,250,1)_50%,rgba(156,138,250,0.9)_66%,rgba(106,113,250,0.85)_86%,transparent_100%)]" />
        {/* soft glow mirroring the line, also fading at edges */}
        <div className="pointer-events-none absolute -top-3 left-0 right-0 h-10 bg-[linear-gradient(90deg,transparent,rgba(106,113,250,0.4)_14%,rgba(156,138,250,0.45)_34%,rgba(106,113,250,0.5)_50%,rgba(156,138,250,0.42)_66%,rgba(106,113,250,0.38)_86%,transparent)] blur-xl" aria-hidden />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(248,113,113,0.05)_0%,transparent_60%)]" aria-hidden />
      <div className="relative container mx-auto px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="inline-flex items-center">
              <img src={tavlWhite} alt="tavl" className="h-8 w-auto drop-shadow" />
            </div>
            <p className="mt-3 text-slate-500">Live quizzes with strategy. Play, create, compete.</p>
            <div className="mt-4 flex items-center gap-3">
              <a href="#" aria-label="Twitter" className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#6a71fa]/10 border border-[#6a71fa]/40 hover:bg-[#6a71fa]/20 text-[#6a71fa] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="GitHub" className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#6a71fa]/10 border border-[#6a71fa]/40 hover:bg-[#6a71fa]/20 text-[#6a71fa] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Discord" className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#6a71fa]/10 border border-[#6a71fa]/40 hover:bg-[#6a71fa]/20 text-[#6a71fa] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <div className="text-slate-900 font-medium">Product</div>
            <ul className="mt-3 space-y-2">
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Features</a></li>
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Pricing</a></li>
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Upgrades</a></li>
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Changelog</a></li>
            </ul>
          </div>
          <div>
            <div className="text-slate-900 font-medium">Resources</div>
            <ul className="mt-3 space-y-2">
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Docs</a></li>
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Help Center</a></li>
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Status</a></li>
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Community</a></li>
            </ul>
          </div>
          <div>
            <div className="text-slate-900 font-medium">Company</div>
            <ul className="mt-3 space-y-2">
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">About</a></li>
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Careers</a></li>
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Contact</a></li>
              <li><a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Legal</a></li>
            </ul>
          </div>
        </div>
        <div className="my-10 h-px bg-[#6a71fa]/20" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm">
          <div>© {year} Tavl. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Terms</a>
            <a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Privacy</a>
            <a className="hover:text-[#6a71fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a71fa]/50 rounded" href="#">Cookies</a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

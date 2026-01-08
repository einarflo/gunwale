import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeTabKey, ViewMode, Translate } from "../types";

type SearchAndTabsBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeTab: HomeTabKey;
  onTabChange: (tab: HomeTabKey) => void;
  t: Translate;
};

const SearchAndTabsBar = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  activeTab,
  onTabChange,
  t,
}: SearchAndTabsBarProps) => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  const handleBlur = () => {
    if (!searchTerm) {
      setSearchOpen(false);
    }
  };

  return (
    <div className="relative rounded-3xl p-4 shadow-xl backdrop-blur-md overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
      <div className="absolute left-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3 border-white/10 bg-white/5 px-2 py-2 rounded-full">
          <div className="relative z-10 inline-flex items-center gap-2 text-sm rounded-full px-2 py-1 bg-[#6A71FA] shadow-sm flex-wrap">
            {(["mine", "favorites", "played", "trash"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={[
                  "relative group transition-colors duration-200 font-bold rounded-full px-4 py-2",
                  activeTab === tab
                    ? "bg-white text-[#6A71FA] shadow-sm"
                    : "text-white hover:text-[#6A71FA] hover:bg-white/90"
                ].join(" ")}
              >
                {tab === "mine"
                  ? "Mine"
                  : tab === "favorites"
                  ? "Favoritter"
                  : tab === "played"
                  ? "Spilte"
                : "Papirkurv"}
              </button>
            ))}
          </div>

          <div
            className={[
              "relative h-12 transition-all duration-300 ease-out overflow-hidden",
              searchOpen ? "flex-1 min-w-[240px] max-w-xl" : "w-12"
            ].join(" ")}
          >
            <button
              type="button"
              aria-label={t("home.searchPlaceholder") || "Søk"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
              className={[
                "absolute inset-0 flex items-center justify-center rounded-full border border-white/30 bg-white/20 text-white",
                "backdrop-blur-sm transition-colors duration-200",
                searchOpen ? "opacity-0 pointer-events-none" : "hover:bg-white/30"
              ].join(" ")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
                <path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM10 16a6 6 0 110-12 6 6 0 010 12z" />
              </svg>
            </button>
            <div
              className={[
                "absolute inset-0 flex items-center transition-all duration-300",
                searchOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
              ].join(" ")}
            >
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM10 16a6 6 0 110-12 6 6 0 010 12z" />
                </svg>
              </span>
              <div className="w-full h-full rounded-full bg-white border border-slate-200 pl-10 pr-4 shadow-sm focus-within:ring-4 focus-within:ring-[#6a71fa]/30 transition-all">
                <input
                  ref={inputRef}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={handleBlur}
                  placeholder={t("home.searchPlaceholder") || "Finn quizer…"}
                  className="w-full h-full bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/home/create")}
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-white text-[#6A71FA] hover:bg-[#6A71FA] hover:text-white transition-colors shadow-lg shadow-indigo-200/50 duration-200"
        >
          {t("home.create") || "Ny quiz"} <span aria-hidden className="text-lg leading-none">+</span>
        </button>
      </div>
    </div>
  );
};

export default SearchAndTabsBar;

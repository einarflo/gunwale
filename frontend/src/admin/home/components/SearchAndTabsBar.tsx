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
}: SearchAndTabsBarProps) => (
  <>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 sm:mb-4">
      <div className="relative flex items-center w-full max-w-3xl">
        <span className="pointer-events-none absolute left-5 text-white/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM10 16a6 6 0 110-12 6 6 0 010 12z" />
          </svg>
        </span>
        <div className="w-full rounded-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 focus-within:ring-4 focus-within:ring-pink-500/30 transition-all">
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("home.searchPlaceholder") || "Finn quizer…"}
            className="w-full bg-transparent text-white placeholder:text-white/50 outline-none"
          />
        </div>
      </div>
      <div className="inline-flex self-end md:self-auto rounded-xl border border-white/10 overflow-hidden bg-white/10">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`px-3 py-1.5 text-sm font-semibold ${
            viewMode === "grid" ? "bg-white/20 text-white" : "text-white/80"
          }`}
          aria-pressed={viewMode === "grid"}
        >
          Cards
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-1.5 text-sm font-semibold ${
            viewMode === "list" ? "bg-white/20 text-white" : "text-white/80"
          }`}
          aria-pressed={viewMode === "list"}
        >
          List
        </button>
      </div>
    </div>
    <div className="mb-4 flex items-center gap-2">
      {(["mine", "favorites", "played", "trash"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`rounded-full px-3 py-1.5 text-sm border ${
            activeTab === tab
              ? "bg-white/20 text-white border-white/10"
              : "bg-white/10 text-white/80 border-white/10 hover:bg-white/15"
          }`}
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
  </>
);

export default SearchAndTabsBar;

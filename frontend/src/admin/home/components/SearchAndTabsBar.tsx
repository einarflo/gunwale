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
  <div className="rounded-3xl p-8 shadow-xl bg-white backdrop-blur-md border border-slate-100">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 sm:mb-4">
      <div className="relative flex items-center w-full max-w-3xl">
        <span className="pointer-events-none absolute left-5 text-slate-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM10 16a6 6 0 110-12 6 6 0 010 12z" />
          </svg>
        </span>
        <div className="w-full rounded-full bg-white border border-slate-200 pl-12 pr-4 py-3 shadow-sm focus-within:ring-4 focus-within:ring-[#6a71fa]/30 transition-all">
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("home.searchPlaceholder") || "Finn quizer…"}
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>
      </div>
      <div className="inline-flex self-end md:self-auto rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`px-3 py-1.5 text-sm font-semibold ${
            viewMode === "grid" ? "bg-[#6a71fa]/15 text-[#2f2f55]" : "text-slate-600"
          }`}
          aria-pressed={viewMode === "grid"}
        >
          Cards
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-1.5 text-sm font-semibold ${
            viewMode === "list" ? "bg-[#6a71fa]/15 text-[#2f2f55]" : "text-slate-600"
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
              ? "bg-[#6a71fa]/15 text-[#2f2f55] border-[#6a71fa]/30"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
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
  </div>
);

export default SearchAndTabsBar;

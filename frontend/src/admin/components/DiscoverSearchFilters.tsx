import { useMemo } from "react";
import type { Translate } from "../home/types";

type TagItem = {
  id: number;
  name: string;
  slug: string;
};

type SortKey = "recent" | "popular" | "favourites" | "questions";

type DiscoverSearchFiltersProps = {
  term: string;
  onTermChange: (value: string) => void;
  onExecuteSearch: () => void;
  onClearSearch: () => void;
  sortBy: SortKey;
  onSortChange: (value: SortKey) => void;
  selected: Set<string>;
  allTags: TagItem[];
  tagModeAll: boolean;
  onToggleTagMode: () => void;
  onToggleTag: (slug: string) => void;
  onClearTags: () => void;
  t: Translate;
};

const DiscoverSearchFilters = ({
  term,
  onTermChange,
  onExecuteSearch,
  onClearSearch,
  sortBy,
  onSortChange,
  selected,
  allTags,
  tagModeAll,
  onToggleTagMode,
  onToggleTag,
  onClearTags,
  t,
}: DiscoverSearchFiltersProps) => {
  const selectedList = useMemo(() => Array.from(selected), [selected]);
  const hasSelectedTags = selectedList.length > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl p-4 md:p-5 shadow-xl shadow-indigo-200/40">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
      <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
      <div className="relative space-y-4">
        <div className="rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 p-3 md:p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM10 16a6 6 0 110-12 6 6 0 010 12z" />
                </svg>
              </span>
              <input
                value={term}
                onChange={(e) => onTermChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onExecuteSearch();
                }}
                placeholder={t("home.searchPlaceholder") || "Search for quizzes..."}
                className="w-full h-12 rounded-full border border-white/40 bg-white/95 pl-11 pr-12 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#6a71fa]/30"
              />
              {!!term && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={t("common.clear") || "Clear"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-4 py-2">
                <label className="text-sm font-semibold text-white/80">{t("discover.sort") || "Sort"}</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as SortKey)}
                    className="appearance-none rounded-full border border-white/40 bg-white/95 pl-4 pr-9 py-1.5 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6a71fa]/30"
                  >
                    <option value="popular">{t("discover.sort.popular") || "Most plays"}</option>
                    <option value="recent">{t("discover.sort.recent") || "Recently updated"}</option>
                    <option value="favourites">{t("discover.sort.favourites") || "Most favourites"}</option>
                    <option value="questions">{t("discover.sort.questions") || "Most questions"}</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </span>
                </div>
              </div>
              <button
                onClick={onExecuteSearch}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#6A71FA] shadow-lg shadow-indigo-200/50 transition-colors hover:bg-[#6A71FA] hover:text-white"
              >
                {t("common.search") || "Search"}
              </button>
            </div>
          </div>
          {hasSelectedTags && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {selectedList.map((slug) => {
                const name = allTags.find((tg) => tg.slug === slug)?.name || slug;
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-white/20 text-white border border-white/20"
                  >
                    {t("tags." + slug) || name}
                    <button onClick={() => onToggleTag(slug)} className="text-white/80 hover:text-white">
                      ×
                    </button>
                  </span>
                );
              })}
              <button onClick={onClearTags} className="text-xs text-white/80 underline">
                {t("common.clear") || "Clear"}
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 p-3 md:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div className="text-sm font-semibold text-white/90">{t("discover.tags.title") || "Browse tags"}</div>
            {hasSelectedTags && (
              <button
                type="button"
                onClick={onToggleTagMode}
                className={`text-xs px-3 py-1 rounded-full border transition ${tagModeAll ? "bg-white/20 border-white/40 text-white" : "bg-white/10 border-white/20 text-white/80"} hover:bg-white/25`}
              >
                {tagModeAll
                  ? t("discover.tags.matchAll") || "Match all selected"
                  : t("discover.tags.matchAny") || "Match any selected"}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const active = selected.has(tag.slug);
              return (
                <button
                  key={tag.slug}
                  onClick={() => onToggleTag(tag.slug)}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    "border shadow-sm",
                    active
                      ? "bg-white text-[#6A71FA] border-white"
                      : "bg-white/15 text-white border-white/30 hover:bg-white/25"
                  ].join(" ")}
                  title={t("tags." + tag.slug) || tag.name}
                >
                  {t("tags." + tag.slug) || tag.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverSearchFilters;

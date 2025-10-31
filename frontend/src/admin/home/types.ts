import { useI18n } from "../../i18n/I18nProvider";

export type ViewMode = "grid" | "list";
export type HomeTabKey = "mine" | "favorites" | "played" | "trash";
export type Translate = ReturnType<typeof useI18n>["t"];

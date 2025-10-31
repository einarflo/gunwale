import { Translate } from "../home/types";
import { GameCardLabels } from "../components/GameCard";

export const buildGameCardLabels = (t: Translate): GameCardLabels => ({
  questions: t("home.questions") || "Questions",
  plays: t("home.plays") || "Plays",
  participants: t("home.participants") || "Participants",
  favorites: t("home.favorites") || "Favorites",
  difficulty: t("home.difficulty") || "Difficulty",
  lastPlayed: t("home.played.lastPlayed") || "Last played",
  creator: t("discover.creator") || "Creator",
  viewCreator: t("home.viewCreator") || "View creator",
  public: t("home.public") || "Public",
  private: t("home.private") || "Private",
});

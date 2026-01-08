import { useState } from "react";
import randomstring from "randomstring";
import { Game } from "../tv/selectGame";
import { post } from "../api";
import GlobalStyles from "../components/landing/GlobalStyles";
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "../auth/KeycloakProvider";
import { useI18n } from "../i18n/I18nProvider";
import OverviewSection from "./home/components/OverviewSection";
import PremiumBanner from "./home/components/PremiumBanner";
import SearchAndTabsBar from "./home/components/SearchAndTabsBar";
import FavoritesTab from "./home/components/FavoritesTab";
import PlayedTab from "./home/components/PlayedTab";
import TrashTab from "./home/components/TrashTab";
import MyGamesTab from "./home/components/MyGamesTab";
import HomeGameModal from "./home/components/HomeGameModal";
import { HomeTabKey, ViewMode } from "./home/types";

// Home renders the admin landing page and orchestrates data fetching for each dashboard section.
const Home = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { username, userId, isPremium } = useKeycloak();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>();
  const [selectedGame, setSelectedGame] = useState<Game | (Game & Record<string, any>)>();

  const [watingForCreateGame, setWaitingForCreateGame] = useState(false);
  const [newGamePin, setNewGamePin] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<HomeTabKey>("mine");

  const [gameCount, setGameCount] = useState(0);
  const [totalPlays, setTotalPlays] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [refreshMyGamesKey, setRefreshMyGamesKey] = useState(0);

  const createNewGameInstance = (gameId: string, gamePin: string) => {
    setWaitingForCreateGame(true);
    post(`/game_instance/`, {
      game_id: gameId,
      game_pin: gamePin,
      status: "created",
      created_by: userId,
    })
      .then((res) => {
        setWaitingForCreateGame(false);
        navigate(`/host/${gameId}/instance/${res.data}/pin/${gamePin}`);
      })
      .catch(() => {
        setWaitingForCreateGame(false);
      });
  };

  const openGameModal = (game?: Game | (Game & Record<string, any>) | null) => {
    if (!game) {
      return;
    }
    const gameId = String((game as any).uuid ?? (game as any).id ?? (game as any).game_id ?? "");
    if (!gameId) return;
    setSelectedGame(game);
    setSelectedGameId(gameId);
    setNewGamePin(
      randomstring.generate({
        charset: ["numeric"],
        readable: true,
        length: 5,
      }),
    );
    setModalIsOpen(true);
  };

  const handleStartSelectedGame = () => {
    const gameId = selectedGameId || String((selectedGame as any)?.uuid ?? (selectedGame as any)?.id);
    if (!gameId) {
      return;
    }
    createNewGameInstance(gameId, newGamePin);
  };

  const handleEditSelectedGame = () => {
    if (!selectedGameId) {
      return;
    }
    navigate("edit/" + selectedGameId);
  };

  const handleCopyPin = () => navigator.clipboard?.writeText(newGamePin);
  const handleCopyLink = () =>
    navigator.clipboard?.writeText(`${window.location.origin}/join/${newGamePin}`);

  const handleOpenGameFromList = (game: any) => openGameModal(game);

  return (
    <>
      <div
        className="relative pt-20 min-h-screen bg-white text-slate-900 overflow-hidden"
        style={{
          fontFamily:
            'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        }}
      >
        <GlobalStyles />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_28%,rgba(93,184,104,0.18)_0%,transparent_58%),radial-gradient(circle_at_82%_32%,rgba(249,116,116,0.18)_0%,transparent_58%),radial-gradient(circle_at_50%_12%,rgba(156,138,250,0.22)_0%,transparent_60%),linear-gradient(to_bottom_right,rgba(16,24,39,0.08),rgba(156,138,250,0.08),transparent)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(156,138,250,0.06)_0%,transparent_72%),radial-gradient(circle_at_70%_80%,rgba(93,184,104,0.12)_0%,transparent_60%)] animate-pulse-slow" />
        <ParallaxOrbs />
        <ParallaxScroll />

        <OverviewSection
          username={username}
          isPremium={!!isPremium}
          gameCount={gameCount}
          favoriteCount={favoriteCount}
          totalPlays={totalPlays}
          t={t}
        />

        {isPremium && <PremiumBanner t={t} />}

        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="">
            <SearchAndTabsBar
              searchTerm={searchTerm}
              onSearchChange={(value) => setSearchTerm(value)}
              viewMode={viewMode}
              onViewModeChange={(mode) => setViewMode(mode)}
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              t={t}
            />

            {activeTab === "favorites" && (
              <FavoritesTab
                active={activeTab === "favorites"}
                onOpenGame={handleOpenGameFromList}
                onCountChange={setFavoriteCount}
              />
            )}

            {activeTab === "played" && (
              <PlayedTab
                active={activeTab === "played"}
                onOpenGame={handleOpenGameFromList}
              />
            )}

            {activeTab === "trash" && (
              <TrashTab
                active={activeTab === "trash"}
                onRestored={() => setRefreshMyGamesKey((k) => k + 1)}
              />
            )}

            {activeTab === "mine" && (
              <MyGamesTab
                searchTerm={searchTerm}
                viewMode={viewMode}
                onOpenGame={handleOpenGameFromList}
                onStatsChange={({ gameCount, totalPlays }) => {
                  setGameCount(gameCount);
                  setTotalPlays(totalPlays);
                }}
                refreshKey={refreshMyGamesKey}
              />
            )}
          </div>
        </div>

        <HomeGameModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          selectedGame={selectedGame}
          newGamePin={newGamePin}
          isStarting={watingForCreateGame}
          onStartGame={handleStartSelectedGame}
          onEditGame={handleEditSelectedGame}
          onCopyPin={handleCopyPin}
          onCopyLink={handleCopyLink}
        />

        <Footer />
      </div>
    </>
  );
};

export default Home;

import { useEffect, useState } from "react";
import randomstring from "randomstring";
import { Game } from "../tv/selectGame";
import { get, post, put } from "../api";
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

  const [watingForCreateGame, setWaitingForCreateGame] = useState(false);
  const [newGamePin, setNewGamePin] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [games, setGames] = useState<Array<Game>>();
  const [deletedGames, setDeletedGames] = useState<Array<Game>>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [favoriteGames, setFavoriteGames] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [playedGames, setPlayedGames] = useState<any[]>([]);
  const [playedLoading, setPlayedLoading] = useState(false);
  const filteredGames = games?.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const [activeTab, setActiveTab] = useState<HomeTabKey>("mine");
  const totalPlays = (games || []).reduce(
    (acc: number, g: any) => acc + (g.plays ?? g.playthroughs ?? 0),
    0,
  );

  const getGamesForUserId = (id: string) => {
    get(`/games/`)
      .then((res) => {
        setLoading(false);
        if (res.data) {
          setGames(res.data);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        console.log("Error when getting games for user");
        setLoading(false);
        setError(true);
      });
  };

  useEffect(() => {
    if (userId) {
      getGamesForUserId(userId);
    }
  }, [userId]);

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

  const loadDeletedGames = () => {
    get(`/games/trash`)
      .then((res) => setDeletedGames(res.data || []))
      .catch(() => setDeletedGames([]));
  };

  const restoreGame = (selector: string) => {
    put(`/games/${selector}/restore`).then(() => {
      loadDeletedGames();
      if (userId) {
        getGamesForUserId(userId);
      }
    });
  };

  useEffect(() => {
    if (activeTab === "trash") {
      loadDeletedGames();
    }
    if (activeTab === "favorites" && userId) {
      setFavoritesLoading(true);
      get("/favorites/details")
        .then((res) => {
          setFavoriteGames(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setFavoriteGames([]))
        .finally(() => setFavoritesLoading(false));
    }
    if (activeTab === "played" && userId) {
      setPlayedLoading(true);
      get("/games/recent-played")
        .then((res) => {
          setPlayedGames(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setPlayedGames([]))
        .finally(() => setPlayedLoading(false));
    }
  }, [activeTab, userId]);

  const openGameModal = (gameId?: string | null) => {
    if (!gameId) {
      return;
    }
    setSelectedGameId(String(gameId));
    setNewGamePin(
      randomstring.generate({
        charset: ["numeric"],
        readable: true,
        length: 5,
      }),
    );
    setModalIsOpen(true);
  };

  const selectedGame = games?.find(
    (game) => String((game as any).uuid ?? (game as any).id) === String(selectedGameId),
  );

  const handleStartSelectedGame = () => {
    if (!selectedGameId) {
      return;
    }
    createNewGameInstance(selectedGameId, newGamePin);
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

  const handleCreateGame = () => navigate("/home/create");
  const handleDiscover = () => navigate("/discover");
  const handleBilling = () => navigate("/billing");
  const handleUpgrade = () => navigate("/purchase");
  const handleViewCreator = (creatorUserId: string) =>
    navigate(`/creator/${encodeURIComponent(creatorUserId)}`);
  const handleOpenTrash = () => setActiveTab("trash");
  const handleOpenGameFromList = (gameId: string) => openGameModal(gameId);
  const handleEditGame = (gameId: string) => navigate("edit/" + gameId);

  return (
    <>
      <div
        className="relative pt-20 min-h-screen bg-[#1e1b4b] text-white overflow-hidden"
        style={{
          fontFamily:
            'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        }}
      >
        <GlobalStyles />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.35)_0%,transparent_60%),linear-gradient(to_bottom_right,#4f46e5,#9333ea,#ec4899)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse-slow" />
        <ParallaxOrbs />
        <ParallaxScroll />

        <OverviewSection
          username={username}
          isPremium={!!isPremium}
          gameCount={games?.length ?? 0}
          favoriteCount={favoriteGames?.length ?? 0}
          totalPlays={totalPlays}
          onUpgrade={handleUpgrade}
          onCreate={handleCreateGame}
          onDiscover={handleDiscover}
          onBilling={handleBilling}
          onShowTrash={handleOpenTrash}
          t={t}
        />

        {isPremium && <PremiumBanner t={t} onUpgrade={handleUpgrade} />}

        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="rounded-3xl p-8 shadow-xl bg-white/10 backdrop-blur-md border border-white/10">
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
                isLoading={favoritesLoading}
                favorites={favoriteGames}
                t={t}
                onDiscover={handleDiscover}
                onOpenGame={handleOpenGameFromList}
                onEditGame={handleEditGame}
                onViewCreator={handleViewCreator}
              />
            )}

            {activeTab === "played" && (
              <PlayedTab
                isLoading={playedLoading}
                playedGames={playedGames}
                t={t}
                onOpenGame={handleOpenGameFromList}
                onEditGame={handleEditGame}
                onViewCreator={handleViewCreator}
              />
            )}

            {activeTab === "trash" && (
              <TrashTab deletedGames={deletedGames} onRestore={restoreGame} t={t} />
            )}

            {activeTab === "mine" && (
              <MyGamesTab
                loading={loading}
                error={error}
                games={games}
                filteredGames={filteredGames}
                viewMode={viewMode}
                searchTerm={searchTerm}
                t={t}
                onOpenGame={handleOpenGameFromList}
                onEditGame={handleEditGame}
                onCreateGame={handleCreateGame}
                onDiscover={handleDiscover}
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
          t={t}
        />

        <Footer />
      </div>
    </>
  );
};

export default Home;

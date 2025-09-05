import { useEffect, useState } from "react";
import { get, put } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import GameForm from './components/GameForm';

const UpdateGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [initialName, setInitialName] = useState<string>("");
  const [initialDescription, setInitialDescription] = useState<string>("");
  const [initialIsPublic, setInitialIsPublic] = useState<boolean>(false);

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    get(`/games/${gameId}/`)
      .then(res => {
        const g = res.data || {};
        setInitialName(g.name || "");
        setInitialDescription(g.description || "");
        setInitialIsPublic((g.isPublic ?? 0) === 1);
      })
      .finally(() => setLoading(false));
  }, [gameId]);

  const saveGame = async ({ name, description, isPublic }: { name: string; description: string; isPublic: boolean; headerImage?: string | null }) => {
    if (!gameId) return;
    await put(`/games/${gameId}/`, {
      name,
      description,
      isPublic: isPublic ? 1 : 0,
    });
    navigate('/home/edit/' + gameId);
  };

  return (
    <>
      <div className="fixed inset-0 z-0 " />
      <div className="relative z-10 flex justify-center pt-10 min-h-screen">
        <div className="w-full max-w-7xl px-6">
          {loading ? (
            <div className="rounded-2xl bg-white/90 shadow p-6 text-center">Laster...</div>
          ) : (
            <GameForm
              title="Rediger quiz"
              initialName={initialName}
              initialDescription={initialDescription}
              initialIsPublic={initialIsPublic}
              submitText="Lagre"
              cancelText="Avbryt"
              onSubmit={saveGame as any}
              onCancel={() => navigate('/home/edit/' + gameId)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default UpdateGame;

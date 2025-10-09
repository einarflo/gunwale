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
  const [initialTags, setInitialTags] = useState<string[]>([]);

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
    // load tags
    get(`/tags/game/${gameId}`)
      .then(res => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setInitialTags(rows.map((r: any) => String(r.slug)));
      })
      .catch(() => setInitialTags([]));
  }, [gameId]);

  const saveGame = async ({ name, description, isPublic, tags }: { name: string; description: string; isPublic: boolean; tags: string[]; headerImage?: string | null }) => {
    if (!gameId) return;
    await put(`/games/${gameId}/`, {
      name,
      description,
      isPublic: isPublic ? 1 : 0,
    });
    // update tags (ignore errors)
    try { await put(`/tags/game/${gameId}`, { slugs: tags || [] }); } catch(_) {}
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
              initialTags={initialTags}
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

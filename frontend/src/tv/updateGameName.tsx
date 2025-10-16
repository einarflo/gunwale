import { useEffect, useState } from "react";
import { get, put, post } from "../api";
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
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    get(`/games/${gameId}/`)
      .then(res => {
        const g = res.data || {};
        setInitialName(g.name || "");
        setInitialDescription(g.description || "");
        setInitialIsPublic((g.isPublic ?? 0) === 1);
        setCoverImageUrl(g.cover_image_url || null);
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

  const saveGame = async ({ name, description, isPublic, tags, headerImage }: { name: string; description: string; isPublic: boolean; tags: string[]; headerImage?: string | null }) => {
    if (!gameId) return;
    let finalCoverUrl = coverImageUrl;
    try {
      if (headerImage && headerImage.startsWith('data:')) {
        const match = headerImage.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          const contentType = match[1] || 'image/webp';
          const base64 = match[2];
          const bin = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          // Presign
          const pres = await post(`/media/presign`, { kind: 'gameCover', id: gameId, contentType }).then(r => r.data as any);
          if (pres?.putUrl) {
            await fetch(pres.putUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: bin });
            finalCoverUrl = pres.publicUrl || null;
          }
        }
      }
    } catch (_) {}
    await put(`/games/${gameId}/`, { name, description, isPublic: isPublic ? 1 : 0, cover_image_url: finalCoverUrl });
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
              showImageUpload={true}
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

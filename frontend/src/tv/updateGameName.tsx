import { useEffect, useMemo, useState } from "react";
import { get, put, post } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import GameForm from './components/GameForm';
import GlobalStyles from "../components/landing/GlobalStyles";
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";

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
            let candidateUrl = pres.publicUrl || null;
            try {
              if (pres.key) {
                const optimized = await post(`/media/optimize`, { key: pres.key }).then(r => r.data as any);
                if (optimized?.publicUrl) {
                  candidateUrl = optimized.publicUrl;
                }
              }
            } catch (_) {
              // swallow optimization failures; fallback to uploaded url
            }
            finalCoverUrl = candidateUrl;
          }
        }
      }
    } catch (_) {}
    await put(`/games/${gameId}/`, { name, description, isPublic: isPublic ? 1 : 0, cover_image_url: finalCoverUrl });
    // update tags (ignore errors)
    try { await put(`/tags/game/${gameId}`, { slugs: tags || [] }); } catch(_) {}
    navigate('/home/edit/' + gameId);
  };

  const statusLabel = useMemo(() => {
    if (loading) return 'Laster...';
    return initialIsPublic ? 'Offentlig' : 'Privat';
  }, [loading, initialIsPublic]);

  return (
    <>
      <div
        className="relative min-h-screen bg-[#1e1b4b] text-white overflow-hidden"
        style={{
          fontFamily:
            'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <GlobalStyles />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.35)_0%,transparent_60%),linear-gradient(to_bottom_right,#4f46e5,#9333ea,#ec4899)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] animate-pulse-slow" />
        <ParallaxOrbs />
        <ParallaxScroll />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-16 space-y-10 mt-10">
          <section className="rounded-3xl border border-white/10 bg-white/10 p-6 sm:p-8 shadow-[0_25px_80px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Administrer quiz</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
                  {initialName || 'Quiz uten navn'}
                </h1>
                <p className="text-sm text-white/70 leading-relaxed">
                  {initialDescription || 'Oppdater navn, beskrivelse, publisering og tagger for quizen din.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    Status: {statusLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                    Tags: {initialTags.length}
                  </span>
                </div>
              </div>
              <div className="relative h-36 w-full max-w-xs overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-[0_15px_60px_rgba(15,23,42,0.45)]">
                {coverImageUrl ? (
                  <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/60">
                    Ingen forsidebilde
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1e1b4b]/70 via-transparent to-transparent" />
              </div>
            </div>
            <div className="mt-6 relative">
              <div className="h-[2px] w-full bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.85)_12%,rgba(168,85,247,0.85)_28%,rgba(245,158,11,1)_50%,rgba(236,72,153,0.9)_72%,rgba(99,102,241,0.85)_88%,transparent_100%)]" />
              <div
                className="pointer-events-none absolute -top-4 left-0 right-0 h-12 bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.4)_12%,rgba(168,85,247,0.4)_28%,rgba(245,158,11,0.55)_50%,rgba(236,72,153,0.4)_72%,rgba(99,102,241,0.4)_88%,transparent)] blur-2xl"
                aria-hidden
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/8 p-6 sm:p-8 shadow-[0_20px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-white/70">Laster...</div>
            ) : (
            <GameForm
              title="Rediger quiz"
              initialName={initialName}
              initialDescription={initialDescription}
              initialIsPublic={initialIsPublic}
              initialTags={initialTags}
              showImageUpload={true}
              initialImageUrl={coverImageUrl}
              submitText="Lagre"
              cancelText="Avbryt"
              onSubmit={saveGame as any}
              onCancel={() => navigate('/home/edit/' + gameId)}
            />
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default UpdateGame;

import { useEffect, useMemo, useState } from "react";
import { get, put, post } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import GameForm from './components/GameForm';
import GlobalStyles from "../components/landing/GlobalStyles";
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";
import { useI18n } from "../i18n/I18nProvider";
import Footer from "../components/Footer";

const UpdateGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();

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
    if (loading) return t('updateGameName.loading');
    return initialIsPublic ? t('updateGameName.statusPublic') : t('updateGameName.statusPrivate');
  }, [loading, initialIsPublic, t]);

  return (
    <>
      <div
        className="relative min-h-screen bg-white text-slate-900 overflow-hidden"
        style={{
          fontFamily:
            'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <GlobalStyles />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_28%,rgba(93,184,104,0.18)_0%,transparent_58%),radial-gradient(circle_at_82%_32%,rgba(249,116,116,0.18)_0%,transparent_58%),radial-gradient(circle_at_50%_12%,rgba(156,138,250,0.22)_0%,transparent_60%),linear-gradient(to_bottom_right,rgba(16,24,39,0.08),rgba(156,138,250,0.08),transparent)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(156,138,250,0.06)_0%,transparent_72%),radial-gradient(circle_at_70%_80%,rgba(93,184,104,0.12)_0%,transparent_60%)] animate-pulse-slow" />
        <ParallaxOrbs />
        <ParallaxScroll />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-16 space-y-10 mt-10">
          <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-200/40">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
            <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
            <div className="relative text-white">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3 max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">{t('updateGameName.kicker')}</p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
                    {initialName || t('updateGameName.untitled')}
                  </h1>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {initialDescription || t('updateGameName.subtitle')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                      {t('updateGameName.statusLabel')}: {statusLabel}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                      {t('updateGameName.tagsLabel')}: {initialTags.length}
                    </span>
                  </div>
                </div>
                <div className="relative h-36 w-full max-w-xs overflow-hidden rounded-3xl shadow-xl shadow-indigo-200/40">
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover opacity-30" />
                  <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover opacity-40" />
                  {coverImageUrl ? (
                    <img src={coverImageUrl} alt="" className="relative z-10 h-full w-full object-cover" />
                  ) : (
                    <div className="relative z-10 flex h-full w-full items-center justify-center text-sm font-semibold text-white/80">
                      {t('updateGameName.noCover')}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              </div>

              <div className="mt-6 relative">
                <div className="h-[2px] w-full bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.85)_12%,rgba(168,85,247,0.85)_28%,rgba(245,158,11,1)_50%,rgba(236,72,153,0.9)_72%,rgba(99,102,241,0.85)_88%,transparent_100%)]" />
                <div
                  className="pointer-events-none absolute -top-4 left-0 right-0 h-12 bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.4)_12%,rgba(168,85,247,0.4)_28%,rgba(245,158,11,0.55)_50%,rgba(236,72,153,0.4)_72%,rgba(99,102,241,0.4)_88%,transparent)] blur-2xl"
                  aria-hidden
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-slate-500">{t('updateGameName.loading')}</div>
            ) : (
            <GameForm
              title={t('updateGameName.formTitle')}
              initialName={initialName}
              initialDescription={initialDescription}
              initialIsPublic={initialIsPublic}
              initialTags={initialTags}
              showImageUpload={true}
              initialImageUrl={coverImageUrl}
              submitText={t('updateGameName.save')}
              cancelText={t('updateGameName.cancel')}
              onSubmit={saveGame as any}
              onCancel={() => navigate('/home/edit/' + gameId)}
            />
            )}
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default UpdateGame;

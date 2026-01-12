import { useEffect, useRef, useState } from "react";
import type React from "react";
import { get, post, put } from "../api";
import { useKeycloak } from "../auth/KeycloakProvider";
import { useNavigate } from "react-router-dom";
import GlobalStyles from '../components/landing/GlobalStyles';
import ParallaxOrbs from '../components/ParallaxOrbs';
import ParallaxScroll from '../components/ParallaxScroll';
import Footer from '../components/Footer';
import { Globe2, Lock, Image as ImageIcon, ImageOff, Upload, CheckCircle } from 'lucide-react';
import { useI18n } from "../i18n/I18nProvider";

const CreateGame = () => {
    const { userId } = useKeycloak();

    const navigate = useNavigate();
    const { t } = useI18n();

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState<boolean | null>(null);
    const [allTags, setAllTags] = useState<Array<{ id: number; name: string; slug: string }>>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [headerImage, setHeaderImage] = useState<string | null>(null);
    const [imageMode, setImageMode] = useState<'upload' | 'none' | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [imageChoiceMade, setImageChoiceMade] = useState(false);
    const [visibilityChoiceMade, setVisibilityChoiceMade] = useState(false);

    useEffect(() => {
      let mounted = true;
      const fetchTags = async () => {
        try {
          const res = await get('/tags');
          return Array.isArray(res.data) ? res.data : [];
        } catch (_) {
          return [];
        }
      };
      fetchTags().then((list) => {
        if (mounted) setAllTags(list);
      });
      return () => { mounted = false; };
    }, []);

    const toggleTag = (slug: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        const key = slug.toLowerCase();
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageMode('upload');
        const reader = new FileReader();
        reader.onloadend = () => setHeaderImage(reader.result as string);
        reader.readAsDataURL(file);
      }
    };

    const insertGame = async ({ name, description, isPublic, tags, headerImage }: { name: string; description: string; isPublic: boolean; tags: string[]; headerImage?: string | null }) => {
      try {
        const res = await post(`/games`, {
          name,
          description,
          created_by: userId,
          status: "created",
          isPublic: isPublic ? 1 : 0,
        });
        const created = res.data;
        const selector = created?.uuid || created?.id || created;
        // Set tags (ignore failures)
        if (Array.isArray(tags)) {
          try { await put(`/tags/game/${selector}`, { slugs: tags }); } catch(_) {}
        }
        // Placeholder: headerImage can be handled after basic game creation if needed
        navigate(`/home/edit/${selector}`);
      } catch (e) {
        setError(t('createGame.error.generic'));
        throw e;
      }
    };

    const handleSubmit = async () => {
      const nameValid = name.trim().length >= 3;
      const imageReady = imageMode === 'none' || (imageMode === 'upload' && headerImage);
      const tagsReady = selected.size > 0;
      if (!nameValid) { setError(t('createGame.error.nameMin')); return; }
      if (isPublic === null) { setError(t('createGame.error.visibility')); return; }
      if (!imageReady) { setError(t('createGame.error.imageChoice')); return; }
      if (!tagsReady) { setError(t('createGame.error.tagsMin')); return; }
      setSubmitting(true);
      setError(null);
      try {
        await insertGame({
          name,
          description,
          isPublic,
          tags: Array.from(selected),
          headerImage: imageMode === 'upload' ? headerImage : null,
        });
      } finally {
        setSubmitting(false);
      }
    };

    const hslFromString = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
      return `hsl(${h % 360} 75% 60% / 0.45)`;
    };

    const nameValid = name.trim().length >= 3;
    const descriptionFilled = description.trim().length > 0;
    const imageReady = imageMode === 'none' || (imageMode === 'upload' && headerImage);
    const tagsReady = selected.size > 0;
    const canSubmit = nameValid && imageReady && visibilityChoiceMade && tagsReady && !submitting;

    return (
      <>
        <div className="relative min-h-screen bg-white text-slate-900 overflow-hidden" style={{ fontFamily: 'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
          <GlobalStyles />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_28%,rgba(93,184,104,0.18)_0%,transparent_58%),radial-gradient(circle_at_82%_32%,rgba(249,116,116,0.18)_0%,transparent_58%),radial-gradient(circle_at_50%_12%,rgba(156,138,250,0.22)_0%,transparent_60%),linear-gradient(to_bottom_right,rgba(16,24,39,0.08),rgba(156,138,250,0.08),transparent)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(156,138,250,0.06)_0%,transparent_72%),radial-gradient(circle_at_70%_80%,rgba(93,184,104,0.12)_0%,transparent_60%)] animate-pulse-slow" />
          <ParallaxOrbs />
          <ParallaxScroll />
          <div className="mx-auto max-w-6xl px-6 pt-36 pb-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-8">
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,#6A71FA,transparent_70%)] opacity-30" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-lg text-slate-900">{t('createGame.step1.title')}</div>
                      <span className="text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-sky-400 px-3 py-1 rounded-full shadow-sm">
                        {t('createGame.stepLabel')} 1
                      </span>
                    </div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('createGame.step1.nameLabel')}</label>
                    <div className="relative">
                      <input
                        className={`w-full mb-3 px-5 py-3 rounded-xl border text-lg shadow transition focus:outline-none focus:ring-2 ${
                          nameValid
                            ? 'border-emerald-300 bg-emerald-50 text-slate-900 focus:ring-emerald-200'
                            : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-[#6A71FA]/20'
                        }`}
                        placeholder={t('createGame.step1.namePlaceholder')}
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                      {nameValid && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />}
                    </div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('createGame.step1.descriptionLabel')}</label>
                    <div className="relative">
                      <input
                        className={`w-full mb-1 px-5 py-3 rounded-xl border text-lg shadow transition focus:outline-none focus:ring-2 ${
                          descriptionFilled
                            ? 'border-indigo-300 bg-indigo-50 text-slate-900 focus:ring-indigo-200'
                            : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-[#6A71FA]/20'
                        }`}
                        placeholder={t('createGame.step1.descriptionPlaceholder')}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                      {descriptionFilled && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{t('createGame.step1.descriptionHint')}</div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-slate-500">{t('createGame.step1.nameHint')}</div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!nameValid) return;
                          setCurrentStep(1);
                        }}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                          nameValid ? 'bg-[#6A71FA] text-white shadow shadow-indigo-200/40' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                        disabled={!nameValid}
                      >
                        {t('createGame.continue')}
                      </button>
                    </div>
                  </div>

                  <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm ${currentStep < 1 ? 'opacity-60' : ''}`}>
                    <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,#45CC70,transparent_70%)] opacity-25" />
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg text-slate-900">{t('createGame.step2.title')}</div>
                      <span className="text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-1 rounded-full shadow-sm">
                        {t('createGame.stepLabel')} 2
                      </span>
                    </div>
                    {currentStep >= 1 ? (
                      <>
                        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => { setIsPublic(true); setVisibilityChoiceMade(true); }}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                              isPublic === true
                                ? 'bg-[#6A71FA] text-white shadow-lg shadow-indigo-200/40'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Globe2 size={16} />
                            {t('createGame.step2.public')}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsPublic(false); setVisibilityChoiceMade(true); }}
                            className={`ml-1 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                              isPublic === false
                                ? 'bg-[#6A71FA] text-white shadow-lg shadow-indigo-200/40'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Lock size={16} />
                            {t('createGame.step2.private')}
                          </button>
                        </div>
                        <div className="text-xs text-slate-600">
                          {isPublic == null
                            ? t('createGame.step2.help')
                            : (isPublic
                              ? t('createGame.step2.publicHint')
                              : t('createGame.step2.privateHint'))}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-slate-500">{t('createGame.step2.continueHint')}</div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!visibilityChoiceMade) return;
                              setCurrentStep(2);
                            }}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                              visibilityChoiceMade ? 'bg-[#6A71FA] text-white shadow shadow-indigo-200/40' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                            disabled={!visibilityChoiceMade}
                          >
                            {t('createGame.continue')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-500">{t('createGame.step2.locked')}</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-8 h-full justify-between">
                  <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm ${currentStep < 2 ? 'opacity-60' : ''}`}>
                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,#F59E0B,transparent_70%)] opacity-25" />
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg text-slate-900">{t('createGame.step3.title')}</div>
                      <span className="text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full shadow-sm">
                        {t('createGame.stepLabel')} 3
                      </span>
                    </div>
                    {currentStep >= 2 ? (
                      <>
                        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => { setImageMode('upload'); setImageChoiceMade(true); }}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              imageMode === 'upload'
                                ? 'bg-[#6A71FA] text-white shadow-lg shadow-indigo-200/40'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <ImageIcon size={15} />
                            {t('createGame.step3.useImage')}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setImageMode('none'); setHeaderImage(null); setImageChoiceMade(true); }}
                            className={`ml-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              imageMode === 'none'
                                ? 'bg-[#6A71FA] text-white shadow-lg shadow-indigo-200/40'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <ImageOff size={15} />
                            {t('createGame.step3.noImage')}
                          </button>
                        </div>
                        {imageMode === 'upload' ? (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Upload size={18} />
                                <span>{t('createGame.step3.drop')}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                  {t('createGame.step3.pickFile')}
                                </button>
                                {headerImage && (
                                  <button
                                    type="button"
                                    onClick={() => setHeaderImage(null)}
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                                  >
                                    {t('createGame.step3.remove')}
                                  </button>
                                )}
                              </div>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            {headerImage && <img src={headerImage} alt={t('createGame.step3.imageAlt')} className="mt-3 rounded-xl w-full max-h-40 object-cover" />}
                            {!headerImage && <div className="mt-3 text-xs text-slate-500">{t('createGame.step3.recommendation')}</div>}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            {t('createGame.step3.noImageHint')}
                          </div>
                        )}
                        <div className="text-xs text-slate-500">{t('createGame.step3.footer')}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-slate-500">{t('createGame.step3.continueHint')}</div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!imageChoiceMade || !imageReady) return;
                              setCurrentStep(3);
                            }}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                              imageChoiceMade && imageReady ? 'bg-[#6A71FA] text-white shadow shadow-indigo-200/40' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                            disabled={!imageChoiceMade || !imageReady}
                          >
                            {t('createGame.continue')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-500">{t('createGame.step3.locked')}</div>
                    )}
                  </div>

                  <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${currentStep < 3 ? 'opacity-60' : ''}`}>
                    <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,#EC4899,transparent_70%)] opacity-25" />
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg text-slate-900">{t('createGame.step4.title')}</div>
                      <span className="text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-fuchsia-500 px-3 py-1 rounded-full shadow-sm">
                        {t('createGame.stepLabel')} 4
                      </span>
                    </div>
                    {currentStep >= 3 ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {allTags.length === 0 ? (
                            <div className="text-slate-500 text-sm">{t('createGame.step4.loading')}</div>
                          ) : (
                            allTags.map(tag => {
                              const active = selected.has(tag.slug.toLowerCase());
                              const gradientStart = hslFromString(tag.slug);
                              const gradientEnd = hslFromString(tag.slug + 'x');
                              return (
                                <button
                                  key={tag.slug}
                                  type="button"
                                  onClick={() => { toggleTag(tag.slug); }}
                                  className={`px-3 py-1 rounded-full text-sm font-semibold border transition active:scale-95 ${
                                    active
                                      ? 'text-white border-transparent shadow-[0_12px_30px_rgba(78,67,255,0.25)]'
                                      : 'text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                  style={
                                    active
                                      ? {
                                          backgroundImage: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
                                        }
                                      : {}
                                  }
                                  title={tag.name}
                                >
                                  {tag.name}
                                </button>
                              );
                            })
                          )}
                        </div>
                        <div className="mt-3 text-xs text-slate-500">{t('createGame.step4.hint')}</div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-500">{t('createGame.step4.locked')}</div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 flex gap-4 items-center justify-between shadow-sm">
                    <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      {t('createGame.stepLabel')} {currentStep + 1}/4
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className={`relative overflow-hidden rounded-xl px-8 py-3 text-lg font-bold shadow-lg active:scale-95 transition-all focus:ring-4 ${
                        canSubmit
                          ? 'bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 text-white hover:shadow-2xl focus:ring-[#6A71FA]/20'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {t('createGame.submit')}
                    </button>
                    <button
                      onClick={() => navigate('/home')}
                      className="rounded-xl bg-white px-8 py-3 text-lg text-slate-700 font-bold shadow border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                      {t('createGame.cancel')}
                    </button>
                    {error && <div className="text-rose-600 font-semibold ml-4">{error}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
};

export default CreateGame;

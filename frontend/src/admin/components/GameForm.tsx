import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { get } from '../../api';
import { Globe2, Lock, Image as ImageIcon, ImageOff, Upload, CheckCircle } from 'lucide-react';

type Props = {
  title: string;
  initialName?: string;
  initialDescription?: string;
  initialIsPublic?: boolean;
  initialTags?: string[]; // slugs
  showImageUpload?: boolean;
  initialImageUrl?: string | null;
  submitText?: string;
  cancelText?: string;
  errorText?: string;
  onSubmit: (v: { name: string; description: string; isPublic: boolean; tags: string[]; headerImage?: string | null }) => Promise<void> | void;
  onCancel: () => void;
};

type ImageMode = 'upload' | 'none';

export default function GameForm({
  title,
  initialName = '',
  initialDescription = '',
  initialIsPublic = true,
  initialTags = [],
  showImageUpload = false,
  initialImageUrl = null,
  submitText = 'Lagre',
  cancelText = 'Avbryt',
  errorText = 'Noe gikk galt, prøv igjen!',
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [headerImage, setHeaderImage] = useState<string | null>(initialImageUrl ?? null);
  const [imageMode, setImageMode] = useState<ImageMode>(initialImageUrl ? 'upload' : 'none');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialTags.map(s => s.toLowerCase())));
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const didInitTagsRef = useRef(false);

  // Load available tags
  useEffect(() => {
    let mounted = true;
    fetchTags().then(list => { if (mounted) setAllTags(list); }).catch(() => setAllTags([]));
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    if (didInitTagsRef.current) return;
    setSelected(new Set(initialTags.map(s => s.toLowerCase())));
    didInitTagsRef.current = true;
  }, [initialTags]);

  const fetchTags = async () => {
    try { const res = await get('/tags'); return Array.isArray(res.data) ? res.data : []; } catch(_) { return []; }
  };

  const toggleTag = (slug: string) => {
    const ns = new Set(selected);
    const key = slug.toLowerCase();
    if (ns.has(key)) ns.delete(key); else ns.add(key);
    setSelected(ns);
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

  const handleSubmit = async () => {
    const nameValid = name.trim().length >= 3;
    const imageReady = !showImageUpload || imageMode === 'none' || (imageMode === 'upload' && headerImage);
    if (!nameValid) { setError(t('gameForm.error.nameMin')); return; }
    if (!imageReady) { setError(t('gameForm.error.imageChoice')); return; }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name, description, isPublic, tags: Array.from(selected), headerImage: imageMode === 'upload' ? headerImage : null });
    } catch (e) {
      setError(errorText);
    } finally {
      setSubmitting(false);
    }
  };

  const hslFromString = (str: string) => {
    let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return `hsl(${h % 360} 75% 60% / 0.45)`;
  };

  const nameValid = name.trim().length >= 3;
  const descriptionFilled = description.trim().length > 0;
  const imageReady = !showImageUpload || imageMode === 'none' || (imageMode === 'upload' && headerImage);
  const canSubmit = nameValid && imageReady && !submitting;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="font-bold text-lg text-slate-900 mb-3">{title}</div>
          <label className="block font-semibold text-slate-700 mb-1">{t('gameForm.nameLabel')}</label>
          <div className="relative">
            <input
              className={`w-full mb-3 px-5 py-3 rounded-xl border text-lg shadow transition focus:outline-none focus:ring-2 ${
                nameValid
                  ? 'border-emerald-300 bg-emerald-50 text-slate-900 focus:ring-emerald-200'
                  : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-[#6A71FA]/20'
              }`}
              placeholder={t('gameForm.namePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {nameValid && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />}
          </div>
          <label className="block font-semibold text-slate-700 mb-1">{t('gameForm.descriptionLabel')}</label>
          <div className="relative">
            <input
              className={`w-full mb-1 px-5 py-3 rounded-xl border text-lg shadow transition focus:outline-none focus:ring-2 ${
                descriptionFilled
                  ? 'border-indigo-300 bg-indigo-50 text-slate-900 focus:ring-indigo-200'
                  : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-[#6A71FA]/20'
              }`}
              placeholder={t('gameForm.descriptionPlaceholder')}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            {descriptionFilled && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />}
          </div>
          <div className="text-xs text-slate-500 mt-1">{t('gameForm.descriptionHint')}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="font-bold text-lg text-slate-900">{t('gameForm.visibilityTitle')}</div>
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                isPublic
                  ? 'bg-[#6A71FA] text-white shadow-lg shadow-indigo-200/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe2 size={16} />
              {t('gameForm.visibilityPublic')}
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`ml-1 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                !isPublic
                  ? 'bg-[#6A71FA] text-white shadow-lg shadow-indigo-200/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock size={16} />
              {t('gameForm.visibilityPrivate')}
            </button>
          </div>
          <div className="text-xs text-slate-600">
            {isPublic ? t('gameForm.visibilityPublicHint') : t('gameForm.visibilityPrivateHint')}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8 h-full justify-between">
        {showImageUpload && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg text-slate-900">{t('gameForm.imageTitle')}</div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    imageMode === 'upload'
                      ? 'bg-[#6A71FA] text-white shadow-lg shadow-indigo-200/40'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon size={15} />
                  {t('gameForm.imageUse')}
                </button>
                <button
                  type="button"
                  onClick={() => { setImageMode('none'); setHeaderImage(null); }}
                  className={`ml-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    imageMode === 'none'
                      ? 'bg-[#6A71FA] text-white shadow-lg shadow-indigo-200/40'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageOff size={15} />
                  {t('gameForm.imageNone')}
                </button>
              </div>
            </div>
            {imageMode === 'upload' ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Upload size={18} />
                    <span>{t('gameForm.imageDrop')}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {t('gameForm.imagePick')}
                    </button>
                    {headerImage && (
                      <button
                        type="button"
                        onClick={() => setHeaderImage(null)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                      >
                        {t('gameForm.imageRemove')}
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
                {headerImage && <img src={headerImage} alt="Header" className="mt-3 rounded-xl w-full max-h-40 object-cover" />}
                {!headerImage && <div className="mt-3 text-xs text-slate-500">{t('gameForm.imageHint')}</div>}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {t('gameForm.imageNoneHint')}
              </div>
            )}
            <div className="text-xs text-slate-500">{t('gameForm.imageFooter')}</div>
          </div>
        )}
        {/* Tag selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="font-bold text-lg text-slate-900 mb-2">{t('gameForm.tagsTitle')}</div>
          <div className="flex flex-wrap gap-2">
            {allTags.length === 0 ? (
              <div className="text-slate-500 text-sm">{t('gameForm.tagsLoading')}</div>
            ) : (
              allTags.map(tag => {
                const active = selected.has(tag.slug.toLowerCase());
                const gradientStart = hslFromString(tag.slug);
                const gradientEnd = hslFromString(tag.slug + 'x');
                return (
                  <button
                    key={tag.slug}
                    type="button"
                    onClick={() => toggleTag(tag.slug)}
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
                    {t('tags.' + tag.slug) || tag.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 flex gap-4 items-center justify-between shadow-sm">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`relative overflow-hidden rounded-xl px-8 py-3 text-lg font-bold shadow-lg active:scale-95 transition-all focus:ring-4 ${
              canSubmit
                ? 'bg-[#6A71FA] text-white hover:shadow-2xl focus:ring-[#6A71FA]/20'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {submitText}
            {canSubmit && (
              <span
                className="pointer-events-none absolute inset-0 animate-shine"
                style={{ background: 'linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 100%' }}
              />
            )}
          </button>
          <button
            onClick={onCancel}
            className="rounded-xl bg-white px-8 py-3 text-lg text-slate-700 font-bold shadow border border-slate-200 hover:bg-slate-50 transition-all"
          >
            {cancelText}
          </button>
          {error && <div className="text-rose-600 font-semibold ml-4">{error}</div>}
        </div>
      </div>
    </div>
  );
}

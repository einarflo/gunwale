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

  // Load available tags
  useEffect(() => {
    let mounted = true;
    fetchTags().then(list => { if (mounted) setAllTags(list); }).catch(() => setAllTags([]));
    return () => { mounted = false };
  }, []);

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
    if (!nameValid) { setError('Navn må være minst 3 tegn'); return; }
    if (!imageReady) { setError('Velg om du vil bruke bilde, eller last opp et bilde.'); return; }
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
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6">
          <div className="font-bold text-lg text-white mb-3">{title}</div>
          <label className="block font-semibold text-white/90 mb-1">Navn på quiz</label>
          <div className="relative">
            <input
              className={`w-full mb-3 px-5 py-3 rounded-xl border text-lg shadow transition focus:outline-none focus:ring-2 ${
                nameValid
                  ? 'border-emerald-400/70 bg-emerald-500/10 text-white focus:ring-emerald-400/40'
                  : 'border-white/10 bg-white/10 text-white placeholder-white/60 focus:ring-white/30'
              }`}
              placeholder="Skriv inn et navn..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {nameValid && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />}
          </div>
          <label className="block font-semibold text-white/90 mb-1">Beskrivelse</label>
          <div className="relative">
            <input
              className={`w-full mb-1 px-5 py-3 rounded-xl border text-lg shadow transition focus:outline-none focus:ring-2 ${
                descriptionFilled
                  ? 'border-indigo-400/60 bg-indigo-500/10 text-white focus:ring-indigo-400/40'
                  : 'border-white/10 bg-white/10 text-white placeholder-white/60 focus:ring-white/30'
              }`}
              placeholder="Kort beskrivelse (valgfritt)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            {descriptionFilled && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />}
          </div>
          <div className="text-xs text-white/60 mt-1">Navn og beskrivelse vises til spillerne.</div>
        </div>
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6 space-y-4">
          <div className="font-bold text-lg text-white">Synlighet</div>
          <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                isPublic
                  ? 'bg-gradient-to-r from-emerald-400/40 to-teal-400/40 text-white border border-emerald-300/60 shadow-[0_12px_30px_rgba(16,185,129,0.35)]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Globe2 size={16} />
              Offentlig
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`ml-1 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                !isPublic
                  ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white border border-pink-300/60 shadow-[0_12px_30px_rgba(244,114,182,0.28)]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Lock size={16} />
              Privat
            </button>
          </div>
          <div className="text-xs text-white/70">
            {isPublic ? 'Quizen blir synlig for andre lærere og elever.' : 'Kun du og inviterte får tilgang til quizen.'}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8 h-full justify-between">
        {showImageUpload && (
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg text-white">Forsidebilde</div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    imageMode === 'upload'
                      ? 'bg-gradient-to-r from-indigo-400/50 to-pink-400/50 text-white border border-white/20'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <ImageIcon size={15} />
                  Bruk bilde
                </button>
                <button
                  type="button"
                  onClick={() => { setImageMode('none'); setHeaderImage(null); }}
                  className={`ml-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    imageMode === 'none'
                      ? 'bg-gradient-to-r from-amber-400/40 to-orange-400/40 text-white border border-white/20'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <ImageOff size={15} />
                  Ingen bilde
                </button>
              </div>
            </div>
            {imageMode === 'upload' ? (
              <div className="rounded-xl border border-dashed border-white/25 bg-white/5 p-4 text-sm text-white/75">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <Upload size={18} />
                    <span>Dra inn et bilde eller velg fra enhet</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/18"
                    >
                      Velg fil
                    </button>
                    {headerImage && (
                      <button
                        type="button"
                        onClick={() => setHeaderImage(null)}
                        className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white transition"
                      >
                        Fjern
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
                {!headerImage && <div className="mt-3 text-xs text-white/60">Anbefalt størrelse 1600x900. PNG eller JPG.</div>}
              </div>
            ) : (
              <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white/70">
                Du har valgt å ikke bruke forsidebilde. Du kan alltid legge til et senere.
              </div>
            )}
            <div className="text-xs text-white/65">Bilde gir quizen en tydelig identitet på landingssiden.</div>
          </div>
        )}
        {/* Tag selector */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6">
          <div className="font-bold text-lg text-white mb-2">Tags</div>
          <div className="flex flex-wrap gap-2">
            {allTags.length === 0 ? (
              <div className="text-white/70 text-sm">Laster…</div>
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
                        ? 'text-white border-transparent shadow-[0_12px_30px_rgba(78,67,255,0.35)]'
                        : 'text-white/75 border-white/15 hover:text-white hover:border-white/25 hover:bg-white/10'
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
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6 flex gap-4 items-center justify-between">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`relative overflow-hidden rounded-xl px-8 py-3 text-lg font-bold shadow-lg active:scale-95 transition-all focus:ring-4 ${
              canSubmit
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl focus:ring-pink-500/30'
                : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
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
            className="rounded-xl bg-white/10 px-8 py-3 text-lg text-white font-bold shadow border border-white/10 hover:bg-white/20 transition-all"
          >
            {cancelText}
          </button>
          {error && <div className="text-rose-300 font-semibold ml-4">{error}</div>}
        </div>
      </div>
    </div>
  );
}

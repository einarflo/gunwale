import { useState, useEffect } from 'react';
import type React from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { get } from '../../api';

type Props = {
  title: string;
  initialName?: string;
  initialDescription?: string;
  initialIsPublic?: boolean;
  initialTags?: string[]; // slugs
  showImageUpload?: boolean;
  submitText?: string;
  cancelText?: string;
  errorText?: string;
  onSubmit: (v: { name: string; description: string; isPublic: boolean; tags: string[]; headerImage?: string | null }) => Promise<void> | void;
  onCancel: () => void;
};

export default function GameForm({
  title,
  initialName = '',
  initialDescription = '',
  initialIsPublic = false,
  initialTags = [],
  showImageUpload = false,
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
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialTags.map(s => s.toLowerCase())));

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
      const reader = new FileReader();
      reader.onloadend = () => setHeaderImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Navn kan ikke være tomt'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name, description, isPublic, tags: Array.from(selected), headerImage });
    } catch (e) {
      setError(errorText);
    } finally {
      setSubmitting(false);
    }
  };

  const hslFromString = (str: string) => {
    let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return `hsl(${h % 360} 75% 60% / 0.45)`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8">
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6">
          <div className="font-bold text-lg text-white mb-3">{title}</div>
          <label className="block font-semibold text-white/90 mb-1">Navn på quiz</label>
          <input
            className="w-full mb-3 px-5 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 text-lg bg-white/10 text-white placeholder-white/60 shadow"
            placeholder="Skriv inn et navn..."
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <label className="block font-semibold text-white/90 mb-1">Beskrivelse</label>
          <input
            className="w-full mb-1 px-5 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 text-lg bg-white/10 text-white placeholder-white/60 shadow"
            placeholder="Kort beskrivelse (valgfritt)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div className="text-xs text-white/60 mt-1">Navn og beskrivelse vises til spillerne.</div>
        </div>
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6 flex items-center gap-4">
          <label className="font-bold text-lg text-white flex items-center gap-2">Offentlig quiz
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="ml-2 w-5 h-5" />
          </label>
          <div className="text-xs text-white/70">Hvis aktivert, kan alle finne og spille quizen.</div>
        </div>
      </div>
      <div className="flex flex-col gap-8 h-full justify-between">
        {showImageUpload && (
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6">
            <div className="font-bold text-lg text-white mb-2">Header-bilde</div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2 text-white/80" />
            {headerImage && <img src={headerImage} alt="Header" className="rounded-xl w-full max-h-32 object-cover mb-2" />}
            <div className="text-xs text-white/70">Vises øverst på quiz-siden.</div>
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
                return (
                  <button
                    key={tag.slug}
                    type="button"
                    onClick={() => toggleTag(tag.slug)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold border transition active:scale-95 ${active ? 'text-white border-white/10' : 'text-white/90 border-white/10 hover:bg-white/10'}`}
                    style={active ? { backgroundImage: `linear-gradient(135deg, ${hslFromString(tag.slug)} 0%, ${hslFromString(tag.slug + 'x')} 100%)` } : {}}
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
            disabled={submitting}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-8 py-3 text-lg text-white font-bold shadow-lg hover:shadow-2xl active:scale-95 transition-all focus:ring-4 focus:ring-pink-500/30 disabled:opacity-60"
          >
            {submitText}
            <span className="pointer-events-none absolute inset-0 animate-shine" style={{ background: 'linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 100%' }} />
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

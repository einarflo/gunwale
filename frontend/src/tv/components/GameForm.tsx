import { useState } from 'react';
import type React from 'react';

type Props = {
  title: string;
  initialName?: string;
  initialDescription?: string;
  initialIsPublic?: boolean;
  showImageUpload?: boolean;
  submitText?: string;
  cancelText?: string;
  errorText?: string;
  onSubmit: (v: { name: string; description: string; isPublic: boolean; headerImage?: string | null }) => Promise<void> | void;
  onCancel: () => void;
};

export default function GameForm({
  title,
  initialName = '',
  initialDescription = '',
  initialIsPublic = false,
  showImageUpload = false,
  submitText = 'Lagre',
  cancelText = 'Avbryt',
  errorText = 'Noe gikk galt, prøv igjen!',
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await onSubmit({ name, description, isPublic, headerImage });
    } catch (e) {
      setError(errorText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8">
        <div className="rounded-2xl bg-white/90 shadow p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
          <div className="font-bold text-lg text-blue-700 mb-2">{title}</div>
          <label className="block font-semibold text-blue-700 mb-1">Navn på quiz</label>
          <input
            className="w-full mb-3 px-5 py-3 rounded-xl border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg bg-white/80 shadow"
            placeholder="Skriv inn et navn..."
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <label className="block font-semibold text-purple-700 mb-1">Beskrivelse</label>
          <input
            className="w-full mb-1 px-5 py-3 rounded-xl border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg bg-white/80 shadow"
            placeholder="Kort beskrivelse (valgfritt)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">Navn og beskrivelse vises til spillerne.</div>
        </div>
        <div className="rounded-2xl bg-white/90 shadow p-6 flex items-center gap-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
          <label className="font-bold text-lg text-gray-700 flex items-center gap-2">Offentlig quiz
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="ml-2 w-5 h-5" />
          </label>
          <div className="text-xs text-gray-500">Hvis aktivert, kan alle finne og spille quizen.</div>
        </div>
      </div>
      <div className="flex flex-col gap-8 h-full justify-between">
        {showImageUpload && (
          <div className="rounded-2xl bg-white/90 shadow p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
            <div className="font-bold text-lg text-gray-700 mb-2">Header-bilde</div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
            {headerImage && <img src={headerImage} alt="Header" className="rounded-xl w-full max-h-32 object-cover mb-2" />}
            <div className="text-xs text-gray-500">Vises øverst på quiz-siden.</div>
          </div>
        )}
        <div className="rounded-2xl bg-white/90 shadow p-6 flex gap-4 items-center justify-between bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-3 text-lg text-white font-bold shadow-lg hover:scale-105 transition-all focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
          >
            {submitText}
          </button>
          <button
            onClick={onCancel}
            className="rounded-xl bg-white px-8 py-3 text-lg text-gray-700 font-bold shadow hover:scale-105 transition-all border-2 border-gray-300"
          >
            {cancelText}
          </button>
          {error && <div className="text-red-500 font-semibold ml-4">{error}</div>}
        </div>
      </div>
    </div>
  );
}

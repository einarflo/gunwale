import { useEffect, useMemo, useState } from "react";
import { get, put, post } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import GlobalStyles from '../components/landing/GlobalStyles';
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";

const clamp = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const TIME_MIN = 5;
const TIME_MAX = 120;
const SCORE_MIN = 100;
const SCORE_MAX = 5000;

const EditQuestion = () => {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [alternatives, setAlternatives] = useState(["", "", "", ""]);
  const [correctAlternative, setCorrectAlternative] = useState<string>("");
  const [time, setTime] = useState<string>("10");
  const [score, setScore] = useState<string>("1000");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState<number>(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ text: string; isCorrect?: boolean }>>([]);
  const [aiModel, setAiModel] = useState<string>('llama3.1:8b-instruct-q4_K_M');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { gameId, questionId } = useParams<{ gameId: string, questionId: string }>();
  
  const navigate = useNavigate();


  useEffect(() => {
    getQuestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const updateQuestion = () => {
    // Simple validation
    if (!text.trim()) { setError(true); return; }
    if (!correctAlternative) { setError(true); return; }
    put(`/game_question/${questionId}/`, {
      text,
      score,
      description,
      time,
      image_url: imageUrl,
      correct: correctAlternative,
      alt1: alternatives[0],
      alt2: alternatives[1],
      alt3: alternatives[2],
      alt4: alternatives[3]
    })
      .then((res) => {
        navigate('/home/edit/' + gameId);
      })
      .catch(() => {
        setError(true);
      });
  };

  const deleteQuestion = () => {
    if (!window.confirm('Er du sikker på at du vil slette dette spørsmålet?')) return;
    put(`/game_question/${questionId}/`, { deleted: "1" })
      .then(() => navigate('/home/edit/' + gameId))
      .catch(() => {});
  }

   const getQuestion = () => {
    setLoading(true);
    get(`/game_question_by_id/${questionId}/`)
      .then(res => {
        if (res.data) {
          setAlternatives([res.data.alt1, res.data.alt2, res.data.alt3, res.data.alt4]);
          setText(res.data.text || "");
          setDescription(res.data.description || "");
          setCorrectAlternative(res.data.correct || "");
          setTime(res.data.time || "10");
          setScore(res.data.score || "1000");
          setImageUrl(res.data.image_url || null);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }

  const handleAlternativeChange = (index: number, value: string) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives[index] = value;
    setAlternatives(updatedAlternatives);
  };

  const handleCorrectAlternativeChange = (index: number) => {
    setCorrectAlternative(index.toString());
  };

  const correctText = useMemo(() => {
    const idx = Number(correctAlternative) - 1;
    return idx >= 0 && idx < alternatives.length ? (alternatives[idx] || "") : "";
  }, [correctAlternative, alternatives]);

  const filledAlternatives = useMemo(() => alternatives.filter((alt) => alt && alt.trim().length > 0).length, [alternatives]);
  const correctLabel = useMemo(() => {
    const idx = Number(correctAlternative);
    if (idx >= 1 && idx <= alternatives.length) {
      return String.fromCharCode(64 + idx);
    }
    return null;
  }, [correctAlternative, alternatives.length]);

  const timeValue = clamp(Number(time), TIME_MIN, TIME_MAX);
  const scoreValue = clamp(Number(score), SCORE_MIN, SCORE_MAX);

  function stripThinkBlocks(s: string) {
    try { return s.replace(/<think>[\s\S]*?<\/think>/g, ""); } catch { return s; }
  }

  function safeParseJson(maybe: any): any | null {
    if (!maybe) return null;
    if (typeof maybe === 'object') return maybe;
    if (typeof maybe === 'string') {
      const trimmed = stripThinkBlocks(maybe).trim();
      // Try direct parse
      try { return JSON.parse(trimmed); } catch {}
      // Extract ```json ... ``` block
      const code = trimmed.match(/```json([\s\S]*?)```/i);
      if (code && code[1]) {
        try { return JSON.parse(code[1]); } catch {}
      }
      // Extract first {...} object
      const start = trimmed.indexOf('{');
      const end = trimmed.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const sub = trimmed.slice(start, end + 1);
        try { return JSON.parse(sub); } catch {}
      }
    }
    return null;
  }

  function extractOptions(payload: any): Array<{ text: string; isCorrect?: boolean }> {
    // Expect payload like { options: [{ text, isCorrect } ...] }
    const tryObj = (obj: any) => {
      const arr = obj?.options;
      if (Array.isArray(arr)) {
        return arr
          .filter((o) => o && (typeof o.text === 'string' || typeof o === 'string'))
          .map((o) => typeof o === 'string' ? ({ text: o }) : ({ text: String(o.text || ''), isCorrect: Boolean(o.isCorrect) }))
          .filter((o) => o.text.trim().length > 0);
      }
      return [] as Array<{ text: string; isCorrect?: boolean }>;
    };

    // Direct object
    let list = tryObj(payload);
    if (list.length) return list;

    // If wrapped { data: ... }
    list = tryObj(payload?.data);
    if (list.length) return list;

    // If data.raw or string
    const raw = payload?.data?.raw || payload?.raw || payload?.data || payload;
    const parsed = safeParseJson(raw);
    list = tryObj(parsed);
    if (list.length) return list;

    // Best-effort: split by newlines
    if (typeof raw === 'string') {
      const lines = stripThinkBlocks(raw).split(/\n+/).map((l: string) => l.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean);
      return lines.slice(0, 6).map((t) => ({ text: t }));
    }
    return [];
  }

  // Model-based loading bar: fast to 75%, slow to 90%, then super-slow +1% steps
  useEffect(() => {
    let tick: any;
    let finalize: any;
    if (aiLoading) {
      setAiProgress(0);
      // expected time to reach 90%
      const expectedMs90 = (() => {
        const m = (aiModel || '').toLowerCase();
        if (m.includes('3b')) return 6000;
        if (m.includes('deepseek-r1:14b')) return 25000;
        return 15000; // 8B default
      })();
      const start = Date.now();
      const fastEnd = expectedMs90 * 0.4; // 0 -> 75 quickly
      const slowEnd = expectedMs90;       // 75 -> 90 until here
      const superStepMs = 900;            // +1% steps cadence after 90%
      let lastStepAt = expectedMs90;

      tick = setInterval(() => {
        const elapsed = Date.now() - start;
        setAiProgress((prev) => {
          if (elapsed < fastEnd) {
            // Linear 0 -> 75
            const p = Math.min(75, Math.max(0, Math.round((elapsed / fastEnd) * 75)));
            return p;
          }
          if (elapsed < slowEnd) {
            // Linear 75 -> 90
            const t = (elapsed - fastEnd) / (slowEnd - fastEnd);
            const p = 75 + Math.round(t * 15);
            return Math.min(90, p);
          }
          // After 90% time: step +1% up to 99%
          if (prev < 99) {
            const over = elapsed - lastStepAt;
            const steps = Math.floor(over / superStepMs);
            if (steps >= 1) {
              lastStepAt += steps * superStepMs;
              return Math.min(99, prev + steps);
            }
          }
          return prev;
        });
      }, 120);
    } else {
      // finish smoothly to 100, then reset
      setAiProgress((prev) => (prev < 95 ? 95 : prev));
      finalize = setTimeout(() => setAiProgress(100), 150);
      const reset = setTimeout(() => setAiProgress(0), 600);
      return () => clearTimeout(reset);
    }
    return () => { clearInterval(tick); clearTimeout(finalize); };
  }, [aiLoading, aiModel]);

  const fetchAiOptions = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiSuggestions([]);
    try {
      const body: any = {
        question: text,
        option_count: 4,
        model: aiModel,
      };
      //if (correctText.trim()) body.correct_answer = correctText.trim();
      const resp = await fetch('https://ai.tavl.no/v1/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`AI request failed: ${resp.status}`);
      const json = await resp.json();
      const options = extractOptions(json);
      if (options.length === 0) throw new Error('Fant ingen alternativer i AI-svar');
      setAiSuggestions(options);
    } catch (e: any) {
      setAiError(e?.message || 'Kunne ikke hente forslag');
    } finally {
      setAiLoading(false);
    }
  };

  const onSuggestionDragStart = (ev: React.DragEvent, text: string) => {
    ev.dataTransfer.setData('text/plain', text);
    ev.dataTransfer.effectAllowed = 'copyMove';
  };

  const onAlternativeDrop = (ev: React.DragEvent, index: number) => {
    ev.preventDefault();
    const text = ev.dataTransfer.getData('text/plain');
    if (text) handleAlternativeChange(index, text);
  };

  const onAlternativeDragOver = (ev: React.DragEvent) => {
    ev.preventDefault();
  };

  const onUploadImage = async (file: File) => {
    if (!questionId) return;
    try {
      const contentType = file.type || 'image/jpeg';
      const pres = await post(`/media/presign`, { kind: 'questionImage', id: questionId, contentType }).then(r => r.data as any);
      if (pres?.putUrl) {
        await fetch(pres.putUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
        let finalUrl = pres.publicUrl || null;
        try {
          if (pres.key) {
            const optimized = await post(`/media/optimize`, { key: pres.key }).then(r => r.data as any);
            if (optimized?.publicUrl) {
              finalUrl = optimized.publicUrl;
            }
          }
        } catch (_) {
          // ignore optimization errors; fallback to original URL
        }
        setImageUrl(finalUrl);
      }
    } catch (_) {
      setAiError('Opplasting feilet');
    }
  };

  const questionPreview = text.trim() || 'Uten tittel';
  const hasImage = Boolean(imageUrl);

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
              <div className="space-y-3 max-w-3xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Rediger spørsmål</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">{questionPreview}</h1>
                {description && (
                  <p className="text-sm text-white/70 leading-relaxed">{description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    Alternativer: {filledAlternatives}/4
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    Tid: {time || '—'} sek
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    {score || '—'} poeng
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    Fasit: {correctLabel ? `Alternativ ${correctLabel}` : 'Ikke valgt'}
                  </span>
                  <span className={`inline-flex items-center rounded-full border ${hasImage ? 'border-emerald-300/50 bg-emerald-500/20 text-emerald-100' : 'border-white/15 bg-white/10 text-white/70'} px-3 py-1 text-xs font-semibold`}>
                    {hasImage ? 'Bilde lagt til' : 'Ingen bilde'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={updateQuestion}
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/40"
                >
                  Lagre
                </button>
                <button
                  onClick={() => navigate('/home/edit/' + gameId)}
                  className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/20"
                >
                  Avbryt
                </button>
                <button
                  onClick={deleteQuestion}
                  className="inline-flex items-center rounded-full border border-rose-300/50 bg-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/40"
                >
                  Slett
                </button>
              </div>
            </div>
          </section>

          {loading ? (
            <section className="rounded-3xl border border-white/10 bg-white/8 p-6 sm:p-8 shadow-[0_20px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <div className="flex h-48 items-center justify-center text-white/70">Laster…</div>
            </section>
          ) : (
            <>
              <section className="rounded-3xl border border-white/10 bg-white/8 p-6 sm:p-8 shadow-[0_20px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                <div className="grid gap-6 lg:grid-cols-[1.75fr,1fr]">
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/12 bg-white/10 p-6 space-y-4 shadow-inner shadow-indigo-900/25">
                      <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                        Spørsmålstekst
                      </label>
                      <textarea
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm sm:text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                        rows={4}
                        placeholder="Skriv spørsmålet her..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                      />
                      <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                        Hint (valgfritt)
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm sm:text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                        placeholder="Kort hint"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="rounded-2xl border border-white/12 bg-white/10 p-6 shadow-inner shadow-indigo-900/25">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-white">Alternativer</h3>
                        <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                          Velg fasit med radioknappen
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {alternatives.map((alternative, index) => {
                          const isCorrect = String(index + 1) === correctAlternative;
                          return (
                            <div
                              key={index}
                              onDrop={(e) => onAlternativeDrop(e, index)}
                              onDragOver={onAlternativeDragOver}
                              className={`group rounded-2xl border px-4 py-3 transition ${
                                isCorrect
                                  ? 'border-emerald-300/60 bg-emerald-400/20 shadow-[0_12px_35px_rgba(16,185,129,0.35)]'
                                  : 'border-white/12 bg-white/6 hover:border-white/20 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                                <input
                                  type="radio"
                                  name="correctAlternative"
                                  checked={isCorrect}
                                  onChange={() => handleCorrectAlternativeChange(index + 1)}
                                  className="h-4 w-4 shrink-0 accent-pink-500"
                                />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                                      {String.fromCharCode(65 + index)}
                                    </span>
                                    {isCorrect && (
                                      <span className="inline-flex items-center rounded-full border border-emerald-300/60 bg-emerald-400/25 px-2 py-0.5 text-[10px] font-semibold text-emerald-50">
                                        Fasit
                                      </span>
                                    )}
                                  </div>
                                  <input
                                    className="w-full rounded-2xl border border-white/20 bg-white/90 px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                                    type="text"
                                    placeholder={`Alternativ ${index + 1}`}
                                    value={alternative || ''}
                                    onChange={(e) => handleAlternativeChange(index, e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-xs text-white/60">
                        Tips: Du kan dra forslag fra AI-panelet inn i feltene, eller skrive manuelt.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/12 bg-white/10 p-6 shadow-inner shadow-indigo-900/25 space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
                          <span>Tid (sek)</span>
                          <span className="text-white/85 font-semibold">{timeValue} sek</span>
                        </div>
                        <input
                          type="range"
                          min={TIME_MIN}
                          max={TIME_MAX}
                          step={1}
                          value={timeValue}
                          onChange={e => setTime(String(e.target.value))}
                          className="h-2 w-full appearance-none rounded-full bg-white/10 accent-pink-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-400 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-pink-400"
                        />
                        <input
                          type="number"
                          min={TIME_MIN}
                          max={TIME_MAX}
                          step={1}
                          className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                          value={time}
                          onChange={e => setTime(e.target.value)}
                          onBlur={() => setTime(String(timeValue))}
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
                          <span>Poeng</span>
                          <span className="text-white/85 font-semibold">{scoreValue.toLocaleString('no-NB')} poeng</span>
                        </div>
                        <input
                          type="range"
                          min={SCORE_MIN}
                          max={SCORE_MAX}
                          step={50}
                          value={scoreValue}
                          onChange={e => setScore(String(e.target.value))}
                          className="h-2 w-full appearance-none rounded-full bg-white/10 accent-indigo-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-400"
                        />
                        <input
                          type="number"
                          min={SCORE_MIN}
                          max={SCORE_MAX}
                          step={50}
                          className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                          value={score}
                          onChange={e => setScore(e.target.value)}
                          onBlur={() => setScore(String(scoreValue))}
                        />
                      </div>
                      <p className="text-xs text-white/60">
                        Hold deg til faste poeng og tidsintervaller for mer balanserte quizer.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/12 bg-white/10 p-6 shadow-inner shadow-indigo-900/25 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-white">Bilde (valgfritt)</h3>
                        <label className="inline-flex cursor-pointer items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/18">
                          Last opp
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) onUploadImage(f);
                            }}
                          />
                        </label>
                      </div>
                      {imageUrl ? (
                        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                          <img src={imageUrl} alt="Spørsmålsbilde" className="h-48 w-full object-cover" />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/60">
                          Ingen bilde valgt. Brukes for å gi kontekst til spørsmålet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-teal-500/15 to-indigo-500/15 p-6 sm:p-8 shadow-[0_25px_80px_rgba(15,23,42,0.55)] backdrop-blur-xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">AI-forslag til alternativer</h2>
                    <p className="text-sm text-white/70">
                      Skriv spørsmålet først, velg modell og hent forslag. Dra forslag over i alternativene.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                    >
                      <option value="llama3.2:3b-instruct-q4_K_M">llama3.2:3b-instruct (rask)</option>
                      <option value="llama3.1:8b-instruct-q4_K_M">llama3.1:8b-instruct</option>
                      <option value="deepseek-r1:14b">deepseek-r1:14b (treg)</option>
                    </select>
                    <button
                      onClick={fetchAiOptions}
                      disabled={aiLoading || !text.trim()}
                      className="inline-flex items-center rounded-full bg-emerald-500/80 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {aiLoading ? 'Henter…' : 'Foreslå alternativer'}
                    </button>
                  </div>
                </div>

                {(aiLoading || (aiProgress > 0 && aiProgress < 100)) && (
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-black/30">
                    <div
                      className="h-full bg-emerald-400/80 transition-all duration-100"
                      style={{ width: `${aiProgress}%` }}
                    />
                  </div>
                )}
                {aiError && (
                  <div className="mt-3 rounded-2xl border border-rose-300/40 bg-rose-500/20 px-4 py-3 text-sm font-semibold text-rose-100">
                    {aiError}
                  </div>
                )}

                {!aiLoading && aiSuggestions.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/8 px-4 py-3 text-sm text-white/70">
                    Ingen forslag ennå. Fyll inn spørsmålet og trykk «Foreslå alternativer».
                  </div>
                )}

                {aiSuggestions.length > 0 && (
                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {aiSuggestions.map((sug, i) => (
                      <div
                        key={i}
                        draggable
                        onDragStart={(e) => onSuggestionDragStart(e, sug.text)}
                        className={`group flex flex-col gap-3 rounded-2xl border px-4 py-3 transition ${
                          sug.isCorrect
                            ? 'border-emerald-300/60 bg-emerald-400/15'
                            : 'border-white/15 bg-white/10'
                        } cursor-grab active:cursor-grabbing`}
                      >
                        <div className="text-sm text-white/90" title={sug.text}>
                          {sug.text}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 transition hover:bg-white/16"
                            onClick={() => {
                              const emptyIdx = alternatives.findIndex(a => !a || a.trim() === '');
                              const idx = emptyIdx !== -1 ? emptyIdx : 0;
                              handleAlternativeChange(idx, sug.text);
                              if (sug.isCorrect) setCorrectAlternative(String(idx + 1));
                            }}
                          >
                            Sett inn
                          </button>
                          {sug.isCorrect && (
                            <button
                              className="inline-flex items-center rounded-full border border-emerald-300/60 bg-emerald-400/25 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/35"
                              onClick={() => {
                                const emptyIdx = alternatives.findIndex(a => !a || a.trim() === '');
                                const idx = emptyIdx !== -1 ? emptyIdx : 0;
                                handleAlternativeChange(idx, sug.text);
                                setCorrectAlternative(String(idx + 1));
                              }}
                            >
                              Merk korrekt
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs text-white/60">
                  Tips: AI-forslag kan redigeres etterpå. Dra og slipp direkte til alternativene, eller bruk knappene.
                </p>
              </section>

              {error && (
                <section className="rounded-3xl border border-rose-400/50 bg-rose-500/20 p-5 text-sm font-semibold text-rose-100 shadow-[0_20px_60px_rgba(190,24,93,0.35)]">
                  Noe gikk galt eller mangler. Kontroller feltene og prøv igjen.
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EditQuestion;

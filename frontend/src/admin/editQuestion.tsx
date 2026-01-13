import { useEffect, useMemo, useState } from "react";
import { get, put, post } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import GlobalStyles from '../components/landing/GlobalStyles';
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";
import placeholderImg from "../images/tavl-placeholder.jpg";
import { useAiLoadingProgress } from "./utils/aiLoadingProgress";
import { useI18n } from "../i18n/I18nProvider";
import { KnownQuestionType, normalizeQuestionType } from "../utils/questionTypes";

const clamp = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const TIME_MIN = 5;
const TIME_MAX = 120;
const SCORE_MIN = 100;
const SCORE_MAX = 5000;

const EditQuestion = () => {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [alternatives, setAlternatives] = useState(["", "", "", ""]);
  const [questionType, setQuestionType] = useState<KnownQuestionType>('multi');
  const [correctAlternative, setCorrectAlternative] = useState<string>("");
  const [time, setTime] = useState<string>("10");
  const [score, setScore] = useState<string>("1000");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModel, setAiModel] = useState<string>('llama3.1:8b-instruct-q4_K_M');
  const aiProgress = useAiLoadingProgress(aiLoading, aiModel);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ text: string; isCorrect?: boolean }>>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { gameId, questionId } = useParams<{ gameId: string, questionId: string }>();
  
  const navigate = useNavigate();


  useEffect(() => {
    getQuestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  useEffect(() => {
    if (questionType === 'slide') {
      setCorrectAlternative('');
      return;
    }
    if (questionType === 'boolean' && !['1', '2'].includes(correctAlternative)) {
      setCorrectAlternative('1');
    }
  }, [questionType, correctAlternative]);

  const updateQuestion = () => {
    // Simple validation
    if (!text.trim()) { setError(true); return; }
    if (questionType !== 'slide') {
      if (!correctAlternative) { setError(true); return; }
      if (questionType === 'boolean' && !['1', '2'].includes(correctAlternative)) { setError(true); return; }
    }
    const payload: any = {
      text,
      description,
      image_url: imageUrl,
      type: questionType,
    };
    if (questionType !== 'slide') {
      payload.score = score;
      payload.time = time;
      payload.correct = correctAlternative;
      payload.alt1 = alternatives[0];
      payload.alt2 = alternatives[1];
      payload.alt3 = questionType === 'multi' ? alternatives[2] : "";
      payload.alt4 = questionType === 'multi' ? alternatives[3] : "";
    } else {
      payload.correct = "";
      payload.alt1 = "";
      payload.alt2 = "";
      payload.alt3 = "";
      payload.alt4 = "";
    }
    put(`/game_question/${questionId}/`, payload)
      .then((res) => {
        navigate('/home/edit/' + gameId);
      })
      .catch(() => {
        setError(true);
      });
  };

  const deleteQuestion = () => {
    if (!window.confirm(t('editQuestion.deleteConfirm') || 'Are you sure you want to delete this question?')) return;
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
          const rawType = res.data.type ?? res.data.question_type ?? res.data.questionType;
          const normalized = normalizeQuestionType(rawType);
          setQuestionType(normalized === 'unknown' ? 'multi' : normalized);
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

  const optionCount = questionType === 'boolean' ? 2 : questionType === 'slide' ? 0 : 4;
  const visibleAlternatives = useMemo(() => alternatives.slice(0, optionCount), [alternatives, optionCount]);
  const filledAlternatives = useMemo(() => visibleAlternatives.filter((alt) => alt && alt.trim().length > 0).length, [visibleAlternatives]);
  const correctLabel = useMemo(() => {
    const idx = Number(correctAlternative);
    if (idx >= 1 && idx <= optionCount) {
      return String.fromCharCode(64 + idx);
    }
    return null;
  }, [correctAlternative, optionCount]);

  const timeValue = clamp(Number(time), TIME_MIN, TIME_MAX);
  const scoreValue = clamp(Number(score), SCORE_MIN, SCORE_MAX);
  const previewImage = imageUrl || placeholderImg;
  const previewAlternatives = useMemo(() => {
    return visibleAlternatives.map((alt, idx) => ({
      label: String.fromCharCode(65 + idx),
      text: alt,
      isCorrect: String(idx + 1) === correctAlternative,
    }));
  }, [visibleAlternatives, correctAlternative]);

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
      if (options.length === 0) throw new Error(t('editQuestion.ai.noOptions') || 'No options found in AI response');
      setAiSuggestions(options);
    } catch (e: any) {
      setAiError(e?.message || t('editQuestion.ai.fetchFailed') || 'Could not fetch suggestions');
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
      setAiError(t('editQuestion.image.uploadFailed') || 'Upload failed');
    }
  };

  const questionPreview = text.trim() || t('editQuestion.untitled') || 'Untitled';
  const hasImage = Boolean(imageUrl);

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
              <div className="space-y-3 max-w-3xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  {t('editQuestion.title') || 'Edit question'}
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">{questionPreview}</h1>
                {description && (
                  <p className="text-sm text-white/80 leading-relaxed">{description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                    {t('editQuestion.form.typeLabel') || 'Question type'}: {t(`editQuestion.type.${questionType}`) || questionType}
                  </span>
                  {questionType !== 'slide' && (
                    <>
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                        {t('editQuestion.summary.options') || 'Options'}: {filledAlternatives}/{optionCount}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                        {t('editQuestion.summary.time') || 'Time'}: {time || '—'} {t('editQuestion.secondsShort') || 'sec'}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                        {score || '—'} {t('editQuestion.pointsShort') || 'points'}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                        {t('editQuestion.summary.correct') || 'Correct'}: {correctLabel ? `${t('editQuestion.optionLabel') || 'Option'} ${correctLabel}` : (t('editQuestion.summary.notSelected') || 'Not selected')}
                      </span>
                    </>
                  )}
                  <span className={`inline-flex items-center rounded-full border ${hasImage ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-white/20 bg-white/15 text-white/85'} px-3 py-1 text-xs font-semibold`}>
                    {hasImage ? (t('editQuestion.summary.imageAdded') || 'Image added') : (t('editQuestion.summary.noImage') || 'No image')}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={updateQuestion}
                  className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#6A71FA] shadow-lg shadow-indigo-200/50 transition hover:bg-[#6A71FA] hover:text-white"
                >
                  {t('common.save') || 'Save'}
                </button>
                <button
                  onClick={() => navigate('/home/edit/' + gameId)}
                  className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/25"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={deleteQuestion}
                  className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  {t('common.delete') || 'Delete'}
                </button>
              </div>
            </div>
            </div>
          </section>

          {loading ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
              <div className="flex h-48 items-center justify-center text-slate-500">
                {t('common.loading') || 'Loading…'}
              </div>
            </section>
          ) : (
            <>
              <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
                <div className="grid gap-6 lg:grid-cols-[1.75fr,1fr]">
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                      <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {t('editQuestion.form.typeLabel') || 'Question type'}
                      </label>
                      <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value as KnownQuestionType)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6A71FA]/20"
                      >
                        <option value="multi">{t('editQuestion.type.multi') || '4 options'}</option>
                        <option value="boolean">{t('editQuestion.type.boolean') || '2 options'}</option>
                        <option value="slide">{t('editQuestion.type.slide') || 'Slide'}</option>
                      </select>
                      <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {t('editQuestion.form.questionText') || 'Question text'}
                      </label>
                      <textarea
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6A71FA]/20"
                        rows={4}
                        placeholder={t('editQuestion.form.questionPlaceholder') || 'Write the question here...'}
                        value={text}
                        onChange={e => setText(e.target.value)}
                      />
                      <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {t('editQuestion.form.hintLabel') || 'Hint (optional)'}
                      </label>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6A71FA]/20"
                        placeholder={t('editQuestion.form.hintPlaceholder') || 'Short hint'}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </div>

                    {questionType !== 'slide' && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-lg font-semibold text-slate-900">{t('editQuestion.form.optionsTitle') || 'Options'}</h3>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            {t('editQuestion.form.correctHint') || 'Pick the correct option with the radio button'}
                          </span>
                        </div>
                        <div className="mt-4 space-y-3">
                          {visibleAlternatives.map((alternative, index) => {
                            const isCorrect = String(index + 1) === correctAlternative;
                            return (
                              <div
                                key={index}
                                onDrop={(e) => onAlternativeDrop(e, index)}
                                onDragOver={onAlternativeDragOver}
                                className={`group rounded-2xl border px-4 py-3 transition ${
                                  isCorrect
                                    ? 'border-emerald-200 bg-emerald-50 shadow-[0_8px_24px_rgba(16,185,129,0.18)]'
                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                                  <input
                                    type="radio"
                                    name="correctAlternative"
                                    checked={isCorrect}
                                    onChange={() => handleCorrectAlternativeChange(index + 1)}
                                    className="h-4 w-4 shrink-0 accent-[#6A71FA]"
                                  />
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        {String.fromCharCode(65 + index)}
                                      </span>
                                      {isCorrect && (
                                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                          {t('editQuestion.form.correctBadge') || 'Correct'}
                                        </span>
                                      )}
                                    </div>
                                    <input
                                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6A71FA]/20"
                                      type="text"
                                      placeholder={`${t('editQuestion.optionLabel') || 'Option'} ${index + 1}`}
                                      value={alternative || ''}
                                      onChange={(e) => handleAlternativeChange(index, e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {questionType === 'multi' && (
                          <p className="mt-3 text-xs text-slate-500">
                            {t('editQuestion.form.dragTip') || 'Tip: Drag suggestions from the AI panel into the fields, or type manually.'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {questionType !== 'slide' && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                          <span>{t('editQuestion.form.timeLabel') || 'Time (sec)'}</span>
                          <span className="text-slate-700 font-semibold">{timeValue} {t('editQuestion.secondsShort') || 'sec'}</span>
                        </div>
                        <input
                          type="range"
                          min={TIME_MIN}
                          max={TIME_MAX}
                          step={1}
                          value={timeValue}
                          onChange={e => setTime(String(e.target.value))}
                          className="h-2 w-full appearance-none rounded-full bg-slate-100 accent-[#6A71FA] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6A71FA] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#6A71FA]"
                        />
                        <input
                          type="number"
                          min={TIME_MIN}
                          max={TIME_MAX}
                          step={1}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6A71FA]/20"
                          value={time}
                          onChange={e => setTime(e.target.value)}
                          onBlur={() => setTime(String(timeValue))}
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                          <span>{t('editQuestion.form.scoreLabel') || 'Score'}</span>
                          <span className="text-slate-700 font-semibold">{scoreValue.toLocaleString('no-NB')} {t('editQuestion.pointsShort') || 'points'}</span>
                        </div>
                        <input
                          type="range"
                          min={SCORE_MIN}
                          max={SCORE_MAX}
                          step={50}
                          value={scoreValue}
                          onChange={e => setScore(String(e.target.value))}
                          className="h-2 w-full appearance-none rounded-full bg-slate-100 accent-[#6A71FA] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6A71FA] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#6A71FA]"
                        />
                        <input
                          type="number"
                          min={SCORE_MIN}
                          max={SCORE_MAX}
                          step={50}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6A71FA]/20"
                          value={score}
                          onChange={e => setScore(e.target.value)}
                          onBlur={() => setScore(String(scoreValue))}
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        {t('editQuestion.form.balanceHint') || 'Stick to consistent points and time ranges for more balanced quizzes.'}
                      </p>
                    </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{t('editQuestion.form.imageTitle') || 'Image (optional)'}</h3>
                        <label className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                          {t('editQuestion.form.upload') || 'Upload'}
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
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                          <img src={imageUrl} alt={t('editQuestion.image.alt') || 'Question image'} className="h-48 w-full object-cover" />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                          {t('editQuestion.form.noImage') || 'No image selected. Use it to add context to the question.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {questionType === 'multi' && (
                <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-200/40">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,#45CC70,#0B6B3A)] bg-cover" />
                <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#45CC70,#0B6B3A)] bg-cover opacity-90" />
                <div className="relative">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{t('editQuestion.ai.title') || 'AI option suggestions'}</h2>
                    <p className="text-sm text-white/80">
                      {t('editQuestion.ai.subtitle') || 'Write the question first, choose a model and fetch suggestions. Drag suggestions into the options.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="rounded-full border border-white/40 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                      <option value="llama3.2:3b-instruct-q4_K_M">{t('editQuestion.ai.modelFast') || 'llama3.2:3b-instruct (fast)'}</option>
                      <option value="llama3.1:8b-instruct-q4_K_M">{t('editQuestion.ai.modelStandard') || 'llama3.1:8b-instruct'}</option>
                      <option value="deepseek-r1:14b">{t('editQuestion.ai.modelSlow') || 'deepseek-r1:14b (slow)'}</option>
                    </select>
                    <button
                      onClick={fetchAiOptions}
                      disabled={aiLoading || !text.trim()}
                      className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#2f2f55] shadow-lg shadow-emerald-200/50 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {aiLoading ? (t('editQuestion.ai.loading') || 'Fetching…') : (t('editQuestion.ai.fetch') || 'Suggest options')}
                    </button>
                  </div>
                </div>

                {(aiLoading || (aiProgress > 0 && aiProgress < 100)) && (
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-white/30 bg-black/20">
                    <div
                      className="h-full bg-white/80 transition-all duration-100"
                      style={{ width: `${aiProgress}%` }}
                    />
                  </div>
                )}
                {aiError && (
                  <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {aiError}
                  </div>
                )}

                {!aiLoading && aiSuggestions.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/40 bg-white/15 px-4 py-3 text-sm text-white/85">
                    {t('editQuestion.ai.empty') || 'No suggestions yet. Fill in the question and click “Suggest options”.'}
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
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-white/30 bg-white/15 text-white'
                        } cursor-grab active:cursor-grabbing`}
                      >
                        <div className={`${sug.isCorrect ? 'text-emerald-800' : 'text-white'} text-sm`} title={sug.text}>
                          {sug.text}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
                              sug.isCorrect
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-white/40 bg-white/15 text-white/90 hover:bg-white/25'
                            }`}
                            onClick={() => {
                              const emptyIdx = alternatives.findIndex(a => !a || a.trim() === '');
                              const idx = emptyIdx !== -1 ? emptyIdx : 0;
                              handleAlternativeChange(idx, sug.text);
                              if (sug.isCorrect) setCorrectAlternative(String(idx + 1));
                            }}
                          >
                            {t('editQuestion.ai.insert') || 'Insert'}
                          </button>
                          {sug.isCorrect && (
                            <button
                              className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                              onClick={() => {
                                const emptyIdx = alternatives.findIndex(a => !a || a.trim() === '');
                                const idx = emptyIdx !== -1 ? emptyIdx : 0;
                                handleAlternativeChange(idx, sug.text);
                                setCorrectAlternative(String(idx + 1));
                              }}
                            >
                              {t('editQuestion.ai.markCorrect') || 'Mark correct'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs text-white/80">
                  {t('editQuestion.ai.tip') || 'Tip: AI suggestions can be edited later. Drag and drop into options, or use the buttons.'}
                </p>
                </div>
              </section>
              )}

              <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 lg:w-1/2">
                    <img src={previewImage} alt={t('editQuestion.preview.alt') || 'Preview'} className="h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    {questionType !== 'slide' && (
                      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                          {timeValue} {t('editQuestion.secondsShort') || 'sec'}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                          {scoreValue.toLocaleString('no-NB')} {t('editQuestion.pointsShort') || 'points'}
                        </span>
                        {correctLabel && (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-500/50 px-3 py-1 text-xs font-semibold text-white">
                            {t('editQuestion.summary.correct') || 'Correct'}: {correctLabel}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-2xl font-bold text-white drop-shadow-lg">{questionPreview}</h2>
                      {description && (
                        <p className="mt-2 text-sm text-white/85 drop-shadow">{description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{t('editQuestion.preview.title') || 'Preview'}</h3>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {t('editQuestion.preview.subtitle') || 'How the question appears in the host view'}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/home/edit/${gameId}`)}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        {t('editQuestion.preview.goToOverview') || 'Go to quiz overview'}
                      </button>
                    </div>
                    <div className="grid gap-3">
                      {questionType === 'slide' ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
                          {t('editQuestion.preview.slideHint') || 'Slides show info only, no alternatives.'}
                        </div>
                      ) : (
                        previewAlternatives.map(({ label, text, isCorrect }) => (
                          <div
                            key={label}
                            className={`relative overflow-hidden rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              isCorrect
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_8px_24px_rgba(16,185,129,0.18)]'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                              {label}
                            </span>
                            <span>{text?.trim() ? text : (t('editQuestion.questions.emptyOption') || '—')}</span>
                            {isCorrect && (
                              <span className="absolute inset-y-0 right-4 inline-flex items-center">
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-emerald-600"
                                >
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {error && (
                <section className="rounded-3xl border border-rose-400/50 bg-rose-500/20 p-5 text-sm font-semibold text-rose-100 shadow-[0_20px_60px_rgba(190,24,93,0.35)]">
                  {t('editQuestion.error') || 'Something went wrong or is missing. Check the fields and try again.'}
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

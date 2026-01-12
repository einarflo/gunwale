import { useEffect, useMemo, useState } from "react";
import { get, post, put } from "../api";
import { Question } from "../tv/game";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import GlobalStyles from '../components/landing/GlobalStyles';
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";
import placeholderImg from "../images/tavl-placeholder.jpg";
import { useKeycloak } from "../auth/KeycloakProvider";
import Footer from "../components/Footer";
import { useI18n } from "../i18n/I18nProvider";
import { useAiLoadingProgress } from "./utils/aiLoadingProgress";

export interface GameItem {
  name: String;
  description: String;
  created_by: String;
  status: String;
  uuid?: string;
  id?: string;
  cover_image_url?: string | null;
  coverImageUrl?: string | null;
}

type AiSuggestion = {
  text: string;
  difficulty?: string;
  topic?: string;
  time?: number;
  score?: number;
};

const EditGame = () => {
  // get id from url params
  const { gameId } = useParams<{ gameId: string }>();

  const navigate = useNavigate();
  const { userId } = useKeycloak();
  const { t } = useI18n();

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [game, setGame] = useState<GameItem>();
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!gameId) return;
    getQuestionsForGameId(gameId);
    getGame(gameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);
  
  const [questions, setQuestions] = useState<Array<Question>>([]);
  const [deletedQuestions, setDeletedQuestions] = useState<Array<any>>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [aiModel, setAiModel] = useState('llama3.2:3b-instruct-q4_K_M');
  const [aiDifficulty, setAiDifficulty] = useState<'mixed' | 'easy' | 'medium' | 'hard'>('mixed');
  const [aiCount, setAiCount] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const aiProgress = useAiLoadingProgress(aiLoading, aiModel);

  const difficultyLabel = (value?: string) => {
    switch ((value || '').toLowerCase()) {
      case 'easy':
      case 'lett':
        return t('editGame.ai.difficulty.easy') || 'Easy';
      case 'medium':
      case 'middels':
        return t('editGame.ai.difficulty.medium') || 'Medium';
      case 'hard':
      case 'vanskelig':
        return t('editGame.ai.difficulty.hard') || 'Hard';
      default:
        return t('editGame.ai.difficulty.mixed') || 'Mixed';
    }
  };

  const newQuestion = (draft?: Partial<Record<'text' | 'description' | 'score' | 'time' | 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'correct', string>>) => {
    return post(`/game_question/`, {
      text: draft?.text ?? "",
      game_id: gameId,
      score: draft?.score ?? "1000",
      description: draft?.description ?? "",
      number_in_line: questions.length + 1,
      status: "created",
      time: draft?.time ?? "10",
      correct: draft?.correct ?? "1",
      alt1: draft?.alt1 ?? "",
      alt2: draft?.alt2 ?? "",
      alt3: draft?.alt3 ?? "",
      alt4: draft?.alt4 ?? ""
    })
      .then((res) => {
        navigate('/home/edit/' + gameId + '/question/' + res.data);
      })
      .catch(() => {
        setError(true);
      });
  };

   // Get all questions for the current game Id
  const getQuestionsForGameId = (id: String) => {
    setLoading(true);
    get(`/game_question/${id}/`)
      .then(res => {
        if (res.data) {
          setQuestions(res.data);
      }
      setLoading(false);
    })
      .catch(err => {
        console.log("Error when getting questions for game with id ", id);
        setLoading(false);
      });
  }

  const getDeletedQuestions = (id: String) => {
    get(`/game_question/trash/${id}`)
      .then(res => setDeletedQuestions(res.data || []))
      .catch(() => setDeletedQuestions([]));
  }

     // Get game info
     const getGame = (id: String) => {
      get(`/games/${id}/`)
        .then(res => {
          if (res.data) {
            setGame(res.data);
        }})
        .catch(err => {
          console.log("Error when getting questions for game with id ", id);
        });
    }

    const deleteGame = () => {
    if (!window.confirm(t('editGame.deleteConfirm') || 'Are you sure you want to delete this quiz?')) return;
      put(`/games/${gameId}/`, { deleted: "1" })
      .then(res => {
        console.log(res);
        navigate('/home');
      })
      .catch(() => {
        console.log("Something fishy is going on");
      });
    }

  const filteredQuestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return questions;
    return questions.filter(q => (q.text || '').toString().toLowerCase().includes(term));
  }, [questions, searchTerm]);

  // Visual preview list while dragging (no persist yet)
  const displayQuestions = useMemo(() => {
    const term = searchTerm.trim();
    if (term) return filteredQuestions;
    if (dragIndex === null || hoverIndex === null) return filteredQuestions;
    const arr = [...filteredQuestions] as any[];
    const [moved] = arr.splice(dragIndex, 1);
    arr.splice(hoverIndex, 0, moved);
    return arr as any;
  }, [filteredQuestions, dragIndex, hoverIndex, searchTerm]);

  // Persist new order to backend (number_in_line)
  const persistOrder = async (list: Array<Question>) => {
    for (let i = 0; i < list.length; i++) {
      const q: any = list[i];
      try {
        await put(`/game_question/${String(q.uuid)}/`, { number_in_line: String(i + 1) });
      } catch (e) {
        console.log('Failed to save order for', q.uuid);
      }
    }
  };

  // Drag handlers with preview
  const onDragStart = (index: number) => {
    if (searchTerm.trim()) return;
    setDragIndex(index);
    setHoverIndex(index);
  };
  const onDragOver = (e: React.DragEvent, index: number) => {
    if (searchTerm.trim()) return;
    e.preventDefault();
    if (dragIndex !== null && hoverIndex !== index) setHoverIndex(index);
  };
  const onDragEnd = () => {
    setDragIndex(null);
    setHoverIndex(null);
  };
  const onDrop = (index: number) => {
    if (searchTerm.trim()) return; // disable reordering when filtering
    if (dragIndex === null) return;
    const updated = [...questions];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setQuestions(updated);
    setDragIndex(null);
    setHoverIndex(null);
    persistOrder(updated);
  };

  // Button-based reorder (for mobile)
  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setQuestions(updated);
    persistOrder(updated);
  };

  // Inline edit helpers
  const updateLocal = (uuid: string, patch: Partial<any>) => {
    setQuestions(prev => prev.map((q: any) => (q.uuid === uuid ? { ...q, ...patch } : q)) as any);
  };

  const restoreQuestion = async (uuid: string) => {
    try {
      await put(`/game_question/restore/${uuid}`, {});
      getQuestionsForGameId(gameId || '');
      getDeletedQuestions(gameId || '');
    } catch (e) {
      console.log('Failed to restore question', uuid);
    }
  };

  const stats = useMemo(() => {
    const totalQuestions = questions.length;
    const totalScore = questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0);
    const totalTime = questions.reduce((sum, q) => sum + (Number(q.time) || 0), 0);
    return { totalQuestions, totalScore, totalTime };
  }, [questions]);
  const coverImage = (game as any)?.cover_image_url || (game as any)?.coverImageUrl || placeholderImg;
  const gameUuid = (game as any)?.uuid || (game as any)?.id || gameId;

  const startGameInstance = async () => {
    if (!gameUuid || !userId) return;
    const pin = String(Math.floor(10000 + Math.random() * 90000));
    try {
      setStarting(true);
      const { data } = await post(`/game_instance/`, {
        game_id: gameUuid,
        game_pin: pin,
        status: 'created',
        created_by: userId,
      });
      navigate(`/host/${gameUuid}/instance/${data}/pin/${pin}`);
    } catch (e) {
      console.error('Failed to start game instance', e);
      setStarting(false);
    }
  };

  const fetchAiQuestions = async () => {
    if (!game?.name) {
      setAiError(t('editGame.ai.missingTitle') || 'Quiz needs a title before AI can suggest questions.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const resp = await fetch('https://ai.tavl.no/v1/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: game?.name,
          description: game?.description || '',
          existingQuestions: (questions || []).map((q: any) => q.text).filter(Boolean),
          count: Math.max(1, Math.min(6, aiCount)),
          difficulty: aiDifficulty,
          model: aiModel,
        }),
      });
      if (!resp.ok) throw new Error(`${t('editGame.ai.responseFailed') || 'AI response failed'}: ${resp.status}`);
      const json = await resp.json();
      const list = (json?.data?.questions || json?.questions || [])
        .filter(Boolean)
        .map((item: any) => ({
          text: String(item?.text || '').trim(),
          difficulty: item?.difficulty,
          topic: item?.topic,
          time: typeof item?.time === 'number' ? item.time : undefined,
          score: typeof item?.score === 'number' ? item.score : undefined,
        }))
        .filter((item: AiSuggestion) => item.text.length > 0);
      if (list.length === 0) {
        setAiError(t('editGame.ai.noSuggestions') || 'No suggestions this time. Try again with a different prompt.');
      }
      setAiSuggestions(list);
    } catch (e: any) {
      setAiError(e?.message || t('editGame.ai.fetchFailed') || 'Could not fetch suggestions');
      setAiSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  };

  const createFromSuggestion = (sug: AiSuggestion, index: number) => {
    newQuestion({
      text: sug.text,
      description: sug.topic || '',
      time: sug.time ? String(Math.max(5, Math.min(120, Math.round(sug.time)))) : undefined,
      score: sug.score ? String(Math.max(100, Math.min(5000, Math.round(sug.score)))) : undefined,
    }).then(() => {
      setAiSuggestions((prev) => prev.filter((_, i) => i !== index));
    });
  };

  const copySuggestion = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  return (
    <>
      <GlobalStyles />
      <div
        className="relative min-h-screen bg-white text-slate-900 overflow-hidden"
        style={{
          fontFamily:
            'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_28%,rgba(93,184,104,0.18)_0%,transparent_58%),radial-gradient(circle_at_82%_32%,rgba(249,116,116,0.18)_0%,transparent_58%),radial-gradient(circle_at_50%_12%,rgba(156,138,250,0.22)_0%,transparent_60%),linear-gradient(to_bottom_right,rgba(16,24,39,0.08),rgba(156,138,250,0.08),transparent)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(156,138,250,0.06)_0%,transparent_72%),radial-gradient(circle_at_70%_80%,rgba(93,184,104,0.12)_0%,transparent_60%)] animate-pulse-slow" />
        <ParallaxOrbs />
        <ParallaxScroll />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16 space-y-10 mt-10">
          <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-200/40">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
            <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover" />
            <div className="relative text-white">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(260px,320px)] lg:items-stretch">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                        {t('editGame.title') || 'Edit quiz'}
                      </p>
                      <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
                        {game?.name || t('editGame.untitled') || 'Untitled quiz'}
                      </h1>
                    </div>
                    {game?.description && (
                      <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-3xl">
                        {game.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                      {t('editGame.status') || 'Status'}: {(game as any)?.status || t('editGame.unknown') || 'Unknown'}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                      {t('editGame.visibility') || 'Visibility'}: {((game as any)?.isPublic ?? (game as any)?.is_public ?? 0) === 1 ? (t('home.public') || 'Public') : (t('home.private') || 'Private')}
                    </span>
                    {(game as any)?.created_by_name && (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                        {t('editGame.by') || 'By'} {(game as any)?.created_by_name}
                      </span>
                    )}
                    {(game as any)?.updated_at && (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                        {t('editGame.updated') || 'Updated'} {new Date((game as any).updated_at).toLocaleString()}
                      </span>
                    )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/30 bg-white/95 p-4 text-center shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                        {t('editGame.stats.questions') || 'Questions'}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalQuestions}</p>
                    </div>
                    <div className="rounded-2xl border border-white/30 bg-white/95 p-4 text-center shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                        {t('editGame.stats.totalTime') || 'Total time (sec)'}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalTime}</p>
                    </div>
                    <div className="rounded-2xl border border-white/30 bg-white/95 p-4 text-center shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                        {t('editGame.stats.totalScore') || 'Total score'}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalScore}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={startGameInstance}
                      disabled={starting || !userId}
                      className="inline-flex items-center rounded-full bg-[#6A71FA] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 transition hover:bg-[#555ef6] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {starting ? (t('home.starting') || 'Starting…') : (t('editGame.startQuiz') || 'Start quiz')}
                  </button>
                  <button
                    onClick={() => navigate('/home')}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t('editGame.toOverview') || 'Back to overview'}
                  </button>
                  <button
                    onClick={() => navigate('/home/update/' + gameId)}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t('editGame.editMetadata') || 'Edit metadata'}
                  </button>
                  <button
                    onClick={deleteGame}
                    className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    {t('editGame.deleteQuiz') || 'Delete quiz'}
                  </button>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-indigo-200/40">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover opacity-30" />
                <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)] bg-cover opacity-40" />
                <img src={coverImage} alt="" className="relative z-10 h-full w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {!((game as any)?.cover_image_url || (game as any)?.coverImageUrl) && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/70">
                    {t('editGame.noCoverImage') || 'No cover image'}
                  </div>
                )}
                </div>
              </div>

              <div className="mt-8 relative">
                <div className="h-[2px] w-full bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.85)_12%,rgba(168,85,247,0.85)_28%,rgba(245,158,11,1)_50%,rgba(236,72,153,0.9)_72%,rgba(99,102,241,0.85)_88%,transparent_100%)]" />
                <div
                  className="pointer-events-none absolute -top-4 left-0 right-0 h-12 bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.4)_12%,rgba(168,85,247,0.4)_28%,rgba(245,158,11,0.55)_50%,rgba(236,72,153,0.4)_72%,rgba(99,102,241,0.4)_88%,transparent)] blur-2xl"
                  aria-hidden
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {t('editGame.questions.title') || 'Questions'}
                </h2>
                <p className="text-sm text-slate-600">
                  {t('editGame.questions.subtitle') || 'Drag cards to reorder, or use the arrows for precision.'}
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
                <div className="relative w-full sm:w-64 md:w-72">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM10 16a6 6 0 110-12 6 6 0 010 12z" />
                    </svg>
                  </span>
                  <input
                    className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-5 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#6A71FA]/40 focus:ring-2 focus:ring-[#6A71FA]/20"
                    placeholder={t('editGame.questions.searchPlaceholder') || 'Search questions…'}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => newQuestion()}
                  className="inline-flex items-center justify-center rounded-full bg-[#6A71FA] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 transition hover:bg-[#555ef6]"
                >
                  {t('editGame.questions.new') || 'New question'}
                </button>
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="flex h-32 items-center justify-center text-slate-500">
                  {t('common.loading') || 'Loading…'}
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                  {t('editGame.questions.empty') || 'No questions yet. Click “New question” to start.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {displayQuestions.map((q: any, idx: number) => {
                    const image = q.image_url || q.imageUrl || placeholderImg;
                    const secondsShort = t('editGame.secondsShort') || 'sec';
                    const pointsShort = t('editGame.pointsShort') || 'points';
                    const timeLabel = q.time ? `${q.time} ${secondsShort}` : `— ${secondsShort}`;
                    const scoreLabel = q.score ? `${q.score} ${pointsShort}` : `— ${pointsShort}`;
                    const correctIndex = Number(q.correct);
                    const correctLabel = Number.isFinite(correctIndex) && correctIndex >= 1 && correctIndex <= 4
                      ? String.fromCharCode(64 + correctIndex)
                      : null;
                    const altData = (['alt1', 'alt2', 'alt3', 'alt4'] as const).map((field, choiceIdx) => ({
                      key: field,
                      label: String.fromCharCode(65 + choiceIdx),
                      text: q[field] || '',
                      isCorrect: String(q.correct) === String(choiceIdx + 1),
                    }));

                    return (
                      <div
                        key={String(q.uuid || idx)}
                        draggable={!searchTerm.trim()}
                        onDragStart={() => onDragStart(idx)}
                        onDragOver={(e) => onDragOver(e as any, idx)}
                        onDragEnd={onDragEnd}
                        onDrop={() => onDrop(idx)}
                        className={`group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition hover:border-slate-300 hover:bg-slate-50 cursor-grab active:cursor-grabbing ${
                          hoverIndex === idx && dragIndex !== null ? 'border-[#6A71FA]/60 bg-slate-50' : ''
                        }`}
                      >
                        <div className="absolute inset-x-0 -top-1 mx-5 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 uppercase tracking-[0.2em]">
                                #{idx + 1}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                                {t('editGame.questions.time') || 'Time'}: {timeLabel}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                                {t('editGame.questions.score') || 'Score'}: {scoreLabel}
                              </span>
                              {correctLabel && (
                                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                                  {t('editGame.questions.correct') || 'Correct'}: {correctLabel}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => navigate('/home/edit/' + gameId + '/question/' + String(q.uuid))}
                              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              {t('editGame.questions.edit') || 'Edit question'}
                            </button>
                          </div>

                          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 h-48 lg:flex-[0_0_48%] lg:max-w-[420px] lg:h-[260px]">
                              <img src={image} alt="" className="h-full w-full object-cover object-center" />
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                                <h3 className="text-lg font-semibold text-white drop-shadow">
                                  {q.text || t('editGame.questions.untitled') || 'Untitled'}
                                </h3>
                                {q.description && (
                                  <p className="text-sm text-white/85 drop-shadow line-clamp-2">
                                    {q.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-3 lg:min-h-[260px]">
                              <div className="grid gap-2 text-sm font-medium">
                                {altData.map(({ key, label, text, isCorrect }) => (
                                  <div
                                    key={key}
                                    className={`relative overflow-hidden rounded-2xl border px-3 py-2 ${
                                      isCorrect
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_8px_24px_rgba(16,185,129,0.18)]'
                                        : 'border-slate-200 bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                                      {label}
                                    </span>
                                    <span>{text?.trim() ? text : (t('editGame.questions.emptyOption') || '—')}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center justify-between text-xs text-slate-500 lg:mt-auto">
                                <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-1">
                                  <span>{t('editGame.questions.dragHint') || 'Drag to move'}</span>
                                </div>
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    className={`rounded-full border border-slate-200 bg-white p-1 text-slate-600 transition hover:bg-slate-50 ${
                                      idx === 0 ? 'opacity-40 cursor-not-allowed' : ''
                                    }`}
                                    onClick={() => moveQuestion(idx, idx - 1)}
                                    disabled={idx === 0}
                                    title={t('editGame.questions.moveUp') || 'Move up'}
                                  >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M7 14l5-5 5 5z" />
                                    </svg>
                                  </button>
                                  <button
                                    className={`rounded-full border border-slate-200 bg-white p-1 text-slate-600 transition hover:bg-slate-50 ${
                                      idx === displayQuestions.length - 1 ? 'opacity-40 cursor-not-allowed' : ''
                                    }`}
                                    onClick={() => moveQuestion(idx, idx + 1)}
                                    disabled={idx === displayQuestions.length - 1}
                                    title={t('editGame.questions.moveDown') || 'Move down'}
                                  >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M7 10l5 5 5-5z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                {t('editGame.questions.loadError') || 'There was an error loading questions. Please try again.'}
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={() => {
                  const ns = !showTrash;
                  setShowTrash(ns);
                  if (ns) getDeletedQuestions(gameId || '');
                }}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {showTrash ? (t('editGame.trash.hide') || 'Hide trash') : (t('editGame.trash.show') || 'Show trash')}
              </button>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-200/40">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,#45CC70,#0B6B3A)] bg-cover" />
            <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[linear-gradient(120deg,#45CC70,#0B6B3A)] bg-cover opacity-90" />
            <div className="relative">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {t('editGame.ai.title') || 'AI suggestions for new questions'}
                </h2>
                <p className="text-sm text-white/80 max-w-2xl">
                  {t('editGame.ai.subtitle') || 'Let Tavl AI suggest questions based on your quiz. When you like a suggestion, create it and fine-tune in the editor.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span>{t('editGame.ai.totalQuestions') || 'Questions total'}: {questions.length}</span>
                {game?.name && <span>{t('editGame.ai.titleLabel') || 'Title'}: {game.name}</span>}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,220px),minmax(0,200px),minmax(0,120px),auto]">
              <select
                value={aiModel}
                onChange={e => setAiModel(e.target.value)}
                className="rounded-full border border-white/40 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="llama3.2:3b-instruct-q4_K_M">{t('editGame.ai.modelFast') || 'llama3.2 3B (fast)'}</option>
                <option value="llama3.1:8b-instruct-q4_K_M">{t('editGame.ai.modelStandard') || 'llama3.1 8B'}</option>
                <option value="deepseek-r1:14b">{t('editGame.ai.modelDeep') || 'deepseek-r1 14B (thorough)'}</option>
              </select>
              <select
                value={aiDifficulty}
                onChange={e => setAiDifficulty(e.target.value as typeof aiDifficulty)}
                className="rounded-full border border-white/40 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="mixed">{t('editGame.ai.difficulty.mixed') || 'Mixed difficulty'}</option>
                <option value="easy">{t('editGame.ai.difficulty.easy') || 'Easy'}</option>
                <option value="medium">{t('editGame.ai.difficulty.medium') || 'Medium'}</option>
                <option value="hard">{t('editGame.ai.difficulty.hard') || 'Hard'}</option>
              </select>
              <input
                type="number"
                min={1}
                max={6}
                value={aiCount}
                onChange={e => setAiCount(Math.max(1, Math.min(6, Number(e.target.value) || 1)))}
                className="rounded-full border border-white/40 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <div className="flex items-center justify-end">
                <button
                  onClick={fetchAiQuestions}
                  disabled={aiLoading || !game?.name}
                  className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#2f2f55] shadow-lg shadow-emerald-200/50 transition hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? (t('editGame.ai.generating') || 'Generating…') : (t('editGame.ai.fetch') || 'Fetch suggestions')}
                </button>
              </div>
            </div>

            {aiError && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {aiError}
              </div>
            )}

            {(aiLoading || (aiProgress > 0 && aiProgress < 100)) && (
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-white/30 bg-black/20">
                <div
                  className="h-full bg-white/80 transition-all duration-100"
                  style={{ width: `${aiProgress}%` }}
                />
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {aiSuggestions.map((sug, index) => (
                  <div
                    key={`${sug.text}-${index}`}
                    className="group relative rounded-2xl border border-white/30 bg-white/15 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition hover:border-white/40 hover:bg-white/20"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{sug.text}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
                        <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-2 py-0.5">
                          {difficultyLabel(sug.difficulty)}
                        </span>
                        {sug.topic && (
                          <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-2 py-0.5">
                            {t('editGame.ai.topic') || 'Topic'}: {sug.topic}
                          </span>
                        )}
                        {typeof sug.time === 'number' && (
                          <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-2 py-0.5">
                            {t('editGame.questions.time') || 'Time'}: {Math.round(sug.time)} {t('editGame.secondsShort') || 'sec'}
                          </span>
                        )}
                        {typeof sug.score === 'number' && (
                          <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-2 py-0.5">
                            {t('editGame.questions.score') || 'Score'}: {Math.round(sug.score)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => createFromSuggestion(sug, index)}
                        className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#2f2f55] shadow transition hover:bg-white/90"
                      >
                        {t('editGame.ai.createAndEdit') || 'Create and edit'}
                      </button>
                      <button
                        onClick={() => copySuggestion(sug.text)}
                        className="inline-flex items-center rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/25"
                      >
                        {t('editGame.ai.copyText') || 'Copy text'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!aiLoading && aiSuggestions.length === 0 && !aiError && (
              <div className="mt-6 rounded-2xl border border-dashed border-white/40 bg-white/15 p-6 text-sm text-white/85">
                {t('editGame.ai.empty') || 'No suggestions yet. Make sure the quiz has a title (and optionally a description), then click “Fetch suggestions”.'}
              </div>
            )}
            </div>
          </section>

          {showTrash && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {t('editGame.trash.title') || 'Deleted questions'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {t('editGame.trash.subtitle') || 'Restore questions removed by mistake.'}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {t('editGame.trash.count') || 'Count'}: {deletedQuestions.length}
                </span>
              </div>

              <div className="mt-5">
                {deletedQuestions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                    {t('editGame.trash.empty') || 'No deleted questions.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {deletedQuestions.map((dq: any) => (
                      <div
                        key={String(dq.uuid)}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
                      >
                        <div className="text-sm font-semibold text-slate-900 line-clamp-3">
                          {dq.text || t('editGame.questions.untitled') || 'Untitled'}
                        </div>
                        <button
                          onClick={() => restoreQuestion(String(dq.uuid))}
                          className="mt-4 inline-flex items-center rounded-full bg-[#6A71FA] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#555ef6]"
                        >
                          {t('editGame.trash.restore') || 'Restore'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default EditGame;

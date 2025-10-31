import { useEffect, useMemo, useState } from "react";
import { get, post, put } from "../api";
import { Question } from "./game";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import GlobalStyles from '../components/landing/GlobalStyles';
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";
import placeholderImg from "../images/tavl-placeholder.jpg";
import { useKeycloak } from "../auth/KeycloakProvider";

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
  const [aiProgress, setAiProgress] = useState(0);

  const difficultyLabel = (value?: string) => {
    switch ((value || '').toLowerCase()) {
      case 'easy':
      case 'lett':
        return 'Lett';
      case 'medium':
      case 'middels':
        return 'Middels';
      case 'hard':
      case 'vanskelig':
        return 'Vanskelig';
      default:
        return 'Blandet';
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
      if (!window.confirm('Er du sikker på at du vil slette denne quizen?')) return;
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
      setAiError('Quizen må ha et navn før AI kan foreslå spørsmål');
      return;
    }
    setAiLoading(true);
    setAiProgress(0);
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
      if (!resp.ok) throw new Error(`AI-respons feilet: ${resp.status}`);
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
        setAiError('Fant ingen forslag denne gangen. Prøv igjen med en annen prompt.');
      }
      setAiSuggestions(list);
    } catch (e: any) {
      setAiError(e?.message || 'Klarte ikke hente forslag');
      setAiSuggestions([]);
      setAiProgress(100);
    } finally {
      setAiLoading(false);
      const reset = setTimeout(() => setAiProgress(0), 600);
      return () => clearTimeout(reset);
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
        className="relative min-h-screen bg-[#1e1b4b] text-white overflow-hidden"
        style={{
          fontFamily:
            'Inter, "Plus Jakarta Sans", Poppins, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.35)_0%,transparent_60%),linear-gradient(to_bottom_right,#4f46e5,#9333ea,#ec4899)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse-slow" />
        <ParallaxOrbs />
        <ParallaxScroll />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16 space-y-10 mt-10">
          <section className="rounded-3xl border border-white/10 bg-white/10 p-6 sm:p-8 shadow-[0_25px_80px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(260px,320px)] lg:items-stretch">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">Rediger quiz</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
                      {game?.name || 'Quiz uten navn'}
                    </h1>
                  </div>
                  {game?.description && (
                    <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-3xl">
                      {game.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs font-semibold text-white/80">
                      Status: {(game as any)?.status || 'Ukjent'}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs font-semibold text-white/80">
                      Synlighet: {((game as any)?.isPublic ?? (game as any)?.is_public ?? 0) === 1 ? 'Offentlig' : 'Privat'}
                    </span>
                    {(game as any)?.created_by_name && (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs font-semibold text-white/80">
                        Av {(game as any)?.created_by_name}
                      </span>
                    )}
                    {(game as any)?.updated_at && (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs font-semibold text-white/80">
                        Oppdatert {new Date((game as any).updated_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/15 bg-white/8 p-4 text-center shadow-inner shadow-indigo-900/20">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Spørsmål</p>
                    <p className="mt-2 text-2xl font-bold text-white">{stats.totalQuestions}</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/8 p-4 text-center shadow-inner shadow-indigo-900/20">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Total tid (sek)</p>
                    <p className="mt-2 text-2xl font-bold text-white">{stats.totalTime}</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/8 p-4 text-center shadow-inner shadow-indigo-900/20">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Poengsum</p>
                    <p className="mt-2 text-2xl font-bold text-white">{stats.totalScore}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={startGameInstance}
                    disabled={starting || !userId}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:shadow-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {starting ? 'Starter…' : 'Start quiz'}
                  </button>
                  <button
                    onClick={() => navigate('/home')}
                    className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/20"
                  >
                    Til oversikt
                  </button>
                  <button
                    onClick={() => navigate('/home/update/' + gameId)}
                    className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/20"
                  >
                    Rediger metadata
                  </button>
                  <button
                    onClick={deleteGame}
                    className="inline-flex items-center rounded-full border border-rose-300/50 bg-rose-500/25 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/35"
                  >
                    Slett quiz
                  </button>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 shadow-[0_18px_60px_rgba(15,23,42,0.45)]">
                <img src={coverImage} alt="" className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {!((game as any)?.cover_image_url || (game as any)?.coverImageUrl) && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/60">
                    Ingen forsidebilde
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
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/8 p-6 sm:p-8 shadow-[0_20px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Spørsmål</h2>
                <p className="text-sm text-white/60">
                  Dra kort for å endre rekkefølge, eller bruk pilene for presist grep.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
                <div className="relative w-full sm:w-64 md:w-72">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM10 16a6 6 0 110-12 6 6 0 010 12z" />
                    </svg>
                  </span>
                  <input
                    className="w-full rounded-full border border-white/15 bg-white/10 py-2.5 pl-11 pr-5 text-sm font-medium text-white placeholder:text-white/50 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-pink-400/40"
                    placeholder="Søk i spørsmål…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => newQuestion()}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/40"
                >
                  Nytt spørsmål
                </button>
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="flex h-32 items-center justify-center text-white/60">Laster…</div>
              ) : filteredQuestions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-white/70">
                  Ingen spørsmål enda. Klikk «Nytt spørsmål» for å starte.
                </div>
              ) : (
                <div className="space-y-4">
                  {displayQuestions.map((q: any, idx: number) => {
                    const image = q.image_url || q.imageUrl || placeholderImg;
                    const timeLabel = q.time ? `${q.time} sek` : '— sek';
                    const scoreLabel = q.score ? `${q.score} poeng` : '— poeng';
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
                        className={`group relative rounded-2xl border border-white/12 bg-white/10 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.45)] transition hover:border-white/20 hover:bg-white/14 cursor-grab active:cursor-grabbing ${
                          hoverIndex === idx && dragIndex !== null ? 'border-pink-400/60 bg-white/16' : ''
                        }`}
                      >
                        <div className="absolute inset-x-0 -top-1 mx-5 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/70">
                              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 uppercase tracking-[0.2em]">
                                #{idx + 1}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1">
                                Tid: {timeLabel}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1">
                                Poeng: {scoreLabel}
                              </span>
                              {correctLabel && (
                                <span className="inline-flex items-center rounded-full border border-emerald-300/45 bg-emerald-500/25 px-3 py-1 text-emerald-100">
                                  Fasit: {correctLabel}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => navigate('/home/edit/' + gameId + '/question/' + String(q.uuid))}
                              className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/18"
                            >
                              Rediger spørsmålet
                            </button>
                          </div>

                          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/30 h-48 lg:flex-[0_0_48%] lg:max-w-[420px] lg:h-[260px]">
                              <img src={image} alt="" className="h-full w-full object-cover object-center" />
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                                <h3 className="text-lg font-semibold text-white drop-shadow">
                                  {q.text || 'Uten tittel'}
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
                                        ? 'border-emerald-300/45 bg-emerald-400/20 text-emerald-100 shadow-[0_14px_35px_rgba(16,185,129,0.35)]'
                                        : 'border-white/12 bg-white/6 text-white/85'
                                    }`}
                                  >
                                    <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                                      {label}
                                    </span>
                                    <span>{text?.trim() ? text : '—'}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center justify-between text-xs text-white/60 lg:mt-auto">
                                <div className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-2 py-1">
                                  <span>Dra for å flytte</span>
                                </div>
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    className={`rounded-full border border-white/15 bg-white/8 p-1 text-white transition hover:bg-white/14 ${
                                      idx === 0 ? 'opacity-40 cursor-not-allowed' : ''
                                    }`}
                                    onClick={() => moveQuestion(idx, idx - 1)}
                                    disabled={idx === 0}
                                    title="Flytt opp"
                                  >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M7 14l5-5 5 5z" />
                                    </svg>
                                  </button>
                                  <button
                                    className={`rounded-full border border-white/15 bg-white/8 p-1 text-white transition hover:bg-white/14 ${
                                      idx === displayQuestions.length - 1 ? 'opacity-40 cursor-not-allowed' : ''
                                    }`}
                                    onClick={() => moveQuestion(idx, idx + 1)}
                                    disabled={idx === displayQuestions.length - 1}
                                    title="Flytt ned"
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
              <div className="mt-6 rounded-2xl border border-rose-400/40 bg-rose-500/20 p-4 text-sm font-semibold text-rose-100">
                Det oppstod en feil ved lasting av spørsmål. Prøv igjen senere.
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={() => {
                  const ns = !showTrash;
                  setShowTrash(ns);
                  if (ns) getDeletedQuestions(gameId || '');
                }}
                className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/20"
              >
                {showTrash ? 'Skjul papirkurv' : 'Vis papirkurv'}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/8 p-6 sm:p-8 shadow-[0_20px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">AI-forslag til nye spørsmål</h2>
                <p className="text-sm text-white/65 max-w-2xl">
                  La Tavl AI foreslå flere spørsmål basert på quizen. Når du liker et forslag kan du opprette det og finjustere i editoren.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                <span>Spørsmål totalt: {questions.length}</span>
                {game?.name && <span>Tittel: {game.name}</span>}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,220px),minmax(0,200px),minmax(0,120px),auto]">
              <select
                value={aiModel}
                onChange={e => setAiModel(e.target.value)}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              >
                <option value="llama3.2:3b-instruct-q4_K_M">llama3.2 3B (rask)</option>
                <option value="llama3.1:8b-instruct-q4_K_M">llama3.1 8B</option>
                <option value="deepseek-r1:14b">deepseek-r1 14B (grundig)</option>
              </select>
              <select
                value={aiDifficulty}
                onChange={e => setAiDifficulty(e.target.value as typeof aiDifficulty)}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
              >
                <option value="mixed">Blandet vanskelighetsgrad</option>
                <option value="easy">Lett</option>
                <option value="medium">Middels</option>
                <option value="hard">Vanskelig</option>
              </select>
              <input
                type="number"
                min={1}
                max={6}
                value={aiCount}
                onChange={e => setAiCount(Math.max(1, Math.min(6, Number(e.target.value) || 1)))}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
              <div className="flex items-center justify-end">
                <button
                  onClick={fetchAiQuestions}
                  disabled={aiLoading || !game?.name}
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? 'Genererer…' : 'Hent forslag'}
                </button>
              </div>
            </div>

            {aiError && (
              <div className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/20 px-4 py-3 text-sm font-semibold text-rose-100">
                {aiError}
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {aiSuggestions.map((sug, index) => (
                  <div
                    key={`${sug.text}-${index}`}
                    className="group relative rounded-2xl border border-white/12 bg-white/10 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.35)] transition hover:border-white/20 hover:bg-white/14"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white/90">{sug.text}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-2 py-0.5">
                          {difficultyLabel(sug.difficulty)}
                        </span>
                        {sug.topic && (
                          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-2 py-0.5">
                            Tema: {sug.topic}
                          </span>
                        )}
                        {typeof sug.time === 'number' && (
                          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-2 py-0.5">
                            Tid: {Math.round(sug.time)} sek
                          </span>
                        )}
                        {typeof sug.score === 'number' && (
                          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-2 py-0.5">
                            Poeng: {Math.round(sug.score)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => createFromSuggestion(sug, index)}
                        className="inline-flex items-center rounded-full bg-emerald-500/80 px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-emerald-500"
                      >
                        Opprett og rediger
                      </button>
                      <button
                        onClick={() => copySuggestion(sug.text)}
                        className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/12"
                      >
                        Kopier tekst
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!aiLoading && aiSuggestions.length === 0 && !aiError && (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/70">
                Ingen forslag ennå. Sørg for at quizen har et navn (og gjerne en beskrivelse), og klikk «Hent forslag» for å la AI hjelpe deg.
              </div>
            )}
          </section>

          {showTrash && (
            <section className="rounded-3xl border border-white/10 bg-white/8 p-6 sm:p-8 shadow-[0_20px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Slettede spørsmål</h2>
                  <p className="text-sm text-white/60">
                    Gjenopprett spørsmål som er fjernet ved et uhell.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                  Antall: {deletedQuestions.length}
                </span>
              </div>

              <div className="mt-5">
                {deletedQuestions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-white/65">
                    Ingen slettede spørsmål.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {deletedQuestions.map((dq: any) => (
                      <div
                        key={String(dq.uuid)}
                        className="rounded-2xl border border-white/12 bg-white/10 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.35)]"
                      >
                        <div className="text-sm font-semibold text-white line-clamp-3">
                          {dq.text || 'Uten tittel'}
                        </div>
                        <button
                          onClick={() => restoreQuestion(String(dq.uuid))}
                          className="mt-4 inline-flex items-center rounded-full bg-emerald-500/80 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500"
                        >
                          Gjenopprett
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default EditGame;

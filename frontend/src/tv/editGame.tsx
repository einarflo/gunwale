import { useEffect, useMemo, useState } from "react";
import { get, post, put } from "../api";
import { Question } from "./game";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import GlobalStyles from '../components/landing/GlobalStyles';
import ParallaxOrbs from "../components/ParallaxOrbs";
import ParallaxScroll from "../components/ParallaxScroll";

export interface GameItem {
  name: String;
  description: String;
  created_by: String;
  status: String;
}

const EditGame = () => {
  // get id from url params
  const { gameId } = useParams<{ gameId: string }>();

  const navigate = useNavigate();

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [game, setGame] = useState<GameItem>();

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

  const newQuestion = (
  ) => {
    post(`/game_question/`, {
        text: "",
        game_id: gameId,
        score: "1000",
        description: "",
        number_in_line: questions.length + 1,
        status: "created",
        time: "10",
        correct: "1",
        alt1: "",
        alt2: "",
        alt3: "",
        alt4: ""
      })
      .then((res) => {
        console.log(res);
        // Backend returns question uuid
        navigate('/home/edit/' + gameId + '/question/' + res.data);
      })
      .catch((err) => {
        console.log("Something fishy is going on");
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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3 max-w-3xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Rediger quiz</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
                  {game?.name || 'Quiz uten navn'}
                </h1>
                {game?.description && (
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed">{game.description}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/home')}
                  className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/20"
                >
                  Til oversikt
                </button>
                <button
                  onClick={newQuestion}
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/40"
                >
                  Nytt spørsmål
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

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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

            <div className="mt-8 relative">
              <div className="h-[2px] w-full bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.85)_12%,rgba(168,85,247,0.85)_28%,rgba(245,158,11,1)_50%,rgba(236,72,153,0.9)_72%,rgba(99,102,241,0.85)_88%,transparent_100%)]" />
              <div
                className="pointer-events-none absolute -top-4 left-0 right-0 h-12 bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.4)_12%,rgba(168,85,247,0.4)_28%,rgba(245,158,11,0.55)_50%,rgba(236,72,153,0.4)_72%,rgba(99,102,241,0.4)_88%,transparent)] blur-2xl"
                aria-hidden
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/8 p-6 sm:p-8 shadow-[0_20px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Spørsmål</h2>
                <p className="text-sm text-white/60">
                  Dra kort for å endre rekkefølge, eller bruk pilene for presist grep.
                </p>
              </div>
              <div className="relative w-full sm:w-auto">
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
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="flex h-32 items-center justify-center text-white/60">Laster…</div>
              ) : filteredQuestions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-white/70">
                  Ingen spørsmål enda. Klikk «Nytt spørsmål» for å starte.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {displayQuestions.map((q: any, idx: number) => (
                    <div
                      key={String(q.uuid || idx)}
                      draggable={!searchTerm.trim()}
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e as any, idx)}
                      onDragEnd={onDragEnd}
                      onDrop={() => onDrop(idx)}
                      className={`group relative rounded-2xl border border-white/12 bg-white/10 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.45)] transition hover:border-white/20 hover:bg-white/14 ${
                        hoverIndex === idx && dragIndex !== null ? 'border-pink-400/60 bg-white/16' : ''
                      }`}
                    >
                      <div className="absolute inset-x-0 -top-1 mx-5 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/70">
                              #{idx + 1}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-indigo-300/40 bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-100">
                              {q.time || '—'} sek
                            </span>
                            <span className="inline-flex items-center rounded-full border border-amber-300/40 bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-100">
                              {q.score || '—'} poeng
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold leading-snug text-white line-clamp-3">
                            {q.text || 'Uten tittel'}
                          </h3>
                          {q.description && (
                            <p className="text-sm text-white/65 line-clamp-2">{q.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate('/home/edit/' + gameId + '/question/' + String(q.uuid))}
                          className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/20"
                        >
                          Rediger
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-medium">
                        {(['alt1', 'alt2', 'alt3', 'alt4'] as const).map((field, choiceIdx) => {
                          const isCorrect = String(q.correct) === String(choiceIdx + 1);
                          const label = ['A', 'B', 'C', 'D'][choiceIdx];
                          return (
                            <div
                              key={field}
                              className={`rounded-xl border px-3 py-2 ${
                                isCorrect
                                  ? 'border-emerald-300/45 bg-emerald-400/20 text-emerald-100 shadow-inner shadow-emerald-900/25'
                                  : 'border-white/12 bg-white/6 text-white/80'
                              }`}
                            >
                              {label}: {q[field] || '—'}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
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
                  ))}
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
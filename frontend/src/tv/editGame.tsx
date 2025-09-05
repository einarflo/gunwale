import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { get, post, put } from "../api";
import { Question } from "./game";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import GlobalStyles from '../components/landing/GlobalStyles';
import AnimatedGradientBackground from '../components/landing/AnimatedGradientBackground';

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

  // No inline save; full edits happen on question page

  const restoreQuestion = async (uuid: string) => {
    try {
      await put(`/game_question/restore/${uuid}`, {});
      getQuestionsForGameId(gameId || '');
      getDeletedQuestions(gameId || '');
    } catch (e) {
      console.log('Failed to restore question', uuid);
    }
  };

  return (
    <>
      <GlobalStyles />
      <AnimatedGradientBackground />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="glass rounded-3xl p-8 shadow-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <div className="text-3xl font-extrabold text-blue-800">{game?.name || 'Quiz'}</div>
              {game?.description && (
                <div className="text-gray-600 mt-1">{game.description}</div>
              )}
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button onClick={newQuestion} className="rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-5 py-2 text-white font-bold shadow hover:scale-105 transition">
                Nytt spørsmål
              </button>
              <button onClick={() => navigate('/home/update/' + gameId)} className="rounded-xl bg-white px-5 py-2 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">
                Rediger quiz
              </button>
              <button onClick={deleteGame} className="rounded-xl bg-white px-5 py-2 text-red-600 font-semibold shadow border-2 border-red-200 hover:bg-red-50 transition">
                Slett quiz
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-semibold text-gray-700">Spørsmål</div>
            <input
              className="px-4 py-2 rounded-xl border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base bg-white/80 shadow"
              placeholder="Søk i spørsmål..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32 text-gray-500">Laster...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-gray-600">Ingen spørsmål enda. Klikk «Nytt spørsmål» for å starte.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayQuestions.map((q: any, idx: number) => (
                <div
                  key={String(q.uuid || idx)}
                  draggable={!searchTerm.trim()}
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e as any, idx)}
                  onDragEnd={onDragEnd}
                  onDrop={() => onDrop(idx)}
                  className={`relative rounded-2xl bg-white p-5 border-2 ${hoverIndex === idx && dragIndex !== null ? 'border-blue-400' : 'border-blue-200'} hover:border-blue-300 shadow-sm hover:shadow transition`}
                >
                  {/* Drag handle and position badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 text-gray-500">
                    <span className="inline-block rounded-full bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1">Nummer: {idx + 1}</span>
                    <span className="inline-block rounded-full bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1">Tid: {q.time || '—'}</span>
                    <span className="inline-block rounded-full bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1">Poeng: {q.score || '—'}</span>
                  </div>
                  <div className="flex items-start justify-between mb-2 mt-6">
                    <div className="text-lg font-bold text-blue-800 line-clamp-2">{q.text || 'Uten tittel'}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className={`rounded-xl px-3 py-2 text-sm ${q.correct === '1' ? 'bg-green-100 text-green-800 font-semibold' : 'bg-gray-100 text-gray-700'}`}>A: {q.alt1 || '—'}</div>
                    <div className={`rounded-xl px-3 py-2 text-sm ${q.correct === '2' ? 'bg-green-100 text-green-800 font-semibold' : 'bg-gray-100 text-gray-700'}`}>B: {q.alt2 || '—'}</div>
                    <div className={`rounded-xl px-3 py-2 text-sm ${q.correct === '3' ? 'bg-green-100 text-green-800 font-semibold' : 'bg-gray-100 text-gray-700'}`}>C: {q.alt3 || '—'}</div>
                    <div className={`rounded-xl px-3 py-2 text-sm ${q.correct === '4' ? 'bg-green-100 text-green-800 font-semibold' : 'bg-gray-100 text-gray-700'}`}>D: {q.alt4 || '—'}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      className={`rounded bg-white border text-gray-700 text-sm font-semibold px-3 py-1 hover:bg-gray-50 ${idx === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                      onClick={() => moveQuestion(idx, idx - 1)}
                      disabled={idx === 0}
                      title="Flytt opp"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>
                    </button>
                    <button
                      className={`rounded bg-white border text-gray-700 text-sm font-semibold px-3 py-1 hover:bg-gray-50 ${idx === (displayQuestions.length - 1) ? 'opacity-40 cursor-not-allowed' : ''}`}
                      onClick={() => moveQuestion(idx, idx + 1)}
                      disabled={idx === (displayQuestions.length - 1)}
                      title="Flytt ned"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                    </button>
                    <button
                      onClick={() => navigate('/home/edit/' + gameId + '/question/' + String(q.uuid))}
                      className="ml-auto rounded bg-blue-600 text-white text-sm font-semibold px-3 py-1 hover:bg-blue-700"
                    >
                      Rediger
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Dra og hold over kort for å forhåndsvise plassering, eller bruk pilene. Slipp for å lagre rekkefølge.</div>
                </div>
              ))}
            </div>
          )}

          {error && <div className="text-red-600 font-semibold mt-4">Det har oppstått en feil...</div>}
          <div className="mt-8">
            <button
              onClick={() => { const ns = !showTrash; setShowTrash(ns); if (ns) getDeletedQuestions(gameId || ''); }}
              className="rounded-xl bg-white px-5 py-2 text-gray-700 font-semibold shadow border-2 border-gray-200 hover:bg-gray-50 transition"
            >
              {showTrash ? 'Skjul papirkurv' : 'Vis papirkurv'}
            </button>
          </div>

          {showTrash && (
            <div className="mt-4">
              <div className="text-lg font-semibold text-gray-700 mb-2">Slettede spørsmål</div>
              {deletedQuestions.length === 0 ? (
                <div className="text-gray-500">Ingen slettede spørsmål</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deletedQuestions.map((dq: any) => (
                    <div key={String(dq.uuid)} className="rounded-2xl bg-white p-4 border-2 border-gray-200">
                      <div className="font-semibold text-gray-800">{dq.text || 'Uten tittel'}</div>
                      <button onClick={() => restoreQuestion(String(dq.uuid))} className="mt-2 rounded bg-green-600 text-white text-sm font-semibold px-3 py-1 hover:bg-green-700">Gjenopprett</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditGame;

const Container = styled.div`
  display: flex;
  margin: 10px;
  margin-top: 0px;

`;

const Heading = styled.div`
  font-size: 2.5rem;
  #font-weight: bold;
  color: #05212f;
  font-family: sans-serif;
  padding: 31px;
  padding-bottom: 0px;
  font-family: "Coll";
`;

const Recent = styled.div`
  font-size: 1.5rem;
  color: #05212f70;
  font-family: sans-serif;
  padding-left: 31px;
  padding-bottom: 0px;
  font-family: "Coll";
`;

const Desc = styled.div`
  font-size: 1rem;
  #font-weight: bold;
  color: #05212f;
  font-family: sans-serif;
  padding: 31px;
  padding-top: 0px;

  font-family: "Coll";
`;

const QuizActions = styled.div`
  display: flex;
  padding: 31px;
  padding-top: 5px;
`;

const QuestionsList = styled.div`
  margin-top: 0px;
  width: 80%;
  max-width: 1000px;
  padding: 21px;
`;

const QuestionContainer = styled.div`
  
  border-radius: 8px;
  border: 2px solid #2d3870;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  &:hover {
    border: 2px solid #2d387050;
  }
`;

const QuestionText = styled.div`
  font-size: 1.2rem;
  color: #05212f;
  font-weight: bold;
  margin-bottom: 8px;
`;

const QuestionDescription = styled.div`
  color: #2d3870;
`;

const QuestionMeta = styled.div`
  color: #2d3870;
  text-align: right;
`;

const Play = styled.div`
  background: #2d3870;
  margin: 0px;
  border-radius: 5px;
  padding: 8px;
  width: 120px;
  height: 30px;
  font-weight: bold;
cursor: pointer;
  color: white;
  border: 2px solid #2d3870;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  &:hover {
    border: 2px solid #2d387050;
    background: #2d387050;
  }
`;

const Home = styled.div`
  background: #ffffff;
  border: 2px solid #2d3870;
  margin: 0px;
  margin-right: 20px;
  border-radius: 5px;
  padding: 8px;
  width: 120px;
  height: 30px;
  font-weight: bold;
  cursor: pointer;
  color: #2d3870;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border: 2px solid #2d387050;
  }
`;

const Delete = styled.div`
  background: #fc0349;
  margin: 0px;
  border-radius: 5px;
  padding: 8px;
  width: 120px;
  height: 30px;
  font-weight: bold;
cursor: pointer;
  color: white;
  border: 2px solid #fc034970;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  &:hover {
    border: 2px solid #fc034950;
    background: #fc034950;
  }
`;

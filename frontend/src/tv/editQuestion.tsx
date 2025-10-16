import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { get, put, post } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import GlobalStyles from '../components/landing/GlobalStyles';
import AnimatedGradientBackground from '../components/landing/AnimatedGradientBackground';

export interface GameItem {
  name: String;
  description: String;
  created_by: String;
  status: String;
}

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
        setImageUrl(pres.publicUrl || null);
      }
    } catch (_) {
      setAiError('Opplasting feilet');
    }
  };

  return (
    <>
      <GlobalStyles />
      <AnimatedGradientBackground />
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="glass rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
            <div className="text-2xl md:text-3xl font-extrabold text-blue-800">Rediger spørsmål</div>
            <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-0">
              <button onClick={updateQuestion} className="rounded-lg md:rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-3 py-2 md:px-5 md:py-2 text-white text-sm md:text-base font-bold shadow hover:scale-105 transition">Lagre</button>
              <button onClick={() => navigate('/home/edit/' + gameId)} className="rounded-lg md:rounded-xl bg-white px-3 py-2 md:px-5 md:py-2 text-blue-700 text-sm md:text-base font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">Avbryt</button>
              <button onClick={deleteQuestion} className="rounded-lg md:rounded-xl bg-white px-3 py-2 md:px-5 md:py-2 text-red-600 text-sm md:text-base font-semibold shadow border-2 border-red-200 hover:bg-red-50 transition">Slett</button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32 text-gray-500">Laster...</div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              <div className="rounded-xl md:rounded-2xl bg-white p-4 md:p-5 border-2 border-blue-200 shadow-sm">
                <label className="block text-sm font-semibold text-blue-700 mb-1">Spørsmålstekst</label>
                <textarea className="w-full max-w-full rounded-lg md:rounded-xl border-2 border-blue-200 px-3 py-2 md:px-4 md:py-3 bg-white/80 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base" rows={3} placeholder="Skriv spørsmålet her..." value={text} onChange={e => setText(e.target.value)} />
                <label className="block text-sm font-semibold text-purple-700 mt-4 mb-1">Hint (valgfritt)</label>
                <input className="w-full max-w-full rounded-lg md:rounded-xl border-2 border-purple-200 px-3 py-2 md:px-4 md:py-3 bg-white/80 shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm md:text-base" placeholder="Kort hint" value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div className="rounded-xl md:rounded-2xl bg-white p-4 md:p-5 border-2 border-blue-200 shadow-sm">
                <div className="text-lg font-bold text-gray-700 mb-2">Alternativer</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {alternatives.map((alternative, index) => (
                    <label key={index}
                           onDrop={(e) => onAlternativeDrop(e, index)}
                           onDragOver={onAlternativeDragOver}
                           className={`flex items-center gap-2 rounded-lg md:rounded-xl px-3 py-2 border-2 ${String(index+1) === correctAlternative ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="correctAlternative"
                        checked={String(index+1) === correctAlternative}
                        onChange={() => handleCorrectAlternativeChange(index + 1)}
                      />
                      <span className="text-sm font-semibold text-gray-600 w-5">{String.fromCharCode(65+index)}:</span>
                      <input
                        className="flex-1 max-w-full rounded-md border border-gray-300 px-2 py-1 bg-white outline-none text-gray-800 text-sm md:text-base focus:ring-2 focus:ring-blue-400"
                        type="text"
                        placeholder={`Alternativ ${index + 1}`}
                        value={alternative || ''}
                        onChange={(e) => handleAlternativeChange(index, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* AI-forslag */}
              <div className="rounded-xl md:rounded-2xl bg-white p-4 md:p-5 border-2 border-emerald-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="text-lg font-bold text-gray-700">AI-forslag til alternativer</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-300 px-3 py-2 text-sm text-gray-800 hover:bg-blue-50 font-semibold max-w-[2000px] truncate"
                    >
                      <option value="llama3.2:3b-instruct-q4_K_M">llama3.2:3b-instruct (rask)</option>
                      <option value="llama3.1:8b-instruct-q4_K_M">llama3.1:8b-instruct</option>
                      <option value="deepseek-r1:14b">deepseek-r1:14b (treg)</option>
                    </select>
                    <button onClick={fetchAiOptions} disabled={aiLoading || !text.trim()} className="rounded-lg px-3 py-2 md:px-4 md:py-2 bg-emerald-600 text-white text-sm md:text-base font-semibold shadow disabled:opacity-50">
                      {aiLoading ? 'Henter…' : 'Foreslå alternativer'}
                    </button>
                  </div>
                </div>
                {(aiLoading || (aiProgress > 0 && aiProgress < 100)) && (
                  <div className="w-full h-2 bg-gray-100 rounded overflow-hidden mb-3">
                    <div className="h-full bg-emerald-500 transition-all duration-100" style={{ width: `${aiProgress}%` }} />
                  </div>
                )}
                {aiError && <div className="text-sm text-red-600 mb-2">{aiError}</div>}
                {!aiLoading && aiSuggestions.length === 0 && <div className="text-sm text-gray-500">Ingen forslag ennå. Skriv spørsmålet og trykk “Foreslå alternativer”.</div>}

                {aiSuggestions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiSuggestions.map((sug, i) => (
                      <div key={i}
                           draggable
                           onDragStart={(e) => onSuggestionDragStart(e, sug.text)}
                           className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 rounded-lg md:rounded-xl px-3 py-2 border-2 ${sug.isCorrect ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'} cursor-grab active:cursor-grabbing`}>
                        <div className="text-sm text-gray-800 truncate sm:max-w-[70%]" title={sug.text}>{sug.text}</div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
                            onClick={() => {
                              // Insert into first empty alternative or replace the shortest
                              const emptyIdx = alternatives.findIndex(a => !a || a.trim() === '');
                              const idx = emptyIdx !== -1 ? emptyIdx : 0;
                              handleAlternativeChange(idx, sug.text);
                              if (sug.isCorrect) setCorrectAlternative(String(idx + 1));
                            }}
                          >Sett inn</button>
                          {sug.isCorrect && (
                            <button
                              className="text-xs px-2 py-1 rounded border border-green-500 text-green-700"
                              onClick={() => {
                                const emptyIdx = alternatives.findIndex(a => !a || a.trim() === '');
                                const idx = emptyIdx !== -1 ? emptyIdx : 0;
                                handleAlternativeChange(idx, sug.text);
                                setCorrectAlternative(String(idx + 1));
                              }}
                            >Merk korrekt</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">Tips: Dra og slipp forslag inn i en av boksene over. Grønn ramme = foreslått fasit.</div>
              </div>

              {/* Bilde for spørsmålet */}
              <div className="rounded-xl md:rounded-2xl bg-white p-4 md:p-5 border-2 border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-gray-700">Bilde (valgfritt)</div>
                  <label className="rounded-lg bg-white border-2 border-blue-300 px-3 py-2 text-blue-700 text-sm font-semibold shadow hover:bg-blue-50 transition cursor-pointer">
                    Last opp
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f=e.target.files?.[0]; if (f) onUploadImage(f); }} />
                  </label>
                </div>
                {imageUrl ? (
                  <img src={imageUrl} alt="Spørsmålsbilde" className="rounded-xl w-full max-h-60 object-cover" />
                ) : (
                  <div className="text-sm text-gray-500">Ingen bilde valgt.</div>
                )}
              </div>

              <div className="rounded-xl md:rounded-2xl bg-white p-4 md:p-5 border-2 border-blue-200 shadow-sm">
                <label className="block text-sm font-semibold text-purple-700 mt-4 mb-1">Tid (sek)</label>
                <input className="w-full max-w-full rounded-lg md:rounded-xl border-2 border-purple-200 px-3 py-2 md:px-4 md:py-3 bg-white/80 shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm md:text-base" value={time} onChange={e => setTime(e.target.value)} />
                <label className="block text-sm font-semibold text-purple-700 mt-4 mb-1">Poeng</label>
                <input className="w-full max-w-full rounded-lg md:rounded-xl border-2 border-purple-200 px-3 py-2 md:px-4 md:py-3 bg-white/80 shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm md:text-base" value={score} onChange={e => setScore(e.target.value)} />
              </div>

              {error && <div className="text-red-600 font-semibold">Noe gikk galt eller mangler. Sjekk feltene over.</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditQuestion;

const Recent = styled.div`
  font-size: 1.5rem;
  color: #05212f70;
  font-family: sans-serif;
  padding-left: 31px;
  padding-bottom: 0px;
  font-family: "Coll";
`;

const NameInput = styled.input`
background: #ffffff;
border: 2px solid #2d3870;
margin: 31px;
border-radius: 5px;
padding: 8px;
width: 600px;
height: 30px;
color: #2d3870;
display: flex;
align-items: center;
justify-content: center;
font-family: "Coll";
font-size: 1rem;
`;

const DescriptionInput = styled.input`
background: #ffffff;
border: 2px solid #2d3870;
margin: 31px;
border-radius: 5px;
padding: 8px;
width: 600px;
height: 30px;
color: #2d3870;
display: flex;
align-items: center;
justify-content: center;
font-family: "Coll";
font-size: 1rem;
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

const TextInput = styled.input`
  background: #ffffff;
  border: 2px solid #2d3870;
  margin: 8px;
  border-radius: 5px;
  padding: 8px;
  width: 600px;
  height: 30px;
  color: #2d3870;
  font-family: "Coll";
  font-size: 1rem;
`;

const AlternativeContainer = styled.div`
  display: flex;
  align-items: center;
  padding-left: 23px;
`;

const RadioButton = styled.input`
  margin: 0 8px;
`;

const Actions = styled.div`
  display: flex;
  padding: 31px;
  padding-top: 31px;
`;

const Create = styled.div`
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

const Cancel = styled.div`
  background: #ffffff;
  border: 2px solid #2d3870;
  margin: 0px;
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

const ErrorMessage = styled.div`
  color: red;
  padding: 16px;
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
  margin-left: 20px;
  &:hover {
    border: 2px solid #fc034950;
    background: #fc034950;
  }
`;

import { useEffect, useState } from "react";
import styled from "styled-components";
import { get, put } from "../api";
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

  return (
    <>
      <GlobalStyles />
      <AnimatedGradientBackground />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="glass rounded-3xl p-8 shadow-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="text-3xl font-extrabold text-blue-800">Rediger spørsmål</div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button onClick={updateQuestion} className="rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-5 py-2 text-white font-bold shadow hover:scale-105 transition">Lagre</button>
              <button onClick={() => navigate('/home/edit/' + gameId)} className="rounded-xl bg-white px-5 py-2 text-blue-700 font-semibold shadow border-2 border-blue-200 hover:bg-blue-50 transition">Avbryt</button>
              <button onClick={deleteQuestion} className="rounded-xl bg-white px-5 py-2 text-red-600 font-semibold shadow border-2 border-red-200 hover:bg-red-50 transition">Slett</button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32 text-gray-500">Laster...</div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              <div className="rounded-2xl bg-white p-5 border-2 border-blue-200 shadow-sm">
                <label className="block text-sm font-semibold text-blue-700 mb-1">Spørsmålstekst</label>
                <textarea className="w-full rounded-xl border-2 border-blue-200 px-4 py-3 bg-white/80 shadow focus:outline-none focus:ring-2 focus:ring-blue-400" rows={3} placeholder="Skriv spørsmålet her..." value={text} onChange={e => setText(e.target.value)} />
                <label className="block text-sm font-semibold text-purple-700 mt-4 mb-1">Hint (valgfritt)</label>
                <input className="w-full rounded-xl border-2 border-purple-200 px-4 py-3 bg-white/80 shadow focus:outline-none focus:ring-2 focus:ring-purple-400" placeholder="Kort hint" value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div className="rounded-2xl bg-white p-5 border-2 border-blue-200 shadow-sm">
                <div className="text-lg font-bold text-gray-700 mb-2">Alternativer</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {alternatives.map((alternative, index) => (
                    <label key={index} className={`flex items-center gap-2 rounded-xl px-3 py-2 border-2 ${String(index+1) === correctAlternative ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="correctAlternative"
                        checked={String(index+1) === correctAlternative}
                        onChange={() => handleCorrectAlternativeChange(index + 1)}
                      />
                      <span className="text-sm font-semibold text-gray-600 w-5">{String.fromCharCode(65+index)}:</span>
                      <input
                        className="flex-1 bg-transparent outline-none text-gray-800"
                        type="text"
                        placeholder={`Alternativ ${index + 1}`}
                        value={alternative || ''}
                        onChange={(e) => handleAlternativeChange(index, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 border-2 border-blue-200 shadow-sm flex items-center gap-4">
                <label className="text-sm text-gray-700">Tid (sek)</label>
                <input className="w-20 rounded border border-blue-200 px-2 py-1" value={time} onChange={e => setTime(e.target.value)} />
                <label className="ml-2 text-sm text-gray-700">Poeng</label>
                <input className="w-24 rounded border border-purple-200 px-2 py-1" value={score} onChange={e => setScore(e.target.value)} />
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

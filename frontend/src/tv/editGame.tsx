import { useEffect, useState } from "react";
import styled from "styled-components";
import { get, post, put } from "../api";
import { Question } from "./game";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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
  const [game, setGame] = useState<GameItem>();

  useEffect(() => {
    if (!gameId) return;
    getQuestionsForGameId(gameId);
    getGame(gameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);
  
  const [questions, setQuestions] = useState<Array<Question>>([]);

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
        navigate('/home/question/' + res.data);
      })
      .catch((err) => {
        console.log("Something fishy is going on");
        setError(true);
      });
  };

   // Get all questions for the current game Id
   const getQuestionsForGameId = (id: String) => {
    get(`/game_question/${id}/`)
      .then(res => {
        if (res.data) {
          setQuestions(res.data);
      }})
      .catch(err => {
        console.log("Error when getting questions for game with id ", id);
      });
  }

     // Get game info
     const getGame = (id: String) => {
      get(`/game/${id}/`)
        .then(res => {
          if (res.data) {
            setGame(res.data);
        }})
        .catch(err => {
          console.log("Error when getting questions for game with id ", id);
        });
    }

    const deleteGame = () => {
      put(`/game/${gameId}/`, {
        deleted: "1"
      }, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
        .then(res => {
          console.log(res);
          navigate('/home');
        })
        .catch(err => {
          console.log("Something fishy is going on");
        });
    }

  return (
    <>
    <Heading>{game?.name}</Heading>
    <Desc>{game?.description}</Desc>
    <QuizActions>
      <Play onClick={newQuestion}>Add question</Play>
      <Home onClick={() => navigate('home/update/' + gameId)}>Edit</Home>
      <Delete onClick={() => deleteGame()}>Delete</Delete>
      {error && <div style={{ color: "red", padding: "10px" }}>Det har oppstått en feil...</div>}
    </QuizActions>
    <Recent>Questions</Recent>
    <Container>
      <QuestionsList>
          {questions.map((question, index) => (
            <QuestionContainer key={index} onClick={() => navigate('/home/question/' + question.id)}>
              <QuestionText>{question.text}</QuestionText>
              <QuestionDescription style={{ fontWeight: question.correct === "1" ? "bold" : "" }}>A: {question.alt1}</QuestionDescription>
              <QuestionDescription style={{ fontWeight: question.correct === "2" ? "bold" : "" }}>B: {question.alt2}</QuestionDescription>
              <QuestionDescription style={{ fontWeight: question.correct === "3" ? "bold" : "" }}>C: {question.alt3}</QuestionDescription>
              <QuestionDescription style={{ fontWeight: question.correct === "4" ? "bold" : "" }}>D: {question.alt4}</QuestionDescription>
              <QuestionMeta>Score: {question.score} - Time: {question.time}</QuestionMeta>
            </QuestionContainer>
          ))}
        </QuestionsList>
    </Container>
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
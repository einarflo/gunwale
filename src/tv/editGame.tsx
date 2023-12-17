import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Question } from "./game";

interface EditGameProps {
  gameId: String;
  cancel: () => void;
  edit: (id: String) => void;
}

export interface GameItem {
  name: String;
  description: String;
  created_by: String;
  status: String;
}

const EditGame = ({ gameId, cancel, edit }: EditGameProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [alternatives, setAlternatives] = useState(["", "", "", ""]);
  const [correctAlternative, setCorrectAlternative] = useState<Number>();
  const [error, setError] = useState(false);
  const [game, setGame] = useState<GameItem>();


  const [editName, setEditName] = useState<String>("");
  const [ediAlt1, setAlt1] = useState<String>("");
  const [ediAlt2, setAlt2] = useState<String>("");
  const [ediAlt3, setAlt3] = useState<String>("");
  const [ediAlt4, setAlt4] = useState<String>("");

  useEffect(() => {
    getQuestionsForGameId(gameId);
    getGame(gameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  
  const [questions, setQuestions] = useState<Array<Question>>([]);
  const [currentQ, setCurrentQ] = useState<String>("");

  const insertQuestion = (
    name: string,
    description: string,
    alternatives: string[],
    correctAlternative: Number = 1
  ) => {
    axios
      .post(`https://www.dogetek.no/api/api.php/game_question/`, {
        name: name,
        description: description,
        game_id: gameId,
        status: "created",
        alternatives: alternatives,
        correctAlternative: correctAlternative,
      })
      .then((res) => {
        console.log(res);
        edit(res.data.id);
      })
      .catch((err) => {
        console.log("Something fishy is going on");
        setError(true);
      });
  };

   // Get all questions for the current game Id
   const getQuestionsForGameId = (id: String) => {
    axios.get(`https://www.dogetek.no/api/api.php/game_question/${id}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
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
      axios.get(`https://www.dogetek.no/api/api.php/game/${id}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
        .then(res => {
          if (res.data) {
            setGame(res.data);
        }})
        .catch(err => {
          console.log("Error when getting questions for game with id ", id);
        });
    }

  const handleAlternativeChange = (index: number, value: string) => {
    const updatedAlternatives = [...alternatives];
    updatedAlternatives[index] = value;
    setAlternatives(updatedAlternatives);
  };

  const handleCorrectAlternativeChange = (index: number) => {
    setCorrectAlternative(index);
  };

  return (
    <>
    <Heading>{game?.name}</Heading>
    <Container>
      <QuestionsList>
          {questions.map((question, index) => (
            <QuestionContainer key={index} onClick={() => setCurrentQ(question.id)}>
              <QuestionText>{question.text}</QuestionText>
              <QuestionDescription style={{ fontWeight: question.correct === "1" ? "bold" : "" }}>A: {question.alt1}</QuestionDescription>
              <QuestionDescription style={{ fontWeight: question.correct === "2" ? "bold" : "" }}>B: {question.alt2}</QuestionDescription>
              <QuestionDescription style={{ fontWeight: question.correct === "3" ? "bold" : "" }}>C: {question.alt3}</QuestionDescription>
              <QuestionDescription style={{ fontWeight: question.correct === "4" ? "bold" : "" }}>D: {question.alt4}</QuestionDescription>
              <QuestionMeta>Score: {question.score} - Time: {question.time}</QuestionMeta>
            </QuestionContainer>
          ))}
        </QuestionsList>
      <Form>
        <TextInput
          placeholder="Question text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <AlternativesHeading>Alternatives:</AlternativesHeading>
        {alternatives.map((alternative, index) => (
          <AlternativeContainer key={index}>
            <TextInput
              type="text"
              placeholder={`Alternative ${index + 1}`}
              value={alternative}
              onChange={(e) => handleAlternativeChange(index, e.target.value)}
            />
            <RadioButton
              type="radio"
              name="correctAlternative"
              checked={correctAlternative === index}
              onChange={() => handleCorrectAlternativeChange(index)}
            />
          </AlternativeContainer>
        ))}
        <Actions>
          <CreateButton
            onClick={() =>
              insertQuestion(name, description, alternatives, correctAlternative)
            }
          >
            Save
          </CreateButton>
          <CancelButton onClick={cancel}>Delete</CancelButton>
        </Actions>
        {error && <ErrorMessage>Something went wrong, please try again!</ErrorMessage>}
      </Form>
    </Container>
    </>
  );
};

export default EditGame;

const Container = styled.div`
  display: flex;
  margin: 10px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  margin: 16px;
  height: 100%;
`;

const Heading = styled.div`
  font-size: 2.5rem;
  #font-weight: bold;
  color: #05212f;
  font-family: sans-serif;
  padding: 31px;
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

const AlternativesHeading = styled.div`
  font-size: 1.5rem;
  color: #05212f;
  font-family: sans-serif;
  padding: 16px;
`;

const AlternativeContainer = styled.div`
  display: flex;
  align-items: center;
`;

const RadioButton = styled.input`
  margin: 0 8px;
`;

const Actions = styled.div`
  display: flex;
  padding-top: 16px;
`;

const CreateButton = styled.button`
  background: #2d3870;
  border: none;
  border-radius: 5px;
  padding: 8px;
  width: 120px;
  font-weight: bold;
  cursor: pointer;
  color: white;
  margin-right: 20px;
`;

const CancelButton = styled.button`
  background: #ffffff;
  border: 2px solid #2d3870;
  border-radius: 5px;
  padding: 8px;
  width: 120px;
  font-weight: bold;
  cursor: pointer;
  color: #2d3870;
`;

const ErrorMessage = styled.div`
  color: red;
  padding: 16px;
`;

const QuestionsList = styled.div`
  margin-top: 20px;
  width: 50%;
`;

const QuestionsHeading = styled.div`
  font-size: 1.5rem;
  color: #05212f;
  font-family: sans-serif;
  padding: 16px;
`;

const QuestionContainer = styled.div`
  background: #f8f8f8;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 16px;
  cursor: pointer;
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
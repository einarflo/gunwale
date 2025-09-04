import { useEffect, useState } from "react";
import styled from "styled-components";
import { get, put } from "../api";
import { useNavigate, useParams } from "react-router-dom";

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
  const [correctAlternative, setCorrectAlternative] = useState<String>();
  const [error, setError] = useState(false);

  const { gameId, questionId } = useParams<{ gameId: string, questionId: string }>();
  
  const navigate = useNavigate();


  useEffect(() => {
    getQuestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const updateQuestion = (
  ) => {
    put(`/game_question/${questionId}/`, {
      text: text,
      score: "1000",
      description: description,
      time: "10",
      correct: correctAlternative,
      alt1: alternatives[0],
      alt2: alternatives[1],
      alt3: alternatives[2],
      alt4: alternatives[3]
      })
      .then((res) => {
        console.log(res);
        navigate('/home/edit/' + gameId);
      })
      .catch((err) => {
        console.log("Something fishy is going on");
        setError(true);
      });
  };

  const deleteQuestion = () => {
    put(`/game_question/${questionId}/`, {
      deleted: "1"
    }, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
      .then(res => {
        console.log(res);
        navigate('/home/edit/' + gameId);
      })
      .catch(err => {
        console.log("Something fishy is going on");
      });
  }

   const getQuestion = () => {
    get(`/game_question_by_id/${questionId}/`)
      .then(res => {
        if (res.data) {
          setAlternatives([res.data.alt1, res.data.alt2, res.data.alt3, res.data.alt4]);
          setText(res.data.text);
          setDescription(res.data.description);
          setCorrectAlternative(res.data.correct)
      }})
      .catch(err => {
        console.log("Error when getting question with id ", questionId);
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
    <Heading>Edit question</Heading>
    <NameInput placeholder="Question text" value={text} onChange={(e) => setText(e.target.value)} />
    <DescriptionInput placeholder="Hint" value={description} onChange={(e) => setDescription(e.target.value)} />
    <Recent>Alternatives</Recent>
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
              checked={Number(correctAlternative) -1  === index}
              onChange={() => handleCorrectAlternativeChange(index + 1)}
            />
          </AlternativeContainer>
        ))}
        <Actions>
            <Create onClick={() =>
              updateQuestion()}>Save</Create>
            <Cancel onClick={() => navigate('/home/edit' + gameId)}>Cancel</Cancel>
            <Delete onClick={() => deleteQuestion()}>Delete</Delete>
          </Actions>
        {error && <ErrorMessage>Something went wrong, please try again!</ErrorMessage>}
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
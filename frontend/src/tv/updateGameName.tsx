import { useEffect, useState } from "react";
import styled from "styled-components";
import { get, put } from "../api";

interface UpdateGameProps {
    gameId: String | undefined
    edit: (id: String) => void
}

const UpdateGame = ({gameId = "", edit}: UpdateGameProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, seterror] = useState(false);

     // Insert player in DB and set username
  const updateGame = (name: String, description: String) => {
    put(`/game/${gameId}/`, {
      name: name,
      description: description
    }, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
      .then(res => {
        console.log(res);
        edit(gameId)
      })
      .catch(err => {
        console.log("Something fishy is going on");
        seterror(true);
      });
  }

  const getGame = () => {
    get(`/game/${gameId}/`)
      .then(res => {
        if (res.data) {
          setDescription(res.data.description);
          setName(res.data.name);
      }})
      .catch(err => {
        console.log("Error when getting question with id ", gameId);
      });
  }

  useEffect(() => {
    getGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

    return (
        <>
        <Heading>Update quiz</Heading>
            <NameInput placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <DescriptionInput placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Actions>
            <Create onClick={() => updateGame(name, description)}>Update</Create>
            <Cancel onClick={() => edit(gameId)}>Cancel</Cancel>
            { error && "Something went wrong, please try again!" }
          </Actions>
          </>
    );
};

export default UpdateGame;

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
  font-family: "Coll";
`;

const Actions = styled.div`
  display: flex;
  padding: 31px;
  padding-top: 5px;
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
`;
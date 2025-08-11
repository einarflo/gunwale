import { useState } from "react";
import styled from "styled-components";
import { post } from "../api";
import { useKeycloak } from "../auth/KeycloakProvider";
import Ads from "../components/Ads";

interface NewGameProps {
    userid: String,
    cancel: () => void,
    edit: (id: String) => void
}

const NewGame = ({userid, cancel, edit}: NewGameProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, seterror] = useState(false);
    const { isPremium } = useKeycloak();

     // Insert player in DB and set username
  const insertQuestion = (name: String, description: String) => {
    post(`/game/`, {
      name: name,
      description: description,
      created_by: userid,
      status: "created"
    }, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
      .then(res => {
        console.log(res);
        edit(res.data)
      })
      .catch(err => {
        console.log("Something fishy is going on");
        seterror(true);
      });
  }

    return (
        <>
        
        <Heading>Create a new quiz</Heading>
            <NameInput placeholder="Name" onChange={(e) => setName(e.target.value)} />
            <DescriptionInput placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
          <Actions>
            <Create onClick={() => insertQuestion(name, description)}>Create quiz</Create>
            <Cancel onClick={cancel}>Cancel</Cancel>
            { error && "Something went wrong, please try again!" }
          </Actions>
          { !isPremium && <Ads /> }
          </>
    );
};

export default NewGame;

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
  padding-bottom: 31px;
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
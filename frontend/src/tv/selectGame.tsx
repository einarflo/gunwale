import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { get } from "../api";
import Status from "../components/Status";
import Header from '../components/landing/Header';
import TVGamePlayView from "./game";
import Home from "./home";
import NewGame from "./createGame";
import EditGame from "./editGame";
import EditQuestion from "./editQuestion";
import UpdateGame from "./updateGameName";
import ProfilePage from "./profilePage";

interface CreateViewProps {
    username: String;
    logout: () => void;
}

export interface Game {
    favorite?: String;
    popular?: String;
    id: String;
    name: String;
    description: String;
    qcount: String;
    plays: String;
    username: String;
}

const TVView = ({ username, logout }: CreateViewProps) => {

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [games, setGames] = useState<Array<Game>>()
  const [gamePin, setGamePin] = useState<String | undefined>()
  const [gameId, setGameId] = useState<String | undefined>()
  const [gameInstanceId, setGameInstanceId] = useState<String | undefined>()
  const [page, setPage] = useState("home");
  const [userId, setUserId] = useState(25);
  const [editId, setEditId] = useState<String | undefined>(undefined);
  const [questionId, setQuestionId] = useState<String | undefined>(undefined);

  useEffect(() => {
    getUserInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const startGame = (_gameId: String, _gameInstanceId: String, _gamePin: String) => {
    setGameId(_gameId);
    setGameInstanceId(_gameInstanceId);
    setGamePin(_gamePin);
  }

  const stopGame = () => {
    setGameId(undefined);
    setGameInstanceId(undefined);
  }

  const getUserInfo = () => {
    get(`/users/${username}/`)
      .then(res => {
        if (res.data["username"] === username) {
          getGamesForUserId(res.data["id"])
          setUserId(res.data["id"]);
        }
        else {
          setError(true);
          setLoading(false);
        }
      })
      .catch(err => {
        console.log("Error when getting user info for ", username);
        setLoading(false);
        setError(true);
      });
  }

  const getGamesForUserId = (id: String) => {
    get(`/game_list/${id}/`)
      .then(res => {
        setLoading(false);
        if (res.data) {
          setGames(res.data);
        }
        else {
          setError(true);
        }
      })
      .catch(err => {
        console.log("Error when getting games for user");
        setLoading(false);
        setError(true);
      });
  }

    


  // Game selected: 
  if (gameId && gameInstanceId && gamePin) {
    return <TVGamePlayView gameId={gameId} gameInstanceId={gameInstanceId} gamePin={gamePin} stopGame={stopGame}/>
  }

  // List of available games
  return(
    <GameSelectionWrapper>
      
      <Header 
        username={String(username)}
        logout={logout}
      />
      <Content>
        <Status loading={loading} error={error} />
        { page === "home" && <Home userid={String(userId)} games={games} error={error} edit={(id: String) => {setEditId(id); setPage("edit")}} loading={loading} username={username} newGame={() => setPage("newgame")} discover={() => {}} startGame={startGame} /> }
        { page === "newgame" && <NewGame userid={String(userId)} edit={(id: String) => {setEditId(id); setPage("edit")}} cancel={() => setPage("home")} /> }
        { page === "edit" && editId && <EditGame gameId={editId} edit={(id: String) => {setQuestionId(id); setPage("question")}} update={(id: String) => {setEditId(id); setPage("update")}} cancel={() => {setPage("home"); setEditId(undefined);}} /> }
        { page === "question" && questionId && <EditQuestion gameId={editId} questionId={questionId} edit={(id: String) => {setEditId(id); setPage("edit")}} cancel={() => {setPage("home"); setQuestionId(undefined);}} /> }
        { page === "update" && editId && <UpdateGame gameId={editId} edit={(id: String) => {setEditId(id); setPage("edit")}} /> }
        { page === "profile" && <ProfilePage username={username} logout={logout} /> }
        </Content>
    </GameSelectionWrapper>)
}


const GameSelectionWrapper = styled.div`
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  
  #background: rgb(28,0,65);
  #background: linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(45,56,112,1) 0%, rgba(21,2,43,1) 100%); 
  display: block;
`;

const Content = styled.div`
  overflow: scroll;
`;


const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div`
width: 50px;
height: 50px;
margin-left: auto;
margin-right: auto;
left: 50%;
border: 3px solid rgba(255,255,255,.3);
border-radius: 50%;
border-top-color: #fff;
animation: spin 1s ease-in-out infinite;
-webkit-animation: ${rotate} 1s ease-in-out infinite;
`;




export default TVView;
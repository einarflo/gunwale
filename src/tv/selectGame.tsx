import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import logo from '../images/gw-logo-dark.png';
import TVGamePlayView from "./game";
import Home from "./home";
import NewGame from "./createGame";
import EditGame from "./editGame";

interface CreateViewProps {
    username: String,
    logout: () => void
}

export interface Game {
    id: String,
    name: String,
    description: String,
    qcount: String,
}

const TVView = ({ username, logout }: CreateViewProps) => {

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [games, setGames] = useState<Array<Game>>()
  const [playGame, setPlayGames] = useState<String | undefined>()
  const [page, setPage] = useState("home");
  const [userId, setUserId] = useState(25);
  const [editId, setEditId] = useState<String | undefined>(undefined);

  useEffect(() => {
    getUserInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserInfo = () => {
    axios.get(`https://www.dogetek.no/api/api.php/users/${username}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
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
    axios.get(`https://www.dogetek.no/api/api.php/game_list/${id}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
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
  if (playGame) {
    return <TVGamePlayView id={playGame} stopGame={() => setPlayGames(undefined)}/>
  }

  // List of available games
  return(
    <GameSelectionWrapper>
      <SideBarNav>
        <Logo src={logo}></Logo>
        <NavItem onClick={() => setPage("home")}>Home</NavItem>
        <NavItem onClick={() => setPage("library")}>Library</NavItem>
        <NavItem onClick={() => setPage("discover")}>Discover</NavItem>
        <NavItem onClick={() => setPage("settings")}>Settings</NavItem>
      </SideBarNav>
      <Content>
        <Header>
          <Username>{username}</Username>
          <Logout onClick={logout}>Logout</Logout>
        </Header>
        { page === "home" && <Home games={games} error={error} edit={(id: String) => {setEditId(id); setPage("edit")}} loading={loading} username={username} newGame={() => setPage("newgame")} discover={() => {}} setPlayGames={setPlayGames}/> }
        { page === "newgame" && <NewGame userid={String(userId)} edit={(id: String) => {setEditId(id); setPage("edit")}} cancel={() => setPage("home")} /> }
        { page === "edit" && editId && <EditGame gameId={editId} edit={() => {}} cancel={() => setPage("home")} /> }
        </Content>
    </GameSelectionWrapper>)
}


const GameSelectionWrapper = styled.div`
  height: 100vh;
  width: 100vw;
  
  #background: rgb(28,0,65);
  #background: linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(45,56,112,1) 0%, rgba(21,2,43,1) 100%); 
  display: flex;
`;

const SideBarNav = styled.div`
  height: 100vh;
  width: 260px;
  background: #ffffff;
  border-right: 2px solid #2d387050;
`;

const NavItem = styled.div`
  font-weight: normal;
  font-family: "Coll";
  padding-left: 45px;
  font-size: 1.3rem;
  padding-bottom: 25px;
  cursor: pointer;
`;

const Content = styled.div`
  overflow: scroll;
`;



const Header = styled.div`
  height: 82px;
  width: calc(100vw - 260px);
  background: #ffffff;
  /* border-bottom: 2px solid #2d387050; */
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  border-radius: 5px;
  padding: 10px;
  padding-right: 40px;
  padding-left: 40px;
  font-weight: bold;
  color: white;
  height 60px;
  padding-bottom: 50px;
`;

const Username = styled.div`
  margin-left: auto;
  flex: auto;
  text-align: right;
  padding-right: 20px;
  font-weight: bold;
`;

const Logout = styled.div`
  background: #ffffff;
  margin: 18px;
  border-radius: 5px;
  padding: 10px;
  font-weight: bold;
  color:  #2d3870;
  cursor: pointer;
  margin-left: auto;
  border: 2px solid #2d3870;
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
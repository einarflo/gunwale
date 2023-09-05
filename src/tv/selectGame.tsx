import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import logo from '../images/gw-logo-dark.png';
import TVGamePlayView from "./game";

interface CreateViewProps {
    username: String,
    logout: () => void
}

interface Game {
    id: String,
    name: String,
    description: String
}

const TVView = ({ username, logout }: CreateViewProps) => {

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [games, setGames] = useState<Array<Game>>()
  const [playGame, setPlayGames] = useState<String | undefined>()

  useEffect(() => {
    getUserInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserInfo = () => {
    axios.get(`https://www.dogetek.no/api/api.php/users/${username}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        if (res.data["username"] === username) {
          getGamesForUserId(res.data["id"])
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
    axios.get(`https://www.dogetek.no/api/api.php/games/${id}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
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
      <Header>
        <Logo src={logo}></Logo>
        <Logout onClick={logout}>Logout</Logout>
      </Header>
        { loading ? 
            <Spinner/> 
          :
            <>
              {error && <div>An error has occured</div>}
              {games?.map(game => <GameInst onClick={() => setPlayGames(game.id)}>{game.name}</GameInst>)}
            </>
        }
    </GameSelectionWrapper>)
}

const GameSelectionWrapper = styled.div`
  height: 100vh;
  width: 100vw;
  
  background: rgb(28,0,65);
  background: linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(45,56,112,1) 0%, rgba(21,2,43,1) 100%); 
`;

const Header = styled.div`
  height: 90px;
  width: 100vw;
  background: #ffffff;
`;

const Logo = styled.img`
  border-radius: 5px;
  padding: 10px;
  position: absolute;
  font-weight: bold;
  color: white;
  height 60px;
`;

const Logout = styled.div`
  background: #2d3870;
  margin: 20px;
  border-radius: 5px;
  padding: 10px;
  position: absolute;
  font-weight: bold;
  right: 0;
  color: white;
`;

const GameInst = styled.div`
  height: 50px;
  margin: 20px;
  font-size: 2rem;
  color: #000000;
  text-align: center;
  background: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  max-width: 500px;
  margin-right: auto;
  margin-left: auto;
  left: 50%;
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
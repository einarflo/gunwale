import styled from "styled-components";
import { Game, Spinner } from "./selectGame";
import GameListItem from "./gameListItem";

interface HomeProps {
    games: Game[] | undefined,
    username: String,
    newGame: () => void,
    discover: () => void,
    setPlayGames: (id: String) => void,
    loading: boolean,
    error: boolean,
    edit: (id: String) => void;
}

const Home = ({username, games, newGame, discover, loading, setPlayGames, error, edit}: HomeProps) => {
    return (
        <>
        <Welcome>Welcome, {username}!</Welcome>
          <Actions>
            <New onClick={newGame}>+ New quiz</New>
            <Discover onClick={discover}>Discover</Discover>
          </Actions>
          <Recent>Recently played</Recent>
          <RecentItems>
          { loading ? 
              <Spinner/> 
            :
              <>
                {error && <div>An error has occured</div>}
                {games?.map(game => <GameListItem onClick={() => setPlayGames(game.id)} edit={edit} game={game}/>)}
              </>
          }
          </RecentItems>
          </>
    );
};

export default Home;

const RecentItems = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const New = styled.div`
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

const Discover = styled.div`
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

const Actions = styled.div`
  display: flex;
  padding: 31px;
  padding-top: 5px;
`;

const Welcome = styled.div`
  font-size: 2.5rem;
  #font-weight: bold;
  color: #05212f;
  font-family: sans-serif;
  padding: 31px;
  font-family: "Coll";
`;

const Recent = styled.div`
  font-size: 1.5rem;
  color: #05212f70;
  font-family: sans-serif;
  padding: 31px;
  padding-bottom: 0px;
  font-family: "Coll";
`;

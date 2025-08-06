import styled from "styled-components";
import { Game, Spinner } from "./selectGame";
import GameListItem from "./gameListItem";
import Modal from "react-modal";
import { useState } from "react";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import WhiteButton from "../components/WhiteButton";
import randomstring from 'randomstring';
import { post } from "../api";

interface HomeProps {
    games: Game[] | undefined,
    userid: String,
    username: String,
    newGame: () => void,
    discover: () => void,
    startGame: (gameId: String, gameInstanceId: String, gamePin: String) => void,
    loading: boolean,
    error: boolean,
    edit: (id: String) => void;
}

const Home = ({ userid, username, games, newGame, discover, loading, startGame, error, edit}: HomeProps) => {

  const [modalIsOpen, setModalIsOpen] = useState(false);
	const [selectedGameId, setSelectedGameId] = useState<String>();

	const [watingForCreateGame, setWaitingForCreateGame] = useState(false);
	const [newGamePin, setNewGamePin] = useState('');

	const createNewGameInstance = (gameId: String, gamePin: String) => {
		setWaitingForCreateGame(true);
                        post(`/game_instance/`, {
                                game_id: gameId,
                                game_pin: gamePin,
                                status: 'created',
                                created_by: userid
                        }, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
				.then(res => {
					console.log('gameInstanceId:', res.data);

					setWaitingForCreateGame(false);
					//setPlayGames(selectedGameId || '')
					startGame(gameId, res.data, gamePin);
				})
				.catch(err => {
					console.log("Something fishy is going on");
					//seterror(true);
					setWaitingForCreateGame(false);
				});

	}

    return (
        <>
        <Header>
          <Welcome>Welcome, {username}!</Welcome>
          <Actions>
            <WhiteButton click={newGame} text="New quiz"></WhiteButton>
          </Actions>
        </Header>
        
          <Recent>Your games</Recent>
          <RecentItems>
          { loading ? 
              <Spinner/> 
            :
              <>
                {error && <div>An error has occured</div>}
                {games?.map(game => <GameListItem onClick={() => {setSelectedGameId(game.id); setModalIsOpen(true)}} edit={edit} game={game}/>)}
              </>
          }
          </RecentItems>
          <Modal
        isOpen={modalIsOpen}
        onAfterOpen={() => {
					setNewGamePin(randomstring.generate({
						charset: ['numeric'],
						readable: true,
						length: 5
					}))
				}}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
					overlay: {
						position: 'fixed',
						top: 0 + '82px',
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(255, 255, 255, 0.75)'
					},
					content: {
						top: '40%',
						left: '50%',
						right: 'auto',
						bottom: 'auto',
						marginRight: '-50%',
						transform: 'translate(-50%, -50%)',
						borderRadius: '15px',
						border: 'none',
						color: 'white',
						fontFamily: "Coll",
						backgroundImage: 'linear-gradient(180deg, #6A71FA 0%, #9C8AFA 100%)',
						width: '70%',
						maxWidth: '1000px'
					},
				}}
        contentLabel="Game options"
      >
				<Content>
					<Left>
						<Heading>{games?.find(game => game.id == selectedGameId)?.name}</Heading>
						<Username>by {games?.find(game => game.id == selectedGameId)?.username}</Username>
						<div>{games?.find(game => game.id == selectedGameId)?.qcount} question{ games?.find(game => game.id == selectedGameId)?.qcount !== '1' && 's' }</div>
						<WhiteButton text="Edit game" click={() => edit(selectedGameId || '')} />
					</Left>
					<Right>
						<NewPin>{newGamePin}</NewPin>
						<PrimaryButton text="Start game" click={() => createNewGameInstance(selectedGameId || '0', newGamePin)} loading={watingForCreateGame}/>
					</Right>
				</Content>
      </Modal>
          </>
    );
};

export default Home;

const Heading = styled.div`
	color: white;
	font-family: "Coll";
	font-size: 2.5rem;
  padding-top: 20px;
  padding-left: 20px;
`;

const Left = styled.div`
	display: block;
	width: 50%;
`;

const Right = styled.div`
	display: block;
	width: 50%;
	margin: 20px;
	border-radius: 15px;
	background: white;
`;

const Content = styled.div`
	display: flex;
`;

const NewPin = styled.div`
	color: #9f9f9f;
	font-family: "Coll";
	font-size: 2.5rem;
	text-align: center;
	padding-top: 10px;
`;

const Header = styled.div`
    color: white;
    font-family: "Coll";
    padding: 30px;
    background-image: linear-gradient(180deg, #6A71FA 0%, #9C8AFA 100%);
  width: 100%;
`;

const Username = styled.div`
	color: #ffffff90;
	font-family: "Coll";
	font-size: 1.5rem;
	padding-left: 20px;
`;

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
  &:hover {
    border: 2px solid #2d387050;
    background: #2d387050;
  }
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
  &:hover {
    border: 2px solid #2d387050;
  }
`;

const Actions = styled.div`
  display: flex;
  padding: 31px;
  padding-top: 5px;
`;

const Welcome = styled.div`
  font-size: 2.5rem;
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

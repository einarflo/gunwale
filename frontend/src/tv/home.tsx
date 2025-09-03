import { Game, Spinner } from "./selectGame";
import Modal from "react-modal";
import { useState } from "react";
import randomstring from 'randomstring';
import { post } from "../api";
import GlobalStyles from '../components/landing/GlobalStyles';
import AnimatedGradientBackground from '../components/landing/AnimatedGradientBackground';

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
                        post(`/game_instance/`, JSON.stringify({
                                game_id: gameId,
                                game_pin: gamePin,
                                status: 'created',
                                created_by: userid
                        }) , { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
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
      <GlobalStyles />
      <AnimatedGradientBackground />
      {/* Premium Upsell Banner - now a full-width bar under header */}
      <div className="w-full sticky top-0 z-20">
        <div
          className="w-full flex items-center justify-center gap-4 py-3 px-4 bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 border-b-2 border-blue-400 shadow-lg relative cursor-pointer" >
          <span className="inline-block rounded-full  px-3 py-1 text-base font-bold text-white shadow mr-2 bg-gradient-to-r from-purple-500 to-pink-500 ">Premium</span>
          <span className="text-base font-semibold text-gray-900">Upgrade to Premium – no ads, exclusive upgrades and more features</span>
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="glass rounded-3xl p-8 shadow-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="text-3xl font-bold text-gray-800">Velkommen, {username}!</div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <button onClick={newGame} className="rounded-xl border-2 border-blue-300 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-all font-medium">Ny quiz</button>
              <button onClick={discover} className="rounded-xl border-2 border-purple-300 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-all font-medium">Oppdag</button>
            </div>
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-4">Dine spill</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="flex justify-center items-center h-32"><Spinner /></div>
            ) : error ? (
              <div className="text-red-500">En feil oppstod</div>
            ) : (
              games?.map(game => (
                <div key={String(game.id)} className="glass rounded-xl p-6 shadow bg-white hover:shadow-lg transition cursor-pointer" onClick={() => {setSelectedGameId(game.id); setModalIsOpen(true)}}>
                  <div className="text-lg font-bold text-blue-700 mb-2">{game.name}</div>
                  <div className="text-sm text-gray-500 mb-1">{game.qcount} spørsmål</div>
                  <div className="text-sm text-gray-500 mb-2">Av {game.username}</div>
                  <button className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-white font-semibold shadow hover:scale-105 transition" onClick={e => {e.stopPropagation(); edit(game.id);}}>Rediger</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Modal for game options */}
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
            borderRadius: '20px',
            border: 'none',
            color: 'white',
            fontFamily: "Coll",
            background: 'linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%)',
            width: '70%',
            maxWidth: '1000px',
            boxShadow: '0 8px 32px rgba(59,130,246,0.15)'
          },
        }}
        contentLabel="Game options"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="text-2xl font-bold text-blue-900 mb-2">{games?.find(game => game.id === selectedGameId)?.name}</div>
            <div className="text-gray-700 mb-2">by {games?.find(game => game.id === selectedGameId)?.username}</div>
            <div className="text-gray-500 mb-4">{games?.find(game => game.id === selectedGameId)?.qcount} spørsmål</div>
            <button className="rounded-lg border-2 border-blue-300 px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 transition" onClick={() => edit(selectedGameId || '')}>Rediger quiz</button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="text-3xl font-bold text-purple-700 mb-2">{newGamePin}</div>
            <button className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-lg font-bold text-white shadow-xl hover:scale-105 transition" onClick={() => createNewGameInstance(selectedGameId || '0', newGamePin)} disabled={watingForCreateGame}>
              {watingForCreateGame ? 'Starter...' : 'Start spill'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Home;


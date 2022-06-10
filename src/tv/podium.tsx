import { Logo, Player, Start, Tvrapper } from "./game";
import logo from '../images/gunwale-logo-white.png';
import styled from "styled-components";
import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { Spinner } from "./selectGame";


interface PodiumProps {
  id: String;
  finish: () => void;
}

const Podium = ({ id, finish }: PodiumProps) => {
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(true);
      axios.get(`https://www.dogetek.no/api/api.php/game_players_id/${id}/?hash=${Math.random() * 21991919393914999419}`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
        .then(res => {
          if (res.data) {
            setPlayers(res.data);
            setLoading(false);
        }})
        .catch(err => {
          console.log("Error when getting player list");
          setLoading(false);
        });
  }, [id])

  if (loading) {
    <Tvrapper>
      <Logo src={logo}/>
      <ContentPlayers>
        <Spinner/> 
      </ContentPlayers>
      <Start onClick={finish}>Next</Start>
    </Tvrapper>
    
  }

  // return a random slogan
  const winnerSlogans = [
      'Winner winner, chicken dinner',
      'All your base are belong to us',
      'I am constipated, please excuse me!',
      'Win! No one remembers losers.'
  ]

  return (
    <Tvrapper>
      <Logo src={logo}/>
      <ContentPlayers>
        <Header>{winnerSlogans[Number((Math.random() * 3).toFixed(0))]}</Header>
        { players?.length === 0 ? 
            <div>No players ...</div>
          : 
            players?.sort((a: Player, b: Player) => Number(b.score) - Number(a.score)).slice(0,3).map(player => <ScoreEntry>{player.name} - {player.score}</ScoreEntry>)}
      </ContentPlayers>
      <Start onClick={finish}>Finish</Start>
    </Tvrapper>
  )
}

const ContentPlayers = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
`;

const ScoreEntry = styled.div`
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

const Header = styled.div`
    padding: 10px;
    color: #ffffff60;
    border-radius: 10px;
    width: fit-content;
    font-size: 3rem;
    font-weight: bold;
    text-align: center;
    left: 50%;
    margin: auto;
    margin-bottom: 30px;
`;

export default Podium;
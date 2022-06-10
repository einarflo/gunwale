import { Logo, Player, Start, Stop, Tvrapper } from "./game";
import logo from '../images/gunwale-logo-white.png';
import styled from "styled-components";
import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { Spinner } from "./selectGame";


interface CurrentScoresProps {
  id: String;
  next: () => void
  stop: () => void
}

const CurrentScores = ({ id, next, stop }: CurrentScoresProps) => {
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
      <Start onClick={next}>Next</Start>
      <Stop onClick={stop}>Stop</Stop>
    </Tvrapper>
    
  }

  return (
    <Tvrapper>
      <Logo src={logo}/>
      <ContentPlayers>
        <Header>Current leaderboard</Header>
        { players?.length === 0 ? 
            <div>No players ...</div>
          : 
            players?.sort((a: Player, b: Player) => Number(b.score) - Number(a.score)).slice(0,5).map(player => <ScoreEntry>{player.name} - {player.score}</ScoreEntry>)}
      </ContentPlayers>
      <Start onClick={next}>Next</Start>
      <Stop onClick={stop}>Stop</Stop>
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

export default CurrentScores;
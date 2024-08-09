import { CurrentQuestionCount, Logo, Player, Start, Stop, Tvrapper } from "./game";
import logo from '../images/tavl-white.png';
import styled from "styled-components";
import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { Spinner } from "./selectGame";
import TopLeftLogo from "../components/TopLeftLogo";
import { selectableColors } from "../phone/waiting";

interface CurrentScoresProps {
  id: String,
  currentQuestionCount: string,
  next: () => void,
  stop: () => void,
}

const CurrentScores = ({ id, next, stop, currentQuestionCount }: CurrentScoresProps) => {
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
      <TopLeftLogo/>
      <ContentPlayers>
        <Spinner/> 
      </ContentPlayers>
      <Start onClick={next}>Next</Start>
      <Stop onClick={stop}>Stop</Stop>
    </Tvrapper>
    
  }


  // Leader should cover sreen with banner from side to side
  // Should display what question were currently at

  return (
    <Tvrapper>
      <TopLeftLogo/>
      <CurrentQuestionCount>{currentQuestionCount}</CurrentQuestionCount>
      <ContentPlayers>
        <Header>Scoreboard</Header>
        { players?.length === 0 ? 
            <div>No players ...</div>
          : 
            players?.sort((a: Player, b: Player) => Number(b.score) - Number(a.score)).slice(0,5).map(player => <ScoreEntry hex={selectableColors[Number(player.admin) || 0]}><Name>{player.name}</Name><Score>{player.score}</Score></ScoreEntry>)}
      </ContentPlayers>
      <Start onClick={next}>Next</Start>
      <Stop onClick={stop}>Stop</Stop>
    </Tvrapper>
  )
}

const Name = styled.div`
  padding: 5px;
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
`;

const Score = styled.div`
padding: 5px;
`;

const ContentPlayers = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
    font-family: "Coll";
`;

const ScoreEntry = styled.div.attrs((props: {hex: any}) => props)`
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
  font-family: "Coll";
  background-color: ${props => (props.hex || " #9C8AFA")};
  color: white;
  padding: 5px;
  display: flex;
  justify-content: space-between;
`;

const Header = styled.div`
    padding: 10px;
    color: black;
    border-radius: 10px;
    width: fit-content;
    font-size: 3rem;
    font-weight: bold;
    text-align: center;
    left: 50%;
    margin: auto;
    margin-bottom: 30px;
    font-family: "Coll";
    letter-spacing: 2px;
`;

export default CurrentScores;
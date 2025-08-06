import { Logo, Player, Start, Tvrapper } from "./game";
import logo from '../images/tavl-white.png';
import styled from "styled-components";
import { useEffect, useState } from "react";
import { Spinner } from "./selectGame";
import TopLeftLogo from "../components/TopLeftLogo";
import { selectableColors } from "../phone/waiting";
import { get } from "../api";


interface PodiumProps {
  gameInstanceId: String;
  finish: () => void;
}

const Podium = ({ gameInstanceId, finish }: PodiumProps) => {
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(true);
      get(`/game_instance_players_id/${gameInstanceId}/?hash=${Math.random() * 21991919393914999419}`)
        .then(res => {
          if (res.data) {
            setPlayers(res.data);
            setLoading(false);
        }})
        .catch(err => {
          console.log("Error when getting player list");
          setLoading(false);
        });
  }, [gameInstanceId])

  // Do a call to set game over

  if (loading) {
    <Tvrapper>
      <TopLeftLogo />
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
      <TopLeftLogo />
      <ContentPlayers>
        <Header>{winnerSlogans[Number((Math.random() * 3).toFixed(0))]}</Header>
        { players?.length === 0 ? 
            <div>No players ...</div>
          : 
            players?.sort((a: Player, b: Player) => Number(b.score) - Number(a.score)).slice(0,3).map(player => <ScoreEntry hex={selectableColors[Number(player.colour) || 0]}><Name>{player.username}</Name><Score>{player.score}</Score></ScoreEntry>)}
      </ContentPlayers>
      <Start onClick={finish}>Finish</Start>
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
    color: #9C8AFA;
    border-radius: 10px;
    width: fit-content;
    font-size: 3rem;
    font-weight: bold;
    text-align: center;
    left: 50%;
    margin: auto;
    margin-bottom: 30px;
    font-family: "Coll";
`;

export default Podium;
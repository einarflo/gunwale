import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import TopLeftLogo from "../components/TopLeftLogo";
import TopRightPoints from "../components/TopRightPoints";
import { HeaderMobile, MobileHeader, MobileNav } from "../landing";

interface WaitingProps {
  username: String;
  userId: String;
  points: number
  gameStarted: () => void
  gamepin: String
  setColorForUser: (no: number) => void
  colorForUser: number
}

export const selectableColors = [
  '#9C8AFA',
  '#5DB868',
  '#F87474',
  '#000000',
]

const Waiting = ({ username, userId, points, gameStarted, gamepin, colorForUser, setColorForUser }: WaitingProps) => {

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`https://www.dogetek.no/api/api.php/game/${gamepin}/?hash=${Math.random() * 21991919393914999419}`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        if (res.data["status"] !== "created") {
          gameStarted();
        }
      })
      .catch(err => {
        console.log("Error when getting game status");
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gamepin]);


  const setColor = (number: number) => {
    setColorForUser(number);
    axios.put(`https://www.dogetek.no/api/api.php/game_players/${userId}/`, {
      admin: number.toString(),
    }, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log("Error when updating user color");
    });
  }
  
  return(
    <MobileGameWrapper>
      <MobileNav>
      <TopLeftLogo />
      <TopRightPoints username={username} points={points} color={selectableColors[colorForUser]}/>
      </MobileNav>
      <BlueWrapper>
        <MobileHeader>Waiting for game to begin...</MobileHeader>
        
      </BlueWrapper>
      <HeaderMobile>Select your color</HeaderMobile>
      <ColorPicker>
        <Color hex={selectableColors[0]} onClick={() => setColor(0)}/>
        <Color hex={selectableColors[1]} onClick={() => setColor(1)}/>
        <Color hex={selectableColors[2]} onClick={() => setColor(2)}/>
        <Color hex={selectableColors[3]} onClick={() => setColor(3)}/>
      </ColorPicker>

    </MobileGameWrapper>
  );
    
}

const Color = styled.div.attrs((props: {hex: any}) => props)`
  width: calc(100% - 60px);
  display: block;
  margin-bottom: 20px;
  margin-left: auto;
  margin-right: auto;
  background-color: ${props => (props.hex)};
  height: 60px;
  border-radius: 15px;
`;

const ColorPicker = styled.div`
  width: 100%;
  display: block;
`;

export const MobileGameWrapper = styled.div`
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: block;
  position: absolute;
`;

export const BlueWrapper = styled.div`
  background-image: linear-gradient(180deg, #6A71FA 0%, #9C8AFA 100%);
  width: 100%;
`;

const Text = styled.div`
  margin: 20px;
  font-size: 2rem;
  color: white;
  text-align: center;
  font-family: "coll";
`;

export default Waiting;
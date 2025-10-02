import { useContext, useEffect } from "react";
import styled from "styled-components";
import TopLeftLogo from "../components/TopLeftLogo";
import TopRightPoints from "../components/TopRightPoints";
import { HeaderMobile, MobileHeader, MobileNav } from "../landing";
import { GameContext } from "../GameContext";
import { useSocket } from "../context/SocketContext";

interface WaitingProps {
  points: number;
  gameStarted: () => void;
  gamepin: string | undefined;
  setColorForUser: (no: number) => void;
  colorForUser: number;
}

export const selectableColors = [
  '#9C8AFA',
  '#5DB868',
  '#F87474',
  '#000000',
]

const Waiting = ({ points, gameStarted, gamepin, colorForUser, setColorForUser }: WaitingProps) => {
  const { gameInstancePlayerId, gameInstanceId } = useContext(GameContext);
  const { socket, connected } = useSocket();

  useEffect(() => {
    // Prefer WebSocket event for status changes
    if (gameInstanceId) {
      socket.emit('join_game', String(gameInstanceId));
      const onStatus = (payload: { gameId?: string; status?: string }) => {
        if (payload?.gameId === String(gameInstanceId) && payload?.status && payload.status !== 'created') {
          gameStarted();
        }
      };
      socket.on('game_status', onStatus);
      return () => {
        socket.off('game_status', onStatus);
      };
    }
  }, [socket, gameInstanceId, gameStarted]);


  const setColor = (number: number) => {
    setColorForUser(number);
    if (!gameInstanceId) return;
    socket.emit('color_update', { gameInstanceId: String(gameInstanceId), colour: number }, (resp: any) => {
      if (!resp?.ok) {
        console.log('WS color_update failed', resp?.error);
      }
    });
  }

    //select color - maybe 5 circles?
    // diffent power ups for each color, maybe some sort of name?
  
    // Should be an upgrade getting black with gold letters
  
  return(
    <MobileGameWrapper>
      <MobileNav>
      <TopLeftLogo />
      <TopRightPoints points={points} color={selectableColors[colorForUser]}/>
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


export default Waiting;

import { createContext, useContext } from 'react';

interface GameContextValue {
  nickname?: string;
  gamePin?: string;
  gameId?: string;
  gameInstanceId?: string;
  gameInstancePlayerId?: string;
  exitGame?: () => void;
}

export const GameContext = createContext<GameContextValue>({});

export const useNickname = () => useContext(GameContext);


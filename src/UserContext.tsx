import { createContext, useContext } from 'react';

interface UserContextValue {
  username?: string;
  userId?: string;
  setUsername?: (name?: string) => void;
  setUserId?: (id?: string) => void;
}

export const UserContext = createContext<UserContextValue>({});

export const useUser = () => useContext(UserContext);


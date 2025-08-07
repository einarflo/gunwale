import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import socket from '../api/socket';

interface SocketContextValue {
  socket: Socket;
  connected: boolean;
  emit: Socket['emit'];
  on: Socket['on'];
}

const SocketContext = createContext<SocketContextValue>({
  socket,
  connected: socket.connected,
  emit: socket.emit.bind(socket),
  on: socket.on.bind(socket)
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleReconnect = () => setConnected(true);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
    };
  }, []);

  const value = useMemo(
    () => ({
      socket,
      connected,
      emit: socket.emit.bind(socket),
      on: socket.on.bind(socket)
    }),
    [connected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;

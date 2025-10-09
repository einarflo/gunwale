import { io } from 'socket.io-client';

const socketUrl = process.env.REACT_APP_WS_URL || (process.env.NODE_ENV !== 'production' ? 'ws://localhost:4000' : 'wss://ws.tavl.no');
const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket'],
});

export const connectSocket = (token?: string) => {
  if (token) {
    socket.auth = { token };
    // attempt to set header for polling transports
    (socket.io as any).opts.extraHeaders = {
      Authorization: `Bearer ${token}`
    };
  }
  if (!socket.connected) {
    socket.connect();
  }
};

export { socket };
export default socket;

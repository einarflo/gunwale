import { io } from 'socket.io-client';

const socketUrl = process.env.REACT_APP_WS_URL || (process.env.NODE_ENV !== 'production' ? 'ws://localhost:4000' : 'wss://ovh.tavl.no');
const socket = io(socketUrl, { autoConnect: false });

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

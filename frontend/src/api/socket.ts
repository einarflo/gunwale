import { io } from 'socket.io-client';

const socketUrl = process.env.REACT_APP_WS_URL || 'wss://ovh.tavl.no';
export const socket = io(socketUrl, { path: '/ws/socket.io' });

export default socket;

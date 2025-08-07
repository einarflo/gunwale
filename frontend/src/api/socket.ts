import { io } from 'socket.io-client';

const socketUrl = process.env.REACT_APP_WS_URL || '';

export const socket = io(socketUrl);

export default socket;

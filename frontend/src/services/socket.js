import { io } from 'socket.io-client';

// O endereço do seu backend.
// Estabelece a conexão WebSocket.
const socket = io('http://localhost:3000');

export default socket;
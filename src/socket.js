// socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  auth: {
    token: localStorage.getItem('accessToken') || null,
  },
});

export const updateSocketToken = (newToken) => {
  if (socket.auth?.token === newToken && socket.connected) return;
  socket.auth = { token: newToken };
  if (socket.connected) {
    socket.disconnect();
  }
  socket.connect(); // ← always connect/reconnect with the new token
};

socket.on('connect', () => {
  console.log('[Socket] connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('[Socket] connection error:', err.message);
});
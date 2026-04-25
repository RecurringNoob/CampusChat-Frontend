// socket.js
import { io } from 'socket.io-client';

// Use environment variable or fallback to localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,          // We'll connect manually after setting auth token
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  auth: {
    token: localStorage.getItem('accessToken') || null,
  },
});

// Optional: helper to update token dynamically (useful after login / refresh)
export const updateSocketToken = (newToken) => {
  if (socket.auth?.token === newToken && socket.connected) return;
  socket.auth = { token: newToken };
  if (socket.connected) {
    socket.disconnect();
    socket.connect();
  }
};

// Log connection status (helpful for debugging)
socket.on('connect', () => {
  console.log('[Socket] connected');
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('[Socket] connection error:', err.message);
});
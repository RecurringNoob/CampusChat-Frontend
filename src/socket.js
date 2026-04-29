import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  auth: {
    token: null, // always start with null — never read from localStorage here
  },
});

export const updateSocketToken = (newToken) => {
  console.log('[Socket] updateSocketToken called, token:', newToken?.substring(0, 20) + '...');

  // Token unchanged and already connected — nothing to do
  if (socket.auth?.token === newToken && socket.connected) return;

  socket.auth = { token: newToken };

  // If active (connecting or connected), disconnect cleanly first.
  // Use socket.active to catch the "connecting but not yet connected" state.
  if (socket.active) {
    socket.disconnect();
  }

  socket.connect();
};

socket.on('connect', () => console.log('[Socket] connected:', socket.id));
socket.on('disconnect', (reason) => console.log('[Socket] disconnected:', reason));
socket.on('connect_error', (err) => console.error('[Socket] connection error:', err.message));
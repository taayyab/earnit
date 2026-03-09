import { io } from 'socket.io-client';

// Single shared socket instance
let socket = null;

const SOCKET_URL = 'http://localhost:4000';

export function getSocket(userId) {
  if (socket && socket.connected) {
    return socket;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      if (userId) {
        socket.emit('join', userId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  if (userId && socket.connected) {
    socket.emit('join', userId);
  }

  return socket;
}

export function joinRoom(userId) {
  const s = getSocket(userId);
  if (s.connected) {
    s.emit('join', userId);
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

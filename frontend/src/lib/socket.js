import { io } from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (serverUrl) => {
  if (socketInstance) {
    return socketInstance;
  }

  socketInstance = io(serverUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

import { io } from 'socket.io-client'

let socket

export function connectSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
      autoConnect: false,
    })
  }
  return socket
}

export function getSocket() {
  return socket
}

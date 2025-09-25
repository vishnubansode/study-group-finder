import { useEffect, useState } from 'react'
import { connectSocket } from '../services/socket'

export default function Chat() {
  const [messages, setMessages] = useState([])
  useEffect(() => {
    const socket = connectSocket()
    socket.connect()
    socket.on('connect', () => console.log('socket connected'))
    socket.on('message', (m) => setMessages((s) => [...s, m]))
    return () => {
      socket.off('message')
      socket.disconnect()
    }
  }, [])

  return (
    <div>
      <h2>Chat</h2>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>{JSON.stringify(m)}</li>
        ))}
      </ul>
    </div>
  )
}

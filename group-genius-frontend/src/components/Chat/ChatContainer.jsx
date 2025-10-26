import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

// Resolve WebSocket URL from env, with robust fallbacks
const WS_URL = (import.meta?.env?.VITE_WS_URL)
  || `${import.meta?.env?.VITE_API_BASE_URL ?? "http://localhost:8080"}/ws-chat`;

const ChatContainer = ({ groupId, username, userId, initialMessages = [], onConnectionChange }) => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const subRef = useRef(null);

  // propagate connection state upwards
  useEffect(() => {
    if (typeof onConnectionChange === 'function') {
      onConnectionChange(connected);
    }
  }, [connected, onConnectionChange]);

  useEffect(() => {
  if (!groupId) return; // don't connect unless a group is selected

  // reset messages when switching groups and normalize initial messages
  const norm = (initialMessages || []).map(m => ({
    ...m,
    sender: m.sender ?? (m.senderId && userId && m.senderId === userId ? username : m.sender || ""),
  }));
  setMessages(norm);

    // create a new STOMP client for this group
    const client = new Client({
      // SockJS factory for browsers
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      debug: (str) => {
        // keep debug minimal in console
        // console.debug('[STOMP]', str);
      },
    });

    client.onConnect = () => {
      setConnected(true);
      try {
        // subscribe to the group's topic
        // ensure no duplicate subscription if reconnect fires
        if (subRef.current) {
          try { subRef.current.unsubscribe(); } catch (_) {}
          subRef.current = null;
        }
        subRef.current = client.subscribe(`/ws/group/${groupId}`, (message) => {
          if (!message.body) return;
          try {
            const payload = JSON.parse(message.body);
            const normalized = {
              ...payload,
              sender: payload.sender ?? (payload.senderId && userId && payload.senderId === userId ? username : payload.sender || ""),
            };
            setMessages((prev) => {
              if (normalized.clientMessageId) {
                const idx = prev.findIndex(m => m.clientMessageId && m.clientMessageId === normalized.clientMessageId);
                if (idx !== -1) {
                  const copy = prev.slice();
                  copy[idx] = { ...copy[idx], ...normalized, pending: false };
                  return copy;
                }
              }
              return [...prev, normalized];
            });
          } catch (err) {
            console.error("Invalid message payload", err);
          }
        });
      } catch (e) {
        console.error("Subscribe failed", e);
      }
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: ", frame.headers, frame.body);
      setConnected(false);
    };

    client.onWebSocketClose = () => {
      setConnected(false);
    };

  client.activate();
    clientRef.current = client;

    return () => {
      // cleanup subscription and deactivate client
      try {
        if (subRef.current) {
          subRef.current.unsubscribe();
          subRef.current = null;
        }
      } catch (e) {
        // ignore
      }
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const sendMessage = (text) => {
    const client = clientRef.current;
    if (!client || !connected || !text.trim()) return;

    const id = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const chatMessage = {
      sender: username,
      senderId: userId,
      content: text,
      timestamp: new Date().toISOString(),
      clientMessageId: id,
    };

    try {
      client.publish({
        destination: `/ws/app/chat/${groupId}`,
        body: JSON.stringify(chatMessage),
      });
      // Rely on server echo to render the message to avoid duplicates
      // If you prefer optimistic UI, ensure the server echoes clientMessageId;
      // the subscription handler above will replace the pending item when it arrives.
    } catch (e) {
      console.error("Send failed", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border rounded-2xl shadow-md">
      <MessageList messages={messages} username={username} userId={userId} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
};

export default ChatContainer;

import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatContainer = ({ groupId, username }) => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    // create a new STOMP client for this group
    const client = new Client({
      // SockJS factory for browsers
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-chat"),
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
        subRef.current = client.subscribe(`/ws/group/${groupId}`, (message) => {
          if (!message.body) return;
          try {
            const payload = JSON.parse(message.body);
            setMessages((prev) => [...prev, payload]);
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

    const chatMessage = {
      sender: username,
      content: text,
      timestamp: new Date().toISOString(),
    };

    try {
      client.publish({
        destination: `/ws/app/chat/${groupId}`,
        body: JSON.stringify(chatMessage),
      });
      // optimistic UI
      setMessages((prev) => [...prev, chatMessage]);
    } catch (e) {
      console.error("Send failed", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border rounded-2xl shadow-md">
      <MessageList messages={messages} username={username} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
};

export default ChatContainer;

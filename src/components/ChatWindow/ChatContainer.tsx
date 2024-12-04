import { useEffect, useState, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const userId = "Shayan";
  
  const TIMEOUT_DURATION = 30000; // 30 seconds in milliseconds

  const connectWebSocket = () => {
    const websocket = new WebSocket(`ws://localhost:8000/chat/${userId}`);

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
      // Reset timeout on message received
      resetTimeout(websocket);
    };

    websocket.onopen = () => {
      setIsConnected(true);
      resetTimeout(websocket);
    };

    websocket.onclose = () => {
      setIsConnected(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    setWs(websocket);
    return websocket;
  };

  const resetTimeout = (websocket: WebSocket) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      console.log("Connection timeout - closing websocket");
      websocket.close();
    }, TIMEOUT_DURATION);
  };

  useEffect(() => {
    const websocket = connectWebSocket();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      websocket.close();
    };
  }, [userId]);

  const sendMessage = (content: string) => {
    if (!isConnected) {
      // If not connected, reconnect before sending
      const newWs = connectWebSocket();
      newWs.onopen = () => {
        newWs.send(content);
      };
    } else if (ws?.readyState === WebSocket.OPEN) {
      ws.send(content);
      setMessages(prev => [...prev, { role: 'user', content }]);
      resetTimeout(ws);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-5 h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded-lg">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
      </div>
      <ChatInput onSendMessage={sendMessage} />
    </div>
  );
} 
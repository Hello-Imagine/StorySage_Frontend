import React, { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import MessageWindow from './MessageWindow';
import ChatInput from './ChatInput';
import { Message } from '../../types/message';
import { apiClient } from '../../utils/api';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';

interface SessionResponse {
  session_id: string;
  message: Message;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sessionId, setSessionId } = useSessionStore();
  const userId = useAuthStore(state => state.userId);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await apiClient('MESSAGES', {
          method: 'GET',
        });
        setMessages(data);
      } catch (error) {
        message.error('Failed to fetch messages: ' + (error as Error).message);
      }
    };

    fetchMessages();
  }, []);

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        created_at: new Date().toISOString(),
        role: 'User'
      };

      setMessages(prev => [...prev, userMessage]);

      if (!sessionId) {
        const response: SessionResponse = await apiClient('SESSIONS', {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            content,
          }),
        });
        setSessionId(response.session_id);
        setMessages(prev => [...prev, response.message]);
      } else {
        const response: Message = await apiClient('MESSAGES', {
          method: 'POST',
          body: JSON.stringify({
            session_id: sessionId,
            content,
          }),
        });
        setMessages(prev => [...prev, response]);
      }
    } catch (error) {
      message.error('Failed to send message: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <MessageWindow messages={messages} />
      <div className="relative">
        {isLoading && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          </div>
        )}
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatPage;

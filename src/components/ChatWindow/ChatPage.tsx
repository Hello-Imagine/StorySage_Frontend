import React, { useState, useEffect } from 'react';
import { message, Spin, FloatButton } from 'antd';
import { LoadingOutlined, StopOutlined } from '@ant-design/icons';
import MessageWindow from './MessageWindow';
import ChatInput from './ChatInput';
import { Message } from '../../types/message';
import { apiClient } from '../../utils/api';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';
import config from '../../config/index';
import { useNavigate } from 'react-router-dom';

interface SessionResponse {
  session_id: string;
  message: Message;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sessionId, setSessionId } = useSessionStore();
  const userId = useAuthStore(state => state.userId);
  const navigate = useNavigate();

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

  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      await apiClient(config.API_ENDPOINTS.END_SESSION(sessionId), {
        method: 'POST',
      });
      message.success('Session ended successfully! Waiting for 3-5 minutes for your biography...');
      // Wait before navigating
      await new Promise(resolve => setTimeout(resolve, 3000));
      navigate('/');
    } catch (error) {
      message.error('Failed to end session: ' + (error as Error).message);
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
      {sessionId && (
        <FloatButton
          icon={<StopOutlined />}
          type="primary"
          tooltip="End Session"
          onClick={handleEndSession}
          style={{ right: 24, bottom: 100 }}
        />
      )}
    </div>
  );
};

export default ChatPage;

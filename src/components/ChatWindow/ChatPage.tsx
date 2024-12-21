import React, { useState, useEffect } from 'react';
import { message, Spin, FloatButton } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import MessageWindow from './MessageWindow';
import ChatInput from './ChatInput';
import { Message } from '../../types/message';
import { apiClient } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historicalMessagesCount, setHistoricalMessagesCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await apiClient('MESSAGES', {
          method: 'GET',
        });
        setMessages(data);
        setHistoricalMessagesCount(data.length);
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
      const response: Message = await apiClient('MESSAGES', {
        method: 'POST',
        body: JSON.stringify({
          content,
        }),
      });
      setMessages(prev => [...prev, response]);
    } catch (error) {
      message.error('Failed to send message: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      const response = await apiClient('END_SESSION', {
        method: 'POST',
      });
      if (response.status === "success") {
        message.success('Session ended successfully! Waiting for 3-5 minutes for your biography...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        navigate('/');
      } else {
        message.error('Failed to end session: ' + response.message);
      }
    } catch (error) {
      message.error('Failed to end session: ' + (error as Error).message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Spin size="large" />
        </div>
      )}
      <MessageWindow 
        messages={messages} 
        historicalMessagesCount={historicalMessagesCount}
      />
      <div className="relative">
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
      <FloatButton
        icon={<StopOutlined />}
        type="primary"
        tooltip="End Session"
        onClick={handleEndSession}
        style={{ left: 24, bottom: 140 }}
      />
    </div>
  );
};

export default ChatPage;

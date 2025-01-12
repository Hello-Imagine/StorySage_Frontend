import React, { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import MessageWindow from './MessageWindow/MessageWindow';
import InterviewWindow from './InterviewWindow/InterviewWindow';
import ChatInput from './ChatInput';
import { Message } from '../../types/message';
import { apiClient } from '../../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historicalMessagesCount, setHistoricalMessagesCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isInterviewMode = location.pathname === '/user_chat';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (isInterviewMode) {
          // Set default welcome message for interview mode
          const welcomeMessage: Message = {
            id: 'welcome',
            content: "Hello! I'm your AI interviewer today. I'll be asking you some questions to learn more about your experience to help you write your biography. Nice to meet you here 😀!",
            created_at: new Date().toISOString(),
            role: 'Interviewer'
          };
          setMessages([welcomeMessage]);
          setHistoricalMessagesCount(0);
        } else {
          // Fetch historical messages for chat mode
          const data = await apiClient('MESSAGES', {
            method: 'GET',
          });
          setMessages(data);
          setHistoricalMessagesCount(data.length);
        }
      } catch (error) {
        message.error('Failed to fetch messages: ' + (error as Error).message);
      }
    };

    fetchMessages();
  }, [isInterviewMode]);

  // When a new message is sent, we send it to the server and add it to the messages array
  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);

      // Create a new user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        created_at: new Date().toISOString(),
        role: 'User'
      };

      // Add the new user message to the current messages
      setMessages(prev => [...prev, userMessage]);

      // Send the message to the server and get the interviewer response
      const response: Message = await apiClient('MESSAGES', {
        method: 'POST',
        body: JSON.stringify({
          content,
        }),
      });

      // Add the server's response to the messages
      setMessages(prev => [...prev, response]);
    } catch (error) {
      message.error('Failed to send message: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      message.loading({ 
        content: '📝 Writing the biography. 😃 DON\'T QUIT', 
        key: 'bioUpdate',
        duration: 0 // This makes the message persist until we manually close it
      });

      const response = await apiClient('END_SESSION', {
        method: 'POST',
      });

      if (response.status === "success") {
        message.success({ 
          content: 'Session ended successfully!',
          key: 'bioUpdate', // Using same key will replace the loading message
          duration: 2 
        });
        navigate('/');
      } else {
        message.error({ 
          content: 'Failed to end session: ' + response.message,
          key: 'bioUpdate'
        });
      }
    } catch (error) {
      message.error({ 
        content: 'Failed to end session: ' + (error as Error).message,
        key: 'bioUpdate'
      });
    }
  };

  const getMostRecentInterviewerMessage = () => {
    return messages.filter(msg => msg.role === 'Interviewer').slice(-1)[0];
  };

  return (
    <div className="flex flex-col h-full">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Spin size="large" />
        </div>
      )}
      
      {isInterviewMode ? (
        <InterviewWindow 
          latestMessage={getMostRecentInterviewerMessage()}
        />
      ) : (
        <MessageWindow 
          messages={messages} 
          historicalMessagesCount={historicalMessagesCount}
        />
      )}

      <div className="relative">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onEndSession={handleEndSession}
          disabled={isLoading} 
        />
      </div>
    </div>
  );
};

export default ChatPage;

import React, { useState, useEffect, useCallback } from 'react';
import { message, Spin, notification } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import MessageWindow from './message-window/MessageWindow';
import InterviewWindow from './interview-window/InterviewWindow';
import ChatInput from './ChatInput';
import { Message } from '../../types/message';
import { apiClient } from '../../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historicalMessagesCount, setHistoricalMessagesCount] = useState(0);
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(true);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>();
  const navigate = useNavigate();
  const location = useLocation();
  const isInterviewMode = location.pathname === '/user_chat';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await apiClient('MESSAGES', {
          method: 'GET',
        });
        setMessages(data);
        setHistoricalMessagesCount(data.length);

        notification.success({
          message: 'Welcome Back!',
          description: "Hello! Welcome back to your biography interview. Let's continue where we left off!",
          icon: <SmileOutlined style={{ color: '#108ee9' }} />,
          placement: 'topRight',
          duration: 3,
        });
        
      } catch (error) {
        message.error('Failed to fetch messages: ' + (error as Error).message);
      }
    };
    fetchMessages();
  }, [isInterviewMode]);

  // Fetch audio for a message
  const fetchAudio = useCallback(async (messageContent: string) => {
    try {
      const response = await apiClient('TEXT_TO_SPEECH', {
        method: 'POST',
        body: JSON.stringify({
          text: messageContent,
        }),
      });
      
      if (response.audioUrl) {
        setCurrentAudioUrl(response.audioUrl);
      } else {
        throw new Error('No audio URL received');
      }
    } catch (error) {
      message.error('Failed to fetch audio: ' + (error as Error).message);
    }
  }, []);

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

      // Set isLoading to false after the message is sent
      setIsLoading(false);

      // Add the server's response to the messages
      setMessages(prev => [...prev, response]);

      // If transcription is enabled, fetch audio for the interviewer's response
      if (isTranscriptionEnabled && response.role === 'Interviewer') {
        await fetchAudio(response.content);
      }
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

  const handleToggleTranscription = () => {
    setIsTranscriptionEnabled(prev => !prev);
    // Clear current audio when toggling off
    if (isTranscriptionEnabled) {
      setCurrentAudioUrl(undefined);
    }
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
          isTranscriptionEnabled={isTranscriptionEnabled}
          onToggleTranscription={handleToggleTranscription}
          audioUrl={currentAudioUrl}
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

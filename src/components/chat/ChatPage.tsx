import React, { useState, useEffect, useCallback } from 'react';
import { message, Spin, notification, Popconfirm } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import MessageWindow from './message-window/MessageWindow';
import InterviewWindow from './interview-window/InterviewWindow';
import ChatInput from './ChatInput';
import { Message } from '../../types/message';
import { apiClient } from '../../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { WELCOME_MESSAGES } from '../../constants/messages';
import TopicSelectionModal from './modals/TopicSelectionModal';
import FeedbackModal from './modals/FeedbackModal';
import { useAuthStore } from '../../stores/authStore';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isInterviewMode = location.pathname === '/user_chat';

  // Chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historicalMessagesCount, setHistoricalMessagesCount] = useState(0);
  
  // Transcription
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(
    process.env.NODE_ENV === 'production'
  );
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>();

  // End session
  const [isTopicModalVisible, setIsTopicModalVisible] = useState(false);
  const [sessionTopics, setSessionTopics] = useState<string[]>([]);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [sessionFeedback, setSessionFeedback] = 
    useState<{ rating: number; feedback: string } | null>(null);
  
  // Like and skip actions
  const [isSkipping, setIsSkipping] = useState(false);
  const [likedMessageIds, setLikedMessageIds] = useState<Set<string>>(new Set());

  // Add new state for transcription loading
  const [isTranscribing, setIsTranscribing] = useState(false);

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

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await apiClient('MESSAGES', {
          method: 'GET',
        });

        setMessages(data.messages);
        setHistoricalMessagesCount(data.messages.length);

        if (data.has_active_session) {
          notification.success({
            message: 'Welcome Back!',
            description: WELCOME_MESSAGES.WELCOME_BACK,
            icon: <SmileOutlined style={{ color: '#108ee9' }} />,
            placement: 'topRight',
            duration: 3,
          });
        } else {
          // Add a welcome message from the interviewer if there's no active session
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            content: WELCOME_MESSAGES.INITIAL_INTERVIEW,
            created_at: new Date().toISOString(),
            role: 'Interviewer'
          };
          setMessages(prev => [...prev, welcomeMessage]);
          setHistoricalMessagesCount(prev => prev + 1);
          if (isTranscriptionEnabled) {
            fetchAudio(WELCOME_MESSAGES.INITIAL_INTERVIEW);
          }
        }
      } catch (error) {
        message.error('Failed to fetch messages: ' + (error as Error).message);
      }
    };
    fetchMessages();
  }, [isInterviewMode, isTranscriptionEnabled, fetchAudio]);

  // When a new message is sent, we send it to the server
  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      // Reset the current audio before processing new message
      setCurrentAudioUrl(undefined);

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

  const handlePrepareEndSession = async () => {
    try {
      setIsEndingSession(true);
      setCurrentAudioUrl(undefined);
      
      const isBaselineUser = useAuthStore.getState().isBaselineUser();

      const response = await apiClient('PREPARE_END_SESSION', {
        method: 'POST',
      });

      if (response.status !== "success") {
        message.error('Failed to prepare end session: ' + response.message);
        return;
      }
      
      // For regular users, show feedback and topic selection modals
      if (!isBaselineUser) {
        setSessionTopics(response.topics);
        setIsFeedbackModalVisible(true);
      } 
      // For baseline users, skip feedback and topic selection
      else {
        message.loading({ 
          content: '📝 Writing the biography. 😃 DON\'T QUIT', 
          key: 'bioUpdate',
          duration: 0
        });
        
        const response = await apiClient('END_SESSION', {
          method: 'POST',
          body: JSON.stringify({
            selected_topics: [],
            feedback: { rating: 0, feedback: "" }
          }),
        });

        if (response.status === "success") {
          message.success({ 
            content: 'Session ended successfully!',
            key: 'bioUpdate',
            duration: 2 
          });
          navigate('/biography');
        } else {
          message.error({ 
            content: 'Failed to end session: ' + response.message,
            key: 'bioUpdate'
          });
        }
      }
    } catch (error) {
      // Check if it's a timeout error for baseline users too
      if (error instanceof Error && 'status' in error && error.status === 408) {
        message.info({ 
          content: 'Your biography is being generated and it may take a few minutes. ' +
          'You can check back later in the biography section.',
          key: 'bioUpdate',
          duration: 5
        });
        navigate('/');
      } else {
        message.error('Failed to end the session: ' + (error as Error).message);
      }
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleFeedbackSubmit = async (rating: number, feedback: string) => {
    try {
      // Store feedback for later use
      setSessionFeedback({ rating, feedback });
      
      // Close feedback modal and show topic selection modal
      setIsFeedbackModalVisible(false);
      setIsTopicModalVisible(true);
    } catch (error) {
      message.error('Failed to submit feedback: ' + (error as Error).message);
    }
  };

  const handleTopicSelection = async (selectedTopics: string[]) => {
    try {
      message.loading({ 
        content: '📝 Writing the biography. 😃 DON\'T QUIT', 
        key: 'bioUpdate',
        duration: 0
      });

      const response = await apiClient('END_SESSION', {
        method: 'POST',
        body: JSON.stringify({
          selected_topics: selectedTopics,
          feedback: sessionFeedback
        }),
      });

      if (response.status === "success") {
        message.success({ 
          content: 'Session ended successfully!',
          key: 'bioUpdate',
          duration: 2 
        });
        setIsTopicModalVisible(false);
        navigate('/biography');
      } else {
        message.error({ 
          content: 'Failed to end session: ' + response.message,
          key: 'bioUpdate'
        });
      }
    } catch (error) {
      // Check if it's a timeout error (status code 408)
      if (error instanceof Error && 'status' in error && error.status === 408) {
        message.info({ 
          content: 'Your biography is being generated and it may take a few minutes. ' +
          'You can check back later in the biography section.',
          key: 'bioUpdate',
          duration: 5
        });
        setIsTopicModalVisible(false);
        navigate('/');
      } else {
        message.error({ 
          content: 'Failed to end session: ' + (error as Error).message,
          key: 'bioUpdate'
        });
      }
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

  const handleLike = async () => {
    const currentMessage = getMostRecentInterviewerMessage();
    if (!currentMessage || likedMessageIds.has(currentMessage.id)) return;

    try {
      await apiClient('LIKE', {
        method: 'POST',
      });
      message.success('Liked!');
      setLikedMessageIds(prev => new Set(prev).add(currentMessage.id));
    } catch (error) {
      message.error('Failed to send like: ' + (error as Error).message);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSkipping(true);
      // Reset the current audio before getting new response
      setCurrentAudioUrl(undefined);
      
      const response: Message = await apiClient('SKIP', {
        method: 'POST',
      });

      // Add the interviewer's response to messages
      setMessages(prev => [...prev, response]);

      // If transcription is enabled, fetch audio for the new response
      if (isTranscriptionEnabled && response.role === 'Interviewer') {
        await fetchAudio(response.content);
      }
    } catch (error) {
      message.error('Failed to skip: ' + (error as Error).message);
    } finally {
      setIsSkipping(false);
    }
  };

  // Add stopAudio function
  const stopAudio = useCallback(() => {
    setCurrentAudioUrl(undefined);
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      {(isLoading || isTranscribing) && (
        <div className="fixed inset-0 bg-black/20 flex items-center 
          justify-center z-50">
          <div className="flex flex-col items-center">
            <Spin size="large" />
            <span className="mt-2 text-white">
              {isTranscribing ? 'Processing your response...' : 'Loading...'}
            </span>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 right-4 z-10">
        <Popconfirm
          title="End Session"
          description="Are you sure you want to end this session?"
          onConfirm={handlePrepareEndSession}
          okText="Yes"
          cancelText="No"
          placement="bottomLeft"
        >
          <img 
            src="/icon/stop.png" 
            alt="End Session" 
            className="h-8 w-8 cursor-pointer hover:opacity-80" 
          />
        </Popconfirm>
      </div>

      <FeedbackModal
        isVisible={isFeedbackModalVisible}
        onOk={handleFeedbackSubmit}
        loading={isEndingSession}
      />

      <TopicSelectionModal
        isVisible={isTopicModalVisible}
        topics={sessionTopics}
        onOk={handleTopicSelection}
        loading={isEndingSession}
      />
      
      {isInterviewMode ? (
        <InterviewWindow 
          latestMessage={getMostRecentInterviewerMessage()}
          isTranscriptionEnabled={isTranscriptionEnabled}
          onToggleTranscription={handleToggleTranscription}
          audioUrl={currentAudioUrl}
          onLike={handleLike}
          onSkip={handleSkip}
          isSkipping={isSkipping}
          isLiked={!!getMostRecentInterviewerMessage()?.id && 
            likedMessageIds.has(getMostRecentInterviewerMessage()!.id)}
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
          disabled={isLoading}
          setIsTranscribing={setIsTranscribing}
          stopAudio={stopAudio}
        />
      </div>
    </div>
  );
};

export default ChatPage;

import React, { useMemo, useRef } from 'react';
import { Message } from '../../../types/message';
import { motion } from 'framer-motion';
import { Button, Space, Tooltip } from 'antd';
import { AudioOutlined, AudioMutedOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { WELCOME_MESSAGES } from '../../../constants/messages';
import { useAuthStore } from '../../../stores/authStore';

interface InterviewWindowProps {
  latestMessage?: Message;
  isTranscriptionEnabled: boolean;
  onToggleTranscription: () => void;
  audioUrl?: string;
  onLike: () => void;
  onSkip: () => void;
  isSkipping?: boolean;
  isLiked?: boolean;
  isLoading?: boolean;
}

const InterviewWindow: React.FC<InterviewWindowProps> = ({ 
  latestMessage, 
  isTranscriptionEnabled,
  onToggleTranscription,
  audioUrl,
  onLike,
  onSkip,
  isSkipping,
  isLiked,
  isLoading
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isBaselineUser = useAuthStore(state => state.isBaselineUser);
  
  // Determine who is speaking based on the latest message
  const isBotSpeaking = useMemo(() => {
    if (isLoading) return false;
    
    if (!latestMessage) return true;
    return latestMessage.role === 'Interviewer';
  }, [latestMessage, isLoading]);
  
  // Replace the separate animation objects with a single one
  const speakingAnimation = {
    speaking: {
      scale: [1, 1.2, 1],
      y: [0, -3, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
      }
    },
    idle: {
      scale: 1,
      transition: {
        duration: 1
      }
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-2xl w-full flex flex-col items-center space-y-8">
        <div className="flex justify-between w-full relative px-14">
          <div className="relative">
            <motion.img 
              src={isBotSpeaking ? "stickers/interviewer_bot.png" : "stickers/interviewer_bot_thinking.png"}
              alt="AI Interviewer" 
              className="h-48 w-auto"
              animate={isBotSpeaking ? "speaking" : "idle"}
              variants={speakingAnimation}
            />
          </div>
          
          <div className="relative">
            <motion.img 
              src={!isBotSpeaking ? "stickers/user.png" : "stickers/user_thinking.png"}
              alt="User" 
              className="h-48 w-auto"
              animate={!isBotSpeaking ? "speaking" : "idle"}
              variants={speakingAnimation}
            />
          </div>
        </div>
        
        <div className="w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg
          p-6 relative">
          <Button
            type="text"
            icon={isTranscriptionEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
            onClick={onToggleTranscription}
            className="absolute -top-3 -left-3 z-10 bg-white dark:bg-gray-700 
              shadow-md rounded-full"
          />
          
          {latestMessage ? (
            <>
              <div className="text-lg text-gray-800 dark:text-gray-200">
                {latestMessage.content}
              </div>

              {/* Only show buttons if it's not a initial welcome message 
              and not a baseline user */}
              {!latestMessage.content.includes(WELCOME_MESSAGES.INITIAL_INTERVIEW) &&
               !isBaselineUser() && (
                <Space className="absolute -bottom-2 right-2">
                  <Tooltip 
                    title={<>
                      Liked this particular question?
                      <br />
                      Let us know!
                    </>}
                    placement="top"
                  >
                    <Button 
                      icon={<LikeOutlined />} 
                      onClick={onLike}
                      shape="circle"
                      disabled={isLiked}
                      className={isLiked ? 'text-blue-500' : ''}
                    />
                  </Tooltip>
                  
                  <Tooltip
                    title={<>
                      Don't like this question?
                      <br />
                      Skip it and try a different one!
                    </>}
                    placement="top"
                  >
                    <Button 
                      icon={<DislikeOutlined />} 
                      onClick={onSkip}
                      loading={isSkipping}
                      shape="circle"
                    />
                  </Tooltip>
                </Space>
              )}
            </>
          ) : (
            <div className="text-lg text-gray-500 dark:text-gray-400 text-center">
              {WELCOME_MESSAGES.INITIAL_INTERVIEW}
            </div>
          )}

          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              autoPlay
              className="hidden"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewWindow;

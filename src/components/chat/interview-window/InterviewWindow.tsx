import React, { useMemo, useRef } from 'react';
import { Message } from '../../../types/message';
import { motion } from 'framer-motion';
import { Button } from 'antd';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';

interface InterviewWindowProps {
  latestMessage?: Message;
  isTranscriptionEnabled: boolean;
  onToggleTranscription: () => void;
  audioUrl?: string;
}

const InterviewWindow: React.FC<InterviewWindowProps> = ({ 
  latestMessage, 
  isTranscriptionEnabled,
  onToggleTranscription,
  audioUrl
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  // Pick a random sticker from 1-7 to display
  const randomSticker = useMemo(() => {
    return Math.floor(Math.random() * 7) + 1;
  }, []);

  // Animation variants for the breathing effect
  const breathingAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.2, 0.9, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-2xl w-full flex flex-col items-center space-y-8">
        <motion.img 
          src={`stickers/chatbot/${randomSticker}.png`}
          alt="AI Interviewer" 
          className="h-60 w-auto"
          initial="initial"
          animate="animate"
          variants={breathingAnimation}
        />
        
        <div className="w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 relative">
          <Button
            type="text"
            icon={isTranscriptionEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
            onClick={onToggleTranscription}
            className="absolute -top-3 -left-3 z-10 bg-white dark:bg-gray-700 shadow-md rounded-full"
          />
          
          {latestMessage ? (
            <div className="text-lg text-gray-800 dark:text-gray-200">
              {latestMessage.content}
            </div>
          ) : (
            <div className="text-lg text-gray-500 dark:text-gray-400 text-center">
              Welcome! Let's start the interview.
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

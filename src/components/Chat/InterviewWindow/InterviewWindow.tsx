import React, { useMemo } from 'react';
import { Message } from '../../../types/message';

interface InterviewWindowProps {
  latestMessage?: Message;
}

const InterviewWindow: React.FC<InterviewWindowProps> = ({ latestMessage }) => {
  // Pick a random sticker from 1-7 to display
  const randomSticker = useMemo(() => {
    return Math.floor(Math.random() * 7) + 1;
  }, []);

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-2xl w-full flex flex-col items-center space-y-8">
        <img 
          src={`stickers/chatbot/${randomSticker}.png`}
          alt="AI Interviewer" 
          className="h-60 w-auto"
        />
        
        <div className="w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
          {latestMessage ? (
            <div className="text-lg text-gray-800 dark:text-gray-200">
              {latestMessage.content}
            </div>
          ) : (
            <div className="text-lg text-gray-500 dark:text-gray-400 text-center">
              Welcome! Let's start the interview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewWindow;

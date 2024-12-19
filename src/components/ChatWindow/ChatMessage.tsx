import React from 'react';
import { Message } from '../../types/message';

interface ChatMessageProps {
  message: Message;
  isMostRecent?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isMostRecent = false }) => {
  const isUser = message.role === 'User';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`rounded-lg px-4 py-2 max-w-[80%] ${
          isUser 
            ? 'bg-blue-500 text-white dark:bg-blue-600' 
            : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
        } ${isMostRecent && !isUser ? 'font-semibold text-lg opacity-100' : 'opacity-90'}`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;

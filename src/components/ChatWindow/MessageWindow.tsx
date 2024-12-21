import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Message } from '../../types/message';

interface MessageWindowProps {
  messages: Message[];
  historicalMessagesCount: number;
}

const MessageWindow: React.FC<MessageWindowProps> = ({ messages, historicalMessagesCount }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto p-4">
      {/* Show historical messages */}
      {messages.slice(0, historicalMessagesCount).map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isMostRecent={false}
        />
      ))}

      {/* Show separator if there are historical messages */}
      {historicalMessagesCount > 0 && (
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">
            The above are historical messages
          </span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>
      )}

      {/* Show new messages */}
      {messages.slice(historicalMessagesCount).map((message, index, newMessages) => (
        <ChatMessage
          key={message.id}
          message={message}
          isMostRecent={index === newMessages.length - 1 && message.role === 'Interviewer'}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageWindow; 
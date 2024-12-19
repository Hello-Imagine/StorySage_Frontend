import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface MessageWindowProps {
  messages: Message[];
}

const MessageWindow: React.FC<MessageWindowProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto p-4">
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message.text}
          isUser={message.isUser}
          isMostRecent={index === messages.length - 1 && !message.isUser}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageWindow; 
import React, { useState } from 'react';
import MessageWindow from './MessageWindow';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

// Initial test messages
const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hello! I'm Isabella. To start, I would like to begin with a big question: tell me the story of your life. Start from the beginning -- from your childhood, to education, to family and relationships, and to any",
    isUser: false,
  },
  {
    id: '2',
    text: "Hi Isabella! Thanks for asking. I grew up in a small town...",
    isUser: true,
  },
  {
    id: '3',
    text: "That's fascinating! Could you tell me more about your education?",
    isUser: false,
  },
  {
    id: '4',
    text: "I studied computer science at university and...",
    isUser: true,
  },
  {
    id: '5',
    text: "What about your career journey after graduation?",
    isUser: false,
  }
];

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
    };
    setMessages(prev => [...prev, newMessage]);

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: "That's interesting! Can you elaborate more on that?",
        isUser: false,
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <>
      <MessageWindow messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} />
    </>
  );
};

export default ChatPage;

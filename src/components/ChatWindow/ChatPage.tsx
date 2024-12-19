import React, { useState } from 'react';
import { Dropdown, MenuProps, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
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

    // Simulate a response from Isabella after 1 second
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: "That's interesting! Can you elaborate more on that?",
        isUser: false,
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const items: MenuProps['items'] = [
    {
      key: 'history',
      label: 'Conversation History',
    },
    {
      key: 'logs',
      label: 'Logs',
    },
    {
      key: 'biography',
      label: 'My Biography',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('clicked', e.key);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <Dropdown menu={{ items, onClick: handleMenuClick }}>
          <Button className="flex items-center gap-2">
            View Data <DownOutlined />
          </Button>
        </Dropdown>
        <Button>
          Logout
        </Button>
      </header>

      <MessageWindow messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatPage;

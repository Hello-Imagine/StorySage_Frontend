import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from 'antd';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if ((e.metaKey || e.ctrlKey)) {
        // Add new line on Cmd/Ctrl + Enter
        setMessage(prev => prev + '\n');
      } else {
        // Send message on Enter
        e.preventDefault();
        handleSend();
      }
    }
  };

  return (
    <div className="min-h-[64px] max-h-[200px] flex flex-col bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex-grow flex">
        <textarea
          ref={textAreaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-grow min-h-[40px] max-h-[160px] resize-none rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          disabled={disabled}
        />
      </div>
      <Button 
        type="primary"
        onClick={handleSend}
        className="mt-2"
        disabled={disabled}
      >
        Send
      </Button>
    </div>
  );
};

export default ChatInput;

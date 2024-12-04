type ChatInputProps = {
  onSendMessage: (message: string) => void;
};

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSendMessage(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  };

  return (
    <input 
      type="text"
      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Type a message..."
      onKeyDown={handleKeyPress}
    />
  );
} 
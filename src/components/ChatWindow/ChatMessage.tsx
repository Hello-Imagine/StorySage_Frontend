type MessageProps = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatMessage({ role, content }: MessageProps) {
  return (
    <div className={`p-3 rounded-lg mb-2 ${
      role === 'user' 
        ? 'bg-blue-100 ml-[20%]' 
        : 'bg-gray-100 mr-[20%]'
    }`}>
      {content}
    </div>
  );
} 
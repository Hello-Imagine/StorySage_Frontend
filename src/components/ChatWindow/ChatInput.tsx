import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from 'antd';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import { transcribeAudio } from '../../utils/api';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
          setIsProcessing(true);
          const transcription = await transcribeAudio(audioBlob);
          setMessage(prev => prev + (prev ? ' ' : '') + transcription);
        } catch (error) {
          console.error('Transcription error:', error);
          // Handle error (you might want to show a notification to the user)
        } finally {
          setIsProcessing(false);
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      // Handle error (you might want to show a notification to the user)
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-[64px] max-h-[200px] flex flex-col bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex-grow flex gap-2">
        <textarea
          ref={textAreaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-grow min-h-[40px] max-h-[160px] resize-none rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          disabled={disabled || isProcessing}
        />
        <Button
          icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
          onClick={toggleRecording}
          disabled={disabled || isProcessing}
          danger={isRecording}
          className="flex items-center justify-center"
        />
      </div>
      <Button 
        type="primary"
        onClick={handleSend}
        className="mt-2"
        disabled={disabled || isProcessing}
        loading={isProcessing}
      >
        Send
      </Button>
    </div>
  );
};

export default ChatInput;

import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { transcribeAudio } from '../../utils/api';
import { Popconfirm } from 'antd';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onEndSession: () => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onEndSession, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      // Switch back to voice mode after sending
      setIsTypingMode(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
          // Add transcription to message
          setMessage(prev => prev + (prev ? ' ' : '') + transcription);
          // Switch to typing mode after transcription
          setIsTypingMode(true);
          setTimeout(() => {
            if (textAreaRef.current) {
              textAreaRef.current.focus();
              adjustTextAreaHeight();
            }
          }, 0);
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

  const toggleMode = () => {
    setIsTypingMode(!isTypingMode);
    if (!isTypingMode) {
      setTimeout(() => textAreaRef.current?.focus(), 0);
    }
  };

  const adjustTextAreaHeight = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = 'inherit';
      const computed = window.getComputedStyle(textarea);
      const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                   + parseInt(computed.getPropertyValue('padding-top'), 10)
                   + textarea.scrollHeight
                   + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                   + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

      const maxHeight = 200; // matches Tailwind chat-input-max
      textarea.style.height = Math.min(height, maxHeight) + 'px';
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextAreaHeight();
  };

  useEffect(() => {
    if (isTypingMode) {
      adjustTextAreaHeight();
    }
  }, [isTypingMode]);

  return (
    <div className="min-h-chat-input-min max-h-chat-input-max flex items-stretch bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="w-1/5 flex items-center justify-center">
        <div className="w-12 h-12 flex items-center justify-center">
          <Popconfirm
            title="End Session"
            description="Are you sure you want to end this session?"
            onConfirm={onEndSession}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <img 
              src="/icon/stop.png" 
              alt="End Session" 
              className="h-8 w-8 cursor-pointer" 
            />
          </Popconfirm>
        </div>
      </div>

      {isTypingMode ? (
        <>
          <textarea
            ref={textAreaRef}
            value={message}
            onChange={handleTextAreaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 min-h-[48px] max-h-[144px] resize-none rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mx-2 overflow-y-auto"
            disabled={disabled || isProcessing}
          />
          <div className="w-1/5 flex items-center justify-center">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/icon/voice_start.png"
                alt="Switch to Voice" 
                className="h-8 w-8 cursor-pointer" 
                onClick={toggleMode}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <button
            onClick={toggleRecording}
            disabled={disabled || isProcessing}
            className="flex-1 h-12 flex items-center justify-center mx-2"
          >
            <img 
              src={isRecording ? "/icon/voice_stop.png" : "/icon/voice_start.png"} 
              alt="Voice" 
              className="h-8 w-8" 
            />
          </button>
          <div className="w-1/5 flex items-center justify-center">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/icon/keyboard.png" 
                alt="Switch to Typing" 
                className="h-8 w-8 cursor-pointer" 
                onClick={toggleMode}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInput;

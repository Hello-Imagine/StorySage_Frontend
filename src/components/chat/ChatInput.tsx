import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { transcribeAudio } from '../../utils/api';
import { Button, Tooltip, notification } from 'antd';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  setIsTranscribing: (isTranscribing: boolean) => void;
  stopAudio: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, setIsTranscribing, stopAudio }) => {
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
      stopAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Add recording time tracking
      let recordingDuration = 0;
      const recordingInterval = setInterval(() => {
        recordingDuration += 1;
      }, 1000);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        clearInterval(recordingInterval);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        try {
          setIsProcessing(true);
          setIsTranscribing(true);
          
          // Create FormData and append audio
          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');
          
          // Add timing information
          const transcription = await transcribeAudio(formData);
          
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
          // Show error to user
          alert(`Transcription failed: ${error instanceof Error ? 
                error.message : 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
          setIsTranscribing(false);
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Set a time limit for recording to prevent extremely large files
      const MAX_RECORDING_TIME = 120 * 1000; // 120 seconds
      mediaRecorder.start(1000); // Collect data in 1-second chunks
      setIsRecording(true);
      
      // Automatically stop recording after MAX_RECORDING_TIME
      setTimeout(() => {
        if (isRecording && mediaRecorderRef.current) {
          stopRecording();
          // Show notification that recording was stopped due to time limit
          notification.info({
            message: "Recording Stopped",
            description: "Recording automatically stopped after 2 minutes."
                        + " The audio is being processed.",
            duration: 5,
          });
        }
      }, MAX_RECORDING_TIME);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check your browser permissions.');
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
    <div className="min-h-chat-input-min max-h-chat-input-max flex items-stretch 
      bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 
      px-4 py-2">
      {isTypingMode ? (
        <>
          <div className="flex-1 relative mx-2">
            <textarea
              ref={textAreaRef}
              value={message}
              onChange={handleTextAreaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full min-h-[48px] max-h-[144px] pr-10 resize-none 
              rounded-lg border border-gray-300 dark:border-gray-600 p-2 
              focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 
              text-gray-900 dark:text-white overflow-y-auto"
              disabled={disabled || isProcessing}
            />
            {message.trim() && (
              <div className="absolute right-3 bottom-4">
                <Tooltip title="Press to send message" placement="top">
                  <Button
                    onClick={handleSend}
                    disabled={disabled || isProcessing}
                    type="text"
                    className="p-2 rounded-full bg-gray-900 
                      hover:bg-gray-800 transition-colors"
                    icon={
                      <svg 
                        viewBox="0 0 24 24" 
                        className="w-4 h-4 text-white"
                      >
                        <path 
                          fill="currentColor" 
                          d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                        />
                      </svg>
                    }
                  />
                </Tooltip>
              </div>
            )}
          </div>
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

import React, { useRef, useState, type ReactNode } from 'react';
import {
  MessageFormWrapper,
  MessageFormContainer,
  AttachButton,
  MessageTextarea,
  SendButton,
  ErrorMessage
} from './MessagesShared';


interface Message {
  id: number;
  content: string;
  username?: string;
  created_at: string;
  media_urls?: string[];
  reply_to_message_id?: number;
  replied_message_username?: string;
  replied_message_content?: string;
  replied_message_created_at?: string;
  replied_message_media_urls?: string[];
}

const MessageForm = ({
  onMessageSent = async () => {},
  replyToMessage = null,
  onCancelReply = () => { }
}: {
  onMessageSent?: (message: string, files: File[], replyToId?: number) => Promise<void>;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const renderMedia = (url: string, idx: number): ReactNode => {
    const fileExtension = url.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension);
    const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExtension);

    const fullUrl = "http://localhost:8000/" + url;

    if (isImage) {
      return <img key={idx} src={fullUrl} alt="Media" className="max-w-full rounded" />;
    } else if (isVideo) {
      return (
        <video key={idx} controls className="max-w-full rounded">
          <source src={fullUrl} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (isAudio) {
      return (
        <audio key={idx} controls className="w-full">
          <source src={fullUrl} type={`audio/${fileExtension}`} />
          Your browser does not support the audio element.
        </audio>
      );
    } else {
      return (
        <a key={idx} href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          📎 {url.split('/').pop()}
        </a>
      );
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || sending) return;

    setSending(true);
    setError('');

    try {
      await onMessageSent(newMessage, selectedFiles, replyToMessage?.id);
      // Clear form on success
      setNewMessage('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };

  return (
    <MessageFormWrapper
      selectedFiles={selectedFiles}
      onRemoveFile={removeFile}
    >
      {/* Error message */}
      <ErrorMessage message={error} setMessage={setError} />

      {/* Reply preview */}
      {replyToMessage && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-blue-700 truncate">
              Replying to {replyToMessage.username}
            </div>
            <div className="text-xs text-blue-600 truncate">
              {replyToMessage.content}
            </div>
            {replyToMessage.media_urls && replyToMessage.media_urls.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {replyToMessage.media_urls.slice(0, 3).map((url, idx) => (
                  <div key={idx} className="w-8 h-8 bg-gray-200 rounded overflow-hidden">
                    {renderMedia(url, idx)}
                  </div>
                ))}
                {replyToMessage.media_urls.length > 3 && (
                  <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center text-xs">
                    +{replyToMessage.media_urls.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onCancelReply}
            className="ml-2 text-blue-500 hover:text-blue-700"
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main form bar */}
      <MessageFormContainer onSubmit={handleSubmit}>
        {/* File input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,video/*,audio/*"
          style={{ display: 'none' }}
        />

        {/* Attach Button */}
        <AttachButton
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
        />

        {/* Text Input */}
        <MessageTextarea
          value={newMessage}
          onChange={handleTextareaInput}
          placeholder={'Type a message...'}
          rows={1} // Start with 1 row, will auto-expand
          disabled={sending}
        />

        {/* Send Button */}
        <SendButton
          disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
          loading={sending}
        />
      </MessageFormContainer>
    </MessageFormWrapper>
  );
};

export default MessageForm;
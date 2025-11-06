import React, { useRef, useState } from 'react';

const MessageForm = ({ username, onMessageSent = () => {}}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || sending) return;

    setSending(true);
    setError('');

    try {
      onMessageSent(newMessage, selectedFiles);
      // Clear form on success
      setNewMessage('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="message-form">

        <div className="">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder= {'Type your message'}
            rows="3"
          />
        </div>

        {/* File upload section */}
        <div className="">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,video/*,audio/*"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="file-upload-btn"
          >
            📎 Attach Files
          </button>
        </div>

        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-preview">
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="remove-file-btn"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}>
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </>
  );
};

export default MessageForm;

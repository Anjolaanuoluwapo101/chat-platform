import React, { memo, useRef, useCallback } from 'react';
import MessageList from './MessageList';

const MessageContainer = memo(({ messages, hasMore, loadingMore, onLoadMore, messagesEndRef }) => {
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && messages.length > 0) {
      const oldestMessageId = messages[messages.length - 1].id;
      onLoadMore(oldestMessageId);
    }
  }, [loadingMore, hasMore, messages, onLoadMore]);

  return (
    <div className="messages-scroll">
      {hasMore && (
        <div className="load-more">
          <button onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
      <MessageList messages={messages} isOwnMessages={true} />
      <div ref={messagesEndRef} />
    </div>
  );
});

MessageContainer.displayName = 'MessageContainer';
export default MessageContainer;
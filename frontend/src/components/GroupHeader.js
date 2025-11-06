import React, { memo } from 'react';

const GroupHeader = memo(({ groupName, showMemberCount, memberCount, onToggleMembers }) => {
  return (
    <header className="messages-header">
      <h2>{groupName}</h2>
      {showMemberCount && (
        <button className="members-toggle" onClick={onToggleMembers}>
          Members ({memberCount})
        </button>
      )}
    </header>
  );
});

GroupHeader.displayName = 'GroupHeader';
export default GroupHeader;
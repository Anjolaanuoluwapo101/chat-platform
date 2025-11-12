import React, { memo } from 'react';

const MemberList = memo(({ members }) => {
  if (!members.length) return null;
  
  return (
    <div className="members-list">
      <h3>Group Members</h3>
      <ul>
        {members.map(member => (
          <li key={member.id}>{member.username}</li>
        ))}
      </ul>
    </div>
  );
});

MemberList.displayName = 'MemberList';
export default MemberList;
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pusherService from '../services/pusherService';
import groupService from '../services/groupService';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import './GroupMessages.css';

const GroupMessages = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [groupName, setGroupName] = useState('Group');
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showMembers, setShowMembers] = useState(false);
    const [members, setMembers] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(false);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const loadMessages = useCallback(async (beforeId = null) => {
        try {
            if (beforeId) setLoadingMore(true);
            const res = await groupService.getGroupMessages(groupId, beforeId);
            const newMessages = res.data.messages || [];
            console.log('Messages', newMessages);

            if (newMessages.length === 0 || newMessages.length < 50) {
                setHasMore(false);
            }

            if (beforeId) {
                setMessages(prev => [...newMessages, ...prev]); // Previous messages go at the start
            } else {
                setMessages(newMessages.reverse()); // Reverse initial messages to show oldest first
                // Mark messages as read when opening group
                if (newMessages.length > 0) {
                    const lastMessageId = newMessages[0].id; // First message after reverse is latest
                    await groupService.markMessagesRead(groupId, lastMessageId);
                }
                setTimeout(scrollToBottom, 100);
            }
        } catch (err) {
            console.error('Failed to load group messages', err);
        } finally {
            setLoadingMore(false);
        }
    }, [groupId, scrollToBottom]);

    const handleNewMessage = useCallback((data) => {
        setMessages(prev => [...prev, data]);  // Append new message instead of prepending
        // Mark new message as read since we're viewing the group
        groupService.markMessagesRead(groupId, data.id).catch(console.error);
        scrollToBottom();
    }, [groupId, scrollToBottom]);

    const loadMembers = useCallback(async () => {
        try {
            const response = await groupService.getGroupMembers(groupId);
            setMembers(response.data.members || []);
        } catch (err) {
            console.error('Failed to load group members:', err);
        }
    }, [groupId]);

    useEffect(() => {
        let mounted = true;
        let channel = null;

        const loadInfo = async () => {
            try {
                const info = await groupService.getGroupInfo(groupId);
                if (!mounted) return;

                const data = info.data;
                setIsMember(!!data.is_member);
                if (data.group && data.group.name) setGroupName(data.group.name);
                if (data.group && data.group.is_anonymous !== undefined) setIsAnonymous(data.group.is_anonymous);

                if (data.is_member) {
                    await loadMessages();
                    if (!mounted) return;

                    // Subscribe to channel after initial load
                    channel = pusherService.subscribeToGroupMessages(groupId, handleNewMessage);
                }
            } catch (err) {
                console.error('Failed to load group info', err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        setLoading(true);
        loadInfo();

        return () => {
            mounted = false;
            if (channel) {
                pusherService.unsubscribe(`private-group-${groupId}`);
            }
        };
    }, [groupId, loadMessages, handleNewMessage]);

    const handleJoin = async () => {
        try {
            const response = await groupService.joinGroup(groupId);
            if (!response.data.success) {
                alert("Could not join group!");
                navigate('/groups');
                return;
            }
            setIsMember(true);
            await Promise.all([loadMessages(), loadMembers()]);
            pusherService.subscribeToGroupMessages(groupId, handleNewMessage);
        } catch (err) {
            console.error('Failed to join group', err);
            alert("Error joining group");
        }
    };

    const handleSend = async (message, files) => {
        try {
            await groupService.sendGroupMessage(groupId, message, files);
            // No need to refresh - Pusher will deliver the message
        } catch (err) {
            console.error('Failed to send group message', err);
            alert("Error sending message");
            throw err; // Re-throw to let MessageForm handle it
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && messages.length > 0) {
            const oldestMessageId = messages[messages.length - 1].id;
            loadMessages(oldestMessageId);
        }
    };

    const toggleMembers = () => {
        setShowMembers(prev => !prev);
    };

    if (loading) return <div className="loading">Loading group...</div>;

    return (
        <div className="messages-container">
            <header className="messages-header">
                <h2>{groupName} {isAnonymous && <span className="anonymous-badge">(Anonymous)</span>}</h2>
                {isMember && (
                    <button className="members-toggle" onClick={toggleMembers}>
                        Members ({members.length})
                    </button>
                )}
            </header>

            {!isMember ? (
                <div className="join-prompt">
                    <p>You are not a member of this group. Would you like to join?</p>
                    <button onClick={handleJoin}>Join Group</button>
                </div>
            ) : (
                <>
                    {showMembers && (
                        <div className="members-list">
                            <h3>Group Members</h3>
                            <ul>
                                {members.map(member => (
                                    <li key={member.id}>{member.username}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="messages-scroll">
                        {hasMore && (
                            <div className="load-more">
                                <button onClick={handleLoadMore} disabled={loadingMore}>
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                        <MessageList messages={messages} isOwnMessages={true} groupType={true} />
                        <div ref={messagesEndRef} />
                    </div>
                    <MessageForm
                        groupType={true}
                        username={groupName}
                        onMessageSent={handleSend}
                        allowAnonymous={false}
                    />
                </>
            )}
        </div>
    );
};

export default GroupMessages;

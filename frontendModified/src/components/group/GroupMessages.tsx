import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import pusherService from '../../services/pusherService';
import groupService from '../../services/groupService';
import auth from '../../services/auth';
import MessageList from '../messages/MessageList';
import MessageForm from '../messages/MessageForm';
import AdminPanel from './AdminPanel';
import AdminNavItems from './AdminNavItems';
import PushNotificationService from '../../services/notifications';
import { motion } from 'framer-motion';

import { MembersIcon, BannedIcon, SettingsIcon } from './AdminIcons';
import {
    ChatScreen,
    ChatHeader,
    LoadingSpinner,
    JoinGroupView,
    MembersList,
    LoadMoreButton,
    ErrorMessage,
    SuccessMessage
} from '../messages/MessagesShared';
import Layout from '../../layouts/Layout';
import {getCommonNavItems } from '../nav/sharedNavItems';

interface Message {
    id: number;
    content: string;
    username?: string;
    created_at: string;
    media_urls?: string[];
    reply_to_message_id?: number;
}

interface Member {
    id: number;
    username: string;
}

interface User {
    id: number;
    username: string;
    email: string;
}

interface NavItem {
    title: string;
    to?: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

const GroupMessages = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // 1. Add a Ref to track mounting status (prevents updates on unmounted components)
    const isMountedRef = useRef(true);

    const currentUser: User | null = auth.getCurrentUser();
    if (!currentUser) {
        window.location.href = '/login';
    }

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [groupName, setGroupName] = useState('Group');
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showMembers, setShowMembers] = useState(false);
    const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false); // Show "New Messages" button when scrolled up
    const [sendingMessage, setSendingMessage] = useState(false); // Track message sending status
    const [networkError, setNetworkError] = useState(false); // Track network connection issues

    // Admin states
    const [isAdmin, setIsAdmin] = useState(false);
    const [admins, setAdmins] = useState<Member[]>([]);
    const [bannedUsers, setBannedUsers] = useState<Member[]>([]);
    const [showAdminPanel, setShowAdminPanel] = useState<string | false>(false);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowScrollButton(false); // Hide the scroll button after scrolling
    }, []);

    // 2. Optimize loadMessages to check isMountedRef
    const loadMessages = useCallback(async (referenceId: number | null = null, direction: string = 'before') => {
        if (!isMountedRef.current) return; // Prevent updates on unmounted components

        try {
            if (referenceId) setLoadingMore(true);

            const res = await groupService.getGroupMessages(parseInt(groupId!), referenceId, direction);

            if (!isMountedRef.current) return; // Check again after await

            const newMessages = res.messages || [];

            if (newMessages.length === 0 || newMessages.length < 50) {
                setHasMore(false);
            }

            if (direction === 'after') {
                setMessages(newMessages);
                setTimeout(scrollToBottom, 100);
            } else if (referenceId) {
                setMessages(prev => [...newMessages, ...prev]);
            } else {
                setMessages(newMessages);
                setTimeout(scrollToBottom, 100);
            }
        } catch (err) {
            console.error('Failed to load group messages', err);
        } finally {
            if (isMountedRef.current) setLoadingMore(false);
        }
    }, [groupId]);

    useEffect(() => {
        isMountedRef.current = true;
        let channel: any = null;

        const initGroupData = async () => {
            try {
                setLoading(true);
                setNetworkError(false); // Clear any previous errors

                // 1. Fetch Group Info
                const info = await groupService.getGroupInfo(parseInt(groupId!));

                if (!isMountedRef.current) return;

                // Prepare all state updates
                const isUserMember = !!info.is_member;
                let fetchedMessages: Message[] = [];

                if (isUserMember) {
                    try {
                        const msgRes = await groupService.getGroupMessages(parseInt(groupId!), null, 'before');
                        fetchedMessages = msgRes.messages || [];
                        // Initialize Push Notification Service
                       
                        if (currentUser) {
                            await PushNotificationService.initialize();
                            await PushNotificationService.login(String(currentUser.id), {
                                url: import.meta.env.VITE_API_BASE_URL + 'pusher/beam-auth',
                                headers: {}
                            }).then(async (beamsClient) => {
                                // Check Interest
                                if(typeof beamsClient === 'boolean') return

                                if (!(await beamsClient.hasInterest("group_" + groupId))) {
                                    await beamsClient.addInterest("group_" + groupId);
                                    console.log("Added interest: group_" + groupId)
                                }
                            });
                        }

                    } catch (e) {
                        console.error("Failed to fetch initial messages", e);
                    }
                }

                if (!isMountedRef.current) return;

                // Group Basic Info
                if (info.group) {
                    setGroupName(info.group.name || 'Group');
                    setIsAnonymous(Number(info.group.is_anonymous) === 1);
                    if (Number(info.group.is_anonymous) === 0) {
                        setMembers(info.group.members || []);
                    }
                    setAdmins(info.group.admins || []);
                    setBannedUsers(info.group.banned_users || []);
                }

                // Membership & Admin Status
                setIsMember(isUserMember);
                const userIsAdmin = info.group?.admins?.some(admin => admin.id === currentUser?.id);
                setIsAdmin(!!userIsAdmin);

                // Messages
                if (isUserMember) {
                    setMessages(fetchedMessages);
                    if (fetchedMessages.length < 50) setHasMore(false);

                    // Subscribe to Pusher
                    channel = pusherService.subscribeToGroupMessages(parseInt(groupId!), handleNewMessage);

                    // Scroll after render
                    setTimeout(scrollToBottom, 100);
                }

            } catch (err) {
                console.error('Failed to load group info', err);
                setNetworkError(true); // Show network error state
            } finally {
                if (isMountedRef.current) setLoading(false);
            }
        };

        initGroupData();

        return () => {
            isMountedRef.current = false;
            if (channel) {
                pusherService.unsubscribe(`private-group-${groupId}`);
            }
        };
    }, [groupId]);

    const handleNewMessage = useCallback((data: Message) => {
        // Add new message but ensure it is unique
        setMessages(prev => {
            const isDuplicate = prev.some(msg => msg.id === data.id);
            return isDuplicate ? prev : [...prev, data];
        });
        // Mark new message as read
        groupService.markMessagesRead(parseInt(groupId!), data.id).catch(console.error);

        // Only auto-scroll if user is already at bottom, otherwise show "New Messages" button
        const messagesContainer = messagesEndRef.current?.parentElement;
        if (messagesContainer) {
            const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 100;
            if (isAtBottom) {
                scrollToBottom();
            } else {
                setShowScrollButton(true); // User is reading old messages, don't interrupt
            }
        }
    }, [groupId, scrollToBottom]);

    // Refresh admin data
    const refreshAdminData = useCallback(async () => {
        try {
            const info = await groupService.getGroupInfo(parseInt(groupId!));
            const data = info;

            // Set admins and banned users
            if (data.group?.admins) setAdmins(data.group.admins);
            if (data.group?.banned_users) setBannedUsers(data.group.banned_users);
            if (data.group && Number(data.group.is_anonymous) == 0) setMembers(data.group.members || []);
        } catch (err) {
            console.error('Failed to refresh admin data', err);
        }
    }, [groupId]);

    // Retry loading group data if there was a network error
    const retryLoadGroup = useCallback(async () => {
        setLoading(true);
        setNetworkError(false);

        try {
            const info = await groupService.getGroupInfo(parseInt(groupId!));

            if (info.group) {
                setGroupName(info.group.name || 'Group');
                setIsAnonymous(Number(info.group.is_anonymous) === 1);
                if (Number(info.group.is_anonymous) === 0) {
                    setMembers(info.group.members || []);
                }
                setAdmins(info.group.admins || []);
                setBannedUsers(info.group.banned_users || []);
            }

            setIsMember(!!info.is_member);
            const userIsAdmin = info.group?.admins?.some(admin => admin.id === currentUser?.id);
            setIsAdmin(!!userIsAdmin);

            if (info.is_member) {
                const msgRes = await groupService.getGroupMessages(parseInt(groupId!), null, 'before');
                setMessages(msgRes.messages || []);
            }
        } catch (err) {
            console.error('Failed to reload group', err);
            setNetworkError(true);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    const handleJoin = useCallback(async () => {
        if (isJoining) return; // Prevent multi-tap

        try {
            setIsJoining(true);
            setError(null);
            const response = await groupService.joinGroup(parseInt(groupId!));
            if (!response.success) {
                setError("Could not join group. Please try again.");
                return;
            }
            // Refresh group info after joining
            const info = await groupService.getGroupInfo(parseInt(groupId!));

            // Handle both response formats
            const data = info;
            setIsMember(!!data.is_member);
            if (!data.is_member) {
                return;
            }
            if (data.group && data.group.name) setGroupName(data.group.name);
            if (data.group && Number(data.group.is_anonymous) == 1) setIsAnonymous(data.group.is_anonymous);
            if (data.group && Number(data.group.is_anonymous) == 0) setMembers(data.group.members || []);

            // Admin functionality
            const userIsAdmin = data.group?.admins?.some(admin => admin.id == currentUser?.id);
            setIsAdmin(!!userIsAdmin);

            // Set admins and banned users
            if (data.group?.admins) setAdmins(data.group.admins);
            if (data.group?.banned_users) setBannedUsers(data.group.banned_users);

            await loadMessages();
            data.group?.last_message_id ? await groupService.markMessagesRead(parseInt(groupId!), data.group.last_message_id || 0) : null;
            setSuccess("Successfully joined the group!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to join group', err);
            setError("Error joining group. Please try again.");
        } finally {
            setIsJoining(false);
        }
    }, [groupId, loadMessages, isJoining]);

    const handleLeaveGroup = useCallback(async () => {
        if (isLeaving) return; // Prevent multi-tap

        if (!window.confirm('Are you sure you want to leave this group?')) {
            return;
        }

        try {
            setIsLeaving(true);
            setError(null);
            const response = await groupService.leaveGroup(parseInt(groupId!));
            if (response.success) {
                // Redirect to groups list
                window.location.href = '/groups';
            } else {
                setError("Failed to leave group. Please try again.");
            }
        } catch (err) {
            console.error('Failed to leave group', err);
            setError("Error leaving group. Please try again.");
        } finally {
            setIsLeaving(false);
        }
    }, [groupId, isLeaving]);

    const handleSend = useCallback(async (message: string, files: File[], replyToMessageId: number | null = null) => {
        try {
            setError(null);
            setSendingMessage(true); // Show "Sending..." status

            await groupService.sendGroupMessage(parseInt(groupId!), message, files, replyToMessageId);

            // Message sent successfully - will appear via Pusher
            setSendingMessage(false);
        } catch (err) {
            console.error('Failed to send group message', err);
            setError("Error sending message. Please try again.");
            setSendingMessage(false);
            throw err;
        }
    }, [groupId]);

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMore && messages.length > 0) {
            const oldestMessageId = messages[0].id; // Oldest is at the start
            loadMessages(oldestMessageId, 'before'); // Explicit direction
        }
    }, [loadingMore, hasMore, messages, loadMessages]);

    const toggleMembers = useCallback(() => {
        setShowMembers(prev => !prev);
    }, []);

    const toggleAdminPanel = useCallback((tab: string) => {
        setShowAdminPanel(tab);
    }, []);


    // Prepare navigation items for the layout
    const navItems = useMemo(() => {
        const baseItems = getCommonNavItems();

        // Add leave group item for all members
        if (isMember) {
            baseItems.push({
                title: isLeaving ? 'Leaving...' : 'Leave Group',
                to: '',
                icon: <SettingsIcon className="w-5 h-5" />,
                onClick: handleLeaveGroup
            });
        }

        // Add admin items if user is admin
        if (isAdmin && !isAnonymous) {
            const adminItems: NavItem[] = AdminNavItems.map(item => ({
                title: item.title,
                to: item.to,
                onClick: () => toggleAdminPanel(item.tab),
                icon: item.tab === 'members' ? <MembersIcon className="w-5 h-5" /> :
                    item.tab === 'banned' ? <BannedIcon className="w-5 h-5" /> :
                        <SettingsIcon className="w-5 h-5" />
            }));

            return [...baseItems, ...adminItems];
        }

        return baseItems;
    }, [isAdmin, isAnonymous, toggleAdminPanel, isMember, handleLeaveGroup, isLeaving]);

    if (loading) return (
        <Layout>
            <div className="min-h-screen  text-white relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
                <div className="relative z-10">
                    <ChatScreen>
                        <LoadingSpinner />
                    </ChatScreen>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout navItems={navItems}>
            {/* Background Elements */}
            <div className="min-h-screen  text-white relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="relative z-10">
                    {/* Error/Success Messages */}
                    {error && <ErrorMessage message={error} setMessage={setError} />}
                    {success && <SuccessMessage message={success} setMessage={setSuccess} />}

                    <ChatScreen>
                        <ChatHeader
                            title={groupName}
                            isAnonymous={isAnonymous}
                            membersCount={members.length}
                            onToggleMembers={toggleMembers}
                            showMembersButton={isMember}
                        />

                        {!isMember ? (
                            <JoinGroupView onJoin={handleJoin} isLoading={isJoining} />
                        ) : (
                            <>
                                {/* Show network error with retry button */}
                                {networkError && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-xl p-6 m-6 text-center">
                                        <p className="text-red-400 mb-3">Connection problem. Please check your internet.</p>
                                        <button
                                            onClick={retryLoadGroup}
                                            className="bg-linear-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                                        >
                                            Retry
                                        </button>
                                    </motion.div>
                                )}

                                {showMembers && (
                                    <MembersList members={members} />
                                )}
                                {/* Message list with consistent padding */}
                                <div className="grow overflow-y-auto p-6">
                                    <LoadMoreButton
                                        onClick={handleLoadMore}
                                        loading={loadingMore}
                                        hasMore={hasMore}
                                    />
                                    <MessageList
                                        messages={messages}
                                        currentUser={currentUser} // Pass current user ID
                                        groupType={true}
                                        onReply={(message) => setReplyToMessage(message)}
                                    />
                                    <div ref={messagesEndRef} />

                                    {/* Show "New Messages" button when user scrolled up */}
                                    {showScrollButton && (
                                        <button
                                            onClick={scrollToBottom}
                                            className="fixed bottom-28 right-10 bg-linear-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                                            New Messages ↓
                                        </button>
                                    )}
                                </div>

                                {/* Show sending status above the message form */}
                                {sendingMessage && (
                                    <div className="text-sm text-amber-400 px-6 py-3 text-center border-t border-slate-600">
                                        Sending...
                                    </div>
                                )}

                                <MessageForm
                                    onMessageSent={handleSend}
                                    replyToMessage={replyToMessage}
                                    onCancelReply={() => setReplyToMessage(null)}
                                />
                            </>
                        )}
                    </ChatScreen>
                </div>
            </div>

            {/* Admin Panel Modal */}
            {showAdminPanel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600">
                        <AdminPanel
                            groupId={parseInt(groupId!)}
                            admins={admins}
                            members={members}
                            bannedUsers={bannedUsers}
                            onAdminDataRefresh={refreshAdminData}
                            initialTab={showAdminPanel as string}
                            onClose={() => setShowAdminPanel(false)}
                        />
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default GroupMessages;
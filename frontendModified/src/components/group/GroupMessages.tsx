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

import { HomeIcon, GroupsIcon, MembersIcon, BannedIcon, SettingsIcon } from './AdminIcons';
import {
    ChatScreen,
    ChatHeader,
    LoadingSpinner,
    JoinGroupView,
    MembersList,
    LoadMoreButton
} from '../messages/MessagesShared';
import Layout from '../../layouts/Layout';

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

    // ... (Keep your existing useState definitions) ...
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

    // Admin states
    const [isAdmin, setIsAdmin] = useState(false);
    const [admins, setAdmins] = useState<Member[]>([]);
    const [bannedUsers, setBannedUsers] = useState<Member[]>([]);
    const [showAdminPanel, setShowAdminPanel] = useState<string | false>(false);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // 2. Optimize loadMessages to check isMountedRef
    const loadMessages = useCallback(async (referenceId: number | null = null, direction: string = 'before') => {
        if (!isMountedRef.current) return;

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
                        PushNotificationService.initialize();
                        
                        // Check Interest
                        if (!(await PushNotificationService.hasInterest("group_" + groupId))) {
                            PushNotificationService.addInterest("group_" + groupId);
                            console.log("Added interest: group_" + groupId)
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
        console.log('New message received:', data)
        // Add new message but ensure it is unique
        setMessages(prev => {
            const isDuplicate = prev.some(msg => msg.id === data.id);
            return isDuplicate ? prev : [...prev, data];
        });
        // Mark new message as read
        groupService.markMessagesRead(parseInt(groupId!), data.id).catch(console.error);
        scrollToBottom();
    }, [groupId]);

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

    const handleJoin = useCallback(async () => {
        try {
            const response = await groupService.joinGroup(parseInt(groupId!));
            if (!response.success) {
                alert("Could not join group!"); // Replace with modal
                // navigate('/groups');
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

            await Promise.all([loadMessages()]);
            data.group?.last_message_id ? await groupService.markMessagesRead(parseInt(groupId!), data.group.last_message_id || 0) : null;
            // pusherService.subscribeToGroupMessages(parseInt(groupId!), handleNewMessage);
        } catch (err) {
            console.error('Failed to join group', err);
            alert("Error joining group"); // Replace with modal
        }
    }, [groupId, loadMessages, handleNewMessage]);

    const handleLeaveGroup = useCallback(async () => {
        if (!window.confirm('Are you sure you want to leave this group?')) {
            return;
        }

        try {
            const response = await groupService.leaveGroup(parseInt(groupId!));
            if (response.success) {
                // Redirect to groups list
                window.location.href = '/groups';
            } else {
                alert("Failed to leave group");
            }
        } catch (err) {
            console.error('Failed to leave group', err);
            alert("Error leaving group");
        }
    }, [groupId]);

    const handleSend = useCallback(async (message: string, files: File[], replyToMessageId: number | null = null) => {
        try {
            await groupService.sendGroupMessage(parseInt(groupId!), message, files, replyToMessageId);
        } catch (err) {
            console.error('Failed to send group message', err);
            alert("Error sending message"); // Replace with modal
            // Revert optimistic update on error if needed
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

    // const handleLeaveGroup = useCallback(async () => {
    //     if (!window.confirm('Are you sure you want to leave this group?')) {
    //         return;
    //     }

    //     try {
    //         const response = await groupService.leaveGroup(parseInt(groupId!));
    //         if (response.success) {
    //             // Redirect to groups list
    //             window.location.href = '/groups';
    //         } else {
    //             alert("Failed to leave group");
    //         }
    //     } catch (err) {
    //         console.error('Failed to leave group', err);
    //         alert("Error leaving group");
    //     }
    // }, [groupId]);

    // Prepare navigation items for the layout
    const navItems = useMemo(() => {
        const baseItems: NavItem[] = [
            { title: 'Home', to: '/', icon: <HomeIcon className="w-5 h-5" /> },
            { title: 'Groups', to: '/groups', icon: <GroupsIcon className="w-5 h-5" /> }
        ];

        // Add leave group item for all members
        if (isMember) {
            baseItems.push({
                title: 'Leave Group',
                to: '#',
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
    }, [isAdmin, isAnonymous, toggleAdminPanel, isMember, handleLeaveGroup]);

    if (loading) return (
        <Layout>
            <ChatScreen>
                <LoadingSpinner />
            </ChatScreen>
        </Layout>
    );

    return (
        <Layout navItems={navItems}>
            <ChatScreen>
                <ChatHeader
                    title={groupName}
                    isAnonymous={isAnonymous}
                    membersCount={members.length}
                    onToggleMembers={toggleMembers}
                    showMembersButton={isMember}
                />

                {!isMember ? (
                    <JoinGroupView onJoin={handleJoin} />
                ) : (
                    <>
                        {showMembers && (
                            <MembersList members={members} />
                        )}
                        <div className="grow overflow-y-auto p-4">
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
                        </div>
                        <MessageForm
                            onMessageSent={handleSend}
                            replyToMessage={replyToMessage}
                            onCancelReply={() => setReplyToMessage(null)}
                        />
                    </>
                )}
            </ChatScreen>

            {/* Admin Panel Modal */}
            {showAdminPanel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
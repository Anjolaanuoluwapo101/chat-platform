import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import pusherService from '../../services/pusherService';
import groupService from '../../services/groupService';
import auth from '../../services/auth';
import MessageList from '../messages/MessageList';
import MessageForm from '../messages/MessageForm';
import AdminPanel from './AdminPanel';
import AdminNavItems from './AdminNavItems';
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

const GroupMessages = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentUser : User | null = auth.getCurrentUser();
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
    
    // Admin states
    const [isAdmin, setIsAdmin] = useState(false);
    const [admins, setAdmins] = useState<Member[]>([]);
    const [bannedUsers, setBannedUsers] = useState<Member[]>([]);
    const [showAdminPanel, setShowAdminPanel] = useState<string | false>(false); // false or string ('members', 'banned', 'settings')

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const loadMessages = useCallback(async (referenceId: number | null = null, direction: string = 'before') => {
        try {
            if (referenceId) setLoadingMore(true);
            
            // Backend will automatically use last_read_id if no referenceId provided
            const res = await groupService.getGroupMessages(parseInt(groupId!), referenceId, direction);
            const newMessages = res.messages || [];
            console.log('Messages', newMessages);

            if (newMessages.length === 0 || newMessages.length < 50) {
                setHasMore(false);
            }

            if (direction === 'after') {
                // Loaded messages AFTER last read (unread messages)
                setMessages(newMessages);
                setTimeout(scrollToBottom, 100);
            } else if (referenceId) {
                // Loaded older messages (scroll up pagination)
                setMessages(prev => [...newMessages, ...prev]);
            } else {
                // Initial load (no referenceId) - could be latest or from last_read
                setMessages(newMessages);
                setTimeout(scrollToBottom, 100);
            }

            // Mark messages as read after loading
            // if (newMessages.length > 0) {
            //     const lastMessageId = newMessages[newMessages.length - 1].id;
            //     await groupService.markMessagesRead(groupId, lastMessageId);
            // }
        } catch (err) {
            console.error('Failed to load group messages', err);
        } finally {
            setLoadingMore(false);
        }
    }, [groupId, scrollToBottom]);

    const handleNewMessage = useCallback((data: Message) => {
        setMessages(prev => [...prev, data]);
        // Mark new message as read
        groupService.markMessagesRead(parseInt(groupId!), data.id).catch(console.error);
        scrollToBottom();
    }, [groupId, scrollToBottom]);

    // Refresh admin data
    const refreshAdminData = async () => {
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
    };

    useEffect(() => {
        let mounted = true;
        let channel: any = null;

        const loadInfo = async () => {
            try {
                const info = await groupService.getGroupInfo(parseInt(groupId!));
                if (!mounted) return;

                // Handle both response formats
                const data = info;
                setIsMember(!!data.is_member);
               
                if (data.group && data.group.name) setGroupName(data.group.name);
                if (data.group && Number(data.group.is_anonymous) == 1) setIsAnonymous(data.group.is_anonymous);
                if (data.group && Number(data.group.is_anonymous) == 0) setMembers(data.group.members || []);
                
                // Admin functionality
                if (data.is_member) {
                    // Check if current user is admin
                    const userIsAdmin = data.group?.admins?.some(admin => admin.id == currentUser?.id);
                    setIsAdmin(!!userIsAdmin);
                    
                    // Set admins and banned users
                    if (data.group?.admins) setAdmins(data.group.admins);
                    if (data.group?.banned_users) setBannedUsers(data.group.banned_users);
                    
                    channel = pusherService.subscribeToGroupMessages(parseInt(groupId!), handleNewMessage);
                    
                    await Promise.all([loadMessages()]);
                    if (!mounted) return;

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
    }, [handleNewMessage]);

    const handleJoin = async () => {
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
            pusherService.subscribeToGroupMessages(parseInt(groupId!), handleNewMessage);
        } catch (err) {
            console.error('Failed to join group', err);
            alert("Error joining group"); // Replace with modal
        }
    };

    const handleSend = async (message: string, files: File[], replyToMessageId: number | null = null) => {
        try {
            await groupService.sendGroupMessage(parseInt(groupId!), message, files, replyToMessageId);
        } catch (err) {
            console.error('Failed to send group message', err);
            alert("Error sending message"); // Replace with modal
            // Revert optimistic update on error if needed
            throw err;
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && messages.length > 0) {
            const oldestMessageId = messages[0].id; // Oldest is at the start
            loadMessages(oldestMessageId, 'before'); // Explicit direction
        }
    };

    const toggleMembers = () => {
        setShowMembers(prev => !prev);
    };

    const toggleAdminPanel = (tab: string) => {
        setShowAdminPanel(tab);
    };

    // Prepare navigation items for the layout
    const getNavItems = () => {
        const baseItems = [
            { title: 'Home', to: '/', icon: <HomeIcon className="w-5 h-5" /> },
            { title: 'Groups', to: '/groups', icon: <GroupsIcon className="w-5 h-5" /> }
        ];

        // Add admin items if user is admin
        if (isAdmin && !isAnonymous) {
            const adminItems = AdminNavItems.map(item => ({
                ...item,
                onClick: () => toggleAdminPanel(item.tab),
                icon: item.tab === 'members' ? <MembersIcon className="w-5 h-5" /> :
                       item.tab === 'banned' ? <BannedIcon className="w-5 h-5" /> :
                       <SettingsIcon className="w-5 h-5" />
            }));
            
            return [...baseItems, ...adminItems];
        }

        return baseItems;
    };

    if (loading) return (
        <Layout>
            <ChatScreen>
                <LoadingSpinner />
            </ChatScreen>
        </Layout>
    );

    return (
        <Layout navItems={getNavItems()}>
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
                        <div className="flex-grow overflow-y-auto p-4">
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
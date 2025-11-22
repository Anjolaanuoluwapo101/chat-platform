// Dashboard card data constants
import { 
  MessageIcon, 
  GroupIcon, 
  LightningIcon, 
  AttachmentIcon, 
  UserIcon, 
  ReplyIcon 
} from './dashboardIcons';

interface DashboardCard {
  id: number;
  icon: React.ComponentType<any>;
  text: string;
}

export const DASHBOARD_CARDS: DashboardCard[] = [
  { 
    id: 1, 
    icon: MessageIcon, 
    text: 'Send messages without revealing your identity' 
  },
  { 
    id: 2, 
    icon: GroupIcon, 
    text: 'Join topic-based anonymous or non-anonymous groups' 
  },
  { 
    id: 3, 
    icon: LightningIcon, 
    text: 'Messages appear instantly without refreshing' 
  },
  { 
    id: 4, 
    icon: AttachmentIcon, 
    text: 'Send images,videos, audios, documents, and other types of media files in messages' 
  },
  { 
    id: 5, 
    icon: UserIcon, 
    text: 'Create an account with just a username, email verification disabled for privacy' 
  },
  { 
    id: 6, 
    icon: ReplyIcon, 
    text: 'Reply to specific messages!' 
  },
];

// Export icons for potential reuse
export { 
  MessageIcon, 
  GroupIcon, 
  LightningIcon, 
  AttachmentIcon, 
  UserIcon, 
  ReplyIcon 
};
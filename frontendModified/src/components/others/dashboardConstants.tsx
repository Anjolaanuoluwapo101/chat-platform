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
    text: 'Join topic-based anonymous groups' 
  },
  { 
    id: 3, 
    icon: LightningIcon, 
    text: 'Messages appear instantly without refreshing' 
  },
  { 
    id: 4, 
    icon: AttachmentIcon, 
    text: 'Send images and files in messages' 
  },
  { 
    id: 5, 
    icon: UserIcon, 
    text: 'Create an account with just a username' 
  },
  { 
    id: 6, 
    icon: ReplyIcon, 
    text: 'Reply to specific messages in conversations' 
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
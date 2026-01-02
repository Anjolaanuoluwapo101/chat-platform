import { HomeIcon, MessageSquareIcon } from '../../ui/NavBar';

import { DoorOpen, GroupIcon} from 'lucide-react';
import auth from '../../services/auth';
import React from 'react';

// Define common navigation items that are used across multiple components
const commonNavItems = [
  {
    title: 'Dashboard',
    icon: React.createElement(HomeIcon, { className: 'w-5 h-5' }),
    to: '/dashboard',
    onClick: () => { }
  }
];


// Add these nav items if user is authenticated 
if (auth.isAuthenticated()) {
  commonNavItems.push(
    {
      title: 'Messages',
      icon: React.createElement(MessageSquareIcon, { className: 'w-5 h-5' }),
      to: '/messages' + `/${auth.getCurrentUser()?.username}`,
      onClick: () => { }

    },
    {
      title: 'Groups',
      icon: React.createElement(GroupIcon, { className: 'w-5 h-5' }),
      to: '/groups',
      onClick: () => { }  
    },
    {
      title: 'Logout',
      icon: React.createElement(DoorOpen, { className: 'w-5 h-5' }),
      to: '#',
      onClick: () => { auth.logout() }
    }
  );
}

// Function to get common nav items with custom overrides
export const getCommonNavItems = (overrides: any[] = []) => {
  // Start with common items
  const items = [...commonNavItems];

  // Apply any overrides
  overrides.forEach(override => {
    const index = items.findIndex(item => item.title === override.title);
    if (index !== -1) {
      items[index] = { ...items[index], ...override };
    } else {
      items.push(override);
    }
  });

  return items;
};


// Utility function to create a nav item with JSX element
export const createNavItem = (title: string, IconComponent: React.ComponentType<any>, props: any = {}) => {
  return {
    title,
    icon: React.createElement(IconComponent, { className: 'w-5 h-5', ...props }),
  };
};
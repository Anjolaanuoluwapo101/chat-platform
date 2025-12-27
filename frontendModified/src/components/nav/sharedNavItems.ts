import { HomeIcon, SettingsIcon, MessageSquareIcon } from '../../ui/NavBar';

import { DoorOpen, GroupIcon, Shield} from 'lucide-react';
import auth from '../../services/auth';
import React from 'react';

// Define common navigation items that are used across multiple components
export const commonNavItems = [
  {
    title: 'Dashboard',
    icon: React.createElement(HomeIcon, { className: 'w-5 h-5' }),
    to: '/dashboard',
  },
  {
    title: 'Messages',
    icon: React.createElement(MessageSquareIcon, { className: 'w-5 h-5' }),
    to: '/messages'+`/${auth.getCurrentUser()?.username}`,
  },
  {
    title: 'Groups',
    icon: React.createElement(GroupIcon, { className: 'w-5 h-5' }),
    to: '/groups',
  },
  {
    title: 'Settings',
    icon: React.createElement(SettingsIcon, { className: 'w-5 h-5' }),
    to: '',
    children: [
    //   {
    //     title: 'Metrics',
    //     to: '/metrics',
    //     icon: React.createElement( TrendingUp, { className: 'w-5 h-5' }),
    //   },
      {
        title: 'Privacy',
        to: '/privacy',
        icon: React.createElement(Shield, { className: 'w-5 h-5' }),
      }
    ],
  },
  {
    title: 'Logout',
    icon: React.createElement(DoorOpen, { className: 'w-5 h-5' }),
    to: '#',
    onClick: () => { auth.logout() }
  },
];

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

// Function to get base nav items (Dashboard and Groups only)
export const getBaseNavItems = () => {
  return commonNavItems.slice(0, 2); // Only Dashboard and Groups
};

// Utility function to create a nav item with JSX element
export const createNavItem = (title: string, IconComponent: React.ComponentType<any>, props: any = {}) => {
  return {
    title,
    icon: React.createElement(IconComponent, { className: 'w-5 h-5', ...props }),
  };
};
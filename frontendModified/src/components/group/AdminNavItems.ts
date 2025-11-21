// Admin navigation items for the sidebar
interface AdminNavItem {
  title: string;
  to: string;
  tab: string;
}

const AdminNavItems: AdminNavItem[] = [
  { 
    title: 'Manage Members', 
    to: '', 
    tab: 'members' 
  },
  { 
    title: 'Banned Users', 
    to: '', 
    tab: 'banned' 
  },
  { 
    title: 'Group Settings', 
    to: '', 
    tab: 'settings' 
  }
];

export default AdminNavItems;
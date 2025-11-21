import React from 'react';
import NavBar from '../ui/NavBar';
import Footer from '../ui/Footer';

interface NavItem {
  title: string;
  to?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface LayoutProps {
  navItems?: NavItem[];
  title?: string;
  children?: React.ReactNode;
}

/**
 * Layout component with optimized spacing
 * Wraps content with NavBar and Footer - symmetrical padding
 */
const Layout = ({ navItems = [], title = 'TYT!', children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex">
    
      <NavBar navItems={navItems} title={title} />

      {/* Main content area with consistent padding */}
      <main className="flex-1 overflow-auto w-full ">
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
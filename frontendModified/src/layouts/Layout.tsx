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
 * Layout component that composes NavBar (collapsible sidebar) and Footer.
 * Pass `navItems` as an array of { label, to, icon }.
 */
const Layout = ({ navItems = [], title = 'TYT!', children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex midnight-theme">
      {/* NavBar is now a collapsible sidebar across all screen sizes */}
      <NavBar navItems={navItems} title={title} />

      {/* Main content area */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
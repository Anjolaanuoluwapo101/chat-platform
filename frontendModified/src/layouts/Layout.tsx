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

const Layout = ({ navItems = [], title = 'TYT!', children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex bg-lk-bg dark:bg-dk-bg font-sans">
      <NavBar navItems={navItems} title={title} />

      <main className="flex-1 overflow-auto z-20 ">

        {children}

        <Footer />
      </main>
    </div>
  );
};

export default Layout;
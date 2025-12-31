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
    <div className="min-h-screen flex bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 min-w-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-amber-900/20 via-orange-900/20 to-amber-900/20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500 rounded-full mix-blur-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blur-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-700 rounded-full mix-blur-multiply filter blur-xl opacity-5 animate-pulse"></div>
      </div>

      <NavBar navItems={navItems} title={title} />

      <main className="flex-1 overflow-auto z-20 ">

        {children}

        <Footer />
      </main>
    </div>
  );
};

export default Layout;